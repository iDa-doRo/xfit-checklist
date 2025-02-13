const bcrypt = require("bcryptjs");
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("gym_attendance.db");

const users = [
    { email: "giulia@example.com", password: "admin123" },
    { email: "vanesa@example.com", password: "mma123" },
    { email: "karim@example.com", password: "boxing123" }
];

async function hashAndUpdatePasswords() {
    db.serialize(() => {
        users.forEach(async (user) => {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            db.run("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, user.email], function (err) {
                if (err) {
                    console.error(`❌ Error updating password for: ${user.email}`, err);
                } else {
                    console.log(`✅ Password updated for: ${user.email}`);
                }
            });
        });
    });
}

hashAndUpdatePasswords();
