document.addEventListener("DOMContentLoaded", () => {
    const sidebarContainer = document.getElementById("sidebar-container");

    // Create and append overlay
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    document.body.appendChild(overlay);

    // Load sidebar content
    fetch("./navbar.html")
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to load admin sidebar: ${response.statusText}`);
            }
            return response.text();
        })
        .then((html) => {
            sidebarContainer.innerHTML = html;

            // Ensure elements exist before setting up functionality
            if (document.querySelector(".hamburger-menu")) {
                setupMobileMenu();
            }
            if (document.querySelector(".nav-links a")) {
                highlightActiveLink(); // Highlight the active nav link
            }
            if (document.querySelector(".contact-btn")) {
                setupAdminProfile(); // Set up admin profile actions
            }
        })
        .catch((error) => {
            console.error("Error loading admin sidebar:", error);
        });
});

function setupMobileMenu() {
    const hamburger = document.querySelector(".hamburger-menu");
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".overlay");

    if (!hamburger || !sidebar || !overlay) {
        console.error("Missing required elements for mobile menu setup.");
        return;
    }

    // Toggle sidebar and overlay visibility
    hamburger.addEventListener("click", () => {
        sidebar.classList.toggle("active");
        overlay.classList.toggle("active");
        toggleHamburgerAnimation(hamburger);
    });

    // Close menu when clicking overlay
    overlay.addEventListener("click", () => {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
        resetHamburgerAnimation(hamburger);
    });

    // Close menu when clicking a nav link on mobile
    const navLinks = document.querySelectorAll(".nav-links a");
    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove("active");
                overlay.classList.remove("active");
                resetHamburgerAnimation(hamburger);
            }
        });
    });
}

function toggleHamburgerAnimation(hamburger) {
    const bars = hamburger.querySelectorAll(".bar");
    hamburger.classList.toggle("active");

    if (!bars || bars.length < 3) {
        console.error("Missing bars for hamburger animation.");
        return;
    }

    if (hamburger.classList.contains("active")) {
        bars[0].style.transform = "rotate(45deg) translate(6px, 6px)";
        bars[1].style.opacity = "0";
        bars[2].style.transform = "rotate(-45deg) translate(6px, -6px)";
    } else {
        resetHamburgerAnimation(hamburger);
    }
}

function resetHamburgerAnimation(hamburger) {
    const bars = hamburger.querySelectorAll(".bar");

    if (!bars || bars.length < 3) {
        console.error("Missing bars for resetting hamburger animation.");
        return;
    }

    bars.forEach((bar) => {
        bar.style.transform = "none";
        bar.style.opacity = "1";
    });
    hamburger.classList.remove("active");
}

function highlightActiveLink() {
    const currentPage = window.location.pathname.split("/").pop(); // Get current page name
    const navLinks = document.querySelectorAll(".nav-links a");

    if (!navLinks || navLinks.length === 0) {
        console.warn("No navigation links found to highlight.");
        return;
    }

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
}

function setupAdminProfile() {
    const contactBtn = document.querySelector(".contact-btn");

    if (!contactBtn) {
        console.warn("Contact button not found for admin profile setup.");
        return;
    }

    // Add event listener for contact button
    contactBtn.addEventListener("click", () => {
        alert("Contact support functionality will be implemented here.");
    });
}
