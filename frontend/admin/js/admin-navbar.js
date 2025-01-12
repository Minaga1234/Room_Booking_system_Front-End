document.addEventListener("DOMContentLoaded", () => {
    const sidebarContainer = document.getElementById("sidebar-container");

    // Dynamically load the admin sidebar
    fetch("../shared/admin-navbar.html")
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to load admin sidebar: ${response.statusText}`);
            }
            return response.text();
        })
        .then((html) => {
            sidebarContainer.innerHTML = html;

            // Highlight the active link based on the current URL
            const currentPage = window.location.pathname.split("/").pop(); // Get current page name
            const navLinks = document.querySelectorAll(".nav-links a");

            navLinks.forEach((link) => {
                const linkHref = link.getAttribute("href");
                const parentLi = link.parentElement;

                // Add 'active' class to the matching link
                if (currentPage === linkHref) {
                    parentLi.classList.add("active");
                } else {
                    parentLi.classList.remove("active");
                }
            });
        })
        .catch((error) => {
            console.error("Error loading admin sidebar:", error);
        });
});

// Fetch admin username dynamically
document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Fetch admin data from an API (example endpoint)
        const response = await fetch("https://api.example.com/admin/profile");
        if (!response.ok) {
            throw new Error(`Failed to fetch admin profile: ${response.statusText}`);
        }
        const data = await response.json();

        // Set the admin username dynamically
        const usernameElement = document.getElementById("username");
        usernameElement.textContent = data.username || "Admin User";
    } catch (error) {
        console.error("Error fetching admin username:", error);

        // Fallback username
        const usernameElement = document.getElementById("username");
        if (usernameElement) {
            usernameElement.textContent = "Admin User";
        }
    }
});
