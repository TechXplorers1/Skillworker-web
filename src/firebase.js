// firebase.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCREoLcmWfoAGrYdWYDnQhuie90p4MKvHc",
  authDomain: "skill-services-ebc0f.firebaseapp.com",
  databaseURL: "https://skill-services-ebc0f-default-rtdb.firebaseio.com",
  projectId: "skill-services-ebc0f",
  storageBucket: "skill-services-ebc0f.firebasestorage.app",
  messagingSenderId: "701079892515",
  appId: "1:701079892515:web:ed7389d826d7b9531b7796",
  measurementId: "G-LSL0BPEC4C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, database, db, storage, analytics };