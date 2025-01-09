document.addEventListener("DOMContentLoaded", async () => {
  try {
    // API Endpoints
    const endpoints = {
      bookingSchedule: "/api/admin/bookings", // Replace with actual endpoint for bookings
      newlyAddedRooms: "/api/admin/rooms", // Replace with actual endpoint for newly added rooms
      usageTrend: "/api/admin/usage-trend", // Replace with actual endpoint for usage trends
      penaltiesToday: "/api/admin/penalties", // Replace with actual endpoint for penalties
    };

    // Fetch data from an endpoint
    const fetchData = async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch data from ${url}: ${response.statusText}`);
      }
      return await response.json();
    };

    // Update Booking Schedule
    const updateBookingSchedule = async () => {
      const bookingListContainer = document.querySelector(".booking-list");
      try {
        const bookings = await fetchData(endpoints.bookingSchedule);
        bookingListContainer.innerHTML = bookings
          .map(
            (booking) => `
          <div class="booking-item">
            <p><strong>${booking.roomName}</strong> - ${booking.status}</p>
            <p>From ${booking.startTime} to ${booking.endTime}</p>
            <p>By ${booking.bookedBy} (${booking.userRole}) - ${booking.userId}</p>
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

    // Update Newly Added Rooms
    const updateNewlyAddedRooms = async () => {
      const newlyAddedRoomsContainer = document.querySelector(".newly-added-rooms");
      try {
        const rooms = await fetchData(endpoints.newlyAddedRooms);
        newlyAddedRoomsContainer.innerHTML = `
          <h2>Newly Added Rooms</h2>
          ${rooms
            .map(
              (room) => `
            <p><strong>${room.name}</strong></p>
            <p>Located on ${room.location}</p>
          `
            )
            .join("")}
        `;
      } catch (error) {
        console.error("Error updating newly added rooms:", error);
        newlyAddedRoomsContainer.innerHTML = "<p>Failed to load newly added rooms.</p>";
      }
    };

    // Update Current Usage Trend (Chart.js)
    const updateUsageTrend = async () => {
      const ctx = document.getElementById("usage-trend-chart").getContext("2d");
      try {
        const usageData = await fetchData(endpoints.usageTrend);
        new Chart(ctx, {
          type: "line",
          data: {
            labels: usageData.labels, // Example: ["Sep", "Oct", "Nov", "Dec", ...]
            datasets: [
              {
                label: "Usage",
                data: usageData.data, // Example: [4000, 6000, 12000, ...]
                backgroundColor: "rgba(255, 102, 0, 0.2)",
                borderColor: "#FF6600",
                borderWidth: 2,
                tension: 0.4,
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
          },
        });
      } catch (error) {
        console.error("Error updating usage trend chart:", error);
      }
    };

    // Update Number of Penalties Today
    const updatePenaltiesToday = async () => {
      const penaltiesContainer = document.querySelector(".penalty-count");
      try {
        const penaltiesData = await fetchData(endpoints.penaltiesToday);
        penaltiesContainer.textContent = penaltiesData.count || 0;
      } catch (error) {
        console.error("Error updating penalties today:", error);
        penaltiesContainer.textContent = "N/A";
      }
    };

    // Initialize Dashboard
    await Promise.all([
      updateBookingSchedule(),
      updateNewlyAddedRooms(),
      updateUsageTrend(),
      updatePenaltiesToday(),
    ]);
  } catch (error) {
    console.error("Error initializing admin dashboard:", error);
  }
});
