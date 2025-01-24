document.addEventListener("DOMContentLoaded", () => {
    // Notification and Profile Wrappers
    const notificationWrapper = document.querySelector(".notification-wrapper");
    const notificationPopup = notificationWrapper?.querySelector(".notification-popup");
    const profileWrapper = document.querySelector(".profile-wrapper");
    const profilePopup = profileWrapper?.querySelector(".profile-popup");
    const profilePicture = profileWrapper?.querySelector(".profile-picture");

    // Base URL for API
    const BASE_URL = "http://127.0.0.1:8000/api/users/";
    const PROFILE_URL = `${BASE_URL}profile/`;

    // Mock function to fetch notifications
    const fetchNotifications = () => [
        { title: "Room Booking", message: "Green Room Booking confirmed.", link: "./bookings.html" },
        { title: "Reminder", message: "Your booking starts in 30 minutes.", link: "./reminders.html" },
        { title: "Update", message: "New features added to the system.", link: "./updates.html" }
    ];

    // Render notifications
    const renderNotifications = () => {
        if (!notificationPopup) return;
        const notifications = fetchNotifications();
        notificationPopup.innerHTML = notifications.length
            ? notifications.map(notif => `
                <div class="notification-item">
                    <h4>${notif.title}</h4>
                    <p>${notif.message}</p>
                    <button onclick="location.href='${notif.link}'">View</button>
                </div>`).join("")
            : `<div class="notification-content">
                <i class="fas fa-bell-slash"></i>
                <p>No new notifications</p>
            </div>`;
    };

    // Notification Popup Events
    if (notificationWrapper && notificationPopup) {
        notificationWrapper.addEventListener("mouseenter", () => {
            renderNotifications();
            notificationPopup.style.display = "block";
        });

        notificationWrapper.addEventListener("mouseleave", () => {
            notificationPopup.style.display = "none";
        });
    }

    // Profile Popup Events
    if (profileWrapper && profilePopup) {
        let hideTimeout;
        profileWrapper.addEventListener("mouseenter", () => {
            clearTimeout(hideTimeout);
            profilePopup.style.display = "block";
        });

        profileWrapper.addEventListener("mouseleave", () => {
            hideTimeout = setTimeout(() => {
                profilePopup.style.display = "none";
            }, 300); // Add delay for smoother hover-out
        });
    }

    // Fetch and Set Profile Picture
    const fetchProfilePicture = async () => {
        try {
            const headers = {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                "Content-Type": "application/json",
            };

            const response = await fetch(PROFILE_URL, { headers });
            if (!response.ok) {
                console.error("Failed to fetch profile picture.");
                return;
            }

            const data = await response.json();
            if (data.profile_picture && profilePicture) {
                profilePicture.src = data.profile_picture; // Set the profile picture URL
            }
        } catch (error) {
            console.error("Error fetching profile picture:", error);
        }
    };

    if (profilePicture) {
        fetchProfilePicture();
    }

    // Search Functionality
    const searchBox = document.querySelector(".search-box");
    if (searchBox) {
        searchBox.addEventListener("input", (event) => {
            const query = event.target.value.trim();
            if (query) {
                console.log(`User searching for: ${query}`);
                // Implement actual search functionality here
            }
        });
    }

    // Simulate periodic notification updates
    if (notificationPopup) {
        setInterval(() => {
            renderNotifications();
        }, 30000); // Update every 30 seconds
    }

    console.log("User header initialized successfully.");
});
