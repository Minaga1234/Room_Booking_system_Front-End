document.addEventListener("DOMContentLoaded", () => {
    const BASE_URL = "http://127.0.0.1:8000/api/users/";
    const PROFILE_URL = `${BASE_URL}profile/`;

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

    // Fetch user profile
    async function fetchProfile() {
        try {
            const headers = await getAuthHeaders();
            if (!headers) return;

            const response = await fetch(PROFILE_URL, { headers });
            const data = await response.json();

            if (response.ok) {
                document.getElementById("profile-name").value = data.username || "";
                document.getElementById("profile-email").value = data.email || "";
                document.getElementById("profile-phone").value = data.phone_number || "";
            } else {
                alert(`Failed to fetch profile: ${data.detail || "Unknown error"}`);
            }
        } catch (error) {
            alert("An error occurred while fetching the profile.");
        }
    }

    // Update Profile
    document.getElementById("profile-form").addEventListener("submit", async (event) => {
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
                alert("Failed to update profile.");
            }
        } catch (error) {
            alert("An error occurred while updating the profile.");
        }
    });

    // Profile Picture Management
    const profilePicture = document.getElementById("profile-picture");
    const profilePictureUpload = document.getElementById("profile-picture-upload");
    const editProfilePictureBtn = document.getElementById("edit-profile-picture-btn");

    // Show file picker when button is clicked
    editProfilePictureBtn.addEventListener("click", () => {
        profilePictureUpload.click();
    });

    // Preview and upload profile picture
    profilePictureUpload.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profilePicture.src = e.target.result;
            };
            reader.readAsDataURL(file);

            const headers = await getAuthHeaders();
            if (!headers) return;

            const formData = new FormData();
            formData.append("profile_picture", file);

            try {
                const response = await fetch(`${BASE_URL}upload_profile_picture/`, {
                    method: "POST",
                    headers: {
                        Authorization: headers["Authorization"],
                    },
                    body: formData,
                });

                if (response.ok) {
                    alert("Profile picture updated successfully!");
                } else {
                    alert("Failed to update profile picture.");
                }
            } catch (error) {
                alert("An error occurred while uploading the profile picture.");
            }
        }
    });

    // Initialize profile
    fetchProfile();
});
