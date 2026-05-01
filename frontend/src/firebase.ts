// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDgsrCeVh4SkoDUvWoYfuiHtvCf-4kKsiQ",
  authDomain: "digital-mental-health-f04bb.firebaseapp.com",
  projectId: "digital-mental-health-f04bb",
  storageBucket: "digital-mental-health-f04bb.firebasestorage.app",
  messagingSenderId: "714563759007",
  appId: "1:714563759007:web:3dd287c3498fd3b7592baa",
  measurementId: "G-H5WN7LGCNJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize and export Firebase Auth and Firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
