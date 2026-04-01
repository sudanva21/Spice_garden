import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Assuming user will set FIREBASE_SERVICE_ACCOUNT base64 string or we use default app if possible in deployment.
// But mostly we expect FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
// or a FIREBASE_SERVICE_ACCOUNT_JSON env variable.

let isMockMode = false;

try {
  let credential = undefined;

  // Let's support either a full JSON string passed in an env var OR individual variables.
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      credential = admin.credential.cert(serviceAccount);
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      credential = admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Replace escaped newlines so it parses properly
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      });
  }

  admin.initializeApp({
      credential: credential,
  });

  if (!credential) {
      console.warn('⚠️ No Firebase credentials found. Using default application credentials, which might fail locally without Google Cloud SDK.');
  }

} catch (error: any) {
  console.error('🔥 Firebase Admin Initialization Error details:', error.message);
  console.warn('⚠️ Starting in mock mode because Firebase failed to initialize.');
  isMockMode = true;
}

// Export a mock db if we failed to initialize to avoid crashing the server
export const db = isMockMode ? {
    collection: () => ({ doc: () => ({ get: async () => ({ exists: false }), update: async () => ({}), set: async () => ({}), delete: async () => ({}) }), where: () => ({ get: async () => ({ docs: [] }), orderBy: () => ({ get: async () => ({ docs: [] }) }) }) })
} as any : admin.firestore();
export const mockMode = isMockMode;

