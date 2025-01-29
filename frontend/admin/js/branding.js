document.addEventListener("DOMContentLoaded", () => {
  const THEME_API_URL = "http://ibs.lunox.dev/api/branding/themes/";
  const BRANDING_ASSETS_API_URL = "http://ibs.lunox.dev/api/branding/assets/";
  const DEGREES_API_URL = "http://ibs.lunox.dev/api/branding/degrees/";
  // const token = localStorage.getItem("accessToken");

  // Temporarily disable authentication for UI editing
  if (!token) {
    alert("Unauthorized! Please log in as an admin.");
    window.location.href = "admin_login.html";
    return;
  }

  const themeGrid = document.getElementById("theme-grid");
  const customThemeForm = document.getElementById("custom-theme-builder");
  const brandingAssetsForm = document.getElementById("branding-assets-form");
  const degreeForm = document.getElementById("degree-form");
  const degreeList = document.getElementById("degree-list");
  const logoUpload = document.getElementById("icon-upload");
  const bgImageUpload = document.getElementById("bg-image-upload");
  const logoBox = document.getElementById("logo-box");
  const bgBox = document.getElementById("background-box");

  // Dummy Data
  const dummyThemes = [
    {
      id: 1,
      name: "Default Theme",
      primary_color: "#007BFF",
      background_color: "#F8F9FA",
      highlight_color: "#FF6600",
      text_color: "#292E4A",
      card_background: "#FFFFFF",
    },
    {
      id: 2,
      name: "Dark Theme",
      primary_color: "#343A40",
      background_color: "#212529",
      highlight_color: "#FFC107",
      text_color: "#FFFFFF",
      card_background: "#343A40",
    },
  ];

  const dummyDegrees = [
    { id: 1, name: "Bachelor of Computer Science" },
    { id: 2, name: "Master of Software Engineering" },
  ];

  // Fetch Themes
  const fetchThemes = async () => {
    try {
      const response = await fetch(THEME_API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch themes. Status: ${response.status}`);

      const themes = await response.json();
      renderThemes(themes);
    } catch (error) {
      console.warn("Backend not reachable. Loading dummy themes for designing.");
      renderThemes(dummyThemes); // Load dummy data
    }
  };

  // Render Themes
  const renderThemes = (themes) => {
    themeGrid.innerHTML = "";
    themes.forEach((theme, index) => {
      const themeCard = document.createElement("div");
      themeCard.classList.add("theme-card");
      themeCard.innerHTML = `
        <h3>${theme.name}</h3>
        <div class="theme-preview">
          <div class="preview-header" style="background-color: ${theme.primary_color}; color: ${theme.text_color};">
            Header
          </div>
          <div class="preview-body" style="background-color: ${theme.background_color}; color: ${theme.text_color};">
            Content
          </div>
        </div>
        <button class="apply-theme-button" data-id="${theme.id}">Apply Theme</button>
      `;

      themeCard.querySelector(".apply-theme-button").addEventListener("click", () => {
        alert(`Applied Theme: ${theme.name}`);
      });

      themeGrid.appendChild(themeCard);
    });
  };

  // Upload and Preview Logic for Branding Assets
  const setupUploadBox = (inputElement, uploadBox, placeholderText) => {
    const placeholder = document.createElement("p");
    placeholder.classList.add("placeholder");
    placeholder.textContent = placeholderText;
    uploadBox.appendChild(placeholder);

    // Trigger file upload dialog when the box is clicked
    uploadBox.addEventListener("click", () => inputElement.click());

    inputElement.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          placeholder.style.display = "none";
          uploadBox.style.backgroundImage = `url(${e.target.result})`;
          uploadBox.style.backgroundSize = "cover";
          uploadBox.style.backgroundPosition = "center";
        };
        reader.readAsDataURL(file);
      }
    });
  };

  setupUploadBox(logoUpload, logoBox, "Upload Logo Here");
  setupUploadBox(bgImageUpload, bgBox, "Upload Background Image Here");

  // Tab Switching Logic
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      button.classList.add("active");
      const target = document.getElementById(button.getAttribute("data-target"));
      target.classList.add("active");
    });
  });

  // Degree Management Logic
  const renderDegrees = (degrees) => {
    degreeList.innerHTML = degrees
      .map(
        (degree) => `
      <div class="degree-item">
        <p>${degree.name}</p>
      </div>
    `
      )
      .join("");
  };

  renderDegrees(dummyDegrees);

  degreeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const degreeName = document.getElementById("degree-name").value.trim();
    if (degreeName) {
      dummyDegrees.push({ id: dummyDegrees.length + 1, name: degreeName });
      renderDegrees(dummyDegrees);
      degreeForm.reset();
    }
  });

  // Initialize
  fetchThemes();
});
