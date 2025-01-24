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

  let userId = null; // Store the user's ID
  let userRole = ""; // The user's role (e.g., "student" or "staff")

  // Fetch token from localStorage
  const getAuthHeaders = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      alert("Your session has expired. Please log in again.");
      window.location.href = "/frontend/user/login.html";
      return null;
    }
    return {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };
  };

  // Load Header and Sidebar
  const loadHeaderAndSidebar = async () => {
    try {
      const headerResponse = await fetch("../shared/header.html");
      if (!headerResponse.ok) throw new Error("Failed to load header.");
      document.getElementById("header-container").innerHTML = await headerResponse.text();

      const sidebarResponse = await fetch("../shared/sidebar.html");
      if (!sidebarResponse.ok) throw new Error("Failed to load sidebar.");
      document.getElementById("sidebar-container").innerHTML = await sidebarResponse.text();
    } catch (error) {
      console.error("Error loading header or sidebar:", error);
    }
  };

  // Fetch User Role
  const fetchUserRole = async () => {
    try {
      const headers = await getAuthHeaders();
      if (!headers) return;
      const response = await fetch("http://127.0.0.1:8000/api/users/profile/", { headers });
      if (!response.ok) throw new Error("Failed to fetch user role.");
      const userData = await response.json();
      userRole = userData.role;
      userId = userData.id; // Store user_id
      configureBookingDate(userRole);
    } catch (error) {
      console.error("Error fetching user role:", error);
      userRole = "student"; // Default to 'student' if role cannot be determined
      configureBookingDate(userRole);
    }
  };

  // Configure Booking Date Based on Role
  const configureBookingDate = (role) => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const formatDate = (date) => date.toISOString().split("T")[0];

    if (role === "student") {
      bookingDateInput.value = formatDate(today);
      bookingDateInput.min = formatDate(today);
      bookingDateInput.max = formatDate(today);
      bookingDateInput.disabled = true;
    } else if (role === "staff") {
      bookingDateInput.value = formatDate(today);
      bookingDateInput.min = formatDate(today);
      bookingDateInput.max = formatDate(tomorrow);
      bookingDateInput.disabled = false;
    } else {
      console.error("Invalid user role.");
      configureBookingDate("student");
    }
  };

  // Generate Time Slots
  const generateTimeSlots = () => {
    const timeSlots = [
      "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM",
      "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM",
      "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM",
      "5:30 PM", "6:00 PM","6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM",
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

  // Fetch Room Details
  const fetchRoomDetails = async (roomId) => {
    try {
      const headers = await getAuthHeaders();
      if (!headers) return;
      const response = await fetch(`http://127.0.0.1:8000/api/rooms/${roomId}/`, { headers });
      if (!response.ok) throw new Error("Failed to fetch room details.");
      const roomDetails = await response.json();
      renderRoomDetails(roomDetails);
    } catch (error) {
      console.error("Error fetching room details:", error);
      alert("Failed to load room details.");
      window.location.href = "room-availability.html";
    }
  };

  // Render Room Details
  const renderRoomDetails = (room) => {
    const roomNameElement = document.querySelector(".room-name");
    const roomDescriptionElement = document.querySelector(".room-description-text");
    const roomImageElement = document.querySelector(".room-image");

    if (roomNameElement) roomNameElement.textContent = room.name || "Room Name Not Available";
    if (roomDescriptionElement) roomDescriptionElement.textContent = room.description || "No description available.";
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

  // Convert time format to HH:mm
  const convertTimeTo24HourFormat = (time) => {
    const [timePart, meridian] = time.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);

    if (meridian === "PM" && hours < 12) {
      hours += 12;
    }
    if (meridian === "AM" && hours === 12) {
      hours = 0;
    }

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  // Format date and time into ISO string
  const formatDateTime = (date, time) => {
    const [hours, minutes] = convertTimeTo24HourFormat(time).split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
  };

  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const bookingDate = bookingDateInput.value;
    const fromTime = fromTimeSelect.value;
    const toTime = toTimeSelect.value;
    const purpose = purposeInput.value.trim();
    const participants = parseInt(participantsInput.value, 10);
    const degreeMajor = degreeSelect.value;
    const termsAgreed = termsCheckbox.checked;

    if (!termsAgreed) {
      errorMessage.textContent = "You must agree to the terms and conditions.";
      return;
    }

    // Validate bookingDate, fromTime, and toTime
    if (!bookingDate) {
      errorMessage.textContent = "Booking date is required.";
      return;
    }

    if (!fromTime || !toTime) {
      errorMessage.textContent = "Both start time and end time are required.";
      return;
    }

    try {
      const startTimeISO = formatDateTime(new Date(bookingDate), fromTime);
      const endTimeISO = formatDateTime(new Date(bookingDate), toTime);

      const bookingData = {
        user_id: userId, // Include user_id in the payload
        room_id: new URLSearchParams(window.location.search).get("room_id"),
        date: bookingDate,
        start_time: startTimeISO,
        end_time: endTimeISO,
        purpose,
        participants,
        degree_major: degreeMajor,
      };

      console.log("Booking Payload:", bookingData);

      const headers = await getAuthHeaders();
      if (!headers) return;

      const response = await fetch("http://127.0.0.1:8000/api/bookings/", {
        method: "POST",
        headers,
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("API Error Details:", errorDetails);
        alert(errorDetails.non_field_errors?.join(", ") || "Failed to book room.");
        return;
    }
    

      alert("Room booked successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error booking room:", error);
      errorMessage.textContent = error.message;
    }
  });

  // Initialize page
  const initialize = async () => {
    const roomId = new URLSearchParams(window.location.search).get("room_id");
    if (!roomId) {
      alert("Room ID not provided!");
      window.location.href = "room-availability.html";
      return;
    }

    await loadHeaderAndSidebar();
    await fetchUserRole();
    generateTimeSlots();
    await fetchRoomDetails(roomId);
  };

  initialize();
});