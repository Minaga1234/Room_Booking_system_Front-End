document.addEventListener("DOMContentLoaded", () => {
    const BASE_URL = "http://127.0.0.1:8000/api/users/";
    const CHANGE_PASSWORD_URL = `${BASE_URL}change_password/`;
    const DEACTIVATE_URL = `${BASE_URL}deactivate_self/`; // Updated URL

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

    // Password Change Form
    const accountSettingsForm = document.getElementById("account-settings-form");

    if (accountSettingsForm) {
        accountSettingsForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const oldPassword = document.getElementById("old-password")?.value;
            const newPassword = document.getElementById("new-password")?.value;

            if (!oldPassword || !newPassword) {
                alert("Please fill in both old and new password fields.");
                return;
            }

            const payload = {
                old_password: oldPassword,
                new_password: newPassword,
            };

            try {
                const headers = await getAuthHeaders();
                if (!headers) return;

                const response = await fetch(CHANGE_PASSWORD_URL, {
                    method: "POST",
                    headers,
                    body: JSON.stringify(payload),
                });

                if (response.ok) {
                    alert("Password updated successfully!");
                    accountSettingsForm.reset();
                } else {
                    const data = await response.json();
                    alert(`Failed to update password: ${data.error || "Unknown error"}`);
                }
            } catch (error) {
                console.error("Error updating password:", error);
                alert("An error occurred while updating the password.");
            }
        });
    }

    // Deactivate Account Button
    const deactivateAccountBtn = document.getElementById("deactivate-account-btn");
    if (deactivateAccountBtn) {
        deactivateAccountBtn.addEventListener("click", async () => {
            if (confirm("Are you sure you want to deactivate your account? This action cannot be undone.")) {
                try {
                    const headers = await getAuthHeaders();
                    if (!headers) return;

                    const response = await fetch(DEACTIVATE_URL, {
                        method: "POST",
                        headers,
                    });

                    if (response.ok) {
                        alert("Your account has been deactivated. You will now be logged out.");
                        window.location.href = "/frontend/user/login.html";
                    } else {
                        const data = await response.json();
                        alert(`Failed to deactivate account: ${data.error || "Unknown error"}`);
                    }
                } catch (error) {
                    console.error("Error deactivating account:", error);
                    alert("An error occurred while deactivating the account.");
                }
            }
        });
    }
});
