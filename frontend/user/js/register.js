const REGISTER_URL = "http://ibs.lunox.dev/api/users/register_user/";

// Function to get CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(`${name}=`)) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Function to validate email
function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@our\.ecu\.edu\.au$/;
    return emailRegex.test(email);
}

// Function to display alerts
function showAlert(message, success) {
    const notification = document.getElementById("error-notification");
    notification.textContent = message;
    notification.style.backgroundColor = success ? "#4CAF50" : "#f44336";
    notification.classList.remove("hidden");
    notification.style.opacity = "1";

    setTimeout(() => {
        notification.style.opacity = "0";
        setTimeout(() => notification.classList.add("hidden"), 500); // Hide after fade out
    }, 5000);
}

// Handle registration form submission
document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const fullName = document.getElementById("full-name").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();
    const role = document.getElementById("role").value;

    if (!email || !fullName || !password || !confirmPassword || !role) {
        showAlert("All fields are required!", false);
        return;
    }

    if (!validateEmail(email)) {
        showAlert("Invalid email format! Must be in '@our.ecu.edu.au' domain.", false);
        return;
    }

    if (password !== confirmPassword) {
        showAlert("Passwords do not match!", false);
        return;
    }

    const csrfToken = getCookie("csrftoken");

    try {
        const response = await fetch(REGISTER_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken,
            },
            body: JSON.stringify({
                username: fullName,
                email: email,
                password: password,
                role: role,
            }),
        });

        let responseData;
        try {
            responseData = await response.json();
        } catch (error) {
            responseData = null; // Non-JSON response
        }

        if (response.ok && responseData) {
            showAlert("Registration successful! Redirecting to login page.", true);
            setTimeout(() => {
                window.location.href = "http://127.0.0.1:5501/frontend/user/login.html";
            }, 2000);
        } else {
            const errorMessage = responseData?.error || "Unknown error occurred.";
            showAlert(`Registration failed: ${errorMessage}`, false);
        }
    } catch (error) {
        console.error("Error during registration:", error);
        showAlert("An unexpected error occurred. Please try again.", false);
    }
});

// Role dropdown logic
document.addEventListener("DOMContentLoaded", () => {
    const select = document.querySelector(".select");
    const selected = select.querySelector(".selected");
    const optionsContainer = select.querySelector(".options");
    const optionsList = optionsContainer.querySelectorAll(".option");
    const hiddenInput = document.getElementById("role");

    selected.addEventListener("click", () => {
        select.classList.toggle("active");
    });

    optionsList.forEach((option) => {
        option.addEventListener("click", () => {
            const value = option.getAttribute("data-value");
            const mappedValue = value === "lecturer" ? "staff" : value; // Map "lecturer" to "staff"
            selected.querySelector("span").textContent = value;
            hiddenInput.value = mappedValue; // Send the correct backend value
            select.classList.remove("active");
        });
    });

    document.addEventListener("click", (e) => {
        if (!select.contains(e.target)) {
            select.classList.remove("active");
        }
    });
});
