document.addEventListener("DOMContentLoaded", () => {
    const sidebarContainer = document.getElementById("sidebar-container");

    // Create and append overlay
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    // Load sidebar content
    fetch("../shared/admin-navbar.html")
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to load admin sidebar: ${response.statusText}`);
            }
            return response.text();
        })
        .then((html) => {
            sidebarContainer.innerHTML = html;
            setupSidebar();
            highlightActiveLink();
            setupAdminProfile();
        })
        .catch((error) => {
            console.error("Error loading admin sidebar:", error);
        });
});

function setupSidebar() {
    const hamburger = document.querySelector('.hamburger-menu');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.overlay');

    // Toggle sidebar and overlay on hamburger click
    hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        toggleHamburgerAnimation(hamburger);
    });

    // Close sidebar when clicking overlay
    overlay.addEventListener('click', () => {
        closeSidebar(hamburger, sidebar, overlay);
    });

    // Close sidebar when clicking a nav link on mobile
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                closeSidebar(hamburger, sidebar, overlay);
            }
        });
    });
}

function closeSidebar(hamburger, sidebar, overlay) {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    resetHamburgerAnimation(hamburger);
}

function toggleHamburgerAnimation(hamburger) {
    const bars = hamburger.querySelectorAll('.bar');
    hamburger.classList.toggle('active');

    if (hamburger.classList.contains('active')) {
        bars[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
        bars[1].style.opacity = '0';
        bars[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
    } else {
        resetHamburgerAnimation(hamburger);
    }
}

function resetHamburgerAnimation(hamburger) {
    const bars = hamburger.querySelectorAll('.bar');
    bars.forEach(bar => {
        bar.style.transform = 'none';
        bar.style.opacity = '1';
    });
    hamburger.classList.remove('active');
}

function highlightActiveLink() {
    const currentPage = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll(".nav-links a");

    navLinks.forEach((link) => {
        const linkHref = link.getAttribute("href");
        const parentLi = link.parentElement;

        if (currentPage === linkHref) {
            parentLi.classList.add("active");
        } else {
            parentLi.classList.remove("active");
        }
    });
}

function setupAdminProfile() {
    // Contact button functionality
    const contactBtn = document.querySelector('.contact-btn');
    if (contactBtn) {
        contactBtn.addEventListener('click', () => {
            alert('Contact support functionality will be implemented here');
        });
    }
}
