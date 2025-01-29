document.addEventListener("DOMContentLoaded", () => {
    const BASE_URL = "http://ibs.lunox.dev/api";
    const BOOKINGS_URL = `${BASE_URL}/bookings/my_bookings/`;
    const CANCEL_BOOKING_URL = (bookingId) => `${BASE_URL}/bookings/${bookingId}/cancel/`;

    // Dynamically get token from localStorage
    const getAuthHeaders = async () => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
            alert("Your session has expired. Please log in again.");
            window.location.href = "/frontend/user/login.html";
            return null;
        }
        return {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        };
    };

    // === Load Sidebar ===
    const loadSidebar = async () => {
        try {
            const sidebarContainer = document.getElementById("sidebar-container");
            const response = await fetch("../shared/navbar.html");
            if (!response.ok) throw new Error(`Failed to load sidebar: ${response.status}`);
            const sidebarHTML = await response.text();
            sidebarContainer.innerHTML = sidebarHTML;
            
            // Highlight Active Sidebar Link
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
        } catch (error) {
            console.error("Error loading sidebar:", error);
        }
    };

    // === Load Header ===
    const loadHeader = async () => {
        try {
            const headerContainer = document.getElementById("header-container");
            const response = await fetch("../shared/header.html");
            if (!response.ok) throw new Error(`Failed to load header: ${response.status}`);
            const headerHTML = await response.text();
            headerContainer.innerHTML = headerHTML;
        } catch (error) {
            console.error("Error loading header:", error);
        }
    };

    // Fetch User Bookings
    const fetchUserBookings = async () => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(BOOKINGS_URL, { headers });
            if (!response.ok) throw new Error(`Failed to fetch bookings: ${response.status}`);
            const data = await response.json();
            console.log("User Bookings:", data);
            return data;
        } catch (error) {
            console.error("Error fetching bookings:", error);
            return [];
        }
    };

    // Render Bookings Table
    const renderBookingsTable = (bookings) => {
        const bookingsTableBody = document.querySelector(".my-bookings-table tbody");
        bookingsTableBody.innerHTML = "";

        if (!bookings || bookings.length === 0) {
            bookingsTableBody.innerHTML = "<tr><td colspan='5'>No bookings found.</td></tr>";
            return;
        }

        bookings.forEach((booking) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${booking.room || "N/A"}</td>
                <td>${new Date(booking.start_time).toLocaleString()}</td>
                <td>${new Date(booking.end_time).toLocaleString()}</td>
                <td>${booking.status}</td>
                <td><button class="cancel-btn" ${booking.status !== "pending" ? "disabled" : ""}>Cancel</button></td>
            `;
            row.querySelector(".cancel-btn").addEventListener("click", () => cancelBooking(booking.id, row));
            bookingsTableBody.appendChild(row);
        });
    };

    // Fetch Ongoing Bookings
    const fetchOngoingBookings = async () => {
        try {
            const headers = await getAuthHeaders();
            const [approvedResponse, checkedInResponse] = await Promise.all([
                fetch(`${BASE_URL}/bookings/?status=approved`, { headers }),
                fetch(`${BASE_URL}/bookings/?status=checked_in`, { headers }),
            ]);
            if (!approvedResponse.ok || !checkedInResponse.ok) throw new Error("Failed to fetch ongoing bookings.");
            const approvedBookings = await approvedResponse.json();
            const checkedInBookings = await checkedInResponse.json();
            return [...approvedBookings.results, ...checkedInBookings.results];
        } catch (error) {
            console.error("Error fetching ongoing bookings:", error);
            return [];
        }
    };
    
    
    const renderOngoingBookings = (bookings) => {
        const ongoingBookingsList = document.getElementById("ongoing-bookings-list");
        ongoingBookingsList.innerHTML = ""; // Clear previous content
    
        const now = new Date(); // Current timestamp
        const filteredBookings = bookings.filter((booking) => {
            const startTime = new Date(booking.start_time);
            const endTime = new Date(booking.end_time);
            return now >= startTime && now <= endTime; // Only include bookings in the current timeslot
        });
    
        if (filteredBookings.length === 0) {
            ongoingBookingsList.innerHTML = "<p>No ongoing bookings available.</p>";
            return;
        }
    
        filteredBookings.forEach((booking) => {
            const startTime = new Date(booking.start_time);
            const endTime = new Date(booking.end_time);
    
            const bookingItem = document.createElement("div");
            bookingItem.classList.add("booking-item");
            bookingItem.innerHTML = `
                <strong>${booking.room || "Unknown Room"}</strong>
                <p><strong>Start:</strong> ${startTime.toLocaleString()}</p>
                <p><strong>End:</strong> ${endTime.toLocaleString()}</p>
                <div class="action-buttons">
                    <button class="check-in-btn" data-id="${booking.id}" ${
                        booking.status === "checked_in" ? "disabled" : ""
                    }>Check In</button>
                    <button class="check-out-btn ${booking.status === "checked_in" ? "" : "hidden"}" data-id="${booking.id}">Check Out</button>
                </div>
                <div class="timer ${booking.status === "checked_in" ? "" : "hidden"}" id="timer-${booking.id}"></div>
            `;
    
            ongoingBookingsList.appendChild(bookingItem);
    
            const checkInButton = bookingItem.querySelector(".check-in-btn");
            const checkOutButton = bookingItem.querySelector(".check-out-btn");
            const timerDiv = bookingItem.querySelector(`#timer-${booking.id}`);
    
            checkInButton.addEventListener("click", () =>
                handleCheckIn(booking.id, checkInButton, checkOutButton, timerDiv, endTime)
            );
            checkOutButton.addEventListener("click", () => handleCheckOut(booking.id, timerDiv));
    
            if (booking.status === "checked_in") {
                startTimer(timerDiv, endTime);
            }
        });
    };
    

    // Handle Check-In
    const handleCheckIn = async (bookingId, checkInButton, checkOutButton, timerDiv, endTime) => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${BASE_URL}/bookings/${bookingId}/check_in/`, {
                method: "POST",
                headers,
            });
            if (!response.ok) throw new Error("Failed to check in.");

            alert("Check-in successful!");
            checkInButton.classList.add("hidden");
            checkOutButton.classList.remove("hidden");
            timerDiv.classList.remove("hidden");
            startTimer(timerDiv, endTime);
        } catch (error) {
            console.error("Error during check-in:", error);
            alert("Failed to check in. Please try again.");
        }
    };

    const handleCheckOut = async (bookingId, checkOutButton, timerDiv, endTime) => {
        try {
            const headers = await getAuthHeaders();
            const now = new Date();
    
            // API Call for Check-Out
            const response = await fetch(`${BASE_URL}/bookings/${bookingId}/check_out/`, {
                method: "POST",
                headers,
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.penalty_imposed) {
                    alert(`Check-out successful, but a penalty of $${errorData.penalty_amount} has been imposed.`);
                } else {
                    throw new Error("Failed to check out.");
                }
            } else if (now > new Date(endTime)) {
                alert("Check-out successful! Penalty imposed for overstaying.");
            } else {
                alert("Check-out successful!");
            }
    
            // Safely handle the timerDiv if it exists
            if (timerDiv) {
                clearInterval(timerDiv.dataset.timerId);
                timerDiv.textContent = "Booking completed.";
            } else {
                console.warn("TimerDiv is undefined. Skipping timer operations.");
            }
    
            // Remove the booking item from the DOM
            checkOutButton.parentElement.parentElement.remove();
        } catch (error) {
            console.error("Error during check-out:", error);
            alert("Failed to check out. Please try again.");
        }
    };
    

    const applyPenaltyForOverstay = async (bookings) => {
        const now = new Date();
    
        bookings.forEach(async (booking) => {
            const endTime = new Date(booking.end_time);
            if (now > endTime && booking.status === "checked_in") {
                try {
                    const headers = await getAuthHeaders();
                    const response = await fetch(`${BASE_URL}/bookings/${booking.id}/apply_penalty/`, {
                        method: "POST",
                        headers,
                    });
    
                    if (response.ok) {
                        alert(`Penalty applied for overdue booking in ${booking.room}`);
                    } else {
                        console.error(`Penalty application failed for booking ${booking.id}`);
                    }
                } catch (error) {
                    console.error(`Error applying penalty for booking ${booking.id}:`, error);
                }
            }
        });
    };
    
    

    // Start Timer
    const startTimer = (timerDiv, endTime) => {
        const endTimeMs = new Date(endTime).getTime();

        const updateTimer = () => {
            const now = Date.now();
            const remainingTime = endTimeMs - now;

            if (remainingTime <= 0) {
                clearInterval(timerDiv.dataset.timerId);
                timerDiv.textContent = "Booking time has ended.";
                return;
            }

            const minutes = Math.floor(remainingTime / 60000);
            const seconds = Math.floor((remainingTime % 60000) / 1000);
            timerDiv.textContent = `Time Remaining: ${minutes}m ${seconds}s`;
        };

        updateTimer();
        const timerId = setInterval(updateTimer, 1000);
        timerDiv.dataset.timerId = timerId;
    };

    
    // === Cancel Booking ===
    const cancelBooking = async (bookingId, rowElement) => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;

        try {
            const headers = await getAuthHeaders();
            if (!headers) return;

            const response = await fetch(CANCEL_BOOKING_URL(bookingId), {
                method: "POST",
                headers,
            });

            if (!response.ok) throw new Error("Failed to cancel booking.");

            alert("Booking canceled successfully.");
            if (rowElement) rowElement.remove();
            loadCalendarEvents();
        } catch (error) {
            console.error("Error cancelling booking:", error);
            alert("Failed to cancel booking. Please try again.");
        }
    };

    // === Load Calendar Events with Popups ===
const loadCalendarEvents = async () => {
    const bookings = await fetchUserBookings();
    const events = bookings.map((booking) => ({
        id: booking.id,
        title: booking.room || "N/A",
        start: booking.start_time,
        end: booking.end_time,
        description: `Status: ${booking.status}`,
    }));

    const calendarEl = document.getElementById("calendar");
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
        },
        events: events,
        eventClick: function (info) {
            const popup = document.createElement("div");
            popup.classList.add("custom-popup");
            popup.innerHTML = `
                <div class="popup-content">
                    <h3>You have booked the ${info.event.title}</h3>
                    <p><strong>Status:</strong> ${info.event.extendedProps.description.split(": ")[1]}</p>
                    <p><strong>Start Time:</strong> ${new Date(info.event.start).toLocaleString()}</p>
                    <p><strong>End Time:</strong> ${new Date(info.event.end).toLocaleString()}</p>
                    <button class="close-popup">Close</button>
                </div>
            `;
            document.body.appendChild(popup);

            // Add close functionality
            const closeButton = popup.querySelector(".close-popup");
            closeButton.addEventListener("click", () => {
                document.body.removeChild(popup);
            });
        },
    });

    calendar.render();
};


const initializeMyBookings = async () => {
    try {
        // Fetch and render all user bookings
        const userBookings = await fetchUserBookings();
        console.log("User Bookings:", userBookings);
        renderBookingsTable(userBookings);

        // Fetch and render ongoing bookings
        const ongoingBookings = await fetchOngoingBookings();
        console.log("Ongoing Bookings:", ongoingBookings);
        renderOngoingBookings(ongoingBookings);

        // Apply penalties for overdue check-outs
        applyPenaltyForOverstay(ongoingBookings);

        // Initialize calendar events
        loadCalendarEvents();
    } catch (error) {
        console.error("Error initializing bookings:", error);
    }
};


    // === Initialize the Chart ===
    const initializeChart = () => {
        const ctx = document.getElementById("weekly-trends-chart");
        if (!ctx) {
            console.warn("Chart element not found. Skipping chart initialization.");
            return null;
        }

        return new Chart(ctx.getContext("2d"), {
            type: "line",
            data: {
                labels: [],
                datasets: [
                    {
                        label: "Bookings",
                        data: [],
                        backgroundColor: "rgba(255, 102, 0, 0.2)",
                        borderColor: "#FF6600",
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                    },
                    {
                        label: "Utilization (%)",
                        data: [],
                        backgroundColor: "rgba(93, 164, 220, 0.2)",
                        borderColor: "#5DA4DC",
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true },
                },
                scales: {
                    y: { title: { display: true, text: "Values" }, min: 0, max: 100 },
                    x: { title: { display: true, text: "Rooms" } },
                },
            },
        });
    };

    // === Initialize and Update ===
    const chart = initializeChart();
    initializeMyBookings();

    // Load Sidebar and Header
    loadSidebar();
    loadHeader();
});