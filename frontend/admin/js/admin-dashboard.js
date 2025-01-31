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

  // Fetch Analytics Data
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
              color: "#000",
            },
          },
        },
        scales: {
          y: {
            title: {
              display: true,
              text: "Values",
              color: "#000",
            },
            ticks: {
              color: "#000",
            },
            beginAtZero: true,
          },
          x: {
            title: {
              display: true,
              text: "Dates",
              color: "#000",
            },
            ticks: {
              color: "#000",
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

  const updateBookingSchedule = async () => {
    const bookingListContainer = document.querySelector(".booking-list");
    try {
      const response = await fetch(ADMIN_BOOKINGS_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.status}`);
      }
      const bookings = await response.json();

      if (bookings.length === 0) {
        bookingListContainer.innerHTML = "<p>No bookings available.</p>";
        return;
      }

      // Display recent bookings
      const recentBookings = bookings.slice(0, 5);

      bookingListContainer.innerHTML = recentBookings
        .map((booking) => {
          const roomName = booking.room_name || "Room N/A";
          const status = booking.status || "Unknown";

          const startTime = booking.start_time ? new Date(booking.start_time) : null;
          const endTime = booking.end_time ? new Date(booking.end_time) : null;

          const startTimeStr = startTime
            ? startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Invalid Date";
          const endTimeStr = endTime
            ? endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Invalid Date";

          return `
            <div class="booking-item">
              <p><strong>${roomName}</strong> - ${status}</p>
              <p>${startTimeStr} - ${endTimeStr}</p>
            </div>
          `;
        })
        .join("");

      bookingListContainer.innerHTML += `
        <div class="view-all-link">
          <a href="http://127.0.0.1:5500/frontend/admin/admin-bookings.html" class="view-all-btn">View All Bookings</a>
        </div>
      `;
    } catch (error) {
      console.error("Error updating booking schedule:", error);
      bookingListContainer.innerHTML = `
        <p>Failed to load booking schedule.</p>
        <div class="view-all-link">
          <a href="http://127.0.0.1:5500/frontend/admin/admin-bookings.html" class="view-all-btn">View All Bookings</a>
        </div>
      `;
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

  // Update Newly Added Rooms Section
  const updateNewlyAddedRooms = async () => {
    const newlyAddedRoomsContainer = document.querySelector("#new-rooms-list");
    try {
      const response = await fetch(`${ROOMS_API_URL}?limit=${NEW_ROOMS_LIMIT}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch room data: ${response.status}`);
      }
      const rooms = await response.json();

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
    await updateChart(chart);

    // Update Newly Added Rooms Section
    await updateNewlyAddedRooms();
  };

  // Run Initialization
  await initializeDashboard();
});
