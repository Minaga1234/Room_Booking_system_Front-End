document.addEventListener("DOMContentLoaded", () => {
  const backIcon = document.querySelector(".back-icon");
  backIcon.addEventListener("click", () => {
    window.history.back();
  });

  const fromTimeSelect = document.getElementById("from-time");
  const toTimeSelect = document.getElementById("to-time");
  const errorMessage = document.getElementById("error-message");
  const bookingForm = document.getElementById("booking-form");

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

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const bookingDate = document.getElementById("booking-date").value;
    const fromTime = fromTimeSelect.value;
    const toTime = toTimeSelect.value;
    const purpose = document.getElementById("purpose").value;

    if (fromTime === "9:00 AM" && toTime === "10:00 AM") {
      errorMessage.textContent =
        "Already allocated for the selected time slot!";
      errorMessage.style.color = "red";
    } else {
      errorMessage.textContent = "";
      alert(
        `Room booked successfully on ${bookingDate} from ${fromTime} to ${toTime} for ${purpose}`
      );
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

  // Dummy data for today's bookings
  const bookings = [
    {
      room: "Green Room",
      bookedBy: "Student",
      time: "9:00 AM to 11:30 AM",
    },
    {
      room: "Green Room",
      bookedBy: "Student",
      time: "12:40 PM to 1:30 PM",
    },
    {
      room: "Green Room",
      bookedBy: "Staff",
      time: "1:40 PM to 2:00 PM",
    },
    {
      room: "Green Room",
      bookedBy: "Staff",
      time: "2:40 PM to 3:30 PM",
    },
  ];

  // Populate the bookings list
  const bookingsList = document.getElementById("bookings-list");
  bookings.forEach((booking) => {
    const bookingItem = document.createElement("div");
    bookingItem.className = "booking-item";
    bookingItem.innerHTML = `
        <strong>${booking.room} - Booked by ${booking.bookedBy}</strong>
        <br />
        From ${booking.time}
      `;
    bookingsList.appendChild(bookingItem);
  });
});
