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
            const sidebarResponse = await fetch('../shared/sidebar.html');
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

    if (!roomContainer || !noRoomsMessage) {
        console.error('Required DOM elements are missing.');
        return;
    }

    // API Endpoint for Rooms
    const apiEndpoint = 'http://ibs.lunox.dev/api/rooms/';

    // Fetch room data from the backend
    const fetchRooms = async () => {
        try {
            const response = await fetch(apiEndpoint);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const rooms = await response.json();
            renderRooms(rooms);
        } catch (error) {
            console.error('Error fetching room data:', error);
            showNoRoomsMessage();
        }
    };

    // Show "No Rooms" Message
    const showNoRoomsMessage = () => {
        noRoomsMessage.style.display = 'block'; // Show "No rooms to show" message
        roomContainer.innerHTML = ''; // Clear any existing room cards
    };

    // Render Room Cards
    const renderRooms = (rooms) => {
        if (!rooms || rooms.length === 0) {
            showNoRoomsMessage();
            return;
        }

        noRoomsMessage.style.display = 'none'; // Hide "No rooms to show" message
        roomContainer.innerHTML = ''; // Clear existing room cards

        rooms.forEach((room) => {
            const roomImage = room.image || './images/default-room.jpg'; // Fallback image
            const roomDescription = room.description || 'No description available.';
            const roomCapacity = room.capacity ? `Capacity: ${room.capacity}` : 'Capacity not specified';

            const card = document.createElement('div');
            card.classList.add('room-card');

            card.innerHTML = `
                <img src="${roomImage}" alt="${room.name}" class="room-image">
                <div class="room-details">
                    <h3 class="room-title">${room.name}</h3>
                    <p class="room-subtitle">${room.location || 'Location not specified'}</p>
                    <p class="room-description">${roomDescription}</p>
                    <p class="room-capacity">${roomCapacity}</p>
                    <button class="check-btn" data-room-id="${room.id}">Check Availability</button>
                </div>
            `;

            // Add click event to redirect dynamically to the booking page
            card.querySelector('.check-btn').addEventListener('click', () => {
                window.location.href = `room-checkout.html?room_id=${room.id}`;
            });

            roomContainer.appendChild(card);
        });
    };

    // Initialize the script
    const initialize = async () => {
        await loadHeaderAndSidebar(); // Load header and sidebar
        await fetchRooms(); // Fetch and render room data
    };

    initialize();
});


document.querySelectorAll('.room-card').forEach(card => {
    const scrollable = card.querySelector('.room-card-scrollable');
    const scrollbar = card.querySelector('.room-card-scrollbar');
    const thumb = card.querySelector('.room-card-scrollbar-thumb');

    const updateScrollThumb = () => {
        const scrollHeight = scrollable.scrollHeight;
        const clientHeight = scrollable.clientHeight;
        const scrollTop = scrollable.scrollTop;

        const thumbHeight = (clientHeight / scrollHeight) * clientHeight;
        const thumbPosition = (scrollTop / scrollHeight) * clientHeight;

        thumb.style.height = `${thumbHeight}px`;
        thumb.style.transform = `translateY(${thumbPosition}px)`;
    };

    scrollable.addEventListener('scroll', updateScrollThumb);

    // Update the scroll bar thumb on load
    updateScrollThumb();
});
