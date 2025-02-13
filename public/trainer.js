const token = localStorage.getItem("token");
const classType = localStorage.getItem("class");
const trainerId = localStorage.getItem("trainerId");

document.getElementById("sessionTime").addEventListener("change", loadStudents);
document.getElementById("loadStudents").addEventListener("click", loadStudents);
document.getElementById("saveAttendance").addEventListener("click", saveAttendance);
document.getElementById("logout").addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
});

// ✅ Load session times
async function loadSessionTimes() {
    const response = await fetch("http://localhost:5050/session-times");
    const times = await response.json();
    const select = document.getElementById("sessionTime");
    select.innerHTML = '<option value="">--Select Time--</option>';
    times.forEach(time => {
        const option = document.createElement("option");
        option.value = time;
        option.textContent = time;
        select.appendChild(option);
    });
}

// ✅ Load students after selecting a session
async function loadStudents() {
    const sessionTime = document.getElementById("sessionTime").value;
    const date = new Date().toISOString().split("T")[0];

    if (!sessionTime) {
        alert("Please select a session time.");
        return;
    }

    const response = await fetch(`http://localhost:5050/students?classType=${classType}&sessionTime=${sessionTime}&date=${date}`);
    const students = await response.json();

    const studentList = document.getElementById("studentList");
    studentList.innerHTML = "";

    students.forEach(student => {
        const li = document.createElement("li");
        li.textContent = student.name;

        const select = document.createElement("select");
        select.innerHTML = `
            <option value="present" ${student.status === "present" ? "selected" : ""}>Present</option>
            <option value="absent" ${student.status === "absent" ? "selected" : ""}>Absent</option>
        `;
        select.dataset.studentId = student.id;
        li.appendChild(select);

        studentList.appendChild(li);
    });
}

// ✅ Save attendance for the session
async function saveAttendance() {
    const sessionTime = document.getElementById("sessionTime").value;
    const date = new Date().toISOString().split("T")[0];

    const attendanceRecords = Array.from(document.querySelectorAll("#studentList select")).map(select => ({
        student_id: select.dataset.studentId,
        status: select.value
    }));

    await fetch("http://localhost:5050/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainer_id: trainerId, classType, sessionTime, date, attendanceRecords })
    });

    alert("Attendance saved!");
}

loadSessionTimes();
