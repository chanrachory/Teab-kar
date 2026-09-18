import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
  addDoc,
  query,
  orderBy,
  deleteDoc,
  updateDoc,
  getDocs,
  where
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

// Exact Firebase Config provided in original codebase
const firebaseConfig = {
  apiKey: "AIzaSyB8NlvwM8W4qj8X_Pyc5NNRt3fxLi1lHR0",
  authDomain: "teabkar-7214c.firebaseapp.com",
  projectId: "teabkar-7214c",
  storageBucket: "teabkar-7214c.firebasestorage.app",
  messagingSenderId: "32022526650",
  appId: "1:32022526650:web:98068d1671b47c28352083",
  measurementId: "G-FNPKK1TH9D",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export {
  db,
  auth,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
  addDoc,
  query,
  orderBy,
  deleteDoc,
  updateDoc,
  getDocs,
  where,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
};
