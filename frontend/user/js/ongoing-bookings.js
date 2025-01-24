document.addEventListener("DOMContentLoaded", async () => {
    const BOOKINGS_URL = "http://127.0.0.1:8000/api/bookings/";

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

    const fetchOngoingBookings = async () => {
        try {
            const headers = await getAuthHeaders();
            if (!headers) return [];
    
            const response = await fetch(`${BOOKINGS_URL}?status=approved`, { headers });
            if (!response.ok) throw new Error("Failed to fetch ongoing bookings.");
    
            const data = await response.json();
            console.log("API Response:", data); // Log the entire response
            return data.results || data; // Adjust based on the API's response format
        } catch (error) {
            console.error("Error fetching ongoing bookings:", error);
            return [];
        }
    };

    const renderBookings = (bookings) => {
        const bookingsList = document.getElementById("bookings-list");
        bookingsList.innerHTML = ""; // Clear previous content

        if (bookings.length === 0) {
            bookingsList.innerHTML = "<p>No ongoing bookings available.</p>";
            return;
        }

        bookings.forEach((booking) => {
            const now = new Date();
            const startTime = new Date(booking.start_time);
            const endTime = new Date(booking.end_time);

            const bookingItem = document.createElement("div");
            bookingItem.classList.add("booking-item");
            bookingItem.innerHTML = `
                <strong>${booking.room || "Unknown Room"}</strong>
                <p><strong>Start:</strong> ${startTime.toLocaleString()}</p>
                <p><strong>End:</strong> ${endTime.toLocaleString()}</p>
                <div class="action-buttons">
                    <button class="check-in-btn" data-id="${booking.id}" ${
                        now < startTime || now > endTime || booking.status === "checked_in" ? "disabled" : ""
                    }>Check In</button>
                    <button class="check-out-btn ${booking.status === "checked_in" ? "" : "hidden"}" data-id="${booking.id}" ${
                        now > endTime || booking.status !== "checked_in" ? "disabled" : ""
                    }>Check Out</button>
                </div>
                <div class="timer ${booking.status === "checked_in" ? "" : "hidden"}" id="timer-${booking.id}"></div>
            `;

            bookingsList.appendChild(bookingItem);

            const checkInButton = bookingItem.querySelector(".check-in-btn");
            const checkOutButton = bookingItem.querySelector(".check-out-btn");
            const timerDiv = bookingItem.querySelector(`#timer-${booking.id}`);

            checkInButton.addEventListener("click", () =>
                handleCheckIn(booking.id, checkInButton, checkOutButton, timerDiv, endTime)
            );
            checkOutButton.addEventListener("click", () => handleCheckOut(booking.id, timerDiv));

            if (booking.status === "checked_in") {
                startTimer(timerDiv, endTime); // Resume the countdown timer if already checked in
            }
        });
    };

    const handleCheckIn = async (bookingId, checkInButton, checkOutButton, timerDiv, endTime) => {
        try {
            const headers = await getAuthHeaders();
            if (!headers) return;

            const response = await fetch(`${BOOKINGS_URL}${bookingId}/check_in/`, {
                method: "POST",
                headers,
            });

            if (!response.ok) throw new Error("Failed to check in.");
            alert("Check-in successful!");
            checkInButton.classList.add("hidden");
            checkOutButton.classList.remove("hidden");
            timerDiv.classList.remove("hidden");

            startTimer(timerDiv, endTime); // Start the countdown timer
        } catch (error) {
            console.error("Error during check-in:", error);
            alert("Failed to check in. Please try again.");
        }
    };

    const handleCheckOut = async (bookingId, timerDiv) => {
        try {
            const headers = await getAuthHeaders();
            if (!headers) return;

            const response = await fetch(`${BOOKINGS_URL}${bookingId}/check_out/`, {
                method: "POST",
                headers,
            });

            if (!response.ok) throw new Error("Failed to check out.");
            alert("Check-out successful!");

            // Stop the timer and clear the booking item
            clearInterval(timerDiv.dataset.timerId);
            document.querySelector(`[data-id="${bookingId}"]`).parentElement.remove();
        } catch (error) {
            console.error("Error during check-out:", error);
            alert("Failed to check out. Please try again.");
        }
    };

    const startTimer = (timerDiv, endTime) => {
        const endTimeMs = new Date(endTime).getTime();

        const updateTimer = () => {
            const now = Date.now();
            const remainingTime = endTimeMs - now;

            if (remainingTime <= 0) {
                clearInterval(timerDiv.dataset.timerId);
                timerDiv.textContent = "Booking time has ended.";
                return;
            }

            const minutes = Math.floor(remainingTime / 60000);
            const seconds = Math.floor((remainingTime % 60000) / 1000);
            timerDiv.textContent = `Time Remaining: ${minutes}m ${seconds}s`;

            if (remainingTime <= 5 * 60 * 1000) {
                alert("Your booking will end in less than 5 minutes!");
            }
        };

        // Update every second
        updateTimer();
        const timerId = setInterval(updateTimer, 1000);
        timerDiv.dataset.timerId = timerId;
    };

    const initialize = async () => {
        try {
            const bookings = await fetchOngoingBookings();
            console.log("Fetched bookings:", bookings); // Debugging the structure
            renderBookings(bookings);
        } catch (error) {
            console.error("Error initializing ongoing bookings:", error);
        }
    };

    initialize();
});
