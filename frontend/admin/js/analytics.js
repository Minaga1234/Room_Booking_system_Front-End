document.addEventListener("DOMContentLoaded", () => {
    // Dummy room data
    const dummyRoomData = {
        1: "Conference Room A",
        2: "Meeting Room B",
        3: "Training Room C",
        4: "Collaboration Space",
        5: "Boardroom",
    };

    // Dummy analytics data
    const dummyAnalyticsData = [
        { room: 1, total_bookings: 25, total_checkins: 20, utilization_rate: 80 },
        { room: 2, total_bookings: 18, total_checkins: 15, utilization_rate: 83.33 },
        { room: 3, total_bookings: 30, total_checkins: 28, utilization_rate: 93.33 },
        { room: 4, total_bookings: 22, total_checkins: 18, utilization_rate: 81.82 },
        { room: 5, total_bookings: 15, total_checkins: 12, utilization_rate: 80 },
    ];

    // Initialize the Chart
    const initializeChart = () => {
        const ctx = document.getElementById("weekly-trends-chart").getContext("2d");

        return new Chart(ctx, {
            type: "line",
            data: {
                labels: [], // Dynamic labels
                datasets: [
                    {
                        label: "Bookings",
                        data: [], // Dynamic data
                        backgroundColor: "rgba(255, 102, 0, 0.2)", // Light orange fill
                        borderColor: "#FF6600", // Orange line
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                    },
                    {
                        label: "Utilization (%)",
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
                        min: 0,
                        max: 100,
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

    // Fetch Room Data
    const fetchRoomData = async () => {
        return dummyRoomData;
    };

    // Fetch Analytics Data
    const fetchAnalyticsData = async () => {
        return dummyAnalyticsData;
    };

    // Update Chart
    const updateChart = async (chart) => {
        const [analyticsData, roomMapping] = await Promise.all([
            fetchAnalyticsData(),
            fetchRoomData(),
        ]);

        if (!analyticsData || analyticsData.length === 0) {
            console.warn("No analytics data available.");
            return;
        }

        const rooms = [];
        const bookings = [];
        const utilizationRates = [];

        analyticsData.forEach((entry) => {
            const roomName = roomMapping[entry.room] || `Room ${entry.room}`;
            rooms.push(roomName); // Use actual room name
            bookings.push(entry.total_bookings);
            utilizationRates.push(entry.utilization_rate);
        });

        chart.data.labels = rooms;
        chart.data.datasets[0].data = bookings;
        chart.data.datasets[1].data = utilizationRates;
        chart.update();
    };

    // Update Metrics
    const updateMetrics = async () => {
        const [analyticsData, roomMapping] = await Promise.all([
            fetchAnalyticsData(),
            fetchRoomData(),
        ]);

        if (!analyticsData || analyticsData.length === 0) {
            console.warn("No analytics data available.");
            return;
        }

        const totalBookings = analyticsData.reduce((sum, entry) => sum + entry.total_bookings, 0);
        const mostBookedRoom = analyticsData.reduce(
            (max, entry) => (entry.total_bookings > max.total_bookings ? entry : max),
            analyticsData[0]
        );

        const activeUsers = analyticsData.filter(
            (entry) =>
                entry.total_checkins > 0 && entry.utilization_rate > 0
        ).length;

        const mostBookedRoomName = roomMapping[mostBookedRoom.room] || `Room ${mostBookedRoom.room}`;

        document.getElementById("total-bookings").textContent = totalBookings;
        document.getElementById("most-booked-room").textContent = mostBookedRoomName;
        document.getElementById("active-users").textContent = activeUsers;
    };

    // Handle Export CSV
    const exportCsvButton = document.querySelector(".export-button");
    exportCsvButton.addEventListener("click", () => {
        // Simulate CSV export
        alert("Exporting CSV...");
    });

    // Initialize and Update
    const chart = initializeChart();
    updateChart(chart);
    updateMetrics();
});