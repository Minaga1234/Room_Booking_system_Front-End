document.addEventListener("DOMContentLoaded", async () => {
    /**
     * Load Header and Sidebar
     */
    const loadHeaderAndSidebar = async () => {
        try {
            // Load header dynamically
            const headerResponse = await fetch("../shared/header.html");
            if (!headerResponse.ok) {
                throw new Error(`Failed to load header: ${headerResponse.statusText}`);
            }
            const headerHTML = await headerResponse.text();
            document.getElementById("header-container").innerHTML = headerHTML;
    
            // Load sidebar dynamically
            const sidebarResponse = await fetch("../shared/sidebar.html");
            if (!sidebarResponse.ok) {
                throw new Error(`Failed to load sidebar: ${sidebarResponse.statusText}`);
            }
            const sidebarHTML = await sidebarResponse.text();
            document.getElementById("sidebar-container").innerHTML = sidebarHTML;
    
            // Highlight active sidebar link
            const currentPage = window.location.pathname.split("/").pop();
            const navLinks = document.querySelectorAll("#sidebar-container .nav-links a");
    
            navLinks.forEach((link) => {
                const linkHref = link.getAttribute("href");
                const parentLi = link.parentElement;
    
                if (currentPage === linkHref) {
                    parentLi.classList.add("active"); // Add active class
                } else {
                    parentLi.classList.remove("active"); // Remove active class
                }
            });
    
            console.log("Header and Sidebar loaded and active link highlighted.");
        } catch (error) {
            console.error("Error loading header or sidebar:", error);
        }
    };
    
    /**
     * Initialize FullCalendar
     */
    const initializeCalendar = () => {
        const calendarEl = document.getElementById("calendar");

        if (!calendarEl) {
            console.error("Calendar element not found.");
            return;
        }

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
                            info.event.remove(); // Remove event from calendar
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
                calendar.addEventSource(data);
                calendar.render();
            })
            .catch((error) => {
                console.error("Error fetching bookings:", error);
            });
    };

    /**
     * Fetch Bookings for FullCalendar
     */
    const fetchBookings = async () => {
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
                color: booking.status === "approved" ? "green" : "red", // Example color logic
            }));
        } catch (error) {
            console.error("Error fetching bookings:", error);
            return [];
        }
    };

    /**
     * Cancel a Booking
     * @param {number} bookingId
     */
    const cancelBooking = async (bookingId) => {
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
    };

    /**
     * Fetch and Display User's Bookings
     */
    const fetchMyBookings = async () => {
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
                    <p>${booking.room.name} - Booked</p>
                    <span>From ${new Date(booking.start_time).toLocaleString()} to ${new Date(booking.end_time).toLocaleString()}</span>
                    <button data-id="${booking.id}" class="cancel-btn">Cancel Booking</button>
                `;
                bookingsListEl.appendChild(bookingEl);
            });

            // Add event listeners for cancel buttons
            document.querySelectorAll(".cancel-btn").forEach((button) => {
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
    };

    /**
     * Fetch and Display Weather Information
     */
    const fetchWeatherDescription = async () => {
        const apiKey = "db4aef39c826d3eeb2e0b440ba11cccb"; // Replace with your OpenWeatherMap API key
        const city = "Colombo"; // Replace with your desired city
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch weather data. Status: ${response.status}`);
            }

            const data = await response.json();

            // Update the weather description dynamically
            const weatherDescriptionElement = document.querySelector(".weather-description");
            weatherDescriptionElement.textContent = data.weather[0].description;

            // Optionally update temperature or icon
            document.querySelector(".temperature").textContent = `${data.main.temp}°C`;
            document.querySelector(".weather-icon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        } catch (error) {
            console.error("Error fetching weather data:", error);
            const weatherDescriptionElement = document.querySelector(".weather-description");
            weatherDescriptionElement.textContent = "Unable to fetch weather data.";
        }
    };

    // Call the function on page load
    document.addEventListener("DOMContentLoaded", () => {
        fetchWeatherDescription();
    });
});
