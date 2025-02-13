const bcrypt = require("bcryptjs");

// Users with plaintext passwords (same as added in DB Browser)
const users = [
    { email: "giulia@example.com", password: "admin123" },
    { email: "vanesa@example.com", password: "mma123" },
    { email: "karim@example.com", password: "boxing123" },
];

// Hash each password and output SQL UPDATE statements
async function hashPasswords() {
    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        console.log(`UPDATE users SET password = '${hashedPassword}' WHERE email = '${user.email}';`);
    }
}

hashPasswords();
