document.addEventListener("DOMContentLoaded", () => {
  const roomId = new URLSearchParams(window.location.search).get("roomId");
  const roomNameElement = document.getElementById("room-name");
  const roomImageElement = document.getElementById("room-image");
  const roomDescriptionElement = document.getElementById("room-description");
  const roomAmenitiesElement = document.getElementById("room-amenities");
  const bookingsList = document.getElementById("bookings-list");
  const bookingForm = document.getElementById("booking-form");
  const errorMessage = document.getElementById("error-message");

  // Dummy room data
  const dummyRoomData = {
    id: roomId,
    name: "Conference Room A",
    description: "A spacious conference room for team meetings and discussions.",
    image: "https://via.placeholder.com/300x150.png?text=Room+A",
    amenities: [
      "Projector",
      "Whiteboard",
      "High-speed Wi-Fi",
      "Air Conditioning",
      "Comfortable Seating",
    ],
  };

  // Dummy bookings data
  const dummyBookingsData = [
    {
      roomId: roomId,
      bookedBy: "John Doe",
      userRole: "Student",
      startTime: "9:00 AM",
      endTime: "10:30 AM",
    },
    {
      roomId: roomId,
      bookedBy: "Jane Smith",
      userRole: "Staff",
      startTime: "11:00 AM",
      endTime: "12:30 PM",
    },
  ];

  // Display today's date
  const currentDateElement = document.getElementById("current-date");
  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  currentDateElement.textContent = currentDate;

  // Populate room details
  roomNameElement.textContent = dummyRoomData.name;
  roomImageElement.src = dummyRoomData.image;
  roomDescriptionElement.textContent = dummyRoomData.description;
  dummyRoomData.amenities.forEach((amenity) => {
    const li = document.createElement("li");
    li.textContent = amenity;
    roomAmenitiesElement.appendChild(li);
  });

  // Populate today's bookings
  if (dummyBookingsData.length === 0) {
    bookingsList.innerHTML = "<p>No bookings for today.</p>";
  } else {
    dummyBookingsData.forEach((booking) => {
      const bookingItem = document.createElement("div");
      bookingItem.className = "booking-item";
      bookingItem.innerHTML = `
        <strong>${booking.bookedBy} (${booking.userRole})</strong>
        <br />
        From ${booking.startTime} to ${booking.endTime}
      `;
      bookingsList.appendChild(bookingItem);
    });
  }

  // Populate time slots
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
  ];
  const fromTimeSelect = document.getElementById("from-time");
  const toTimeSelect = document.getElementById("to-time");

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

  // Handle booking form submission
  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const bookingDate = document.getElementById("booking-date").value;
    const fromTime = fromTimeSelect.value;
    const toTime = toTimeSelect.value;
    const purpose = document.getElementById("purpose").value;

    // Simulate saving the booking
    const newBooking = {
      roomId: roomId,
      bookedBy: "You",
      userRole: "User",
      startTime: fromTime,
      endTime: toTime,
    };

    if (
      dummyBookingsData.some(
        (booking) =>
          booking.startTime === fromTime && booking.endTime === toTime
      )
    ) {
      errorMessage.textContent =
        "The selected time slot is already booked. Please choose another.";
    } else {
      errorMessage.textContent = "";
      dummyBookingsData.push(newBooking);
      alert(
        `Room booked successfully on ${bookingDate} from ${fromTime} to ${toTime} for ${purpose}`
      );
      window.location.reload();
    }
  });
});
