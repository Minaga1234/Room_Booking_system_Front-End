document.addEventListener("DOMContentLoaded", async () => {
  console.log("Add room script loaded.");

  const form = document.getElementById("add-room-form");
  const uploadButton = document.getElementById("upload-btn");
  const roomImageInput = document.getElementById("room-image");
  const imagePreview = document.getElementById("image-preview");

  const ROOM_API_URL = "http://127.0.0.1:8000/api/rooms/";
  const token = localStorage.getItem("accessToken");

  // Load Header and Sidebar
  const loadHeaderAndSidebar = async () => {
    try {
      const headerResponse = await fetch("../admin/header.html");
      if (!headerResponse.ok) {
        throw new Error(`Failed to load header: ${headerResponse.statusText}`);
      }
      const headerHTML = await headerResponse.text();
      document.getElementById("header-container").innerHTML = headerHTML;

      const sidebarResponse = await fetch("../admin/navbar.html");
      if (!sidebarResponse.ok) {
        throw new Error(`Failed to load sidebar: ${sidebarResponse.statusText}`);
      }
      const sidebarHTML = await sidebarResponse.text();
      document.getElementById("sidebar-container").innerHTML = sidebarHTML;

      highlightActiveSidebarLink();
    } catch (error) {
      console.error("Error loading header or sidebar:", error);
    }
  };

  // Highlight Active Sidebar Link
  const highlightActiveSidebarLink = () => {
    const currentPage = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll(".nav-links a");

    navLinks.forEach((link) => {
      const linkHref = link.getAttribute("href");
      const parentLi = link.parentElement;

      if (currentPage === linkHref) {
        parentLi.classList.add("active");
      } else {
        parentLi.classList.remove("active");
      }
    });
  };

  // Check for authentication token
  if (!token) {
    alert("Unauthorized! Please log in.");
    window.location.href = "/login.html";
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

    const featuresInput = document.getElementById("room-features").value.trim();
    const featuresArray = featuresInput.split(",").map((feature) => feature.trim());

    const formData = new FormData();
    formData.append("name", document.getElementById("room-name").value.trim());
    formData.append("location", document.getElementById("location").value.trim());
    formData.append("capacity", document.getElementById("capacity").value.trim());
    formData.append("requires_approval", document.getElementById("is-active").checked);
    formData.append("description", document.getElementById("room-description").value.trim());
    formData.append("features", JSON.stringify(featuresArray)); // Send features as a JSON string
    formData.append("image", roomImageInput.files[0]);

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

  // Load header and sidebar on page load
  await loadHeaderAndSidebar();
});
