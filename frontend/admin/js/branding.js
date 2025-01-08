document.addEventListener("DOMContentLoaded", () => {
  const THEME_API_URL = "http://127.0.0.1:8000/api/branding/themes/";
  const BRANDING_ASSETS_API_URL = "http://127.0.0.1:8000/api/branding/assets/";
  const DEGREES_API_URL = "http://127.0.0.1:8000/api/branding/degrees/";
  const token = localStorage.getItem("accessToken");

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

  // Dummy Data
  const dummyThemes = [
    { id: 1, name: "Default Theme", primary_color: "#007BFF", background_color: "#F8F9FA", highlight_color: "#FF6600", text_color: "#292E4A", card_background: "#FFFFFF" },
    { id: 2, name: "Dark Theme", primary_color: "#343A40", background_color: "#212529", highlight_color: "#FFC107", text_color: "#FFFFFF", card_background: "#343A40" },
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
          Authorization: `Bearer ${token}`,
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
    themes.forEach((theme) => {
      const themeCard = document.createElement("div");
      themeCard.classList.add("theme-card");
      themeCard.style.backgroundColor = theme.card_background || "var(--card-background)";
      themeCard.style.color = theme.text_color || "var(--text-color)";
      themeCard.innerHTML = `
        <h3>${theme.name}</h3>
        <div class="preview-container">
          <div class="preview-header" style="background-color: ${theme.primary_color}; color: ${theme.text_color};">
            Header
          </div>
          <div class="preview-body" style="background-color: ${theme.background_color}; color: ${theme.text_color};">
            <p>Body content with text styles</p>
            <button style="background-color: ${theme.highlight_color}; color: ${theme.primary_color};">Sample Button</button>
          </div>
        </div>
        <button class="save-button" onclick="applyTheme(${theme.id})">Apply Theme</button>
      `;
      themeGrid.appendChild(themeCard);
    });
  };

  // Apply Theme
  window.applyTheme = (themeId) => {
    const theme = dummyThemes.find((t) => t.id === themeId);
    if (theme) {
      updateCSSVariables(theme);
      alert(`Dummy theme "${theme.name}" applied successfully!`);
    } else {
      alert("Theme not found.");
    }
  };

  // Update CSS Variables
  const updateCSSVariables = (theme) => {
    document.documentElement.style.setProperty("--primary-color", theme.primary_color);
    document.documentElement.style.setProperty("--background-color", theme.background_color);
    document.documentElement.style.setProperty("--highlight-color", theme.highlight_color);
    document.documentElement.style.setProperty("--text-color", theme.text_color);
    document.documentElement.style.setProperty("--card-background", theme.card_background || "#112233");
  };

  // Fetch Degrees
  const fetchDegrees = async () => {
    try {
      const response = await fetch(DEGREES_API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch degrees. Status: ${response.status}`);

      const degrees = await response.json();
      renderDegrees(degrees);
    } catch (error) {
      console.warn("Backend not reachable. Loading dummy degrees for designing.");
      renderDegrees(dummyDegrees); // Load dummy data
    }
  };

  // Render Degrees
  const renderDegrees = (degrees) => {
    degreeList.innerHTML = "";
    degrees.forEach((degree) => {
      const degreeItem = document.createElement("div");
      degreeItem.classList.add("degree-item");
      degreeItem.innerHTML = `
        <span>${degree.name}</span>
        <button class="delete-button" onclick="deleteDegree(${degree.id})">Delete</button>
      `;
      degreeList.appendChild(degreeItem);
    });
  };

  // Delete Degree
  window.deleteDegree = (degreeId) => {
    alert(`Dummy degree with ID ${degreeId} deleted.`);
    const updatedDegrees = dummyDegrees.filter((degree) => degree.id !== degreeId);
    renderDegrees(updatedDegrees);
  };

  // Degree Submission
  degreeForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const degreeName = document.getElementById("degree-name").value.trim();

    if (!degreeName) {
      alert("Degree name cannot be empty.");
      return;
    }

    const newDegree = { id: dummyDegrees.length + 1, name: degreeName };
    dummyDegrees.push(newDegree);
    alert("Dummy degree added successfully!");
    document.getElementById("degree-name").value = "";
    renderDegrees(dummyDegrees);
  });

  // Initialize
  fetchThemes();
  fetchDegrees();
});
