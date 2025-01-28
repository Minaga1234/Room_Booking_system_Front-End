document.addEventListener("DOMContentLoaded", () => {
    const BASE_URL = "http://ibs.lunox.dev/api/users/";
    const PROFILE_URL = `${BASE_URL}profile/`;
    const CHANGE_PASSWORD_URL = `${BASE_URL}change_password/`;
    const DEACTIVATE_URL = `${BASE_URL}deactivate/`;

    // Get token dynamically from localStorage
    const getAuthHeaders = async () => {
        let accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            alert("Your session has expired. Please log in again.");
            window.location.href = "/frontend/user/login.html";
            return null;
        }
        return {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        };
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

    // Ensure elements exist before using them
    if (personalInfoSection && accountSettingsSection) {
        // Show the default section (Personal Info) on load
        personalInfoSection.classList.remove("hidden");
        accountSettingsSection.classList.add("hidden");

        // Event Listeners to toggle sections
        if (personalInfoBtn) {
            personalInfoBtn.addEventListener("click", () => {
                personalInfoSection.classList.remove("hidden");
                accountSettingsSection.classList.add("hidden");
            });
        }

        if (accountSettingsBtn) {
            accountSettingsBtn.addEventListener("click", () => {
                accountSettingsSection.classList.remove("hidden");
                personalInfoSection.classList.add("hidden");
            });
        }
    } else {
        console.warn("Personal info or account settings sections are missing in the DOM.");
    }

    // Fetch user profile
    async function fetchProfile() {
        try {
            const headers = await getAuthHeaders();
            if (!headers) return;

            const response = await fetch(PROFILE_URL, { headers });
            const data = await response.json();
            console.log("Profile Data:", data); // Debugging

            if (response.ok) {
                const nameField = document.getElementById("profile-name");
                const emailField = document.getElementById("profile-email");
                const phoneField = document.getElementById("profile-phone");

                if (nameField) nameField.value = data.username || "";
                if (emailField) emailField.value = data.email || "";
                if (phoneField) phoneField.value = data.phone_number || "";
            } else {
                console.error(`Failed to fetch profile: ${data.detail}`);
                alert(`Failed to fetch profile: ${data.detail || "Unknown error"}`);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            alert("An error occurred while fetching the profile.");
        }
    }

    // Update Profile
    if (profileForm) {
        profileForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const payload = {
                phone_number: document.getElementById("profile-phone")?.value,
            };

            try {
                const headers = await getAuthHeaders();
                if (!headers) return;

                const response = await fetch(PROFILE_URL, {
                    method: "PUT",
                    headers,
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
    }

    

    // Initialize profile
    fetchProfile();
});
