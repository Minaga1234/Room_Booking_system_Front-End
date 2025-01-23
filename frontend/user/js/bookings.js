document.addEventListener("DOMContentLoaded", () => {
    // Define the base URL and headers
    const BASE_URL = "http://127.0.0.1:8000/api";
    const AUTH_HEADERS = {
        Authorization: `Token 321497117be1c51df2e1f377037cf54b3774f0ad`,
        "Content-Type": "application/json",
    };

    // === Load Sidebar ===
    const loadSidebar = async () => {
        try {
            const sidebarContainer = document.getElementById("sidebar-container");
            const response = await fetch("../shared/navbar.html");
            if (!response.ok) {
                throw new Error(`Failed to load sidebar: ${response.status}`);
            }
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
            if (!response.ok) {
                throw new Error(`Failed to load header: ${response.status}`);
            }
            const headerHTML = await response.text();
            headerContainer.innerHTML = headerHTML;
        } catch (error) {
            console.error("Error loading header:", error);
        }
    };

    // === Fetch User Bookings ===
    const fetchUserBookings = async () => {
        try {
            const response = await fetch(`${BASE_URL}/bookings/my_bookings/`, {
                headers: AUTH_HEADERS,
            });
            if (!response.ok) throw new Error(`Failed to fetch bookings: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Error fetching bookings:", error);
            return [];
        }
    };

    // === Render My Bookings Table ===
    const renderBookingsTable = (bookings) => {
        const bookingsTableBody = document.querySelector(".my-bookings-table tbody");
        bookingsTableBody.innerHTML = "";

        if (bookings.length === 0) {
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
                <td>
                    <button class="cancel-btn" ${booking.status !== "pending" ? "disabled" : ""}>Cancel</button>
                </td>
            `;
            row.querySelector(".cancel-btn").addEventListener("click", () => cancelBooking(booking.id, row));
            bookingsTableBody.appendChild(row);
        });
    };

    // === Cancel Booking ===
    const cancelBooking = async (bookingId, rowElement) => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;
        try {
            const response = await fetch(`${BASE_URL}/bookings/${bookingId}/cancel/`, {
                method: "POST",
                headers: AUTH_HEADERS,
            });
            if (!response.ok) throw new Error("Failed to cancel booking.");
            alert("Booking canceled successfully.");
            rowElement.remove();
            loadCalendarEvents();
        } catch (error) {
            console.error("Error cancelling booking:", error);
            alert("Failed to cancel booking. Please try again.");
        }
    };

    // === Load Calendar Events ===
    const loadCalendarEvents = async () => {
        const bookings = await fetchUserBookings();
        const events = bookings.map((booking) => ({
            id: booking.id,
            title: booking.room || "N/A",
            start: booking.start_time,
            end: booking.end_time,
            description: booking.status,
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
                if (info.event.extendedProps.description === "pending") {
                    if (confirm(`Do you want to cancel the booking for "${info.event.title}"?`)) {
                        cancelBooking(info.event.id, null);
                        info.event.remove();
                    }
                }
            },
        });

        calendar.render();
    };

    // === Initialize My Bookings ===
    const initializeMyBookings = async () => {
        const bookings = await fetchUserBookings();
        console.log("Fetched bookings:", bookings); // Debugging API response
        renderBookingsTable(bookings);
        loadCalendarEvents();
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
