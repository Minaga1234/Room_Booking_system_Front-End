document.addEventListener("DOMContentLoaded", () => {
    // Notification and Profile Wrappers
    const notificationWrapper = document.querySelector(".notification-wrapper");
    const notificationPopup = notificationWrapper?.querySelector(".notification-popup");
    const profileWrapper = document.querySelector(".profile-wrapper");
    const profilePopup = profileWrapper?.querySelector(".profile-popup");

    // Fetch notifications from the backend
    const fetchNotificationsFromBackend = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/notifications/", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`, // Include authentication token
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch notifications");
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching notifications:", error);
            return [];
        }
    };

    // Render notifications
    const renderNotifications = async () => {
        if (!notificationPopup) return;
        const notifications = await fetchNotificationsFromBackend();

        notificationPopup.innerHTML = notifications.length
            ? notifications.map(notif => `
                <div class="notification-item">
                    <h4>${notif.title}</h4>
                    <p>${notif.message}</p>
                    <button onclick="location.href='${notif.link || '#'}'">View</button>
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
