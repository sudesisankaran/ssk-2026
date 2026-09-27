import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAnWAtEnknyVlkEBSscISbHzdVf8dRa6Ds",
  authDomain: "ssk-2026.firebaseapp.com",
  projectId: "ssk-2026",
  storageBucket: "ssk-2026.firebasestorage.app",
  messagingSenderId: "985457311373",
  appId: "1:985457311373:web:93ffa9d70a1d51bf1aecc4",
  measurementId: "G-EEW8W5YSRR"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
