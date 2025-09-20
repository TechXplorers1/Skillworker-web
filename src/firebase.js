// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // FIX 1: Add the import for Storage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCaprd3Bxc-L6BBkSkwCxSym2yAZ7KhlDI",
  authDomain: "extra-hustle.firebaseapp.com",
  databaseURL: "https://extra-hustle-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "extra-hustle",
  storageBucket: "extra-hustle.firebasestorage.app",
  messagingSenderId: "743074055234",
  appId: "1:743074055234:web:349c19c08100e9a35799db"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const db = getFirestore(app);
const storage = getStorage(app); // FIX 2: Initialize the Storage service

export { auth, database, db, storage }; // FIX 3: Export storage along with the others