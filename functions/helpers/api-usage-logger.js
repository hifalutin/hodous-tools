import { getFirestore } from 'firebase-admin/firestore';

export async function logApiCall({ api, endpoint, status, headers }) {
  try {
    const db = getFirestore();
    const dateKey = new Date().toISOString().split('T')[0];
    const logRef = db
      .collection('apiUsage')
      .doc(api)
      .collection(dateKey)
      .doc();
    const cleanHeaders = Object.fromEntries(
      Object.entries({
        'x-ratelimit-limit': headers['x-ratelimit-limit'],
        'x-ratelimit-remaining': headers['x-ratelimit-remaining'],
        'x-ratelimit-reset': headers['x-ratelimit-reset'],
     }).filter(([key, value]) => value !== undefined)
    );

    await logRef.set({
      endpoint,
      status,
      headers: cleanHeaders,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error logging API usage:', error);
  }
}
