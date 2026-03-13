import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// These will be provided by the user in the environment
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "placeholder",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "placeholder",
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || "placeholder",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "placeholder",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "placeholder",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "placeholder",
  appId: process.env.VITE_FIREBASE_APP_ID || "placeholder"
};

const app = initializeApp(firebaseConfig);
export const rtdb = getDatabase(app);
