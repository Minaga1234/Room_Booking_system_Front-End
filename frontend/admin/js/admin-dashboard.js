document.addEventListener("DOMContentLoaded", () => {
    // Initialize Chart.js
    const ctx = document.getElementById("usage-trend-chart").getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"],
        datasets: [
          {
            label: "Usage",
            data: [4000, 6000, 12000, 8000, 15000, 10000, 18000, 20000],
            backgroundColor: "rgba(255, 102, 0, 0.2)",
            borderColor: "#FF6600",
            borderWidth: 2,
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  });
  