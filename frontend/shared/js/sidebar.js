document.addEventListener("DOMContentLoaded", () => {
    const sidebarContainer = document.getElementById("sidebar-container");

    fetch("../shared/navbar.html")
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to load sidebar: ${response.statusText}`);
            }
            return response.text();
        })
        .then((html) => {
            sidebarContainer.innerHTML = html;
        })
        .catch((error) => {
            console.error("Error loading sidebar:", error);
        });
});

document.addEventListener("DOMContentLoaded", () => {
    const sidebarContainer = document.getElementById("sidebar-container");

    // Dynamically load the sidebar
    fetch("../shared/navbar.html")
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to load sidebar: ${response.statusText}`);
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
            console.error("Error loading sidebar:", error);
        });
});

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Retrieve the stored email from localStorage
        const email = localStorage.getItem("userEmail");

        /*
        if (!email) {
            // Redirect to login if email is not available
            console.error("No email found in localStorage. Redirecting to login...");
            window.location.href = "../user/login.html";
            return;
        }
        */

        // Fetch user data from the API using the email
        const response = await fetch(`http://127.0.0.1:8000/api/users/profile/?email=${encodeURIComponent(email)}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch username: ${response.statusText}`);
        }

        const data = await response.json();

        // Set the username dynamically
        const usernameElement = document.getElementById("username");
        usernameElement.textContent = data.username || "Guest User"; // Fallback to "Guest User" if no username
    } catch (error) {
        console.error("Error fetching username:", error);

        // Fallback username
        const usernameElement = document.getElementById("username");
        usernameElement.textContent = "Guest User";
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Fetch user data from an API (example endpoint)
        const response = await fetch("https://api.example.com/user/profile");
        const data = await response.json();

        // Set the username dynamically
        const usernameElement = document.getElementById("username");
        usernameElement.textContent = data.username || "Guest User";
    } catch (error) {
        console.error("Error fetching username:", error);

        // Fallback username
        document.getElementById("username").textContent = "Guest User";
    }
});
