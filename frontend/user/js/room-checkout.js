document.addEventListener("DOMContentLoaded", () => {
  // Load Header and Sidebar
  const loadHeaderAndSidebar = async () => {
    try {
      // Load header dynamically
      const headerResponse = await fetch("../shared/header.html");
      if (!headerResponse.ok) {
        throw new Error(`Failed to load header: ${headerResponse.statusText}`);
      }
      const headerHTML = await headerResponse.text();
      document.getElementById("header-container").innerHTML = headerHTML;

      // Load sidebar dynamically
      const sidebarResponse = await fetch("../shared/sidebar.html");
      if (!sidebarResponse.ok) {
        throw new Error(`Failed to load sidebar: ${sidebarResponse.statusText}`);
      }
      const sidebarHTML = await sidebarResponse.text();
      document.getElementById("sidebar-container").innerHTML = sidebarHTML;

      // Highlight the active sidebar link
      highlightActiveSidebarLink();
    } catch (error) {
      console.error("Error loading header or sidebar:", error);
    }
  };

  // Highlight Active Sidebar Link
  const highlightActiveSidebarLink = () => {
    const currentPage = window.location.pathname.split("/").pop(); // Get current page name
    const navLinks = document.querySelectorAll(".nav-links a");

    navLinks.forEach((link) => {
      const linkHref = link.getAttribute("href");
      const parentLi = link.parentElement;

      if (currentPage === linkHref) {
        parentLi.classList.add("active"); // Highlight the active link
      } else {
        parentLi.classList.remove("active"); // Remove highlight from other links
      }
    });
  };

  // Extract room ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get("room_id");

  if (!roomId) {
    alert("Room ID not provided!");
    window.location.href = "room-availability.html";
  }

  // Fetch room details using the room ID
  const fetchRoomDetails = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/rooms/${roomId}/`);
      if (!response.ok) {
        throw new Error(`Failed to fetch room details: ${response.statusText}`);
      }
      const roomDetails = await response.json();
      renderRoomDetails(roomDetails);
    } catch (error) {
      console.error(error);
      alert("Failed to load room details!");
      window.location.href = "room-availability.html";
    }
  };

  // Render room details dynamically
  const renderRoomDetails = (room) => {
    document.querySelector(".room-name").textContent = room.name;
    document.querySelector(".room-description p").textContent =
      room.description || "No description available.";
    document.querySelector(".room-image").src =
      room.image || "../assets/default-room.jpg";

    // Dynamically populate bookings (if provided)
    populateBookings(room.bookings || []);
  };

  // Populate the booking list dynamically
  const populateBookings = (bookings) => {
    const bookingsList = document.getElementById("bookings-list");
    bookingsList.innerHTML = ""; // Clear existing items
    bookings.forEach((booking) => {
      const bookingItem = document.createElement("div");
      bookingItem.className = "booking-item";
      bookingItem.innerHTML = `
        <strong>${booking.bookedBy || "Unknown"} - ${booking.purpose || "No purpose provided"}</strong>
        <br />
        From ${booking.startTime} to ${booking.endTime}
      `;
      bookingsList.appendChild(bookingItem);
    });
  };

  // Form submission logic for booking
  const bookingForm = document.getElementById("booking-form");
  const fromTimeSelect = document.getElementById("from-time");
  const toTimeSelect = document.getElementById("to-time");
  const errorMessage = document.getElementById("error-message");

  // Generate time slots
  const timeSlots = [
    "8:30 AM",
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
    "5:00 PM",
    "5:30 PM",
    "6:00 PM",
  ];

  timeSlots.forEach((time) => {
    const fromOption = document.createElement("option");
    fromOption.value = time;
    fromOption.textContent = time;
    fromTimeSelect.appendChild(fromOption);

    const toOption = document.createElement("option");
    toOption.value = time;
    toOption.textContent = time;
    toTimeSelect.appendChild(toOption);
  });

  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const bookingDate = document.getElementById("booking-date").value;
    const fromTime = fromTimeSelect.value;
    const toTime = toTimeSelect.value;
    const purpose = document.getElementById("purpose").value;

    if (!fromTime || !toTime || !bookingDate || !purpose) {
      errorMessage.textContent = "Please fill in all fields.";
      return;
    }

    const bookingData = {
      room_id: roomId,
      date: bookingDate,
      start_time: fromTime,
      end_time: toTime,
      purpose: purpose,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/bookings/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error("Failed to book room. Check time slot availability.");
      }

      alert("Room booked successfully!");
      window.location.reload();
    } catch (error) {
      errorMessage.textContent = error.message;
    }
  });

  // Display today's date
  const currentDateElement = document.getElementById("current-date");
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  currentDateElement.textContent = currentDate;

  // Initialize the page
  const initialize = async () => {
    await loadHeaderAndSidebar(); // Load header and sidebar
    await fetchRoomDetails(); // Fetch room details
  };

  initialize();
});
