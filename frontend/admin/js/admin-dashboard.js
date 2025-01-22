document.addEventListener("DOMContentLoaded", async () => {
  // Dummy data for testing
  const dummyRooms = [
    { id: 1, name: "Room A", location: "Floor 1", capacity: 10, image: "https://via.placeholder.com/80" },
    { id: 2, name: "Room B", location: "Floor 2", capacity: 20, image: "https://via.placeholder.com/80" },
    { id: 3, name: "Room C", location: "Floor 3", capacity: 15, image: "https://via.placeholder.com/80" },
  ];

  const dummyAnalytics = [
    { room: 1, total_bookings: 5, utilization_rate: 80 },
    { room: 2, total_bookings: 8, utilization_rate: 60 },
    { room: 3, total_bookings: 3, utilization_rate: 50 },
  ];

  const dummyBookings = [
    { id: 1, roomName: "Room A", status: "Confirmed", startTime: "2025-01-21T10:00:00", endTime: "2025-01-21T12:00:00", bookedBy: "John Doe", userRole: "Student" },
    { id: 2, roomName: "Room B", status: "Pending", startTime: "2025-01-21T14:00:00", endTime: "2025-01-21T16:00:00", bookedBy: "Jane Smith", userRole: "Professor" },
  ];

  const dummyPenalties = { count: 3 };

  // Mock fetch functions
  const fetchRoomData = async () => {
    return dummyRooms.reduce((acc, room) => ({ ...acc, [room.id]: room.name }), {});
  };

  const fetchAnalyticsData = async () => {
    return dummyAnalytics;
  };

  // Initialize the Chart
  const initializeChart = () => {
    const ctx = document.getElementById("usage-trend-chart").getContext("2d");
    return new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          { label: "Bookings", data: [], backgroundColor: "rgba(255, 102, 0, 0.2)", borderColor: "#FF6600", borderWidth: 2, fill: true },
          { label: "Check-ins", data: [], backgroundColor: "rgba(93, 164, 220, 0.2)", borderColor: "#5DA4DC", borderWidth: 2, fill: true },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true },
        },
      },
    });
  };

  const updateChart = async (chart, roomMapping) => {
    const rooms = dummyAnalytics.map((entry) => roomMapping[entry.room] || `Room ${entry.room}`);
    const bookings = dummyAnalytics.map((entry) => entry.total_bookings);
    const utilizationRates = dummyAnalytics.map((entry) => entry.utilization_rate);
    chart.data.labels = rooms;
    chart.data.datasets[0].data = bookings;
    chart.data.datasets[1].data = utilizationRates;
    chart.update();
  };

  const updateBookingSchedule = async () => {
    const bookingListContainer = document.querySelector(".booking-list");
    bookingListContainer.innerHTML = dummyBookings.map(
      (booking) => `
        <div class="booking-item">
          <p><strong>${booking.roomName}</strong> - ${booking.status}</p>
          <p>From ${new Date(booking.startTime).toLocaleTimeString()} to ${new Date(booking.endTime).toLocaleTimeString()}</p>
          <p>By ${booking.bookedBy} (${booking.userRole})</p>
        </div>`
    ).join("");
  };

  const updatePenaltiesToday = async () => {
    document.querySelector(".penalty-count").textContent = dummyPenalties.count;
  };

  const updateNewlyAddedRooms = async () => {
    const newlyAddedRoomsContainer = document.querySelector("#new-rooms-list");
    newlyAddedRoomsContainer.innerHTML = dummyRooms.map(
      (room) => `
        <div class="room-item">
          <img src="${room.image}" alt="${room.name}" class="room-image" />
          <div class="room-details">
            <p><strong>${room.name}</strong></p>
            <p>Location: ${room.location}</p>
            <p>Capacity: ${room.capacity}</p>
          </div>
        </div>`
    ).join("");
  };

  const initializeDashboard = async () => {
    const roomMapping = await fetchRoomData();
    await updateBookingSchedule();
    await updatePenaltiesToday();
    const chart = initializeChart();
    await updateChart(chart, roomMapping);
    await updateNewlyAddedRooms();
  };

  await initializeDashboard();
});
