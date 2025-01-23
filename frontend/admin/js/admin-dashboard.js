document.addEventListener("DOMContentLoaded", async () => {
  const API_BASE_URL = "http://127.0.0.1:8000/analytics/";
  const ROOMS_API_URL = "http://127.0.0.1:8000/api/rooms/";
  const ADMIN_BOOKINGS_URL = "/api/admin/bookings/";
  const ADMIN_PENALTIES_URL = "/api/admin/penalties/";
  const NEW_ROOMS_LIMIT = 5; // Limit for newly added rooms to display

  
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

  // Initialize the Chart
  const initializeChart = () => {
    const ctx = document.getElementById("usage-trend-chart").getContext("2d");
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
                    label: "Check-ins",
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

  // Update Booking Schedule
  const updateBookingSchedule = async () => {
    const bookingListContainer = document.querySelector(".booking-list");
    try {
      const bookings = await fetch(ADMIN_BOOKINGS_URL).then((res) => res.json());
      const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

      const todayBookings = bookings.filter((booking) => booking.startTime.startsWith(today));

      if (todayBookings.length === 0) {
        bookingListContainer.innerHTML = "<p>No bookings scheduled for today.</p>";
        return;
      }

      bookingListContainer.innerHTML = todayBookings
        .map(
          (booking) => `
            <div class="booking-item">
              <p><strong>${booking.roomName}</strong> - ${booking.status}</p>
              <p>From ${new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
              to ${new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <p>By ${booking.bookedBy} (${booking.userRole})</p>
              <button class="view-booking-btn" onclick="location.href='/admin/bookings/${booking.id}'">View Booking Info</button>
            </div>
          `
        )
        .join("");
    } catch (error) {
      console.error("Error updating booking schedule:", error);
      bookingListContainer.innerHTML = "<p>Failed to load booking schedule.</p>";
    }
  };

  // Update Number of Penalties Today
  const updatePenaltiesToday = async () => {
    const penaltiesContainer = document.querySelector(".penalty-count");
    try {
      const penaltiesData = await fetch(ADMIN_PENALTIES_URL).then((res) => res.json());
      penaltiesContainer.textContent = penaltiesData.count || 0;
    } catch (error) {
      console.error("Error updating penalties today:", error);
      penaltiesContainer.textContent = "N/A";
    }
  };

  // Fetch Newly Added Rooms
  const fetchNewlyAddedRooms = async () => {
    try {
      const response = await fetch(`${ROOMS_API_URL}?limit=${NEW_ROOMS_LIMIT}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch room data: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching newly added rooms:", error);
      return [];
    }
  };

  // Update Newly Added Rooms Section
  const updateNewlyAddedRooms = async () => {
    const newlyAddedRoomsContainer = document.querySelector("#new-rooms-list");
    try {
      const rooms = await fetchNewlyAddedRooms();

      if (!rooms.length) {
        newlyAddedRoomsContainer.innerHTML = "<p>No newly added rooms available.</p>";
        return;
      }

      const roomHTML = rooms
        .map(
          (room) => `
          <div class="room-item">
            <img src="${room.image || '/static/images/default-room.jpg'}" alt="${room.name}" class="room-image" />
            <div class="room-details">
              <p><strong>${room.name}</strong></p>
              <p>Location: ${room.location}</p>
              <p>Capacity: ${room.capacity}</p>
            </div>
          </div>
        `
        )
        .join("");

      newlyAddedRoomsContainer.innerHTML = roomHTML;
    } catch (error) {
      newlyAddedRoomsContainer.innerHTML = "<p>Error loading newly added rooms.</p>";
    }
  };

  // Initialize Admin Dashboard
  const initializeDashboard = async () => {
    const roomMapping = await fetchRoomData();

    // Update Booking Schedule and Penalties
    await updateBookingSchedule();
    await updatePenaltiesToday();

    // Initialize and Update the Traffic Chart
    const chart = initializeChart();
    await updateChart(chart, roomMapping);

    // Update Newly Added Rooms Section
    await updateNewlyAddedRooms();
  };

  // Run Initialization
  await initializeDashboard();
});
