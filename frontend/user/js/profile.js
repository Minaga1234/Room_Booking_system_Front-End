document.addEventListener("DOMContentLoaded", () => {
    const BASE_URL = "http://127.0.0.1:8000/api/users/profile/".trim();
    const TOKEN = "56b3e99143c43eb26aba41b42f20fae927be3756"; // Replaced with actual token
    const HEADERS = {
        "Authorization": `Token ${TOKEN}`,
        "Content-Type": "application/json"
    };

    // Profile Buttons
    const personalInfoBtn = document.getElementById("personal-info-btn");
    const accountSettingsBtn = document.getElementById("account-settings-btn");

    // Sections
    const personalInfoSection = document.getElementById("personal-info");
    const accountSettingsSection = document.getElementById("account-settings");

    // Forms
    const profileForm = document.getElementById("profile-form");
    const accountSettingsForm = document.getElementById("account-settings-form");

    // Show the default section (Personal Info) on load
    personalInfoSection.classList.remove("hidden");
    accountSettingsSection.classList.add("hidden");

    // Event Listeners to toggle sections
    personalInfoBtn.addEventListener("click", () => {
        personalInfoSection.classList.remove("hidden");
        accountSettingsSection.classList.add("hidden");
    });

    accountSettingsBtn.addEventListener("click", () => {
        accountSettingsSection.classList.remove("hidden");
        personalInfoSection.classList.add("hidden");
    });

    // Fetch user profile
    async function fetchProfile() {
        try {
            const response = await fetch(BASE_URL, { headers: HEADERS });
            const data = await response.json();
    
            if (response.ok) {
                document.getElementById("profile-name").value = data.username;
                document.getElementById("profile-email").value = data.email;
                document.getElementById("profile-phone").value = data.phone_number || "";
            } else {
                console.error(`Failed to fetch profile: ${data.detail}`);
                alert(`Failed to fetch profile: ${data.detail || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            alert("An error occurred while fetching the profile.");
        }
    }

    // Add event listener for account settings form submission
accountSettingsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
        password: document.getElementById("settings-password").value,
        notifications: document.getElementById("settings-notifications").checked,
    };

    console.log("Payload being sent for account settings:", payload); // Debugging

    try {
        const response = await fetch(BASE_URL, {
            method: "PUT", // Assuming same endpoint handles account settings
            headers: HEADERS,
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            alert("Account settings updated successfully!");
        } else {
            const data = await response.json();
            alert(`Failed to update account settings: ${data.detail || "Unknown error"}`);
        }
    } catch (error) {
        console.error("Error updating account settings:", error);
        alert("An error occurred while updating account settings.");
    }
});

    // Update profile
    profileForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const payload = {
            phone_number: document.getElementById("profile-phone").value
        };
        
        console.log("Payload being sent:", payload); // Add this for debugging
        try {
            const response = await fetch(BASE_URL, {
                method: "PUT",
                headers: HEADERS,
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert("Profile updated successfully!");
            } else {
                const data = await response.json();
                alert(`Failed to update profile: ${data.detail || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("An error occurred while updating the profile.");
        }
    });

    document.getElementById("deactivate-account-btn").addEventListener("click", async () => {
        if (confirm("Are you sure you want to deactivate your account? This action cannot be undone.")) {
            try {
                const response = await fetch("http://127.0.0.1:8000/api/users/deactivate_self/", { // Corrected URL
                    method: "POST",
                    headers: HEADERS,
                });
    
                if (response.ok) {
                    alert("Your account has been deactivated. You will now be logged out.");
                    // Redirect user to the login page or home page
                    window.location.href = "/login.html";
                } else {
                    const data = await response.json();
                    alert(`Failed to deactivate account: ${data.detail || "Unknown error"}`);
                }
            } catch (error) {
                console.error("Error deactivating account:", error);
                alert("An error occurred while deactivating the account.");
            }
        }
    });
    
    

    // Initialize profile
    fetchProfile();
});
