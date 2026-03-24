import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCGGwzOZrNYK0KuQRQLzpBHUATgYa9L8Pg",
  authDomain: "spicegarden49.firebaseapp.com",
  projectId: "spicegarden49",
  storageBucket: "spicegarden49.firebasestorage.app",
  messagingSenderId: "661508411420",
  appId: "1:661508411420:web:b645233ac53e9c29c10fd9",
  measurementId: "G-ZQV32VP51Y"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
