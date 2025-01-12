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
        // Send login request
        const response = await fetch("http://127.0.0.1:8000/api/users/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });
 
        // Handle non-OK response
        if (!response.ok) {
            const errorData = await response.json();
            showAlert(`Login failed: ${errorData.message || "Invalid credentials"}`, false);
            return;
        }

        // Parse successful response
        const data = await response.json();
        localStorage.setItem("accessToken", data.access); // Store access token
        localStorage.setItem("userRole", data.role); // Store user role based on backend response

        showAlert("Login successful!", true);

        // Redirect based on user role
        if (data.role === "admin") {
            window.location.href = "../admin/admin-dashboard.html";
        } else if (data.role === "student") {
            window.location.href = "../user/dashboard.html";
        } else {
            showAlert("Unknown user role. Please contact support.", false);
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
    alert.style.color = "#ffffff";
    alert.style.padding = "10px 20px";
    alert.style.position = "fixed";
    alert.style.top = "20px";
    alert.style.right = "20px";
    alert.style.borderRadius = "5px";
    alert.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.3)";
    alert.textContent = message;

    document.body.appendChild(alert);

    setTimeout(() => {
        alert.remove();
    }, 3000);
}
