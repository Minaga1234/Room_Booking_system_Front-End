document.addEventListener("DOMContentLoaded", async () => {
    const sidebarContainer = document.getElementById("sidebar-container");

    // Dynamically load the sidebar
    try {
        const sidebarResponse = await fetch("../shared/navbar.html");
        if (!sidebarResponse.ok) {
            throw new Error(`Failed to load sidebar: ${sidebarResponse.statusText}`);
        }
        const sidebarHTML = await sidebarResponse.text();
        sidebarContainer.innerHTML = sidebarHTML;

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
    } catch (error) {
        console.error("Error loading sidebar:", error);
    }

    // Dynamically fetch and set the username
    try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            console.warn("No access token found. Redirecting to login.");
            window.location.href = "/frontend/user/login.html";
            return;
        }

        const profileResponse = await fetch("http://ibs.lunox.dev/api/users/profile/", {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (!profileResponse.ok) {
            throw new Error(`Failed to fetch user profile: ${profileResponse.statusText}`);
        }

        const profileData = await profileResponse.json();
        const usernameElement = document.getElementById("username");

        if (usernameElement) {
            usernameElement.textContent = profileData.username || "Guest User";
        } else {
            console.warn("Username element not found in the DOM.");
        }
    } catch (error) {
        console.error("Error fetching username:", error);

        // Fallback username
        const fallbackElement = document.getElementById("username");
        if (fallbackElement) {
            fallbackElement.textContent = "Guest User";
        }
    }
});
