document.addEventListener("DOMContentLoaded", () => {
  const THEME_API_URL = "http://127.0.0.1:8000/api/branding/themes/";
  const BRANDING_ASSETS_API_URL = "http://127.0.0.1:8000/api/branding/assets/";
  const DEGREES_API_URL = "http://127.0.0.1:8000/api/branding/degrees/";
  const token = localStorage.getItem("accessToken");
  const csrfToken = getCsrfToken();

  if (!token) {
    alert("Unauthorized! Please log in as an admin.");
    window.location.href = "admin_login.html";
    return;
  }

  const themeGrid = document.getElementById("theme-grid");
  const brandingAssetsForm = document.getElementById("branding-assets-form");
  const degreeForm = document.getElementById("degree-form");
  const degreeList = document.getElementById("degree-list");

  // Function to Get CSRF Token from Cookies
  function getCsrfToken() {
    const name = "csrftoken=";
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      while (cookie.charAt(0) === " ") {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }
    return "";
  }

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
      console.error("Error fetching themes:", error);
      alert("Unable to load themes. Please try again.");
    }
  };

  // Render Themes
  const renderThemes = (themes) => {
    themeGrid.innerHTML = "";
    themes.forEach((theme) => {
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
        applyTheme(theme.id);
      });

      themeGrid.appendChild(themeCard);
    });
  };

  // Apply Theme
  const applyTheme = async (themeId) => {
    try {
      const response = await fetch(`${THEME_API_URL}${themeId}/apply/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-CSRFToken": csrfToken,
        },
      });

      if (!response.ok) throw new Error(`Failed to apply theme. Status: ${response.status}`);

      const theme = await response.json();
      alert(`Theme "${theme.name}" applied successfully!`);
    } catch (error) {
      console.error("Error applying theme:", error);
      alert("Unable to apply theme. Please try again.");
    }
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
      console.error("Error fetching degrees:", error);
      alert("Unable to load degrees. Please try again.");
    }
  };

  // Render Degrees
  const renderDegrees = (degrees) => {
    degreeList.innerHTML = degrees
      .map(
        (degree) => `
      <div class="degree-item">
        <p>${degree.name}</p>
        <button class="delete-degree-button" onclick="deleteDegree(${degree.id})">Delete</button>
      </div>
    `
      )
      .join("");
  };

  // Delete Degree
  const deleteDegree = async (degreeId) => {
    if (!confirm("Are you sure you want to delete this degree?")) return;

    try {
      const response = await fetch(`${DEGREES_API_URL}${degreeId}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-CSRFToken": csrfToken,
        },
      });

      if (!response.ok) throw new Error(`Failed to delete degree. Status: ${response.status}`);

      alert("Degree deleted successfully!");
      fetchDegrees();
    } catch (error) {
      console.error("Error deleting degree:", error);
      alert("Unable to delete degree. Please try again.");
    }
  };

  // Add Degree
  degreeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const degreeName = document.getElementById("degree-name").value.trim();
    if (!degreeName) {
      alert("Degree name cannot be empty.");
      return;
    }

    try {
      const response = await fetch(DEGREES_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ name: degreeName }),
      });

      if (!response.ok) throw new Error(`Failed to add degree. Status: ${response.status}`);

      alert("Degree added successfully!");
      document.getElementById("degree-name").value = "";
      fetchDegrees();
    } catch (error) {
      console.error("Error adding degree:", error);
      alert("Unable to add degree. Please try again.");
    }
  });

  // Initialize
  fetchThemes();
  fetchDegrees();
});
