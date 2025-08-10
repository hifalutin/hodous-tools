// helpers/firebase.js

import { initializeApp, applicationDefault, getApps } from 'firebase-admin/app';

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

const client_id = (process.env.ZOHO_CLIENT_ID || '').trim();
const client_secret = (process.env.ZOHO_CLIENT_SECRET || '').trim();
const refresh_token = (process.env.ZOHO_REFRESH_TOKEN || '').trim();

console.log('Zoho config: refresh len=', (refresh_token || '').length);

if (!client_id) throw new Error('Missing ZOHO_CLIENT_ID in environment. Set it in functions/.env and restart.');
if (!client_secret) throw new Error('Missing ZOHO_CLIENT_SECRET in environment. Set it in functions/.env and restart.');
if (!refresh_token) throw new Error('Missing ZOHO_REFRESH_TOKEN in environment. Set it in functions/.env and restart.');
if (refresh_token.toLowerCase() === 'undefined') throw new Error('ZOHO_REFRESH_TOKEN is the string "undefined". Fix your .env value.');

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

  let res;
  try {
    const form = new URLSearchParams();
    form.append('refresh_token', refresh_token);
    form.append('client_id', client_id);
    form.append('client_secret', client_secret);
    form.append('grant_type', 'refresh_token');

    res = await axios.post(
      'https://accounts.zoho.com/oauth/v2/token',
      form.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
        maxRedirects: 0,
        validateStatus: (s) => s >= 200 && s < 500, // let us inspect non-200 bodies
      }
    );
  } catch (e) {
    const status = e?.response?.status;
    const body = e?.response?.data;
    const preview =
      typeof body === 'string'
        ? body.slice(0, 300)
        : JSON.stringify(body || {}).slice(0, 300);
    throw new Error(
      `Zoho refresh failed${
        status ? ` (${status})` : ''
      }. Body preview=${preview}`
    );
  }

  if (res.status !== 200) {
    const preview = typeof res.data === 'string' ? res.data.slice(0, 300) : JSON.stringify(res.data || {}).slice(0, 300);
    throw new Error(`Zoho refresh HTTP ${res.status}. Body preview=${preview}`);
  }

  const body = res?.data || {};
  const token = body.access_token;

  // Be defensive: Zoho returns expires_in as a string; default to 3600s
  const rawExpires = Number(body.expires_in);
  const expiresInSec = Number.isFinite(rawExpires) ? rawExpires : 3600;
  if (!token || typeof token !== 'string') {
    const preview = JSON.stringify(body).slice(0, 300);
    const hint = /invalid_code/i.test(preview)
      ? ' Hint: The refresh token is invalid for this client or empty in your running env. Update ZOHO_REFRESH_TOKEN in functions/.env and restart.'
      : '';
    throw new Error(`Zoho refresh returned no access_token. Body preview=${preview}.${hint}`);
  }

  // refresh 5 minutes early
  const expiresAt = Date.now() + Math.max(0, (expiresInSec - 300)) * 1000;

  await TOKEN_DOC.set({ token, expiresAt }, { merge: true });

  return token;
};

// ⛑ Error handler wrapper
export const handleZohoRequestWithRetry = async (requestFn) => {
  const attempt = async () => {
    const token = await getAccessToken('zoho');
    return requestFn(token);
  };

  try {
    return await attempt();
  } catch (error) {
    const status = error.response?.status;
    const headers = error.response?.headers || {};
    const ct = headers['content-type'] || headers['Content-Type'] || '';
    const body = error.response?.data;
    const bodyStr =
      typeof body === 'string' ? body : JSON.stringify(body || '');
    const zCode = (typeof body === 'object' && body?.code) || undefined;

    const isHtml = /<html/i.test(bodyStr) || /text\/html/i.test(ct);
    const isRedirect = status >= 300 && status < 400;
    const isAuthFail = status === 401 || isRedirect || zCode === 57 || isHtml;

    if (isAuthFail) {
      // Clear cached token and refresh once, then retry
      const TOKEN_DOC = db.collection('access_tokens').doc('zoho');
      await TOKEN_DOC.delete();
      const newToken = await getAccessToken('zoho');
      try {
        return await requestFn(newToken);
      } catch (e2) {
        const s2 = e2.response?.status;
        const h2 = e2.response?.headers || {};
        const ct2 = h2['content-type'] || h2['Content-Type'] || '';
        const b2 = e2.response?.data;
        const preview2 =
          typeof b2 === 'string'
            ? b2.slice(0, 300)
            : JSON.stringify(b2 || {}).slice(0, 300);
        throw new Error(
          `Zoho request failed after refresh${
            s2 ? ` (${s2})` : ''
          }. ct=${ct2} preview=${preview2}`
        );
      }
    }

    // Not an auth/redirect/HTML failure; rethrow original error
    throw error;
  }
};

export const fetchWithCache = async (
  key,
  ttlMs = DEFAULT_TTL,
  collection,
  fetchFn
) => {
  const cacheDoc = db.collection('cache_control').doc(key);
  const cacheData = await cacheDoc.get();
  const now = Date.now();

  if (cacheData.exists && now - cacheData.data().lastFetched < ttlMs) {
    const snapshot = await db
      .collection('cached_data')
      .doc(key)
      .collection(collection)
      .get();
    return snapshot.docs.map((doc) => doc.data());
  }

  const items = await fetchFn();

  const batch = db.batch();
  items.forEach((item) => {
    const ref = db
      .collection('cached_data')
      .doc(key)
      .collection(collection)
      .doc(item.invoice_id);
    batch.set(ref, item, { merge: true });
  });
  batch.set(cacheDoc, { lastFetched: now });
  await batch.commit();

  return items;
};
