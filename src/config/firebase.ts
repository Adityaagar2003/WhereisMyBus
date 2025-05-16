import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAlG7GmGiHVG_J0KyjR35PTxYH-mKQ0yo0",
  authDomain: "bitbus-77c95.firebaseapp.com",
  databaseURL: "https://bitbus-77c95-default-rtdb.firebaseio.com",
  projectId: "bitbus-77c95",
  storageBucket: "bitbus-77c95.firebasestorage.app",
  messagingSenderId: "17457960794",
  appId: "1:17457960794:web:41d665b10d976187014563",
  measurementId: "G-PDQ71P8X06"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication
export const auth = getAuth(app);

// Realtime Database
export const database = getDatabase(app);

// Analytics with browser support check
export const analytics = (() => {
  if (typeof window !== 'undefined') {
    return isSupported().then(yes => yes ? getAnalytics(app) : null);
  }
  return null;
})(); 