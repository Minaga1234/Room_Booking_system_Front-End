// Dynamically set user data (optional)
document.addEventListener("DOMContentLoaded", function () {
    const userAvatar = document.querySelector(".user-avatar");
    const notificationIcon = document.querySelector(".notification-icon");
  
    // Example: Update user avatar or notification dynamically
    userAvatar.src = "../assets/images/user-avatar.png"; // Set user avatar dynamically
    notificationIcon.src = "../assets/icons/notification-icon.png"; // Set notification icon
  });

  // Handle search input
document.querySelector('.search-box').addEventListener('input', function (e) {
    const query = e.target.value.trim();
    console.log('Search query:', query);
    // Add your search functionality here
    if (query) {
        // For example, filter results or redirect to a search page
        console.log(`Performing search for: ${query}`);
    }
});

// Handle notifications click
document.querySelector('.notification-icon').addEventListener('click', function () {
    // Simulate opening a notifications dropdown or page
    alert('Opening Notifications...');
    console.log('Notifications clicked');
    // Redirect to a notifications page if needed
    // window.location.href = './notifications.html';
});

// Handle profile icon click
document.querySelector('.user-avatar').addEventListener('click', function () {
    // Simulate opening a profile dropdown or page
    alert('Opening Profile...');
    console.log('Profile clicked');
    // Redirect to a profile page if needed
    // window.location.href = './profile.html';
});

document.addEventListener("DOMContentLoaded", () => {
    const notificationWrapper = document.querySelector(".notification-wrapper");
    const profileWrapper = document.querySelector(".profile-wrapper");

    // Ensure notification popup stays open when hovered
    const notificationPopup = notificationWrapper.querySelector(".notification-popup");
    notificationWrapper.addEventListener("mouseenter", () => {
        notificationPopup.style.display = "block";
    });
    notificationWrapper.addEventListener("mouseleave", () => {
        notificationPopup.style.display = "none";
    });

    notificationPopup.addEventListener("mouseenter", () => {
        notificationPopup.style.display = "block"; // Keep it visible
    });
    notificationPopup.addEventListener("mouseleave", () => {
        notificationPopup.style.display = "none";
    });

    // Ensure profile popup stays open when hovered
    const profilePopup = profileWrapper.querySelector(".profile-popup");
    profileWrapper.addEventListener("mouseenter", () => {
        profilePopup.style.display = "block";
    });
    profileWrapper.addEventListener("mouseleave", () => {
        profilePopup.style.display = "none";
    });

    profilePopup.addEventListener("mouseenter", () => {
        profilePopup.style.display = "block"; // Keep it visible
    });
    profilePopup.addEventListener("mouseleave", () => {
        profilePopup.style.display = "none";
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const notificationWrapper = document.querySelector(".notification-wrapper");
    const notificationPopup = notificationWrapper.querySelector(".notification-popup");

    // Mock function to simulate fetching notifications
    function fetchNotifications() {
        return [
            { title: "Room Booking", message: "Green Room Booking has been confirmed", link: "./bookings.html" },
            { title: "System Update", message: "New features added to the room booking system", link: "./updates.html" },
            { title: "Reminder", message: "Your Study Room G1 booking starts in 30 minutes", link: "./reminders.html" }
        ];
    }

    // Function to render notifications dynamically
    function renderNotifications() {
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
            notificationPopup.innerHTML = "<p>No new notifications</p>";
        }
    }

    // Ensure notification popup stays open when hovered
    notificationWrapper.addEventListener("mouseenter", () => {
        notificationPopup.style.display = "block";
        renderNotifications(); // Render notifications when popup is opened
    });

    notificationWrapper.addEventListener("mouseleave", () => {
        notificationPopup.style.display = "none";
    });

    notificationPopup.addEventListener("mouseenter", () => {
        notificationPopup.style.display = "block"; // Keep it visible
    });

    notificationPopup.addEventListener("mouseleave", () => {
        notificationPopup.style.display = "none";
    });

    // Simulate periodic updates to notifications (e.g., polling an API)
    setInterval(renderNotifications, 30000); // Update every 30 seconds
});

const notifications = []; // Example: Array of notifications
const notificationContent = document.querySelector('.notification-content');

if (notifications.length > 0) {
    notificationContent.innerHTML = notifications
        .map(notification => `<p>${notification}</p>`)
        .join('');
} else {
    notificationContent.innerHTML = `
        <i class="fas fa-bell-slash"></i>
        <p>No new notifications</p>
    `;
}
