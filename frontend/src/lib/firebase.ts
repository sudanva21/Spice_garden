import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDAsUoo5lXTKBXl9nIZ6MVOsXUwFQv5LOk",
  authDomain: "spicegardengkk.firebaseapp.com",
  projectId: "spicegardengkk",
  storageBucket: "spicegardengkk.firebasestorage.app",
  messagingSenderId: "278641033261",
  appId: "1:278641033261:web:13cf23f7e69a87b144f8a4",
  measurementId: "G-CCLK9NQZS0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
