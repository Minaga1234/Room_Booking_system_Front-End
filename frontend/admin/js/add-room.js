document.addEventListener("DOMContentLoaded", () => {
    console.log("Room management script loaded.");
  
    const form = document.getElementById("add-room-form");
    const uploadButton = document.getElementById("upload-btn");
    const roomImageInput = document.getElementById("room-image");
    const imagePreview = document.getElementById("image-preview");
  
    const ROOM_API_URL = "http://127.0.0.1:8000/api/rooms/";
    const token = localStorage.getItem("accessToken");
  
    if (!token) {
      alert("Unauthorized! Please log in.");
      window.location.href = "/login.html"; // Redirect to login page
      return;
    }
  
    // Handle image upload button click
    uploadButton.addEventListener("click", () => {
      roomImageInput.click();
    });
  
    // Display image preview
    roomImageInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          imagePreview.innerHTML = `<img src="${e.target.result}" alt="Room Image" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">`;
        };
        reader.readAsDataURL(file);
      } else {
        alert("No file selected.");
      }
    });
  
    // Handle form submission
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
  
      const formData = new FormData();
      formData.append("name", document.getElementById("room-name").value.trim());
      formData.append("location", document.getElementById("location").value.trim());
      formData.append("capacity", document.getElementById("capacity").value.trim());
      formData.append("requires_approval", document.getElementById("is-active").checked);
      formData.append("room_introduction", document.getElementById("room-introduction").value.trim());
      formData.append("room_image", roomImageInput.files[0]);
  
      try {
        const response = await fetch(ROOM_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
  
        if (response.ok) {
          alert("Room added successfully!");
          form.reset();
          imagePreview.innerHTML = `<span class="placeholder-text">Room Image</span>`;
        } else {
          const error = await response.json();
          alert(`Error: ${error.message || "Failed to add room."}`);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An unexpected error occurred. Please try again.");
      }
    });
  });
  