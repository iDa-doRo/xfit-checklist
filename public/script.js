document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:5050/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error("Login failed: " + response.statusText);
        }

        const data = await response.json();
        console.log("✅ Login Successful:", data);
        alert("Login successful! Redirecting...");

        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("class", data.class);

        if (data.role === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "trainer.html";
        }
    } catch (error) {
        console.error("❌ Login error:", error);
        alert("Invalid credentials!");
    }
});
