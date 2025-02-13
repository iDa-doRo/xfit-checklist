const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 5050;
const SECRET_KEY = "your_secret_key";

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const db = new sqlite3.Database("gym_attendance.db");

// ✅ Health Check
app.get("/test", (req, res) => res.json({ message: "✅ Server is running!" }));

// ✅ USER LOGIN
app.post("/login", (req, res) => {
    console.log("🔍 Login request received:", req.body);

    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
        if (err || !user) {
            console.log("❌ User not found:", email);
            return res.status(400).json({ error: "Invalid credentials" });
        }

        console.log("🔑 Stored hashed password:", user.password);
        console.log("🔑 Entered password:", password);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("🔑 Password match:", isMatch);

        if (!isMatch) {
            console.log("❌ Incorrect password for:", email);
            return res.status(401).json({ error: "Incorrect password" });
        }

        const token = jwt.sign({ id: user.id, role: user.role, class: user.class }, SECRET_KEY, { expiresIn: "2h" });
        console.log("✅ Login successful for:", email);

        res.json({ token, role: user.role, class: user.class });
    });
});



// ✅ Trainer selects a session first
app.get("/session-times", (req, res) => {
    res.json(["10:00", "18:00", "20:00"]); // Predefined session times
});

// ✅ Fetch Students for a Specific Class & Session
app.get("/students", (req, res) => {
    const { classType, sessionTime, date } = req.query;

    if (!classType || !sessionTime || !date) {
        return res.status(400).json({ error: "Missing required parameters." });
    }

    db.all(
        `SELECT students.id, students.name, 
        (SELECT status FROM attendance 
         WHERE attendance.student_id = students.id 
         AND attendance.class = ? 
         AND attendance.session_time = ? 
         AND attendance.date = ?) AS status 
        FROM students 
        JOIN student_classes ON students.id = student_classes.student_id
        WHERE student_classes.class = ?`,
        [classType, sessionTime, date, classType],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// ✅ Save Attendance for the Entire Session
app.post("/attendance", (req, res) => {
    const { trainer_id, classType, sessionTime, date, attendanceRecords } = req.body;

    if (!trainer_id || !classType || !sessionTime || !date || !attendanceRecords) {
        return res.status(400).json({ error: "Missing required fields." });
    }

    const stmt = db.prepare(
        "INSERT INTO attendance (trainer_id, class, session_time, student_id, date, status) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(student_id, class, session_time, date) DO UPDATE SET status = excluded.status"
    );

    attendanceRecords.forEach(({ student_id, status }) => {
        stmt.run(trainer_id, classType, sessionTime, student_id, date, status);
    });

    stmt.finalize();
    res.json({ message: "Attendance saved successfully!" });
});

// ✅ Export Attendance (Admin Only)
app.get("/export-attendance", (req, res) => {
    db.all("SELECT * FROM attendance", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ✅ Serve Frontend
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(5050, () => console.log("🚀 Server running on http://localhost:5050"));