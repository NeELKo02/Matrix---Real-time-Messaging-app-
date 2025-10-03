// Firebase Configuration - Simple and Clean
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase config with hardcoded values (temporary fix)
const firebaseConfig = {
  apiKey: "AIzaSyACW7xnG98GxyTnw5qSuMs10WQnP1WWhZo",
  authDomain: "real-time-messaging-app-fdc75.firebaseapp.com",
  projectId: "real-time-messaging-app-fdc75",
  storageBucket: "real-time-messaging-app-fdc75.appspot.com",
  messagingSenderId: "558577540401",
  appId: "1:558577540401:web:b2698cf4bcae8fbf11a410",
  measurementId: "G-JVTDGV2CZ9",
};

console.log("🔥 Firebase Config apiKey ends with:", firebaseConfig.apiKey?.slice(-6));

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

console.log('✅ Firebase initialized successfully!');

export default app;