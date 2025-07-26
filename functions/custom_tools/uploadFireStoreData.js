// uploadFirestoreData.js

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- CONFIG --- //
const serviceAccountPath = path.resolve(__dirname, '..', 'firebase-service-account.json');
const jsonFilePath = process.argv[2]; // e.g., ./frontend/src/lib/data/test-data/invoice_test_data.js
const firestorePath = process.argv[3]; // e.g., zoho/invoices_with_line_items

if (!jsonFilePath || !firestorePath) {
  console.error(
    'Usage: node uploadFirestoreData.js <path-to-json> <collection-name>'
  );
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
initializeApp({ credential: cert(serviceAccount) });

const db = getFirestore();

(async () => {
  try {
    const jsonData = (await import(path.resolve(jsonFilePath))).default;
    if (!Array.isArray(jsonData)) {
      throw new Error('JSON file must export an array as default');
    }

    const [rootCollection, ...subPaths] = firestorePath.split('/');
    const baseCollection = db.collection(rootCollection);
    const batch = db.batch();
    jsonData.forEach((doc) => {
      const docId =
        doc.id ||
        doc.invoice_id?.toString() ||
        db.collection(firestorePath).doc().id;
      const ref = subPaths.length
        ? subPaths
            .reduce(
              (ref, segment, i) =>
                i % 2 === 0 ? ref.doc(segment) : ref.collection(segment),
              baseCollection
            )
            .doc(docId)
        : baseCollection.doc(docId);
      batch.set(ref, doc);
    });

    await batch.commit();
    console.log('✅ Data uploaded to Firestore.');
  } catch (err) {
    console.error('🔥 Upload failed:', err.message);
    process.exit(1);
  }
})();
