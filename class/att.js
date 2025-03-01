import { db, collection, getDocs, addDoc, setDoc, doc, query, where } from "./firebase-config.js";

const classSelect = document.getElementById("classSelect");
const semesterSelect = document.getElementById("semesterSelect");
const studentTableBody = document.getElementById("studentTableBody");
const totalStudentsSpan = document.getElementById("totalStudents");
const totalPresentSpan = document.getElementById("totalPresent");
const totalAbsentSpan = document.getElementById("totalAbsent");
const totalLeaveSpan = document.getElementById("totalLeave");
const submitAttendanceBtn = document.getElementById("submitAttendance");

// Class Modal Elements
const classModal = document.getElementById("classModal");
const addClassBtn = document.getElementById("addClassBtn");
const closeClassModal = document.getElementById("closeClassModal");
const saveClass = document.getElementById("saveClass");
const classNameInput = document.getElementById("className");

// Student Modal Elements
const studentModal = document.getElementById("studentModal");
const addStudentBtn = document.getElementById("addStudentBtn");
const closeStudentModal = document.getElementById("closeStudentModal");
const saveStudent = document.getElementById("saveStudent");
const studentNameInput = document.getElementById("studentName");
const rollNumberInput = document.getElementById("rollNumber");

// Get Current Date (YYYY-MM-DD)
const currentDate = new Date().toISOString().split("T")[0];

// Open and Close Modals
addClassBtn.onclick = () => (classModal.style.display = "block");
closeClassModal.onclick = () => (classModal.style.display = "none");

addStudentBtn.onclick = () => {
    if (!classSelect.value || !semesterSelect.value) {
        alert("Please select a class and semester first!");
        return;
    }
    studentModal.style.display = "block";
};
closeStudentModal.onclick = () => (studentModal.style.display = "none");

// Add Class to Firestore
saveClass.onclick = async () => {
    const className = classNameInput.value.trim();
    if (!className) {
        alert("Please enter a class name.");
        return;
    }

    const classDocRef = doc(db, "classes", className);
    await setDoc(classDocRef, { name: className });

    classSelect.innerHTML += `<option value="${className}">${className}</option>`;
    classModal.style.display = "none";
    classNameInput.value = "";
};

// Add Student to Firestore
saveStudent.onclick = async () => {
    const studentName = studentNameInput.value.trim();
    const rollNumber = rollNumberInput.value.trim();
    const className = classSelect.value;
    const semester = semesterSelect.value;

    if (!studentName || !rollNumber) {
        alert("Please fill out all fields.");
        return;
    }

    const studentData = { name: studentName, rollNumber, class: className, semester };
    await addDoc(collection(db, "students"), studentData);

    // Refresh student list
    loadStudents();

    studentModal.style.display = "none";
    studentNameInput.value = "";
    rollNumberInput.value = "";
};

// Load Classes from Firestore
async function loadClasses() {
    const querySnapshot = await getDocs(collection(db, "classes"));
    classSelect.innerHTML = `<option value="">Select a Class</option>`;
    querySnapshot.forEach((doc) => {
        classSelect.innerHTML += `<option value="${doc.id}">${doc.id}</option>`;
    });
}

// Load Students & Attendance for Selected Class and Semester
async function loadStudents() {
    studentTableBody.innerHTML = "";
    totalStudentsSpan.textContent = "0";
    totalPresentSpan.textContent = "0";
    totalAbsentSpan.textContent = "0";
    totalLeaveSpan.textContent = "0";

    if (!classSelect.value || !semesterSelect.value) return;

    const studentQuery = await getDocs(collection(db, "students"));
    const attendanceQuery = query(
        collection(db, "attendance"),
        where("class", "==", classSelect.value),
        where("semester", "==", semesterSelect.value),
        where("date", "==", currentDate)
    );
    const attendanceSnapshot = await getDocs(attendanceQuery);

    let attendanceRecords = {};
    attendanceSnapshot.forEach((doc) => {
        attendanceRecords[doc.data().rollNumber] = doc.data().status;
    });

    let studentCount = 0,
        presentCount = 0,
        absentCount = 0,
        leaveCount = 0;

    studentQuery.forEach((doc) => {
        const student = doc.data();
        if (student.class === classSelect.value && student.semester === semesterSelect.value) {
            let attendanceStatus = attendanceRecords[student.rollNumber] || "Absent"; // Default to Absent if not recorded

            if (attendanceStatus === "Present") presentCount++;
            else if (attendanceStatus === "Absent") absentCount++;
            else if (attendanceStatus === "Leave") leaveCount++;

            studentTableBody.innerHTML += `
                <tr>
                    <td>${student.rollNumber}</td>
                    <td>${student.name}</td>
                    <td>
                        <select class="attendanceSelect">
                            <option value="Present" ${
                                attendanceStatus === "Present" ? "selected" : ""
                            }>Present</option>
                            <option value="Absent" ${
                                attendanceStatus === "Absent" ? "selected" : ""
                            }>Absent</option>
                            <option value="Leave" ${
                                attendanceStatus === "Leave" ? "selected" : ""
                            }>Leave</option>
                        </select>
                    </td>
                </tr>
            `;
            studentCount++;
        }
    });

    totalStudentsSpan.textContent = studentCount;
    totalPresentSpan.textContent = presentCount;
    totalAbsentSpan.textContent = absentCount;
    totalLeaveSpan.textContent = leaveCount;
}

// Submit Attendance to Firestore
submitAttendanceBtn.onclick = async () => {
    if (!classSelect.value || !semesterSelect.value) {
        alert("Please select a class and semester first!");
        return;
    }

    const students = document.querySelectorAll("#studentTableBody tr");
    let presentCount = 0,
        absentCount = 0,
        leaveCount = 0;

    for (let student of students) {
        const rollNumber = student.cells[0].textContent;
        const studentName = student.cells[1].textContent;
        const attendanceStatus = student.cells[2].querySelector("select").value;

        // Store attendance record in Firestore (Replace existing record)
        await setDoc(
            doc(db, "attendance", `${classSelect.value}_${semesterSelect.value}_${currentDate}_${rollNumber}`),
            {
                class: classSelect.value,
                semester: semesterSelect.value,
                date: currentDate,
                rollNumber,
                name: studentName,
                status: attendanceStatus,
            }
        );

        // Update counts
        if (attendanceStatus === "Present") presentCount++;
        else if (attendanceStatus === "Absent") absentCount++;
        else if (attendanceStatus === "Leave") leaveCount++;
    }

    // Update UI counts
    totalPresentSpan.textContent = presentCount;
    totalAbsentSpan.textContent = absentCount;
    totalLeaveSpan.textContent = leaveCount;

    alert("Attendance Submitted Successfully!");
};

// Generate Excel Report
document.getElementById("generateReport").onclick = async () => {
    if (!classSelect.value || !semesterSelect.value) {
        alert("Please select a class and semester first!");
        return;
    }

    const studentQuery = await getDocs(collection(db, "students"));
    const attendanceQuery = query(
        collection(db, "attendance"),
        where("class", "==", classSelect.value),
        where("semester", "==", semesterSelect.value)
    );
    const attendanceSnapshot = await getDocs(attendanceQuery);

    let attendanceRecords = {};
    attendanceSnapshot.forEach((doc) => {
        const data = doc.data();
        if (!attendanceRecords[data.rollNumber]) {
            attendanceRecords[data.rollNumber] = { Present: 0, Absent: 0, Leave: 0, Total: 0 };
        }
        attendanceRecords[data.rollNumber][data.status]++;
        attendanceRecords[data.rollNumber].Total++;
    });

    let reportData = [["Roll Number", "Name", "Present", "Absent", "Leave", "Total", "Percentage"]];
    studentQuery.forEach((doc) => {
        const student = doc.data();
        if (student.class === classSelect.value && student.semester === semesterSelect.value) {
            const record = attendanceRecords[student.rollNumber] || { Present: 0, Absent: 0, Leave: 0, Total: 0 };
            const percentage = ((record.Present / record.Total) * 100).toFixed(2) || 0;
            reportData.push([
                student.rollNumber,
                student.name,
                record.Present,
                record.Absent,
                record.Leave,
                record.Total,
                `${percentage}%`
            ]);
        }
    });

    const ws = XLSX.utils.aoa_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
    XLSX.writeFile(wb, `Attendance_Report_${classSelect.value}_${semesterSelect.value}.xlsx`);
};

// Event Listeners
classSelect.addEventListener("change", loadStudents);
semesterSelect.addEventListener("change", loadStudents);

// Initial Load
window.onload = () => {
    loadClasses();
};