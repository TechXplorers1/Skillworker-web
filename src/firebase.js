// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

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

export { auth, database, db };