const token = localStorage.getItem("token");
const classType = localStorage.getItem("class");

async function loadStudents() {
    const response = await fetch(`http://localhost:5050/students?classType=${classType}`);
    const students = await response.json();

    const studentList = document.getElementById("studentList");
    studentList.innerHTML = "";

    students.forEach(student => {
        const li = document.createElement("li");
        li.textContent = student.name;
        const button = document.createElement("button");
        button.textContent = "Mark Present";
        button.onclick = () => markAttendance(student.id);
        li.appendChild(button);
        studentList.appendChild(li);
    });
}

async function markAttendance(studentId) {
    const date = new Date().toISOString().split("T")[0];
    await fetch("http://localhost:5050/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId, classType, date, time: "10:00 AM", status: "present" })
    });
    alert("Attendance marked!");
}

document.getElementById("logout").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
});

loadStudents();
