document.addEventListener("DOMContentLoaded", async () => {
    const BASE_URL = "http://127.0.0.1:8000";
    const ANALYTICS_URL = `${BASE_URL}/analytics/transformed-analytics/`;
    const ROOMS_URL = `${BASE_URL}/api/rooms/`;
    const ACTIVE_USERS_URL = `${BASE_URL}/api/bookings/active-users/`;

    // === Fetch Transformed Analytics Data ===
    const fetchAnalyticsData = async () => {
        try {
            const response = await fetch(ANALYTICS_URL);
            if (!response.ok) throw new Error("Failed to fetch analytics data");
            return await response.json();
        } catch (error) {
            console.error("Error fetching analytics data:", error);
            return {};
        }
    };

    // === Fetch Active Users Data ===
    const fetchActiveUsers = async () => {
        try {
            const response = await fetch(ACTIVE_USERS_URL);
            if (!response.ok) {
                throw new Error("Failed to fetch active users data");
            }
            const data = await response.json();
            return data.active_users;
        } catch (error) {
            console.error("Error fetching active users:", error);
            return 0;
        }
    };

    // === Initialize Chart ===
    const initializeChart = () => {
        const ctx = document.getElementById("weekly-trends-chart").getContext("2d");
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
                            color: "#FFFFFF",
                        },
                    },
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: "Values",
                            color: "#FFFFFF",
                        },
                        ticks: {
                            color: "#FFFFFF",
                        },
                        grid: {
                            color: "rgba(255, 255, 255, 0.1)",
                        },
                    },
                    x: {
                        title: {
                            display: true,
                            text: "Dates",
                            color: "#FFFFFF",
                        },
                        ticks: {
                            color: "#FFFFFF",
                        },
                        grid: {
                            color: "rgba(255, 255, 255, 0.1)",
                        },
                    },
                },
            },
        });
    };

    // === Get Random Color ===
    const getRandomColor = () => {
        const letters = "0123456789ABCDEF";
        let color = "#";
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    // === Update Chart ===
    const updateChart = async (chart) => {
        const data = await fetchAnalyticsData();
        if (!data || !data.dates || !data.data) {
            console.warn("No analytics data available.");
            return;
        }

        const labels = data.dates;
        const datasets = Object.keys(data.data).map((room) => ({
            label: room,
            data: data.data[room].bookings,
            borderColor: getRandomColor(),
            fill: false,
            tension: 0.4,
        }));

        chart.data.labels = labels;
        chart.data.datasets = datasets;
        chart.update();
    };

    // === Update Metrics ===
    const updateMetrics = async () => {
        const [analyticsData, activeUsers] = await Promise.all([
            fetchAnalyticsData(),
            fetchActiveUsers(),
        ]);

        if (!analyticsData || !analyticsData.data) {
            console.warn("No analytics data available.");
            return;
        }

        let totalBookings = 0;
        let mostBookedRoom = { name: "", bookings: 0 };

        Object.entries(analyticsData.data).forEach(([roomName, roomData]) => {
            const roomBookings = roomData.bookings.reduce((sum, count) => sum + count, 0);
            totalBookings += roomBookings;

            if (roomBookings > mostBookedRoom.bookings) {
                mostBookedRoom = { name: roomName, bookings: roomBookings };
            }
        });

        document.getElementById("total-bookings").textContent = totalBookings;
        document.getElementById("most-booked-room").textContent = mostBookedRoom.name || "N/A";
        document.getElementById("active-users").textContent = activeUsers;
    };

    // === Handle Export CSV ===
    const handleExportCsv = () => {
        window.location.href = `${BASE_URL}/analytics/export_csv/`;
    };

    // === Attach Export Button Event ===
    const exportButton = document.querySelector(".export-button");
    if (exportButton) {
        exportButton.addEventListener("click", handleExportCsv);
    }

    // === Initialize and Update Chart ===
    const chart = initializeChart();
    await updateChart(chart);
    await updateMetrics();
});
