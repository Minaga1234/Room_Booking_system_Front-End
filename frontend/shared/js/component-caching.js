document.addEventListener("DOMContentLoaded", () => {
    const sidebarKey = "cachedSidebar"; // Key for caching sidebar content
    const headerKey = "cachedHeader";  // Key for caching header content

    // Load Sidebar
    if (localStorage.getItem(sidebarKey)) {
        // Use cached sidebar content
        document.getElementById("sidebar-container").innerHTML = localStorage.getItem(sidebarKey);
    } else {
        // Fetch sidebar content and cache it
        fetch("../shared/navbar.html")
            .then((response) => response.text())
            .then((data) => {
                document.getElementById("sidebar-container").innerHTML = data;
                localStorage.setItem(sidebarKey, data); // Cache the sidebar content
            })
            .catch((error) => console.error("Error loading sidebar:", error));
    }

    // Load Header
    if (localStorage.getItem(headerKey)) {
        // Use cached header content
        document.getElementById("header-container").innerHTML = localStorage.getItem(headerKey);
    } else {
        // Fetch header content and cache it
        fetch("../shared/header.html")
            .then((response) => response.text())
            .then((data) => {
                document.getElementById("header-container").innerHTML = data;
                localStorage.setItem(headerKey, data); // Cache the header content
            })
            .catch((error) => console.error("Error loading header:", error));
    }
});
