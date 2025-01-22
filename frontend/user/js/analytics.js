document.addEventListener("DOMContentLoaded", () => {
    // === Load Sidebar ===
    const loadSidebar = async () => {
        try {
            const sidebarContainer = document.getElementById("sidebar-container");
            const response = await fetch("../shared/navbar.html"); // Path to sidebar HTML
            if (!response.ok) {
                throw new Error(`Failed to load sidebar: ${response.status}`);
            }
            const sidebarHTML = await response.text();
            sidebarContainer.innerHTML = sidebarHTML;

            // Highlight Active Sidebar Link
            const currentPage = window.location.pathname.split("/").pop(); // Get current page name
            const navLinks = document.querySelectorAll(".nav-links a");

            navLinks.forEach((link) => {
                const linkHref = link.getAttribute("href");
                const parentLi = link.parentElement;

                // Add 'active' class if the link matches the current page
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
            const response = await fetch("../shared/header.html"); // Path to header HTML
            if (!response.ok) {
                throw new Error(`Failed to load header: ${response.status}`);
            }
            const headerHTML = await response.text();
            headerContainer.innerHTML = headerHTML;

            // Example: Add dynamic event listeners to header elements
            const searchBox = document.querySelector(".search-box");
            if (searchBox) {
                searchBox.addEventListener("input", (event) => {
                    console.log(`Searching for: ${event.target.value}`);
                });
            }
        } catch (error) {
            console.error("Error loading header:", error);
        }
    };

    // === Load Sidebar and Header ===
    loadSidebar();
    loadHeader();
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
    

    // === Fetch Room Data ===
    const fetchRoomData = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/rooms/");
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

    // === Fetch Analytics Data ===
    const fetchAnalyticsData = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/analytics/");
            if (!response.ok) {
                throw new Error(`Failed to fetch analytics data: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching analytics data:", error);
            return [];
        }
    };

    // === Update Chart ===
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

    // === Update Metrics ===
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
            (entry) => entry.total_checkins > 0 && entry.utilization_rate > 0
        ).length;

        const mostBookedRoomName = roomMapping[mostBookedRoom.room] || `Room ${mostBookedRoom.room}`;

        document.getElementById("total-bookings").textContent = totalBookings;
        document.getElementById("most-booked-room").textContent = mostBookedRoomName;
        document.getElementById("active-users").textContent = activeUsers;
    };

    // === Initialize and Update ===
    const chart = initializeChart();
    updateChart(chart);
    updateMetrics();
});
