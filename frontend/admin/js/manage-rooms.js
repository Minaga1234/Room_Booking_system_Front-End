document.addEventListener("DOMContentLoaded", async function () {
  console.log("Room management script loaded.");

  const prevRoomButton = document.getElementById("prev-room");
  const nextRoomButton = document.getElementById("next-room");
  const roomNameDisplay = document.getElementById("room-name-display");
  const roomNameInput = document.getElementById("room-name");
  const roomLocationInput = document.getElementById("room-location");
  const seatingCapacityInput = document.getElementById("seating-capacity");
  const adminApprovalInput = document.getElementById("admin-approval");
  const roomDescriptionInput = document.getElementById("room-description"); // Updated
  const roomFeaturesInput = document.getElementById("room-features"); // Updated
  const roomImage = document.getElementById("room-image");
  const roomImageInput = document.getElementById("room-image-input");
  const editImageButton = document.getElementById("edit-image-button");
  const updateRoomButton = document.getElementById("update-room-button");

  const ROOM_API_URL = "http://ibs.lunox.dev/api/rooms/";
  const token = localStorage.getItem("accessToken");

  // Load Header and Sidebar
  async function loadHeaderAndSidebar() {
    try {
      // Load header
      const headerResponse = await fetch("../admin/header.html");
      if (!headerResponse.ok) {
        throw new Error(`Failed to load header: ${headerResponse.statusText}`);
      }
      const headerHTML = await headerResponse.text();
      document.getElementById("admin-header-container").innerHTML = headerHTML;

      // Load sidebar
      const sidebarResponse = await fetch("../admin/navbar.html");
      if (!sidebarResponse.ok) {
        throw new Error(`Failed to load sidebar: ${sidebarResponse.statusText}`);
      }
      const sidebarHTML = await sidebarResponse.text();
      document.getElementById("admin-navbar-container").innerHTML = sidebarHTML;

      // Highlight the active link in the sidebar
      highlightActiveSidebarLink();
    } catch (error) {
      console.error("Error loading header or sidebar:", error);
    }
  }

  // Highlight Active Sidebar Link
  function highlightActiveSidebarLink() {
    const currentPage = window.location.pathname.split("/").pop(); // Get current page name
    const navLinks = document.querySelectorAll(".nav-links a");

    navLinks.forEach((link) => {
      const linkHref = link.getAttribute("href");
      const parentLi = link.parentElement;

      if (currentPage === linkHref) {
        parentLi.classList.add("active"); // Add the active class to the current link
      } else {
        parentLi.classList.remove("active"); // Remove the active class from other links
      }
    });
  }

  // Authenticate user
  if (!token) {
    alert("Unauthorized! Please log in.");
    window.location.href = "/login.html";
    return;
  }

  let rooms = [];
  let currentRoomIndex = 0;
  let currentImageFile = null;

  // Fetch rooms from the backend
  async function fetchRooms() {
    try {
      const response = await fetch(ROOM_API_URL, {
        headers: {
          Authorization: `Bearer ${token}`, // Authentication remains in fetch
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch rooms. Status: ${response.status}`);
      }

      rooms = await response.json();
      if (rooms.length > 0) {
        loadRoom(0);
      } else {
        roomNameDisplay.textContent = "No Rooms Added";
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  }

  // Load room details into the UI
  function loadRoom(index) {
    const room = rooms[index];
    roomNameDisplay.textContent = room.name;
    roomNameInput.value = room.name;
    roomLocationInput.value = room.location;
    seatingCapacityInput.value = room.capacity;
    adminApprovalInput.checked = room.requires_approval;
    roomDescriptionInput.value = room.description || ""; // Updated
    roomFeaturesInput.value = (room.features || []).join(", "); // Updated
    roomImage.src = room.image || ""; // Set image or leave empty
    currentImageFile = null; // Reset current image file
  }

  // Update room details
  async function updateRoom() {
    const roomData = {
      name: roomNameInput.value.trim(),
      location: roomLocationInput.value.trim(),
      capacity: parseInt(seatingCapacityInput.value.trim(), 10),
      is_available: !adminApprovalInput.checked,
      description: roomDescriptionInput.value.trim(), // Updated
      features: roomFeaturesInput.value.split(",").map((f) => f.trim()), // Updated
    };

    const formData = new FormData();
    Object.keys(roomData).forEach((key) => {
      if (key === "features") {
        formData.append(key, JSON.stringify(roomData[key])); // Add features as a JSON string
      } else {
        formData.append(key, roomData[key]);
      }
    });

    if (currentImageFile) {
      formData.append("image", currentImageFile); // Add image only if a new one is uploaded
    }

    try {
      const response = await fetch(`${ROOM_API_URL}${rooms[currentRoomIndex].id}/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`, // Include token for authentication
        },
        body: formData, // Send as multipart/form-data
      });

      if (response.ok) {
        const updatedData = await response.json();
        rooms[currentRoomIndex] = updatedData; // Update local data
        alert("Room updated successfully!");
        loadRoom(currentRoomIndex); // Reload room details
      } else {
        const error = await response.json();
        console.error("Failed to update room:", error);
        alert(`Failed to update room: ${error.message || "Unknown error occurred"}`);
      }
    } catch (error) {
      console.error("Error updating room:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  }

  // Handle image upload
  editImageButton.addEventListener("click", () => {
    roomImageInput.click();
  });

  roomImageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        roomImage.src = e.target.result; // Display image preview
      };

      reader.readAsDataURL(file);
      currentImageFile = file; // Save file for submission
    }
  });

  // Navigation between rooms
  prevRoomButton.addEventListener("click", () => {
    if (currentRoomIndex > 0) {
      currentRoomIndex--;
      loadRoom(currentRoomIndex);
    }
  });

  nextRoomButton.addEventListener("click", () => {
    if (currentRoomIndex < rooms.length - 1) {
      currentRoomIndex++;
      loadRoom(currentRoomIndex);
    }
  });

  updateRoomButton.addEventListener("click", updateRoom);

  // Initial function calls
  await loadHeaderAndSidebar();
  fetchRooms();
});
