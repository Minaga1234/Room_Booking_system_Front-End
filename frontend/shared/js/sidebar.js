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

// Fetch username dynamically
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
