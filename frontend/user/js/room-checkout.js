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

  let userRole = "student"; // Default to 'student'; dynamically set after fetching role
  let roomId = null;

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
      const sidebarResponse = await fetch("../shared/sidebar.html");

      if (!headerResponse.ok || !sidebarResponse.ok) {
        throw new Error("Failed to load header or sidebar.");
      }

      document.getElementById("header-container").innerHTML = await headerResponse.text();
      document.getElementById("sidebar-container").innerHTML = await sidebarResponse.text();
    } catch (error) {
      console.error("Error loading header or sidebar:", error);
    }
  };

  // Configure Booking Date
  const configureBookingDate = async () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const formatDate = (date) => date.toISOString().split("T")[0];

    try {
      const email = localStorage.getItem("userEmail");
      if (!email) {
        throw new Error("User email not found in localStorage.");
      }

      const response = await fetch(`http://127.0.0.1:8000/api/users/profile/?email=${encodeURIComponent(email)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user profile.");
      }

      const user = await response.json();
      userRole = user.role;

      if (userRole === "student") {
        bookingDateInput.value = formatDate(today);
        bookingDateInput.min = formatDate(today);
        bookingDateInput.max = formatDate(today);
        bookingDateInput.disabled = true;
      } else if (userRole === "staff") {
        bookingDateInput.value = formatDate(today);
        bookingDateInput.min = formatDate(today);
        bookingDateInput.max = formatDate(tomorrow);
        bookingDateInput.disabled = false;
      } else {
        console.error("Invalid user role.");
        bookingDateInput.disabled = true;
      }
    } catch (error) {
      console.error("Error configuring booking date:", error);
    }
  };

  // Validate Booking Date
  const validateBookingDate = (selectedDate) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const selected = new Date(selectedDate);

    if (userRole === "student" && selected.toDateString() !== today.toDateString()) {
      return "Students can only book for today.";
    }

    if (userRole === "staff" && selected > tomorrow) {
      return "Staff can only book for today or tomorrow.";
    }

    return null; // Date is valid
  };

  // Fetch Degree Options
  const fetchDegreeOptions = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/branding/degrees/", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch degree options: ${response.statusText}`);
      }

      const degrees = await response.json();
      degreeSelect.innerHTML = degrees
        .map((degree) => `<option value="${degree.id}">${degree.name}</option>`)
        .join("");
    } catch (error) {
      console.error("Error fetching degree options:", error);
      degreeSelect.innerHTML = `<option value="" disabled>Error loading degrees</option>`;
      errorMessage.textContent = "Failed to load degree options.";
    }
  };

  // Fetch Room Details
  const fetchRoomDetails = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/rooms/${id}/`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch room details: ${response.statusText}`);
      }

      const room = await response.json();
      renderRoomDetails(room);
    } catch (error) {
      console.error("Error fetching room details:", error);
      alert("Failed to load room details. Redirecting...");
      window.location.href = "room-availability.html";
    }
  };

  // Render Room Details
  const renderRoomDetails = (room) => {
    const roomNameElement = document.querySelector(".room-name");
    const roomDescriptionElement = document.querySelector(".room-description-text");
    const roomImageElement = document.querySelector(".room-image");

    roomNameElement.textContent = room.name || "Room Name Not Available";
    roomDescriptionElement.textContent = room.description || "No description available.";
    roomImageElement.src = room.image || "../assets/default-room.jpg";
  };

  // Check Room Availability
  const checkRoomAvailability = async (roomId, startTime, endTime) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/rooms/${roomId}/availability/?start_time=${startTime}&end_time=${endTime}`
      );
      const data = await response.json();

      if (!data.available) {
        showAlert("Selected time slot is unavailable. Please choose a different time.", false);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking room availability:", error);
      showAlert("Failed to verify room availability. Please try again.", false);
      return false;
    }
  };

  // Generate Time Slots
  const generateTimeSlots = () => {
    const timeSlots = [
      "08:30", "09:00", "09:30", "10:00", "10:30", "11:00",
      "11:30", "12:00", "12:30", "13:00", "13:30", "14:00",
      "14:30", "15:00", "15:30", "16:00", "16:30", "17:00",
      "17:30", "18:00",
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

  // Form Submission
  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorMessage.textContent = ""; // Clear previous error messages

    const purpose = purposeInput.value.trim();
    const participants = parseInt(participantsInput.value, 10);
    const degree = degreeSelect.value || null;
    const bookingDate = bookingDateInput.value;
    const fromTime = fromTimeSelect.value;
    const toTime = toTimeSelect.value;
    const termsAgreed = termsCheckbox.checked;
    const email = localStorage.getItem("userEmail");

    if (!email) {
      showAlert("User email not found. Please log in again.", false);
      return;
    }

    const dateError = validateBookingDate(bookingDate);
    if (dateError) {
      errorMessage.textContent = dateError;
      return;
    }

    if (!purpose || isNaN(participants) || !fromTime || !toTime || !termsAgreed) {
      errorMessage.textContent = "All fields are required.";
      return;
    }

    const bookingData = {
      room: roomId,
      purpose,
      participants,
      degree_major: degree,
      start_time: `${bookingDate}T${fromTime}:00`,
      end_time: `${bookingDate}T${toTime}:00`,
      email: email,
    };

    try {
      // Check room availability before submitting
      const isAvailable = await checkRoomAvailability(
        roomId,
        bookingData.start_time,
        bookingData.end_time
      );
      if (!isAvailable) return;

      const response = await fetch("http://127.0.0.1:8000/api/bookings/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Booking Error Details:", errorDetails);
        throw new Error(errorDetails.detail || "Failed to book room.");
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
    roomId = urlParams.get("room_id");

    if (!roomId) {
      alert("Room ID not provided!");
      window.location.href = "room-availability.html";
      return;
    }

    await loadHeaderAndSidebar();
    await fetchDegreeOptions();
    await fetchRoomDetails(roomId);
    generateTimeSlots();
    await configureBookingDate();
  };

  initialize();
});
