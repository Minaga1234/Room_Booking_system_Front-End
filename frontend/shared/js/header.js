window.onload = function () {
    console.log("✅ Header script loaded");

    // ⏳ Wait until `.notification-wrapper` is found before running script
    let waitForElement = setInterval(() => {
        const notificationWrapper = document.querySelector(".notification-wrapper");
        if (notificationWrapper) {
            console.log("✅ Found notification-wrapper:", notificationWrapper);
            clearInterval(waitForElement); // Stop checking once found
            initializeHeaderScripts(); // Run the main function
        } else {
            console.log("⏳ Waiting for notification-wrapper...");
        }
    }, 500); // Check every 500ms
};

function initializeHeaderScripts() {
    console.log("🚀 Initializing Header Scripts...");

    // Select elements again now that they are guaranteed to exist
    const notificationWrapper = document.querySelector(".notification-wrapper");
    const notificationPopup = document.querySelector(".notification-popup");
    const notificationIcon = document.querySelector(".notification-icon");
    const profileWrapper = document.querySelector(".profile-wrapper");
    const profilePopup = document.querySelector(".profile-popup");
    const searchBox = document.querySelector(".search-box");

    console.log("🔍 Checking Elements:");
    console.log("notificationWrapper:", notificationWrapper);
    console.log("notificationPopup:", notificationPopup);
    console.log("notificationIcon:", notificationIcon);
    console.log("profileWrapper:", profileWrapper);
    console.log("profilePopup:", profilePopup);

    if (!notificationPopup) {
        console.error("❌ Notification popup element not found.");
        return;
    }

    // ✅ Function to fetch notifications from Django backend
    const fetchNotificationsFromBackend = async () => {
        console.log("🔄 Fetching notifications...");
        try {
            const authToken = localStorage.getItem("accessToken");

            if (!authToken) {
                console.error("❌ Authentication token not found.");
                return [];
            }

            const response = await fetch("http://127.0.0.1:8000/api/user-notifications/", {  // Adjust this endpoint if needed
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                },
            });

            console.log("📡 API Request Sent: /api/user-notifications/");
            console.log("📡 Response Status:", response.status);

            if (!response.ok) {
                throw new Error(`❌ Failed to fetch notifications: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("✅ Full API Response:", data);

            // ✅ Ensure correct data extraction
            if (Array.isArray(data)) {
                console.log("✅ Extracted Notifications:", data);
                return data;
            } else {
                console.error("❌ No valid notification array in API response. Check Django.");
                return [];
            }
        } catch (error) {
            console.error("❌ Error fetching notifications:", error);
            return [];
        }
    };

    // ✅ Function to render last 5 notifications sorted by newest first
    const renderNotifications = async () => {
        console.log("🔄 Rendering notifications...");
        notificationPopup.innerHTML = ""; // Clear previous notifications

        const notifications = await fetchNotificationsFromBackend();
        console.log("📌 Notifications to display (Before Sorting):", notifications);

        if (!Array.isArray(notifications) || notifications.length === 0) {
            notificationPopup.innerHTML = `
                <div class="notification-content">
                    <i class="fas fa-bell-slash"></i>
                    <p>No new notifications</p>
                </div>
            `;
            notificationIcon.classList.remove("has-new-notifications"); // Remove red dot
            return;
        }

        // ✅ Sort notifications by created_at (latest first)
        notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        console.log("📌 Notifications to display (After Sorting):", notifications);

        // ✅ Display only the last 5 notifications
        const latestNotifications = notifications.slice(0, 5);

        latestNotifications.forEach((notification, index) => {
            console.log(`🔔 Notification ${index + 1}:`, notification);

            const notificationItem = document.createElement("div");
            notificationItem.classList.add("notification-item");

            // Ensure correct data extraction
            const message = notification.message || "No details available.";
            const timestamp = new Date(notification.created_at).toLocaleString();
            const isRead = notification.is_read ? "read" : "unread";

            notificationItem.innerHTML = `
                <div class="notification-item ${isRead}">
                    <p>${message}</p>
                    <small>${timestamp}</small>
                </div>
            `;
            notificationPopup.appendChild(notificationItem);
        });

        notificationIcon.classList.add("has-new-notifications"); // Add red dot to bell icon
    };

    // ✅ Handle Notification Popup Visibility
    if (notificationWrapper) {
        notificationWrapper.addEventListener("click", () => {
            const isVisible = notificationPopup.style.display === "block";
            notificationPopup.style.display = isVisible ? "none" : "block";

            // Fetch and render notifications when opened
            if (!isVisible) renderNotifications();
        });

        // Close popup when clicking outside
        document.addEventListener("click", (event) => {
            if (!notificationWrapper.contains(event.target)) {
                notificationPopup.style.display = "none";
            }
        });
    }

    // ✅ Handle Profile Popup
    if (profileWrapper) {
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

    // ✅ Search Functionality
    if (searchBox) {
        searchBox.addEventListener("input", (event) => {
            const query = event.target.value.trim();
            console.log(`🔍 User searching for: ${query}`);
        });
    }

    // ✅ Periodic Notification Updates (Every 30 seconds)
    setInterval(renderNotifications, 30000);

    // ✅ Initial Notification Fetch on Page Load
    renderNotifications();
}
