document.addEventListener('DOMContentLoaded', function () {
    // Dynamic user data setup
    const userAvatar = document.querySelector(".user-avatar");
    const notificationIcon = document.querySelector(".notification-icon");
    userAvatar.src = "../assets/images/user-avatar.png";
    notificationIcon.src = "../assets/images/notification-icon.png";

    // Mobile search functionality
    const searchIcon = document.querySelector('.search-icon');
    const mobileSearchOverlay = document.querySelector('.mobile-search-overlay');
    const mobileSearchBox = document.querySelector('.mobile-search-box');
    let isSearchVisible = false;

    searchIcon.addEventListener('click', function () {
        isSearchVisible = !isSearchVisible;
        mobileSearchOverlay.style.display = isSearchVisible ? 'block' : 'none';
        if (isSearchVisible) {
            mobileSearchBox.focus();
        }
    });

    // Close mobile search when clicking outside
    document.addEventListener('click', function (event) {
        if (isSearchVisible &&
            !mobileSearchOverlay.contains(event.target) &&
            !searchIcon.contains(event.target)) {
            isSearchVisible = false;
            mobileSearchOverlay.style.display = 'none';
        }
    });

    // Search functionality
    const searchBoxes = document.querySelectorAll('.search-box, .mobile-search-box');
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
    const notificationPopup = notificationWrapper.querySelector(".notification-popup");

    function fetchNotifications() {
        return [
            { title: "Room Booking", message: "Green Room Booking has been confirmed", link: "./bookings.html" },
            { title: "System Update", message: "New features added to the room booking system", link: "./updates.html" },
            { title: "Reminder", message: "Your Study Room G1 booking starts in 30 minutes", link: "./reminders.html" }
        ];
    }

    function renderNotifications() {
        const notifications = fetchNotifications();
        if (notifications.length > 0) {
            notificationPopup.innerHTML = "";
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

    // Notification popup handlers
    notificationWrapper.addEventListener("mouseenter", () => {
        notificationPopup.style.display = "block";
        renderNotifications();
    });

    notificationWrapper.addEventListener("mouseleave", () => {
        notificationPopup.style.display = "none";
    });

    // Profile popup handlers
    const profileWrapper = document.querySelector('.profile-wrapper');
    const profilePopup = profileWrapper.querySelector('.profile-popup');

    profileWrapper.addEventListener("mouseenter", () => {
        profilePopup.style.display = "block";
    });

    profileWrapper.addEventListener("mouseleave", () => {
        profilePopup.style.display = "none";
    });

    // Update notifications periodically
    setInterval(renderNotifications, 30000);
});