import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK on the server side
const app = initializeApp({
  credential: cert({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || `firebase-adminsdk-${process.env.VITE_FIREBASE_PROJECT_ID}@${process.env.VITE_FIREBASE_PROJECT_ID}.iam.gserviceaccount.com`,
    // Use a private key from environment variable or a demo key for development
    privateKey: process.env.FIREBASE_PRIVATE_KEY ? 
      process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : 
      "-----BEGIN PRIVATE KEY-----\nDEMO_KEY_FOR_DEVELOPMENT_ONLY\n-----END PRIVATE KEY-----\n"
  }),
  databaseURL: `https://${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseio.com`
});

export const db = getFirestore(app);