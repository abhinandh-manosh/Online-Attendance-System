// Firebase Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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
const db = getFirestore();

console.log(app);
const attendanceContainer = document.getElementById("attendanceContainer");

async function loadAttendance() {
    const classesSnapshot = await getDocs(collection(db, "classes"));
    const studentsSnapshot = await getDocs(collection(db, "students"));
    const attendanceSnapshot = await getDocs(collection(db, "attendance"));

    const classes = {};
    classesSnapshot.forEach(doc => {
        classes[doc.id] = { name: doc.id, students: [] };
    });

    studentsSnapshot.forEach(doc => {
        const student = doc.data();
        if (classes[student.class]) {
            classes[student.class].students.push({ ...student, attendance: [], semester: student.semester });
        }
    });

    attendanceSnapshot.forEach(doc => {
        const attendance = doc.data();
        const classStudents = classes[attendance.class]?.students;
        if (classStudents) {
            const student = classStudents.find(s => s.rollNumber === attendance.rollNumber);
            if (student) {
                student.attendance.push(attendance.status);
            }
        }
    });

    for (const className in classes) {
        const classData = classes[className];
        const classSection = document.createElement("div");
        classSection.classList.add("class-section");

        const classTitle = document.createElement("div");
        classTitle.classList.add("class-title");
        classTitle.textContent = `Department: ${classData.name}`;
        classSection.appendChild(classTitle);

        const table = document.createElement("table");
        const thead = document.createElement("thead");
        thead.innerHTML = `
            <tr>
                <th>Roll Number</th>
                <th>Name</th>
                <th>Semester</th>
                <th>Attendance Percentage</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        classData.students.forEach(student => {
            const totalClasses = student.attendance.length;
            const presentCount = student.attendance.filter(status => status === "Present").length;
            const attendancePercentage = totalClasses ? ((presentCount / totalClasses) * 100).toFixed(2) : "0.00";

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${student.rollNumber}</td>
                <td>${student.name}</td>
                <td>${student.semester}</td>
                <td>${attendancePercentage}%</td>
            `;
            tbody.appendChild(row);
        });
        table.appendChild(tbody);

        classSection.appendChild(table);
        attendanceContainer.appendChild(classSection);
    }
}

window.onload = loadAttendance;