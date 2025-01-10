document.addEventListener("DOMContentLoaded", () => {
    // Initialize the Traffic Chart
    const initializeTrafficChart = (trafficData, labels) => {
        const ctx = document.getElementById("traffic-chart").getContext("2d");

        return new Chart(ctx, {
            type: "line",
            data: {
                labels: labels || ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"], // Fallback example labels
                datasets: [
                    {
                        label: "Traffic",
                        data: trafficData || [4000, 6000, 12000, 8000, 15000, 10000, 18000, 20000], // Fallback example data
                        backgroundColor: "rgba(255, 102, 0, 0.2)", // Light orange fill
                        borderColor: "#FF6600", // Orange line
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
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
                            color: "#FFFFFF", // White labels
                        },
                    },
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: "Traffic (in thousands)",
                            color: "#FFFFFF", // White labels
                        },
                        ticks: {
                            color: "#FFFFFF", // White ticks
                        },
                        beginAtZero: true,
                    },
                    x: {
                        title: {
                            display: true,
                            text: "Months",
                            color: "#FFFFFF", // White labels
                        },
                        ticks: {
                            color: "#FFFFFF", // White ticks
                        },
                    },
                },
            },
        });
    };

    // Fetch Data for Widgets and Chart
    const fetchDashboardData = async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/dashboard-stats/"); // Replace with your actual API endpoint
            if (!response.ok) {
                throw new Error(`Failed to fetch dashboard data: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            return null;
        }
    };

    // Update Widgets
    const updateWidgets = (data) => {
        if (!data) {
            console.warn("No data available to update widgets.");
            return;
        }

        // Update total bookings widget
        const totalBookingsElement = document.querySelector(".widget.bookings-card");
        totalBookingsElement.innerHTML = `
            <h3>Want to get a successful meeting?</h3>
            <p>${data.totalBookingsDescription || "Just try to experience the green room with more comfort and accessibility"}</p>
            <button class="primary-button">Book Now</button>
        `;

        // Update feedback analysis widget
        const feedbackAnalysisElement = document.querySelector(".widget.feedback-card");
        feedbackAnalysisElement.innerHTML = `
            <h3>Feedback Analysis</h3>
            <p>${data.feedbackDescription || "Share your thoughts on the overall experience with this system."}</p>
            <button class="primary-button">Feedback</button>
        `;

        // Update most popular rooms widget
        const mostPopularRoomsElement = document.querySelector(".widget.popular-rooms");
        mostPopularRoomsElement.innerHTML = `
            <h3>Most Popular Rooms</h3>
            <div class="rooms-list">
                ${data.mostPopularRooms
                    .map(
                        (room) => `
                    <div class="room-item">
                        <img src="${room.image || "../assets/images/default-room.jpg"}" alt="${room.name}" />
                        <button class="primary-button">Check Availability</button>
                    </div>
                `
                    )
                    .join("")}
            </div>
        `;
    };

    // Initialize and Update Dashboard
    const updateDashboard = async () => {
        const data = await fetchDashboardData();

        if (!data) {
            console.error("Failed to fetch data for the dashboard.");
            return;
        }

        // Initialize Traffic Chart with dynamic data
        const trafficChart = initializeTrafficChart(data.trafficData, data.trafficLabels);

        // Update Widgets with dynamic data
        updateWidgets(data);
    };

    // Run the dashboard update
    updateDashboard();
});
