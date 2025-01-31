document.addEventListener('DOMContentLoaded', function () {
    const BASE_URL = 'http://127.0.0.1:8000/api';
    const AUTH_HEADERS = {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`, // Retrieve token from storage
        'Content-Type': 'application/json',
    };

    const refreshAccessToken = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) throw new Error('No refresh token found. Please log in again.');
    
            const response = await fetch(`${BASE_URL}/auth/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: refreshToken }),
            });
    
            if (!response.ok) throw new Error('Failed to refresh token.');
    
            const data = await response.json();
            localStorage.setItem('accessToken', data.access); // Update the access token
            return data.access;
        } catch (error) {
            console.error('Error refreshing token:', error);
            alert('Session expired. Please log in again.');
            window.location.href = '/frontend/user/login.html';
        }
    };
    
    const getAuthHeaders = async () => {
        let accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            accessToken = await refreshAccessToken();
        }
    
        return {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        };
    };  

    let currentPage = 1;

    const bookingListContainer = document.querySelector('.bookings-table tbody');
    const calendarEl = document.getElementById('calendar');
    const addBookingModal = document.getElementById('add-booking-modal');
    const addBookingForm = document.getElementById('add-booking-form');
    const addBookingButton = document.querySelector('.btn-add-booking');
    const cancelModalButton = document.querySelector('.btn-cancel');
    const approveCountDisplay = document.getElementById('approve-count'); // Display for remaining approvals
    const paginationInfo = document.getElementById('page-info');

    const filters = {
        status: '',
        user: '',
        room: '',
    };

    // Ensure all filter elements are present in the DOM
    const statusFilter = document.getElementById('status-filter');
    const userFilter = document.getElementById('user-filter');
    const roomFilter = document.getElementById('room-filter');

    if (!statusFilter || !userFilter || !roomFilter) {
        console.error("One or more filter elements are missing in the DOM.");
        return;
    }

    // Show the modal
    addBookingButton.addEventListener('click', () => {
        addBookingModal.classList.add('show');
    });

    // Hide the modal
    cancelModalButton.addEventListener('click', () => {
        addBookingModal.classList.remove('show');
    });

    // Apply filters
    document.getElementById('apply-filters').addEventListener('click', () => {
        try {
            filters.status = statusFilter.value.trim();
            filters.user = userFilter.value.trim();
            filters.room = roomFilter.value.trim();
            currentPage = 1; // Reset to the first page when applying filters
            loadBookings();
        } catch (error) {
            console.error("Error applying filters:", error);
        }
    });

    // Populate User and Room Dropdowns
    const populateDropdowns = async () => {
        try {
            const [users, rooms] = await Promise.all([
                fetch(`${BASE_URL}/users/`, { headers: AUTH_HEADERS }).then((res) => res.json()),
                fetch(`${BASE_URL}/rooms/`, { headers: AUTH_HEADERS }).then((res) => res.json()),
            ]);

            const userSelect = document.getElementById('user');
            const roomSelect = document.getElementById('room');

            users.forEach((user) => {
                const option = document.createElement('option');
                option.value = user.id; // Use the ID instead of the username
                option.textContent = user.username; // Display the username
                userSelect.appendChild(option);
            });
            
            rooms.forEach((room) => {
                const option = document.createElement('option');
                option.value = room.id; // Use the room ID
                option.textContent = room.name; // Display the room name
                roomSelect.appendChild(option);
            });
            

        } catch (error) {
            console.error('Error populating dropdowns:', error);
        }
    };

    // Submit Form
    addBookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
    
        const formData = new FormData(addBookingForm);
        const payload = {
            user_id: parseInt(formData.get('user'), 10),
            room_id: parseInt(formData.get('room'), 10),
            start_time: formData.get('start-time'),
            end_time: formData.get('end-time'),
            status: formData.get('status'),
        };
    
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${BASE_URL}/bookings/`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload),
            });
    
            if (response.ok) {
                alert('Booking added successfully!');
                addBookingModal.classList.remove('show');
                loadBookings();
            } else {
                const errorData = await response.json();
                alert(
                    errorData.non_field_errors?.[0] || 
                    'Error: Unable to add booking. Please check the details and try again.'
                );
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('An unexpected error occurred. Please try again.');
        }
    });
    

    // Fetch Bookings
    const fetchBookings = async (page = 1) => {
        const queryParams = new URLSearchParams({
            page,
            status: filters.status || '',
            user: filters.user || '',
            room: filters.room || '',
        }).toString();
    
        const url = `${BASE_URL}/bookings/?${queryParams}`;
        try {
            const response = await fetch(url, { headers: AUTH_HEADERS });
            if (response.status === 401 || response.status === 403) {
                alert('Session expired or unauthorized access.');
                window.location.href = '/frontend/user/login.html';
                return null;
            }
            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    
            const data = await response.json();
            console.log('Filtered Bookings API Response:', data);
            return data;
        } catch (error) {
            console.error('Error fetching bookings:', error);
            return null;
        }
    };
    
    

    // Fetch Total Pending Approvals
    const fetchTotalPendingCount = async () => {
        try {
            const queryParams = new URLSearchParams({
                status: 'pending',
                user: filters.user || '',
                room: filters.room || '',
            }).toString();
    
            const url = `${BASE_URL}/bookings/?${queryParams}`;
            const response = await fetch(url, { headers: AUTH_HEADERS });
            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    
            const data = await response.json();
            return data.count || 0; // Use the count from API response
        } catch (error) {
            console.error('Error fetching total pending count:', error);
            return 0;
        }
    };
    

    // Render Bookings Table
    const renderBookingsTable = (bookings) => {
        bookingListContainer.innerHTML = '';

        if (!bookings || !bookings.results || bookings.results.length === 0) {
            bookingListContainer.innerHTML = '<tr><td colspan="6">No bookings found.</td></tr>';
            return;
        }

        bookings.results.forEach((booking) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${booking.room || 'N/A'}</td> <!-- Use room name -->
                <td>${booking.user || 'N/A'}</td> <!-- Use username -->
                <td>${new Date(booking.start_time).toLocaleString()}</td>
                <td>${new Date(booking.end_time).toLocaleString()}</td>
                <td>${booking.status || 'N/A'}</td>
                <td>
                    <button class="approve-btn" ${booking.status !== 'pending' ? 'disabled' : ''}>Approve</button>
                    <button class="cancel-btn" ${booking.status === 'canceled' ? 'disabled' : ''}>Cancel</button>
                    <button class="check-in-btn" ${booking.status !== 'approved' ? 'disabled' : ''}>Check-In</button>
                </td>
            `;

            row.querySelector('.approve-btn').addEventListener('click', () => handleApprove(booking.id));
            row.querySelector('.cancel-btn').addEventListener('click', () => handleCancel(booking.id));
            row.querySelector('.check-in-btn').addEventListener('click', () => handleCheckIn(booking.id));

            bookingListContainer.appendChild(row);
        });
    };

    const handleApprove = async (bookingId) => {
        try {
            const response = await fetch(`${BASE_URL}/bookings/${bookingId}/approve/`, {
                method: 'POST',
                headers: AUTH_HEADERS,
            });
            if (response.ok) {
                alert('Booking Approved!');
                loadBookings();
            } else {
                const error = await response.json();
                console.error('Error approving booking:', error);
                alert(error.error || 'Error approving booking. Try again.');
            }
        } catch (error) {
            console.error('Error approving booking:', error);
            alert('An unexpected error occurred.');
        }
    };
    
    const handleCancel = async (bookingId) => {
        try {
            const response = await fetch(`${BASE_URL}/bookings/${bookingId}/cancel/`, {
                method: 'POST',
                headers: AUTH_HEADERS,
            });
            if (response.ok) {
                alert('Booking Canceled!');
                loadBookings();
            } else {
                const error = await response.json();
                console.error('Error canceling booking:', error);
                alert(error.error || 'Error canceling booking. Try again.');
            }
        } catch (error) {
            console.error('Error canceling booking:', error);
            alert('An unexpected error occurred.');
        }
    };
    
    const handleCheckIn = async (bookingId) => {
        try {
            const response = await fetch(`${BASE_URL}/bookings/${bookingId}/check_in/`, {
                method: 'POST',
                headers: AUTH_HEADERS,
            });
            if (response.ok) {
                alert('Check-In Successful!');
                loadBookings();
            } else {
                const error = await response.json();
                console.error('Error during check-in:', error);
                alert(error.error || 'Error during check-in. Try again.');
            }
        } catch (error) {
            console.error('Error during check-in:', error);
            alert('An unexpected error occurred.');
        }
    };
    

    // Load Bookings with Pagination
    const loadBookings = async () => {
        const data = await fetchBookings(currentPage);
        if (data) {
            renderBookingsTable(data);
            paginationInfo.textContent = `Page ${currentPage} of ${data.total_pages}`;
        }

        const totalPendingCount = await fetchTotalPendingCount();
        approveCountDisplay.textContent = `Remaining bookings to Approve: ${totalPendingCount}`;
    };

    // Pagination controls
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadBookings();
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        currentPage++;
        loadBookings();
    });

    // Apply filters
    document.getElementById('apply-filters').addEventListener('click', () => {
        filters.status = document.getElementById('status-filter').value.trim();
        filters.user = document.getElementById('user-filter').value.trim();
        filters.room = document.getElementById('room-filter').value.trim();
        currentPage = 1; // Reset to the first page when applying filters
        loadBookings();
    });

    // Initialize Calendar
    const initializeCalendar = async () => {
        try {
            const bookings = await fetchBookings();
    
            if (bookings && bookings.results) {
                const events = bookings.results.map((booking) => ({
                    title: `${booking.room || 'N/A'} (By ${booking.user || 'Unknown'})`,
                    start: booking.start_time,
                    end: booking.end_time,
                    description: `Status: ${booking.status || 'N/A'}`,
                }));
    
                const calendar = new FullCalendar.Calendar(calendarEl, {
                    initialView: 'dayGridMonth',
                    headerToolbar: {
                        left: 'prev,next',
                        center: 'title',
                        right: 'today,dayGridMonth,timeGridWeek,timeGridDay',
                    },
                    events: events,
                    eventClick: function (info) {
                        const popup = document.createElement('div');
                        popup.classList.add('custom-popup');
                        popup.innerHTML = `
                            <div class="popup-content">
                                <h3>${info.event.title}</h3>
                                <p><strong>Status:</strong> ${info.event.extendedProps.description}</p>
                                <p><strong>Start Time:</strong> ${new Date(info.event.start).toLocaleString()}</p>
                                <p><strong>End Time:</strong> ${new Date(info.event.end).toLocaleString()}</p>
                                <button class="close-popup">Close</button>
                            </div>
                        `;
                        document.body.appendChild(popup);
    
                        // Add close functionality
                        const closeButton = popup.querySelector('.close-popup');
                        closeButton.addEventListener('click', () => {
                            document.body.removeChild(popup);
                        });
                    },
                });
    
                calendar.render();
            } else {
                console.error("Unexpected data format for calendar bookings.");
            }
        } catch (error) {
            console.error("Error initializing calendar:", error);
        }
    };
    

    // Initialize
    populateDropdowns();
    loadBookings();
    initializeCalendar();
});
