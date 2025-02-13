const token = localStorage.getItem("token");

// Fetch and export attendance
async function exportAttendance() {
    const res = await fetch(`${API_URL}/export-attendance`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await res.json();

    if (res.ok) {
        console.log("Attendance Records:", data);
        alert("✅ Attendance exported! Check console.");
    } else {
        document.getElementById("message").textContent = data.error;
    }
}
