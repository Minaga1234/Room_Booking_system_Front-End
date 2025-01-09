document.addEventListener("DOMContentLoaded", () => {
    // Notification Wrapper
    const notificationWrapper = document.querySelector(".notification-wrapper");
    const notificationPopup = notificationWrapper?.querySelector(".notification-popup");

    // Profile Wrapper
    const profileWrapper = document.querySelector(".profile-wrapper");
    const profilePopup = profileWrapper?.querySelector(".profile-popup");

    // Search Box
    const searchBox = document.querySelector(".search-box");

    // Mock function to simulate fetching notifications
    function fetchNotifications() {
        return [
            { title: "Booking Alert", message: "Room G1 has been successfully reserved.", link: "./admin-bookings.html" },
            { title: "System Maintenance", message: "Scheduled maintenance on Sunday at 10:00 PM.", link: "./admin-updates.html" },
            { title: "New Feedback", message: "You have received new feedback from users.", link: "./admin-feedback.html" },
        ];
    }

    // Function to render notifications dynamically
    function renderNotifications() {
        if (!notificationPopup) return;

        const notifications = fetchNotifications();
        if (notifications.length > 0) {
            notificationPopup.innerHTML = ""; // Clear previous notifications
            notifications.forEach((notification) => {
                const notificationItem = document.createElement("div");
                notificationItem.classList.add("notification-item");
                notificationItem.innerHTML = `
                    <h4>${notification.title}</h4>
                    <p>${notification.message}</p>
                    <button onclick="location.href='${notification.link}'">View</button>
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
    }

    // Handle Notification Popup Visibility
    if (notificationWrapper && notificationPopup) {
        notificationWrapper.addEventListener("mouseenter", () => {
            notificationPopup.style.display = "block";
            renderNotifications(); // Render notifications when popup is opened
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
            console.log(`Admin searching for: ${query}`);
            // Add search functionality as needed
        });
    }

    // Simulate periodic updates to notifications
    if (notificationPopup) {
        setInterval(renderNotifications, 30000); // Update every 30 seconds
    }
});
