// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
  addDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// TODO: លោកអ្នកត្រូវយក Firebase Config របស់លោកអ្នកមកជំនួសនៅទីនេះ
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

export { db, doc, getDoc, setDoc, onSnapshot, collection, addDoc, query, orderBy, auth, signInWithEmailAndPassword, onAuthStateChanged, signOut };
