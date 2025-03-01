// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, setDoc, doc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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

function showMessage(message, divId) {
  var messageDiv = document.getElementById(divId);
  messageDiv.style.display = "block";
  messageDiv.innerHTML = message;
  messageDiv.style.opacity = 1;
  setTimeout(function () {
    messageDiv.style.opacity = 0;
  }, 5000);
}

const signUp = document.getElementById('submitSignUp');
signUp.addEventListener('click', (event) => {
  event.preventDefault();
  const email = document.getElementById('rEmail').value;
  const password = document.getElementById('rPassword').value;
  const firstName = document.getElementById('fName').value;
  const lastName = document.getElementById('lName').value;
  const Roll_number = document.getElementById('rRoll_Number').value;
  const Department = document.getElementById('rDepartment').value;
  const semester = document.getElementById('rSemester').value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const userData = {
        email: email,
        firstName: firstName,
        lastName: lastName,
        Roll_Number: Roll_number,
        Semester: semester,
        Department: Department
      };
      showMessage('Account Created Successfully', 'signUpMessage');
      const docRef = doc(db, "users", user.uid);
      setDoc(docRef, userData)
        .then(() => {
          window.location.href = 'index.html';
        })
        .catch((error) => {
          console.error("error writing document", error);
        });
    })
    .catch((error) => {
      const errorCode = error.code;
      if (errorCode == 'auth/email-already-in-use') {
        showMessage('Email Address Already Exists !!!', 'signUpMessage');
      } else {
        showMessage('Unable to create User', 'signUpMessage');
      }
    });
});
async function populateDepartments() {
  const departmentSelect = document.getElementById('rDepartment');
  const querySnapshot = await getDocs(collection(db, "classes"));
  
  querySnapshot.forEach((doc) => {
    const option = document.createElement('option');
    option.value = doc.id;
    option.textContent = doc.data().name;
    departmentSelect.appendChild(option);
  });
}

document.addEventListener('DOMContentLoaded', populateDepartments);

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
      user.getIdToken().then((token) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('loggedInUserId', user.uid);
        window.location.href = 'homepage.html';
      });
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