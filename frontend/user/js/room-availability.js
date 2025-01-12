document.addEventListener('DOMContentLoaded', () => {
    // Load Header and Sidebar
    const loadHeaderAndSidebar = async () => {
        try {
            // Load header dynamically
            const headerResponse = await fetch('../shared/header.html');
            if (!headerResponse.ok) {
                throw new Error(`Failed to load header: ${headerResponse.statusText}`);
            }
            const headerHTML = await headerResponse.text();
            document.getElementById('header-container').innerHTML = headerHTML;

            // Load sidebar dynamically
            const sidebarResponse = await fetch('../shared/navbar.html');
            if (!sidebarResponse.ok) {
                throw new Error(`Failed to load sidebar: ${sidebarResponse.statusText}`);
            }
            const sidebarHTML = await sidebarResponse.text();
            document.getElementById('sidebar-container').innerHTML = sidebarHTML;

            // Highlight the active sidebar link
            highlightActiveSidebarLink();
        } catch (error) {
            console.error('Error loading header or sidebar:', error);
        }
    };

    // Highlight Active Sidebar Link
    const highlightActiveSidebarLink = () => {
        const currentPage = window.location.pathname.split('/').pop(); // Get current page name
        const navLinks = document.querySelectorAll('.nav-links a');

        navLinks.forEach((link) => {
            const linkHref = link.getAttribute('href');
            const parentLi = link.parentElement;

            if (currentPage === linkHref) {
                parentLi.classList.add('active'); // Highlight the active link
            } else {
                parentLi.classList.remove('active'); // Remove highlight from other links
            }
        });
    };

    // Selectors for Room Availability
    const roomContainer = document.querySelector('.room-container');
    const noRoomsMessage = document.querySelector('.no-rooms');

    // API Endpoint for Rooms
    const apiEndpoint = 'http://127.0.0.1:8000/api/rooms/';

    // Fetch room data from the backend
    const fetchRooms = async () => {
        try {
            const response = await fetch(apiEndpoint);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            renderRooms(data);
        } catch (error) {
            console.error('Error fetching room data:', error);
            noRoomsMessage.style.display = 'block'; // Show "No rooms to show" on error
        }
    };

    // Render room cards dynamically
    const renderRooms = (rooms) => {
        if (rooms.length === 0) {
            noRoomsMessage.style.display = 'block'; // Show "No rooms to show" message
        } else {
            noRoomsMessage.style.display = 'none'; // Hide the message if rooms exist
            roomContainer.innerHTML = ''; // Clear any existing room cards
            rooms.forEach(room => {
                const card = document.createElement('div');
                card.classList.add('room-card');

                card.innerHTML = `
                    <img src="${room.image}" alt="${room.name}" class="room-image">
                    <div class="room-details">
                        <h3 class="room-title">${room.name}</h3>
                        <p class="room-subtitle">${room.description || 'No description available.'}</p>
                        <p class="room-description">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                        <button class="check-btn">Check Availability</button>
                    </div>
                `;

                roomContainer.appendChild(card);
            });
        }
    };

    // Initialize the script
    const initialize = async () => {
        await loadHeaderAndSidebar(); // Load header and sidebar
        await fetchRooms(); // Fetch and render room data
    };

    initialize();
});

document.addEventListener('DOMContentLoaded', () => {
    const highlightActiveSidebarLink = () => {
        const currentPage = window.location.pathname.split('/').pop(); // Get the current page filename
        const navLinks = document.querySelectorAll('.nav-links a');

        navLinks.forEach((link) => {
            const linkHref = link.getAttribute('href'); // Get the href of the link
            const parentLi = link.parentElement; // Get the parent <li> element

            // Normalize the href and currentPage for comparison
            const normalizedHref = new URL(linkHref, window.location.origin).pathname;
            const normalizedCurrentPage = new URL(currentPage, window.location.origin).pathname;

            if (normalizedHref === normalizedCurrentPage) {
                parentLi.classList.add('active'); // Add the 'active' class to the matching link
            } else {
                parentLi.classList.remove('active'); // Remove 'active' from others
            }
        });
    };

    // Call the function to highlight the active link
    highlightActiveSidebarLink();
});
