document.addEventListener('DOMContentLoaded', function () {
    // Set user avatar and notification icon
    const userAvatar = document.querySelector(".user-avatar");
    const notificationIcon = document.querySelector(".notification-icon");
    if (userAvatar) userAvatar.src = "../assets/images/user-avatar.png";
    if (notificationIcon) notificationIcon.src = "../assets/images/notification-icon.png";

    // Search functionality
    const searchBoxes = document.querySelectorAll('.search-box');
    searchBoxes.forEach(searchBox => {
        searchBox.addEventListener('input', function (e) {
            const query = e.target.value.trim();
            if (query) {
                console.log(`Performing search for: ${query}`);
                // Add your search functionality here
            }
        });
    });

    // Notification functionality
    const notificationWrapper = document.querySelector(".notification-wrapper");
    const notificationPopup = notificationWrapper?.querySelector(".notification-popup");

    function fetchNotifications() {
        // Simulated notifications data
        return [
            { title: "Room Booking", message: "Green Room Booking has been confirmed", link: "./bookings.html" },
            { title: "System Update", message: "New features added to the room booking system", link: "./updates.html" },
            { title: "Reminder", message: "Your Study Room G1 booking starts in 30 minutes", link: "./reminders.html" }
        ];
    }

    function renderNotifications() {
        if (!notificationPopup) return;

        const notifications = fetchNotifications();
        notificationPopup.innerHTML = "";

        if (notifications.length > 0) {
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

    if (notificationWrapper && notificationPopup) {
        notificationWrapper.addEventListener("mouseenter", () => {
            notificationPopup.style.display = "block";
            renderNotifications();
        });

        notificationWrapper.addEventListener("mouseleave", () => {
            notificationPopup.style.display = "none";
        });
    }

    // Profile popup functionality
    const profileWrapper = document.querySelector('.profile-wrapper');
    const profilePopup = profileWrapper?.querySelector('.profile-popup');

    if (profileWrapper && profilePopup) {
        profileWrapper.addEventListener("mouseenter", () => {
            profilePopup.style.display = "block";
        });

        profileWrapper.addEventListener("mouseleave", () => {
            profilePopup.style.display = "none";
        });
    }

    // Periodic notification updates
    if (notificationPopup) {
        setInterval(() => {
            renderNotifications();
        }, 30000); // Update every 30 seconds
    }
});
