document.addEventListener("DOMContentLoaded", function () {
    const calendarEl = document.getElementById("calendar");

    if (!calendarEl) {
        console.error("Calendar element not found.");
        return;
    }

    // Initialize FullCalendar
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
        },
        events: [], // Events will be dynamically fetched
        eventClick: function (info) {
            if (confirm(`Do you want to cancel the booking for "${info.event.title}"?`)) {
                cancelBooking(info.event.id)
                    .then(() => {
                        info.event.remove(); // Remove the event from the calendar
                        alert("Booking cancelled successfully.");
                    })
                    .catch((error) => {
                        console.error("Error cancelling booking:", error);
                        alert("Failed to cancel booking. Please try again.");
                    });
            }
        },
    });

    // Fetch and display bookings in FullCalendar
    fetchBookings()
        .then((data) => {
            calendar.addEventSource(data); // Add bookings as events
            calendar.render(); // Render the calendar
        })
        .catch((error) => {
            console.error("Error fetching bookings:", error);
        });

    /**
     * Fetch bookings from the Django backend
     */
    async function fetchBookings() {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/bookings/calendar_events/", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`, // Use valid token
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch bookings. Status: ${response.status}`);
            }

            const data = await response.json();

            // Format bookings for FullCalendar
            return data.map((booking) => ({
                id: booking.id,
                title: booking.title,
                start: booking.start,
                end: booking.end,
                color: booking.title.includes("approved") ? "green" : "red", // Example color logic
            }));
        } catch (error) {
            console.error("Error fetching bookings:", error);
            return [];
        }
    }

    /**
     * Cancel a booking
     * @param {number} bookingId
     */
    async function cancelBooking(bookingId) {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/bookings/${bookingId}/cancel/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`, // Use valid token
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to cancel booking. Status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error cancelling booking:", error);
            throw error;
        }
    }

    /**
     * Fetch and display user's bookings
     */
    async function fetchMyBookings() {
        const bookingsListEl = document.querySelector(".bookings-list");
        bookingsListEl.innerHTML = "<p>Loading bookings...</p>";

        try {
            const response = await fetch("http://127.0.0.1:8000/api/bookings/my_bookings/", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`, // Use valid token
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch bookings.");
            }

            const bookings = await response.json();
            bookingsListEl.innerHTML = "";

            if (bookings.length === 0) {
                bookingsListEl.innerHTML = "<p>No bookings found.</p>";
                return;
            }

            bookings.forEach((booking) => {
                const bookingEl = document.createElement("div");
                bookingEl.classList.add("booking-item");
                bookingEl.innerHTML = `
                    <p><strong>Room:</strong> ${booking.room.name}</p>
                    <p><strong>Start:</strong> ${new Date(booking.start_time).toLocaleString()}</p>
                    <p><strong>End:</strong> ${new Date(booking.end_time).toLocaleString()}</p>
                    <button data-id="${booking.id}" class="cancel-booking">Cancel</button>
                `;
                bookingsListEl.appendChild(bookingEl);
            });

            // Add event listeners for cancel buttons
            document.querySelectorAll(".cancel-booking").forEach((button) => {
                button.addEventListener("click", async (e) => {
                    const bookingId = e.target.dataset.id;
                    try {
                        await cancelBooking(bookingId);
                        alert("Booking cancelled successfully.");
                        fetchMyBookings(); // Refresh the bookings list
                    } catch (error) {
                        console.error("Error cancelling booking:", error);
                        alert("Failed to cancel booking. Please try again.");
                    }
                });
            });
        } catch (error) {
            console.error("Error fetching bookings:", error);
            bookingsListEl.innerHTML = "<p>Error loading bookings. Please try again.</p>";
        }
    }

    // Fetch user's bookings on page load
    fetchMyBookings();
});
