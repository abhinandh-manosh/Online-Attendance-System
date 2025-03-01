import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, getDoc, doc, query, collection, where, getDocs } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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

// Function to check if marks are pass or fail
function checkPassFail(score) {
  return score >= 40 ? "Pass" : "Fail";
}

// Function to fetch and display student marks
async function fetchStudentMarks(rollNumber) {
  const docRef = doc(db, "students", rollNumber);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
      const studentData = docSnap.data();
      const marks = studentData.marks;
      let displayMarks = "<table border='1'><tr><th>Semester</th><th>Series Exam</th><th>Subject</th><th>Score</th><th>Status</th></tr>";

      for (let semester in marks) {
          for (let seriesExam in marks[semester]) {
              for (let subject in marks[semester][seriesExam]) {
                  const score = marks[semester][seriesExam][subject];
                  displayMarks += `<tr>
                      <td>${semester}</td>
                      <td>${seriesExam}</td>
                      <td>${subject}</td>
                      <td>${score}</td>
                      <td>${checkPassFail(score)}</td>
                  </tr>`;
              }
          }
      }

      displayMarks += "</table>";
      document.getElementById("studentMarks").innerHTML = displayMarks;
  } else {
      document.getElementById("studentMarks").innerHTML = "No marks found.";
  }
}

// Function to fetch and display student attendance with percentage
async function displayStudentAttendance(rollNumber, department) {
  if (rollNumber && department) {
      try {
          const attendanceQuery = query(
              collection(db, "attendance"),
              where("rollNumber", "==", rollNumber),
              where("class", "==", department)
          );
          const attendanceSnapshot = await getDocs(attendanceQuery);

          if (!attendanceSnapshot.empty) {
              let attendanceRecords = "<table border='1'><tr><th>Date</th><th>Status</th></tr>";
              let totalDays = 0;
              let presentDays = 0;

              attendanceSnapshot.forEach((doc) => {
                  const attendanceData = doc.data();
                  attendanceRecords += `<tr>
                      <td>${attendanceData.date}</td>
                      <td>${attendanceData.status}</td>
                  </tr>`;
                  totalDays++;
                  if (attendanceData.status === "Present") {
                      presentDays++;
                  }
              });

              attendanceRecords += "</table>";
              const attendancePercentage = (presentDays / totalDays) * 100;
              attendanceRecords += `<p>Attendance Percentage: ${attendancePercentage.toFixed(2)}%</p>`;
              document.getElementById("studentAttendance").innerHTML = attendanceRecords;
          } else {
              document.getElementById("studentAttendance").innerHTML = "No attendance records found for this student.";
          }
      } catch (e) {
          console.error("Error fetching attendance records: ", e);
      }
  } else {
      document.getElementById("studentAttendance").innerHTML = "Roll number or department is missing.";
  }
}

// Authenticate and Fetch Admin Data
onAuthStateChanged(auth, (user) => {
  if (user) {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    const authToken = localStorage.getItem('authToken');
    if (loggedInUserId === user.uid && authToken) {
      user.getIdTokenResult().then((idTokenResult) => {
        const currentTime = new Date().getTime() / 1000;
        if (idTokenResult.expirationTime < currentTime) {
          console.error("Token expired.");
          window.location.href = 'index.html'; // Redirect to login page
        } else {
          const docRef = doc(db, "users", loggedInUserId);
          getDoc(docRef)
            .then((docSnap) => {
              if (docSnap.exists()) {
                const userData = docSnap.data();
                // Update UI with admin details
                document.getElementById('loggedUserFName').innerText = userData.firstName;
                document.getElementById('UserFName').innerText = userData.firstName;
                document.getElementById('loggedUserEmail').innerText = userData.email;
                document.getElementById('loggedUserLName').innerText = userData.lastName;
                document.getElementById('loggedUserRoll_Number').innerText = userData.Roll_Number;
                document.getElementById('loggedUserDepartment').innerText = userData.Department;
                document.getElementById('UserLName').innerText = userData.lastName;
                document.getElementById('loggedUserSemester').innerText = userData.Semester;

                // Fetch and display student marks and attendance using the roll number and department
                const userRollNumber = userData.Roll_Number;
                const userDepartment = userData.Department;
                fetchStudentMarks(userRollNumber);
                displayStudentAttendance(userRollNumber, userDepartment);
              } else {
                console.error("No matching document found.");
              }
            })
            .catch((error) => {
              console.error("Error fetching document:", error);
            });
        }
      }).catch((error) => {
        console.error("Error getting token result:", error);
        window.location.href = 'index.html'; // Redirect to login page
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
  localStorage.removeItem('authToken');
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