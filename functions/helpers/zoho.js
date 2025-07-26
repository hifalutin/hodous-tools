// helpers/firebase.js

import { initializeApp, applicationDefault, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    credential: applicationDefault(),
  });
}

// helpers/zoho.js

import axios from 'axios';
import dotenv from 'dotenv';
import { db } from './firebase.js';

dotenv.config();

const DEFAULT_TTL = parseInt(process.env.ZC_TTL_MS || '30000');

const client_id = process.env.ZOHO_CLIENT_ID;
const client_secret = process.env.ZOHO_CLIENT_SECRET;
const refresh_token = process.env.ZOHO_REFRESH_TOKEN;

export const getAccessToken = async (serviceName) => {
  const TOKEN_DOC = db.collection('access_tokens').doc(serviceName);
  const doc = await TOKEN_DOC.get();
  const now = Date.now();

  if (doc.exists) {
    const data = doc.data();
    if (data.token && data.expiresAt > now) {
      return data.token;
    }
  }

  const res = await axios.post(
    'https://accounts.zoho.com/oauth/v2/token',
    new URLSearchParams({
      refresh_token,
      client_id,
      client_secret,
      grant_type: 'refresh_token',
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  const token = res.data.access_token;
  const expiresAt = now + 60 * 60 * 1000;

  await TOKEN_DOC.set({ token, expiresAt }, { merge: true });

  return token;
};

// ⛑ Error handler wrapper
export const handleZohoRequestWithRetry = async (requestFn) => {
  try {
    const token = await getAccessToken('zoho');
    return await requestFn(token);
  } catch (error) {
    if (error.response?.status === 401) {
      const TOKEN_DOC = db.collection('access_tokens').doc('zoho');
      await TOKEN_DOC.delete(); // force refresh
      const newToken = await getAccessToken('zoho');
      return await requestFn(newToken);
    }
    throw error;
  }
};

export const fetchWithCache = async (key, ttlMs = DEFAULT_TTL, collection, fetchFn) => {
  const cacheDoc = db.collection('cache_control').doc(key);
  const cacheData = await cacheDoc.get();
  const now = Date.now();

  if (cacheData.exists && now - cacheData.data().lastFetched < ttlMs) {
    const snapshot = await db.collection('cached_data').doc(key).collection(collection).get();
    return snapshot.docs.map(doc => doc.data());
  }

  const items = await fetchFn();

  const batch = db.batch();
  items.forEach(item => {
    const ref = db.collection('cached_data').doc(key).collection(collection).doc(item.invoice_id);
    batch.set(ref, item, { merge: true });
  });
  batch.set(cacheDoc, { lastFetched: now });
  await batch.commit();

  return items;
};
