// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, setDoc, doc, query, where } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "**********************************",
    authDomain: "******************************",
    projectId: "*******************************",
    storageBucket: "*******************************",
    messagingSenderId: "*******************************",
    appId: "*******************************"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, getDocs, addDoc, setDoc, doc, query, where };