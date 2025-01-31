document.addEventListener("DOMContentLoaded", async () => {
    const API_BASE_URL = "http://127.0.0.1:8000/analytics/";
    const ROOMS_API_URL = "http://127.0.0.1:8000/api/rooms/";
    const ADMIN_BOOKINGS_URL = "http://127.0.0.1:8000/api/bookings/admin/bookings/";
    const ADMIN_PENALTIES_URL = "http://127.0.0.1:8000/api/admin/penalties/";
    const NEW_ROOMS_LIMIT = 5;

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

    // Fetch Transformed Analytics Data
    const fetchAnalyticsData = async () => {
        try {
            const response = await fetch(API_BASE_URL + "transformed-analytics/");
            if (!response.ok) {
                throw new Error(`Failed to fetch analytics data: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching analytics data:", error);
            return {};
        }
    };

    // Initialize the Chart
    const initializeChart = () => {
        const ctx = document.getElementById("usage-trend-chart").getContext("2d");
        return new Chart(ctx, {
            type: "line",
            data: {
                labels: [],
                datasets: [],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: "#FFFFFF", // Set legend text color to white
                        },
                    },
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: "Values",
                            color: "#FFFFFF", // Set Y-axis title color to white
                        },
                        ticks: {
                            color: "#FFFFFF", // Set Y-axis ticks color to white
                        },
                        beginAtZero: true,
                        grid: {
                            color: "rgba(255, 255, 255, 0.1)", // Light white gridlines
                        },
                    },
                    x: {
                        title: {
                            display: true,
                            text: "Dates",
                            color: "#FFFFFF", // Set X-axis title color to white
                        },
                        ticks: {
                            color: "#FFFFFF", // Set X-axis ticks color to white
                        },
                        grid: {
                            color: "rgba(255, 255, 255, 0.1)", // Light white gridlines
                        },
                    },
                },
            },
        });
    };

    // Generate Random Colors for Datasets
    const getRandomColor = () => {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    // Update the Chart
    const updateChart = async (chart) => {
        const analyticsData = await fetchAnalyticsData();
        if (!analyticsData || !analyticsData.dates || !analyticsData.data) {
            console.warn("No analytics data available.");
            return;
        }

        const labels = analyticsData.dates;
        const datasets = Object.keys(analyticsData.data).map((room) => ({
            label: room,
            data: analyticsData.data[room].bookings,
            borderColor: getRandomColor(),
            fill: false,
            tension: 0.4,
        }));

        chart.data.labels = labels;
        chart.data.datasets = datasets;
        chart.update();
    };

    // Update Most Popular Rooms
    const updatePopularRooms = async () => {
        const analyticsData = await fetchAnalyticsData();
        if (!analyticsData || !analyticsData.data) {
            console.warn("No analytics data available.");
            document.getElementById("popular-rooms-list").innerHTML = "<p>No popular rooms available.</p>";
            return;
        }

        const popularRooms = Object.entries(analyticsData.data)
            .map(([roomName, roomData]) => ({
                name: roomName,
                totalBookings: roomData.bookings.reduce((sum, count) => sum + count, 0),
            }))
            .sort((a, b) => b.totalBookings - a.totalBookings);

        const popularRoomsHTML = popularRooms
            .slice(0, 5) // Limit to top 5 rooms
            .map(
                (room) => `
                <div class="room-item">
                    <p><strong>Room:</strong> ${room.name}</p>
                    <p><strong>Total Bookings:</strong> ${room.totalBookings}</p>
                </div>
            `
            )
            .join("");

        document.getElementById("popular-rooms-list").innerHTML = popularRoomsHTML;
    };

    // Initialize Admin Dashboard
    const initializeDashboard = async () => {
        const roomMapping = await fetchRoomData();

        // Update Popular Rooms
        await updatePopularRooms();

        // Initialize and Update the Traffic Chart
        const chart = initializeChart();
        await updateChart(chart);

        console.log("Dashboard initialized successfully.");
    };

    // Run Initialization
    await initializeDashboard();
});
