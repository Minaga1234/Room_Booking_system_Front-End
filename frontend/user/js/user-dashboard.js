document.addEventListener("DOMContentLoaded", async () => {
    const API_BASE_URL = "http://127.0.0.1:8000/analytics/";
    const ROOMS_API_URL = "http://127.0.0.1:8000/api/rooms/";
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
                            color: "#000000",
                        },
                    },
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: "Values",
                            color: "#000000",
                        },
                        ticks: {
                            color: "#000000",
                        },
                        beginAtZero: true,
                    },
                    x: {
                        title: {
                            display: true,
                            text: "Rooms",
                            color: "#111111",
                        },
                        ticks: {
                            color: "#000000",
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
