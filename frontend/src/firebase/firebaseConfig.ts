// src/firebase/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDgsrCeVh4SkoDUvWoYfuiHtvCf-4kKsiQ",
  authDomain: "digital-mental-health-f04bb.firebaseapp.com",
  projectId: "digital-mental-health-f04bb",
  storageBucket: "digital-mental-health-f04bb.appspot.com", // ✅ fixed here
  messagingSenderId: "714563759007",
  appId: "1:714563759007:web:3dd287c3498fd3b7592baa",
  measurementId: "G-H5WN7LGCNJ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
