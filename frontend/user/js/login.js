document.getElementById("login-form").addEventListener("submit", function (e) {
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

    // If validation passes, log the details and redirect
    showAlert("Login successful!", true);
    console.log("Login Details:", { email, password, isAdmin });

    // Redirect based on user role
    if (isAdmin) {
        window.location.href = "../admin/admin-dashboard.html";
    } else {
        window.location.href = "../user/dashboard.html";
    }
});

// Function to validate email with specific format
function validateEmail(email) {
    // Regex for specific email format 'user@our.ecu.edu.au'
    const emailRegex = /^[a-zA-Z0-9._%+-]+@our\.ecu\.edu\.au$/;
    return emailRegex.test(email);
}

// Function to Display Alert Messages
function showAlert(message, success = false) {
    // Create alert popup
    const alert = document.createElement("div");
    alert.className = "alert-popup";
    alert.style.backgroundColor = success ? "#4CAF50" : "#ff4d4d"; // Green for success, red for error
    alert.textContent = message;

    // Append alert to the body
    document.body.appendChild(alert);

    // Remove the alert after 3 seconds
    setTimeout(() => {
        alert.remove();
    }, 3000);
}
