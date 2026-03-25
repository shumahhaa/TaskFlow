import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAuZ7vaH8dmnk37N1uldOvburVyOjr7L-o",
  authDomain: "taskflow-aa1a6.firebaseapp.com",
  projectId: "taskflow-aa1a6",
  storageBucket: "taskflow-aa1a6.firebasestorage.app",
  messagingSenderId: "939756137027",
  appId: "1:939756137027:web:eae06071465a92f5b702f6",
  measurementId: "G-ZVJ8WCSTKM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged };
