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

// ✅ USER LOGIN
app.post("/login", (req, res) => {
    console.log("🔍 Login request received:", req.body);

    const { email, password } = req.body;
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
        if (err || !user) {
            console.log("❌ User not found:", email);
            return res.status(400).json({ error: "Invalid credentials" });
        }

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

// ✅ FETCH STUDENTS FOR TRAINER
app.get("/students", (req, res) => {
    const { classType } = req.query;
    db.all("SELECT * FROM students WHERE class = ?", [classType], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ✅ SAVE ATTENDANCE
app.post("/attendance", (req, res) => {
    const { student_id, classType, date, time, status } = req.body;

    db.run("INSERT INTO attendance (student_id, class, date, time, status) VALUES (?, ?, ?, ?, ?)",
        [student_id, classType, date, time, status],
        function (err) {
            if (err) return res.status(500).json({ error: "Failed to save attendance" });
            res.json({ message: "Attendance saved!" });
        });
});

// ✅ EXPORT ATTENDANCE (ADMIN ONLY)
app.get("/export-attendance", (req, res) => {
    db.all("SELECT * FROM attendance", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ✅ SERVE FRONTEND
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
