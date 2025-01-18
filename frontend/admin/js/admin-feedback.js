document.addEventListener("DOMContentLoaded", async () => {
    await loadHeaderAndSidebar();
    await fetchAndDisplayFeedback();
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
        const dummyFeedbacks = [
            {
                id: 1,
                fullName: "John Doe",
                fieldOfStudy: "Computer Science",
                room: "Green Room",
                studentId: "CS2023",
                feedback: "The room booking system is very convenient.",
            },
            {
                id: 2,
                fullName: "Jane Smith",
                fieldOfStudy: "Engineering",
                room: "Blue Room",
                studentId: "EN2045",
                feedback: "Would like better availability of rooms in the afternoon.",
            },
            {
                id: 3,
                fullName: "Alice Johnson",
                fieldOfStudy: "Business",
                room: "Study Hall",
                studentId: "BS1012",
                feedback: "The booking process is easy, but the UI can be improved.",
            },
        ];
        populateFeedbackCards(dummyFeedbacks);
    } catch (error) {
        console.error("Error fetching feedback data:", error);
        document.getElementById("feedback-error-message").classList.remove("hidden");
    }
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
            <p><strong>Feedback:</strong> ${feedback.feedback}</p>
            <div class="card-actions">
                <button class="action-btn review-btn" data-id="${feedback.id}">Mark Reviewed</button>
                <button class="action-btn delete-btn" data-id="${feedback.id}">Delete</button>
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
        });
    });

    document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", async (e) => {
            const feedbackId = e.target.dataset.id;
            alert(`Deleting Feedback #${feedbackId}.`);
        });
    });
};
