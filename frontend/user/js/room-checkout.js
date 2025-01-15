document.addEventListener("DOMContentLoaded", () => {
  const bookingForm = document.getElementById("booking-form");
  const purposeInput = document.getElementById("purpose");
  const participantsInput = document.getElementById("participants");
  const participantsDisplay = document.querySelector(".participants-range span");
  const degreeSelect = document.getElementById("degree");
  const fromTimeSelect = document.getElementById("from-time");
  const toTimeSelect = document.getElementById("to-time");
  const bookingDateInput = document.getElementById("booking-date");
  const termsCheckbox = document.getElementById("terms");
  const errorMessage = document.getElementById("error-message");

  let userRole = ""; // The user's role (e.g., "student" or "staff")

  if (
    !bookingForm ||
    !purposeInput ||
    !participantsInput ||
    !participantsDisplay ||
    !degreeSelect ||
    !fromTimeSelect ||
    !toTimeSelect ||
    !bookingDateInput ||
    !termsCheckbox ||
    !errorMessage
  ) {
    console.error("One or more form elements are missing.");
    return;
  }

  // Load Header and Sidebar
  const loadHeaderAndSidebar = async () => {
    try {
      const headerResponse = await fetch("../shared/header.html");
      if (!headerResponse.ok) {
        throw new Error(`Failed to load header: ${headerResponse.statusText}`);
      }
      document.getElementById("header-container").innerHTML = await headerResponse.text();

      const sidebarResponse = await fetch("../shared/sidebar.html");
      if (!sidebarResponse.ok) {
        throw new Error(`Failed to load sidebar: ${sidebarResponse.statusText}`);
      }
      document.getElementById("sidebar-container").innerHTML = await sidebarResponse.text();

      console.log("Header and Sidebar loaded successfully.");
    } catch (error) {
      console.error("Error loading header or sidebar:", error);
    }
  };

  // Get User Role
  const fetchUserRole = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/user/"); // Replace with your API endpoint
      if (!response.ok) {
        throw new Error("Failed to fetch user role.");
      }
      const userData = await response.json();
      userRole = userData.role; // Assume the role is returned as 'student' or 'staff'
      console.log(`User Role: ${userRole}`);
      configureBookingDate(userRole);
    } catch (error) {
      console.error("Error fetching user role:", error);
      userRole = "student"; // Default to 'student' if the role cannot be determined
      configureBookingDate(userRole);
    }
  };

  // Configure Booking Date Based on Role
  const configureBookingDate = (role) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const formatDate = (date) => date.toISOString().split("T")[0]; // Format as YYYY-MM-DD

    if (role === "student") {
      bookingDateInput.value = formatDate(today);
      bookingDateInput.min = formatDate(today);
      bookingDateInput.max = formatDate(today);
      bookingDateInput.disabled = true; // Students can only book for today
    } else if (role === "staff") {
      bookingDateInput.value = formatDate(today);
      bookingDateInput.min = formatDate(today);
      bookingDateInput.max = formatDate(tomorrow);
      bookingDateInput.disabled = false; // Staff can select today or tomorrow
    } else {
      console.error("Invalid user role. Defaulting to student configuration.");
      configureBookingDate("student");
    }
  };

  // Validate Booking Date
  const validateBookingDate = (bookingDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const selectedDate = new Date(bookingDate);

    if (userRole === "student") {
      if (selectedDate.getTime() !== today.getTime()) {
        errorMessage.textContent = "Students can only book for today.";
        return false;
      }
    } else if (userRole === "staff") {
      if (
        selectedDate.getTime() !== today.getTime() &&
        selectedDate.getTime() !== tomorrow.getTime()
      ) {
        errorMessage.textContent = "Staff can only book for today or tomorrow.";
        return false;
      }
    } else {
      errorMessage.textContent = "Invalid user role. Please contact support.";
      return false;
    }

    return true;
  };

  // Generate Time Slots
  const generateTimeSlots = () => {
    const timeSlots = [
      "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM",
      "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM",
      "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM",
      "5:30 PM", "6:00 PM",
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
  };

  // Event Listener for Participants Range
  participantsInput.addEventListener("input", (event) => {
    participantsDisplay.textContent = event.target.value;
  });

  // Fetch Room Details
  const fetchRoomDetails = async (roomId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/rooms/${roomId}/`);
      if (!response.ok) {
        throw new Error(`Failed to fetch room details: ${response.statusText}`);
      }
      const roomDetails = await response.json();
      renderRoomDetails(roomDetails);
    } catch (error) {
      console.error("Error fetching room details:", error);
      alert("Failed to load room details!");
      window.location.href = "room-availability.html";
    }
  };

  // Render Room Details
  const renderRoomDetails = (room) => {
    const roomNameElement = document.querySelector(".room-name");
    const roomDescriptionElement = document.querySelector(".room-description-text");
    const roomImageElement = document.querySelector(".room-image");

    if (roomNameElement) roomNameElement.textContent = room.name || "Room Name Not Available";
    if (roomDescriptionElement)
      roomDescriptionElement.textContent = room.description || "No description available.";
    if (roomImageElement) roomImageElement.src = room.image || "../assets/default-room.jpg";
    populateBookings(room.bookings || []);
  };

  // Populate Bookings
  const populateBookings = (bookings) => {
    const bookingsList = document.getElementById("bookings-list");
    if (!bookingsList) return;
    bookingsList.innerHTML = "";
    bookings.forEach((booking) => {
      const bookingItem = document.createElement("div");
      bookingItem.className = "booking-item";
      bookingItem.innerHTML = `
        <strong>${booking.bookedBy || "Unknown"} - ${booking.purpose || "No purpose provided"}</strong>
        <br />
        From ${booking.startTime || "N/A"} to ${booking.endTime || "N/A"}
      `;
      bookingsList.appendChild(bookingItem);
    });
  };

  // Form Submission
  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const bookingDate = bookingDateInput.value;
    const fromTime = fromTimeSelect.value;
    const toTime = toTimeSelect.value;
    const purpose = purposeInput.value.trim();
    const participants = parseInt(participantsInput.value, 10);
    const degreeMajor = degreeSelect.value;
    const termsAgreed = termsCheckbox.checked;

    // Validate Fields
    if (!bookingDate) {
      errorMessage.textContent = "Please select a booking date.";
      return;
    }
    if (!validateBookingDate(bookingDate)) return;
    if (!fromTime || !toTime) {
      errorMessage.textContent = "Please select both start and end times.";
      return;
    }
    if (!purpose) {
      errorMessage.textContent = "Please provide a purpose for the booking.";
      return;
    }
    if (isNaN(participants) || participants < 0 || participants > 6) {
      errorMessage.textContent = "Please select a valid number of participants (0-6).";
      return;
    }
    if (!degreeMajor) {
      errorMessage.textContent = "Please select a degree major.";
      return;
    }
    if (!termsAgreed) {
      errorMessage.textContent = "You must agree to the terms and conditions.";
      return;
    }

    const bookingData = {
      date: bookingDate,
      start_time: fromTime,
      end_time: toTime,
      purpose,
      participants,
      degree_major: degreeMajor,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/bookings/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(errorDetails.message || "Failed to book room. Check time slot availability.");
      }

      alert("Room booked successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error booking room:", error);
      errorMessage.textContent = error.message;
    }
  });

  // Initialize the Page
  const initialize = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get("room_id");

    if (!roomId) {
      alert("Room ID not provided!");
      window.location.href = "room-availability.html";
      return;
    }

    await fetchUserRole(); // Fetch the user's role
    await loadHeaderAndSidebar();
    generateTimeSlots();
    await fetchRoomDetails(roomId);
  };

  initialize();
});
