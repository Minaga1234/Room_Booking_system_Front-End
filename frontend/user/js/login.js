document.getElementById("login-form").addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevent default form submission behavior

    // Fetch input values
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const isAdmin = document.getElementById("cbx-51").checked;

    // Custom validation
    if (!email || !password) {
        showAlert("Both fields are required!", false);
        return;
    }

    if (!validateEmail(email)) {
        showAlert("Email must follow the format 'user@our.ecu.edu.au'!", false);
        return;
    }

    try {
        const response = await fetch("http://127.0.0.1:8000/api/users/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            showAlert(`Login failed: ${errorData.message || "Invalid credentials"}`, false);
            return;
        }

        const data = await response.json();
        localStorage.setItem("accessToken", data.access); // Store access token
        localStorage.setItem("userRole", isAdmin ? "admin" : "student"); // Store user role

        showAlert("Login successful!", true);

        // Redirect based on user role
        if (isAdmin) {
            window.location.href = "../admin/dashboard.html";
        } else {
            window.location.href = "../user/dashboard.html";
        }
    } catch (error) {
        console.error("Login error:", error);
        showAlert("An unexpected error occurred. Please try again.", false);
    }
});

// Function to validate email with specific format
function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@our\.ecu\.edu\.au$/;
    return emailRegex.test(email);
}

// Function to Display Alert Messages
function showAlert(message, success = false) {
    const alert = document.createElement("div");
    alert.className = "alert-popup";
    alert.style.backgroundColor = success ? "#4CAF50" : "#ff4d4d";
    alert.textContent = message;

    document.body.appendChild(alert);

    setTimeout(() => {
        alert.remove();
    }, 3000);
}
