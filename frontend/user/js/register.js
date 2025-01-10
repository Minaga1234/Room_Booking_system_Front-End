// Event listener for form submission
document.getElementById("register-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const fullName = document.getElementById("full-name").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();
    const role = document.getElementById("role").value;

    // Validation checks
    if (!email || !fullName || !password || !confirmPassword || !role) {
        showAlert("All fields are required!", false);
        return;
    }

    if (!validateEmail(email)) {
        showAlert("Invalid email format! Please use 'user@our.ecu.edu.au'", false);
        return;
    }

    if (password !== confirmPassword) {
        showAlert("Passwords do not match!", false);
        return;
    }

    // Show success message
    showAlert("Registration successful!", true);

    // Log registration details (for demonstration purposes)
    console.log({
        email,
        fullName,
        password,
        role
    });

    // Optionally, proceed with form submission or API call
});

// Email validation function for specific domain
function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@our\.ecu\.edu\.au$/;
    return emailRegex.test(email);
}

// Function to display alert messages
function showAlert(message, success) {
    const notification = document.getElementById("error-notification");
    notification.textContent = message;
    notification.style.backgroundColor = success ? "#4CAF50" : "#f44336"; // Green for success, red for error
    notification.style.opacity = "1";
    notification.style.transform = "translateX(-50%) translateY(0)";
    notification.style.display = "block";

    // Keep the alert visible for 5 seconds and then fade out
    setTimeout(() => {
        notification.style.opacity = "0";
        notification.style.transform = "translateX(-50%) translateY(-10px)";
        setTimeout(() => {
            notification.style.display = "none";
        }, 500); // Match fade-out duration
    }, 5000);
}

// Dropdown logic for role selection
document.addEventListener("DOMContentLoaded", () => {
    const select = document.querySelector(".select");
    const selected = select.querySelector(".selected");
    const optionsContainer = select.querySelector(".options");
    const optionsList = optionsContainer.querySelectorAll(".option");
    const hiddenInput = document.getElementById("role");

    // Toggle dropdown on click
    selected.addEventListener("click", () => {
        select.classList.toggle("active");
    });

    // Select an option and update the hidden input
    optionsList.forEach((option) => {
        option.addEventListener("click", () => {
            const value = option.getAttribute("data-value");
            selected.querySelector("span").textContent = value;
            hiddenInput.value = value;
            select.classList.remove("active"); // Close the dropdown
        });
    });

    // Close dropdown if clicked outside
    document.addEventListener("click", (e) => {
        if (!select.contains(e.target)) {
            select.classList.remove("active");
        }
    });
});
