document.addEventListener("DOMContentLoaded", () => {
    console.log("Header script loaded");

    // Notification and Profile Wrappers
    const notificationWrapper = document.querySelector(".notification-wrapper");
    const notificationPopup = notificationWrapper?.querySelector(".notification-popup");
    const profileWrapper = document.querySelector(".profile-wrapper");
    const profilePopup = profileWrapper?.querySelector(".profile-popup");

    // Fetch notifications from the backend
    const fetchNotificationsFromBackend = async () => {
        console.log("Fetching notifications...");
        try {
            const authToken = localStorage.getItem("authToken");
            if (!authToken) {
                console.error("Authentication token not found");
                return [];
            }

            const response = await fetch("http://127.0.0.1:8000/notifications/", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("Fetch response status:", response.status);

            if (!response.ok) {
                throw new Error(`Failed to fetch notifications: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Fetched notifications:", data);
            return data;
        } catch (error) {
            console.error("Error fetching notifications:", error);
            return [];
        }
    };

    // Render notifications
    const renderNotifications = async () => {
        if (!notificationPopup) {
            console.warn("Notification popup element not found");
            return;
        }

        const notifications = await fetchNotificationsFromBackend();
        console.log("Rendering notifications:", notifications);

        notificationPopup.innerHTML = notifications.length
            ? notifications.map(notif => `
                <div class="notification-item">
                    <h4>${notif.title || "Notification"}</h4>
                    <p>${notif.message || "No details available."}</p>
                    <button onclick="location.href='${notif.link || '#'}'">View</button>
                </div>`).join("")
            : `<div class="notification-content">
                <i class="fas fa-bell-slash"></i>
                <p>No new notifications</p>
            </div>`;
    };

    // Initialize notifications when the header loads
    const initializeNotifications = async () => {
        console.log("Initializing notifications...");
        await renderNotifications();

        // Simulate periodic notification updates
        setInterval(() => {
            console.log("Refreshing notifications...");
            renderNotifications();
        }, 30000); // Update every 30 seconds
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

    // Initialize Notifications
    initializeNotifications();

    console.log("User header initialized successfully.");
});