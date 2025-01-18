document.addEventListener("DOMContentLoaded", async () => {
    await loadHeaderAndSidebar();
    await fetchAndDisplayFeedback();
    addFilterFunctionality();
});

const loadHeaderAndSidebar = async () => {
    try {
        const headerResponse = await fetch("./header.html");
        const sidebarResponse = await fetch("./navbar.html");

        if (!headerResponse.ok || !sidebarResponse.ok) {
            throw new Error("Failed to load header or sidebar.");
        }

        document.getElementById("header-container").innerHTML = await headerResponse.text();
        document.getElementById("sidebar-container").innerHTML = await sidebarResponse.text();
    } catch (error) {
        console.error("Error loading header/sidebar:", error);
        document.getElementById("feedback-error-message").classList.remove("hidden");
    }
};

const fetchAndDisplayFeedback = async () => {
    try {
        // Simulated feedback data
        const dummyFeedbacks = [
            {
                id: 1,
                fullName: "John Doe",
                fieldOfStudy: "Computer Science",
                room: "Green Room",
                studentId: "CS2023",
                feedback: "The room booking system is very convenient.",
                status: "pending",
                date: "2025-01-15"
            },
            {
                id: 2,
                fullName: "Jane Smith",
                fieldOfStudy: "Engineering",
                room: "Blue Room",
                studentId: "EN2045",
                feedback: "Would like better availability of rooms in the afternoon.",
                status: "reviewed",
                date: "2025-01-12"
            },
            {
                id: 3,
                fullName: "Alice Johnson",
                fieldOfStudy: "Business",
                room: "Study Hall",
                studentId: "BS1012",
                feedback: "The booking process is easy, but the UI can be improved.",
                status: "pending",
                date: "2025-01-14"
            },
        ];

        populateFeedbackCards(dummyFeedbacks);
        updateStats(dummyFeedbacks);
    } catch (error) {
        console.error("Error fetching feedback data:", error);
        document.getElementById("feedback-error-message").classList.remove("hidden");
    }
};

const updateStats = (feedbacks) => {
    const totalFeedback = feedbacks.length;
    const pendingReview = feedbacks.filter(f => f.status === 'pending').length;
    const reviewed = feedbacks.filter(f => f.status === 'reviewed').length;

    document.getElementById('total-feedback').textContent = totalFeedback;
    document.getElementById('pending-review').textContent = pendingReview;
    document.getElementById('reviewed').textContent = reviewed;
};

const populateFeedbackCards = (feedbacks) => {
    const cardsContainer = document.getElementById("feedback-cards-container");
    cardsContainer.innerHTML = "";

    feedbacks.forEach((feedback, index) => {
        const card = document.createElement("div");
        card.className = "feedback-card";

        card.innerHTML = `
            <h3>Feedback #${feedback.id || index + 1}</h3>
            <p><strong>Full Name:</strong> ${feedback.fullName}</p>
            <p><strong>Field of Study:</strong> ${feedback.fieldOfStudy}</p>
            <p><strong>Room:</strong> ${feedback.room}</p>
            <p><strong>Student ID:</strong> ${feedback.studentId}</p>
            <p><strong>Date:</strong> ${feedback.date}</p>
            <p><strong>Feedback:</strong> ${feedback.feedback}</p>
            <div class="card-actions">
                <button class="action-btn review-btn" data-id="${feedback.id}">
                    <i class="fas fa-check"></i> Mark Reviewed
                </button>
                <button class="action-btn delete-btn" data-id="${feedback.id}">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;

        cardsContainer.appendChild(card);
    });

    addActionEventListeners();
};

const addActionEventListeners = () => {
    document.querySelectorAll(".review-btn").forEach((button) => {
        button.addEventListener("click", async (e) => {
            const feedbackId = e.target.dataset.id;
            alert(`Marking Feedback #${feedbackId} as reviewed.`);
            // Update status logic here
        });
    });

    document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", async (e) => {
            const feedbackId = e.target.dataset.id;
            alert(`Deleting Feedback #${feedbackId}.`);
            // Delete feedback logic here
        });
    });

    document.querySelector(".refresh-btn")?.addEventListener("click", () => {
        fetchAndDisplayFeedback();
    });
};

const addFilterFunctionality = () => {
    const filterModal = document.getElementById("filter-modal");
    const filterBtn = document.querySelector(".filter-btn");
    const cancelBtn = document.querySelector(".cancel-btn");
    const filterForm = document.getElementById("filter-form");

    filterBtn.addEventListener("click", () => {
        filterModal.classList.remove("hidden");
    });

    cancelBtn.addEventListener("click", () => {
        filterModal.classList.add("hidden");
    });

    filterForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const course = document.getElementById("course-filter").value;
        const date = document.getElementById("date-filter").value;
        const status = document.getElementById("status-filter").value;

        // Filter feedbacks based on criteria
        applyFilters(course, date, status);
        filterModal.classList.add("hidden");
    });
};

const applyFilters = (course, date, status) => {
    const dummyFeedbacks = [
        {
            id: 1,
            fullName: "John Doe",
            fieldOfStudy: "Computer Science",
            room: "Green Room",
            studentId: "CS2023",
            feedback: "The room booking system is very convenient.",
            status: "pending",
            date: "2025-01-15"
        },
        {
            id: 2,
            fullName: "Jane Smith",
            fieldOfStudy: "Engineering",
            room: "Blue Room",
            studentId: "EN2045",
            feedback: "Would like better availability of rooms in the afternoon.",
            status: "reviewed",
            date: "2025-01-12"
        },
        {
            id: 3,
            fullName: "Alice Johnson",
            fieldOfStudy: "Business",
            room: "Study Hall",
            studentId: "BS1012",
            feedback: "The booking process is easy, but the UI can be improved.",
            status: "pending",
            date: "2025-01-14"
        },
    ];

    let filteredFeedbacks = dummyFeedbacks;

    if (course) {
        filteredFeedbacks = filteredFeedbacks.filter(f => f.fieldOfStudy === course);
    }

    if (date) {
        filteredFeedbacks = filteredFeedbacks.filter(f => f.date === date);
    }

    if (status) {
        filteredFeedbacks = filteredFeedbacks.filter(f => f.status === status);
    }

    populateFeedbackCards(filteredFeedbacks);
    updateStats(filteredFeedbacks);
};
