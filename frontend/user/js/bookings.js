document.addEventListener("DOMContentLoaded", () => {
    const calendarEl = document.getElementById("calendar");
    const bookingsListEl = document.querySelector(".bookings-list");

    // Initialize the calendar
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
        },
        events: [],
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

    // Fetch bookings for the calendar
    const fetchCalendarBookings = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/bookings/calendar_events/", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch calendar events: ${response.statusText}`);
            }

            const events = await response.json();
            calendar.addEventSource(events);
            calendar.render();
        } catch (error) {
            console.error("Error fetching calendar bookings:", error);
        }
    };

    // Fetch bookings for the list (only current and future bookings for the owner)
    const fetchBookingsList = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/bookings/my_bookings/", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch user bookings: ${response.statusText}`);
            }

            const bookings = await response.json();
            const currentAndFutureBookings = bookings.filter((booking) => {
                const now = new Date();
                return new Date(booking.end_time) > now; // Filter only current and future bookings
            });

            renderBookingsList(currentAndFutureBookings);
        } catch (error) {
            console.error("Error fetching user bookings:", error);
        }
    };

    // Render bookings list
    const renderBookingsList = (bookings) => {
        bookingsListEl.innerHTML = ""; // Clear previous bookings

        if (!bookings.length) {
            bookingsListEl.innerHTML = "<p>No current or future bookings found.</p>";
            return;
        }

        bookings.forEach((booking) => {
            const bookingItem = document.createElement("div");
            bookingItem.className = "booking-item";
            bookingItem.innerHTML = `
                <strong>Room: ${booking.room}</strong>
                <br />
                From: ${new Date(booking.start_time).toLocaleString()} <br />
                To: ${new Date(booking.end_time).toLocaleString()} <br />
                Status: ${booking.status}
            `;
            bookingsListEl.appendChild(bookingItem);
        });
    };

    // Cancel a booking
    const cancelBooking = async (bookingId) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/bookings/${bookingId}/cancel/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to cancel booking: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error cancelling booking:", error);
            throw error;
        }
    };

    // Initialize the page by fetching bookings
    const initialize = async () => {
        await fetchCalendarBookings(); // Fetch all bookings for the calendar
        await fetchBookingsList();    // Fetch only current and future bookings for the list
    };

    initialize();
});
