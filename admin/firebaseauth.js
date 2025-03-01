// Firebase Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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

console.log(app);

function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);
  messageDiv.style.display = "block";
  messageDiv.innerHTML = message;
  messageDiv.style.opacity = 1;
  setTimeout(() => {
    messageDiv.style.opacity = 0;
  }, 5000);
}

// Signup Handler
document.getElementById('submitSignUp').addEventListener('click', (event) => {
  event.preventDefault();
  const email = document.getElementById('rEmail').value;
  const password = document.getElementById('rPassword').value;
  const admin = document.getElementById('radmin').value;
  const id = document.getElementById('rid').value;

  if (!email || !password || !admin || !id) {
    showMessage('All fields are required.', 'signUpMessage');
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const userData = { email, admin, id };
      showMessage('Account Created Successfully', 'signUpMessage');
      
      return setDoc(doc(db, "admins", user.uid), userData);
    })
    .then(() => {
      window.location.href = 'index.html';
    })
    .catch((error) => {
      const errorCode = error.code;
      if (errorCode === 'auth/email-already-in-use') {
        showMessage('Email Address Already Exists !!!', 'signUpMessage');
      } else {
        showMessage('Unable to create user. Please try again.', 'signUpMessage');
      }
    });
});

// Signin Handler
document.getElementById('submitSignIn').addEventListener('click', (event) => {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showMessage('Email and password are required.', 'signInMessage');
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      showMessage('Login successful', 'signInMessage');
      localStorage.setItem('loggedInUserId', user.uid);
      window.location.href = 'homepage.html';
    })
    .catch((error) => {
      const errorCode = error.code;
      if (errorCode === 'auth/wrong-password') {
        showMessage('Incorrect password.', 'signInMessage');
      } else if (errorCode === 'auth/user-not-found') {
        showMessage('Account does not exist.', 'signInMessage');
      } else {
        showMessage('Login failed. Please try again.', 'signInMessage');
      }
    });
});
