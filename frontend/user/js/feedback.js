// const loadHeaderAndSidebar = async () => {
//     try {
//         const headerResponse = await fetch("../shared/header.html");
//         if (!headerResponse.ok) {
//             throw new Error(`Failed to load header: ${headerResponse.statusText}`);
//         }
//         document.getElementById("header-container").innerHTML = await headerResponse.text();

//         const sidebarResponse = await fetch("../shared/sidebar.html");
//         if (!sidebarResponse.ok) {
//             throw new Error(`Failed to load sidebar: ${sidebarResponse.statusText}`);
//         }
//         document.getElementById("sidebar-container").innerHTML = await sidebarResponse.text();

//         console.log("Header and Sidebar loaded successfully.");
//     } catch (error) {
//         console.error("Error loading header or sidebar:", error);
//     }
// };

document.addEventListener("DOMContentLoaded", () => {
    const roomDropdown = document.getElementById("room");
    const form = document.getElementById("feedback-form");

    // Dummy data for fallback
    const dummyRooms = [
        { id: "1", name: "Green Room" },
        { id: "2", name: "Blue Room" },
        { id: "3", name: "Study Hall" }
    ];

    // Fetch rooms from the backend
    async function fetchRooms() {
        try {
            const response = await fetch("/api/rooms"); // Replace with your API endpoint
            if (!response.ok) {
                throw new Error("Failed to fetch rooms");
            }
            const rooms = await response.json();
            populateRooms(rooms);
        } catch (error) {
            console.error("Error fetching rooms:", error);
            populateRooms(dummyRooms); // Fallback to dummy data
        }
    }

    // Populate the room dropdown
    function populateRooms(rooms) {
        roomDropdown.innerHTML = `<option value="" disabled selected>Select a room</option>`;
        rooms.forEach(room => {
            const option = document.createElement("option");
            option.value = room.id;
            option.textContent = room.name;
            roomDropdown.appendChild(option);
        });
    }

    // Submit form data to the backend
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = {
            fullName: document.getElementById("full-name").value,
            fieldOfStudy: document.getElementById("field-of-study").value,
            room: document.getElementById("room").value,
            studentId: document.getElementById("student-id").value,
            feedback: document.getElementById("feedback").value,
        };

        try {
            const response = await fetch("/api/submit-feedback", { // Replace with your API endpoint
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert("Feedback submitted successfully!");
                form.reset();
            } else {
                alert("Failed to submit feedback. Please try again.");
            }
        } catch (error) {
            console.error("Error submitting feedback:", error);
            alert("Error submitting feedback. Please try again later.");
        }
    });

    // Initialize fetching
    fetchRooms();
});
