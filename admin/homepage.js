import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Firebase Configuration
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
const auth = getAuth();
const db = getFirestore();

// Authenticate and Fetch Admin Data
onAuthStateChanged(auth, (user) => {
  if (user) {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    if (loggedInUserId === user.uid) {
      const docRef = doc(db, "admins", loggedInUserId);
      getDoc(docRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            // Update UI with admin details
            document.getElementById('loggedAdminId').innerText = userData.id;
            document.getElementById('loggedAdminEmail').innerText = userData.email;
            document.getElementById('loggedAdminName').innerText = userData.admin;
            document.getElementById('Admin').innerText = userData.admin;
          } else {
            console.error("No matching document found.");
          }
        })
        .catch((error) => {
          console.error("Error fetching document:", error);
        });
    } else {
      console.error("User ID mismatch or not found in local storage.");
      window.location.href = 'index.html'; // Redirect to login page
    }
  } else {
    console.error("No user is currently logged in.");
    window.location.href = 'index.html'; // Redirect to login page
  }
});

// Logout Functionality
const logoutButton = document.getElementById('logout');
logoutButton.addEventListener('click', () => {
  localStorage.removeItem('loggedInUserId');
  signOut(auth)
    .then(() => {
      alert('Logged out successfully!');
      window.location.href = 'index.html';
    })
    .catch((error) => {
      console.error('Error signing out:', error);
    });
});

// Popup Show and Hide
document.getElementById('button').addEventListener('click', () => {
  const popup = document.querySelector('.popup');
  if (popup) {
    popup.style.display = "flex";
    popup.focus(); // Set focus for accessibility
  } else {
    console.error('Popup element not found.');
  }
});

document.getElementById('close').addEventListener('click', () => {
  const popup = document.querySelector('.popup');
  if (popup) {
    popup.style.display = "none";
  } else {
    console.error('Popup element not found.');
  }
});
