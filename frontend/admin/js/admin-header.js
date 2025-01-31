document.addEventListener("DOMContentLoaded", () => {
    console.log("Header script loaded");

    // Notification Wrapper
    const notificationWrapper = document.querySelector(".notification-wrapper");
    const notificationPopup = notificationWrapper?.querySelector(".notification-popup");

    // Profile Wrapper
    const profileWrapper = document.querySelector(".profile-wrapper");
    const profilePopup = profileWrapper?.querySelector(".profile-popup");

    // Search Box
    const searchBox = document.querySelector(".search-box");

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

    // Render notifications dynamically
    const renderNotifications = async () => {
        if (!notificationPopup) return;

        const notifications = await fetchNotificationsFromBackend();
        console.log("Rendering notifications:", notifications);

        if (notifications.length > 0) {
            notificationPopup.innerHTML = ""; // Clear previous notifications
            notifications.forEach((notification) => {
                const notificationItem = document.createElement("div");
                notificationItem.classList.add("notification-item");
                notificationItem.innerHTML = `
                    <h4>${notification.title || "Notification"}</h4>
                    <p>${notification.message || "No details available."}</p>
                    <button onclick="location.href='${notification.link || "#"}'">View</button>
                `;
                notificationPopup.appendChild(notificationItem);
            });
        } else {
            notificationPopup.innerHTML = `
                <div class="notification-content">
                    <i class="fas fa-bell-slash"></i>
                    <p>No new notifications</p>
                </div>
            `;
        }
    };

    // Handle Notification Popup Visibility
    if (notificationWrapper && notificationPopup) {
        notificationWrapper.addEventListener("mouseenter", () => {
            notificationPopup.style.display = "block";
            renderNotifications(); // Fetch and render notifications when popup is opened
        });

        notificationWrapper.addEventListener("mouseleave", () => {
            notificationPopup.style.display = "none";
        });
    }

    // Handle Profile Popup
    if (profileWrapper && profilePopup) {
        profileWrapper.addEventListener("click", () => {
            profilePopup.classList.toggle("visible");
        });

        // Close profile popup when clicking outside
        document.addEventListener("click", (event) => {
            if (!profileWrapper.contains(event.target)) {
                profilePopup.classList.remove("visible");
            }
        });
    }

    // Dynamic Search Bar Behavior
    if (searchBox) {
        searchBox.addEventListener("input", (event) => {
            const query = event.target.value.trim();
            console.log(`User searching for: ${query}`);
            // Add search functionality as needed
        });
    }

    // Simulate periodic updates to notifications
    if (notificationPopup) {
        setInterval(renderNotifications, 30000); // Update every 30 seconds
    }

    // Profile Popup Hover Logic
    let hideTimeout; // Timeout reference to delay hiding

    if (profileWrapper && profilePopup) {
        // Show the popup when hovering over the profile wrapper
        profileWrapper.addEventListener("mouseenter", () => {
            clearTimeout(hideTimeout); // Clear any existing timeout
            profilePopup.style.display = "block"; // Show the popup
        });

        // Hide the popup with a delay when leaving the profile wrapper
        profileWrapper.addEventListener("mouseleave", () => {
            hideTimeout = setTimeout(() => {
                profilePopup.style.display = "none"; // Hide the popup
            }, 500); // 0.5 second delay
        });

        // Keep the popup visible when hovering over the popup itself
        profilePopup.addEventListener("mouseenter", () => {
            clearTimeout(hideTimeout); // Clear any existing timeout
            profilePopup.style.display = "block"; // Keep the popup visible
        });

        // Hide the popup with a delay when leaving the popup
        profilePopup.addEventListener("mouseleave", () => {
            hideTimeout = setTimeout(() => {
                profilePopup.style.display = "none"; // Hide the popup
            }, 500); // 0.5 second delay
        });
    }
});
