document.addEventListener('DOMContentLoaded', () => {
    const roomContainer = document.querySelector('.room-container');
    const noRoomsMessage = document.querySelector('.no-rooms');

    // Replace this URL with your actual backend API endpoint
    const apiEndpoint = 'http://127.0.0.1:8000/api/rooms/';

    // Fetch room data from the backend
    fetch(apiEndpoint)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Check if there are any rooms in the data
            if (data.length === 0) {
                noRoomsMessage.style.display = 'block'; // Show "No rooms to show" message
            } else {
                noRoomsMessage.style.display = 'none'; // Hide "No rooms to show" message

                // Dynamically generate room cards
                data.forEach(room => {
                    const card = document.createElement('div');
                    card.classList.add('room-card');

                    card.innerHTML = `
                        <img src="${room.image}" alt="${room.name}" class="room-image">
                        <div class="room-details">
                            <h3 class="room-title">${room.name}</h3>
                            <p class="room-subtitle">${room.description}</p>
                            <p class="room-description">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.</p>
                            <button class="check-btn">Check Availability</button>
                        </div>
                    `;

                    roomContainer.appendChild(card);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching room data:', error);
            noRoomsMessage.style.display = 'block'; // Show "No rooms to show" if there is an error
        });
});
