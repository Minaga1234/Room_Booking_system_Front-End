document.addEventListener("DOMContentLoaded", async () => {
    const API_BASE_URL = "http://127.0.0.1:8000/analytics/";
    const ROOMS_API_URL = "http://127.0.0.1:8000/api/rooms/";
    const BOOKINGS_URL = "http://127.0.0.1:8000/api/bookings/";
    const sidebarKey = "cachedSidebar"; // Key for caching sidebar content
    const headerKey = "cachedHeader";  // Key for caching header content

    // Fetch Room Data
    const fetchRoomData = async () => {
        try {
            const response = await fetch(ROOMS_API_URL);
            if (!response.ok) {
                throw new Error(`Failed to fetch room data: ${response.status}`);
            }
            const rooms = await response.json();
            const roomMapping = {};
            rooms.forEach((room) => {
                roomMapping[room.id] = room.name;
            });
            return roomMapping;
        } catch (error) {
            console.error("Error fetching room data:", error);
            return {};
        }
    };

    // Fetch Analytics Data
    const fetchAnalyticsData = async () => {
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) {
                throw new Error(`Failed to fetch analytics data: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching analytics data:", error);
            return [];
        }
    };

    // Fetch token dynamically from localStorage
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

    // Fetch Ongoing Bookings
    const fetchOngoingBookings = async () => {
        try {
            const headers = await getAuthHeaders();
            if (!headers) return [];

            const response = await fetch(`${BOOKINGS_URL}?status=approved`, { headers });
            if (!response.ok) throw new Error("Failed to fetch bookings.");
            return await response.json();
        } catch (error) {
            console.error("Error fetching bookings:", error);
            return [];
        }
    };

    // Render Ongoing Bookings
    const renderOngoingBookings = (bookings) => {
        const bookingsContainer = document.getElementById("ongoing-bookings");
        bookingsContainer.innerHTML = ""; // Clear existing content

        if (bookings.length === 0) {
            bookingsContainer.innerHTML = "<p>No ongoing bookings found.</p>";
            return;
        }

        bookings.forEach((booking) => {
            const bookingElement = document.createElement("div");
            bookingElement.classList.add("ongoing-booking");

            bookingElement.innerHTML = `
                <strong>${booking.room || "Unknown Room"}</strong>
                <p>From: ${new Date(booking.start_time).toLocaleString()}</p>
                <p>To: ${new Date(booking.end_time).toLocaleString()}</p>
                <button class="check-in-btn" data-id="${booking.id}">Check In</button>
                <button class="check-out-btn hidden" data-id="${booking.id}">Check Out</button>
            `;

            bookingsContainer.appendChild(bookingElement);

            // Add event listeners for Check-In and Check-Out
            const checkInButton = bookingElement.querySelector(".check-in-btn");
            const checkOutButton = bookingElement.querySelector(".check-out-btn");

            checkInButton.addEventListener("click", () => handleCheckIn(booking.id, checkInButton, checkOutButton));
            checkOutButton.addEventListener("click", () => handleCheckOut(booking.id));
        });
    };

    // Handle Check-In
    const handleCheckIn = async (bookingId, checkInButton, checkOutButton) => {
        try {
            const headers = await getAuthHeaders();
            if (!headers) return;

            const response = await fetch(`${BOOKINGS_URL}${bookingId}/check_in/`, {
                method: "POST",
                headers,
            });

            if (!response.ok) throw new Error("Failed to check in.");
            alert("Check-in successful!");
            checkInButton.classList.add("hidden");
            checkOutButton.classList.remove("hidden");

            startTimer(bookingId, checkOutButton); // Start reminder timer
        } catch (error) {
            console.error("Error during check-in:", error);
            alert("Failed to check in. Please try again.");
        }
    };

    // Handle Check-Out
    const handleCheckOut = async (bookingId) => {
        try {
            const headers = await getAuthHeaders();
            if (!headers) return;

            const response = await fetch(`${BOOKINGS_URL}${bookingId}/check_out/`, {
                method: "POST",
                headers,
            });

            if (!response.ok) throw new Error("Failed to check out.");
            alert("Check-out successful!");

            // Remove the booking from the ongoing section
            document.querySelector(`[data-id="${bookingId}"]`).parentElement.remove();
        } catch (error) {
            console.error("Error during check-out:", error);
            alert("Failed to check out. Please try again.");
        }
    };

    // Start Reminder Timer
    const startTimer = (bookingId, checkOutButton) => {
        const bookingEndTime = new Date(checkOutButton.dataset.endTime).getTime();
        const timerInterval = setInterval(() => {
            const now = Date.now();
            const remainingTime = bookingEndTime - now;

            if (remainingTime <= 5 * 60 * 1000 && remainingTime > 0) {
                alert(`Your booking ends in ${Math.ceil(remainingTime / 60000)} minutes.`);
            } else if (remainingTime <= 0) {
                clearInterval(timerInterval);
                alert("Your booking time has ended. Please check out.");
            }
        }, 60 * 1000); // Check every minute
    };

    // Update Most Popular Rooms
    const updatePopularRooms = async (roomMapping) => {
        const analyticsData = await fetchAnalyticsData();

        if (!analyticsData || analyticsData.length === 0) {
            console.warn("No analytics data available.");
            document.getElementById("popular-rooms-list").innerHTML = "<p>No popular rooms available.</p>";
            return;
        }

        // Sort rooms by total bookings in descending order
        const sortedRooms = analyticsData
            .filter((entry) => entry.total_bookings) // Ensure total_bookings exists
            .sort((a, b) => b.total_bookings - a.total_bookings);

        if (sortedRooms.length === 0) {
            document.getElementById("popular-rooms-list").innerHTML = "<p>No popular rooms available.</p>";
            return;
        }

        // Create HTML content for the sorted rooms using roomMapping
        const popularRoomsHTML = sortedRooms
            .map((room) => `
                <div class="room-item">
                    <p><strong>Room:</strong> ${roomMapping[room.room] || "Unknown Room"}</p>
                    <p><strong>Bookings:</strong> ${room.total_bookings || 0}</p>
                </div>
            `)
            .join("");

        // Update the widget with sorted rooms
        document.getElementById("popular-rooms-list").innerHTML = popularRoomsHTML;
    };

    // Initialize the Chart
    const initializeChart = () => {
        const ctx = document.getElementById("traffic-chart").getContext("2d");

        return new Chart(ctx, {
            type: "line",
            data: {
                labels: [], // Dynamic labels
                datasets: [
                    {
                        label: "Bookings Traffic",
                        data: [], // Dynamic data
                        backgroundColor: "rgba(255, 102, 0, 0.2)", // Light orange fill
                        borderColor: "#FF6600", // Orange line
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                    },
                    {
                        label: "Check-ins Traffic",
                        data: [], // Dynamic data
                        backgroundColor: "rgba(93, 164, 220, 0.2)", // Light blue fill
                        borderColor: "#5DA4DC", // Blue line
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
                    legend: {
                        display: true,
                        labels: {
                            color: "#FFFFFF", // White font for the legend
                        },
                    },
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: "Values",
                            color: "#FFFFFF", // White font for Y-axis title
                        },
                        ticks: {
                            color: "#FFFFFF", // White font for Y-axis ticks
                        },
                        grid: {
                            color: "rgba(255, 255, 255, 0.1)", // Light white gridlines
                        },
                        beginAtZero: true,
                    },
                    x: {
                        title: {
                            display: true,
                            text: "Rooms",
                            color: "#FFFFFF", // White font for X-axis title
                        },
                        ticks: {
                            color: "#FFFFFF", // White font for X-axis ticks
                        },
                        grid: {
                            color: "rgba(255, 255, 255, 0.1)", // Light white gridlines
                        },
                    },
                },
            },
        });
    };


    // Update the Chart
    const updateChart = async (chart, roomMapping) => {
        const analyticsData = await fetchAnalyticsData();
        if (!analyticsData || analyticsData.length === 0) {
            console.warn("No analytics data available.");
            return;
        }

        const rooms = analyticsData.map((entry) => roomMapping[entry.room] || `Room ${entry.room}`);
        const bookings = analyticsData.map((entry) => entry.total_bookings);
        const utilizationRates = analyticsData.map((entry) => entry.utilization_rate || 0);

        chart.data.labels = rooms;
        chart.data.datasets[0].data = bookings;
        chart.data.datasets[1].data = utilizationRates;
        chart.update();
    };

    // Initialize the Dashboard
    const initializeDashboard = async () => {
        const roomMapping = await fetchRoomData();

        // Update the Most Popular Rooms Widget
        await updatePopularRooms(roomMapping);

        // Initialize and Update the Traffic Chart
        const chart = initializeChart();
        await updateChart(chart, roomMapping);
    };

    // Load Sidebar and Header with Cache
    const loadHeaderAndSidebar = () => {
        // Load Sidebar
        if (localStorage.getItem(sidebarKey)) {
            document.getElementById("sidebar-container").innerHTML = localStorage.getItem(sidebarKey);
        } else {
            fetch("../shared/navbar.html")
                .then((response) => response.text())
                .then((data) => {
                    document.getElementById("sidebar-container").innerHTML = data;
                    localStorage.setItem(sidebarKey, data); // Cache content
                })
                .catch((error) => console.error("Error loading sidebar:", error));
        }

        // Load Header
        if (localStorage.getItem(headerKey)) {
            document.getElementById("header-container").innerHTML = localStorage.getItem(headerKey);
        } else {
            fetch("../shared/header.html")
                .then((response) => response.text())
                .then((data) => {
                    document.getElementById("header-container").innerHTML = data;
                    localStorage.setItem(headerKey, data); // Cache content
                })
                .catch((error) => console.error("Error loading header:", error));
        }
    };

    // Run Initialization
    loadHeaderAndSidebar();
    initializeDashboard();
});
