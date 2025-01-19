document.addEventListener('DOMContentLoaded', () => {
    const feedbackEndpoint = 'http://127.0.0.1:8000/feedback/feedback/';
    const statsEndpoint = 'http://127.0.0.1:8000/feedback/feedback/stats/';
    const reportEndpoint = 'http://127.0.0.1:8000/feedback/report/';

    const fetchFeedbackData = async (filters = {}) => {
        try {
            const params = new URLSearchParams(filters).toString();
            const url = params ? `${feedbackEndpoint}?${params}` : feedbackEndpoint;

            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();
            renderFeedbackCards(data);
        } catch (error) {
            console.error('Error fetching feedback data:', error);
            displayErrorMessage();
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch(statsEndpoint);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const stats = await response.json();
            updateStats(stats);
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    };

    const renderFeedbackCards = (data) => {
        const container = document.getElementById('feedback-cards-container');
        container.innerHTML = ''; // Clear existing content
    
        if (!data || data.length === 0) {
            container.innerHTML = '<p>No feedback available.</p>';
            return;
        }
    
        data.forEach((feedback) => {
            const card = document.createElement('div');
            card.classList.add('feedback-card');
            card.innerHTML = `
                <div class="feedback-content">
                    <p class="feedback-message">${feedback.content}</p>
                </div>
                <div class="feedback-details">
                    <p><strong>User:</strong> ${feedback.full_name || 'Anonymous User'}</p>
                    <p><strong>Room:</strong> ${feedback.room || 'N/A'}</p>
                    <p><strong>Rating:</strong> ${feedback.rating}</p>
                    <p><strong>Sentiment:</strong> ${feedback.sentiment || 'Not Analyzed'}</p>
                    ${
                        feedback.admin_response
                            ? '<p><strong>Status:</strong> Reviewed</p>'
                            : `<button class="review-btn" data-id="${feedback.id}">Mark as Reviewed</button>`
                    }
                </div>
            `;
            container.appendChild(card);
        });
    
        // Add event listeners for the "Mark as Reviewed" buttons
        const reviewButtons = document.querySelectorAll('.review-btn');
        reviewButtons.forEach((button) =>
            button.addEventListener('click', () => markFeedbackAsReviewed(button.dataset.id))
        );
    };    

    const updateStats = (stats) => {
        document.getElementById('total-feedback').textContent = stats.total_feedback || 0;
        document.getElementById('pending-review').textContent = stats.pending_review || 0;
        document.getElementById('reviewed').textContent = stats.reviewed || 0;
    };

    const displayErrorMessage = () => {
        const errorMessage = document.getElementById('feedback-error-message');
        errorMessage.classList.remove('hidden');
    };

    const markFeedbackAsReviewed = async (id) => {
        try {
            const response = await fetch(`${feedbackEndpoint}${id}/mark_reviewed/`, { method: 'POST' });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            fetchFeedbackData(); // Refresh the feedback list
            fetchStats(); // Update stats
        } catch (error) {
            console.error('Error marking feedback as reviewed:', error);
        }
    };

    const handleFilterSubmit = (event) => {
        event.preventDefault();

        // Gather filter values
        const room = document.getElementById('room-filter').value;
        const sentiment = document.getElementById('sentiment-filter').value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        const filters = {};
        if (room) filters.room = room;
        if (sentiment) filters.sentiment = sentiment;
        if (startDate) filters.start_date = startDate;
        if (endDate) filters.end_date = endDate;

        fetchFeedbackData(filters);
    };

    const handleDownloadReport = async () => {
        try {
            const response = await fetch(reportEndpoint);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'feedback_report.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error('Error downloading report:', error);
        }
    };

    // Add event listeners
    document.getElementById('filter-form').addEventListener('submit', handleFilterSubmit);
    document.getElementById('refresh-btn').addEventListener('click', () => fetchFeedbackData());
    document.getElementById('download-report-btn').addEventListener('click', handleDownloadReport);

    // Fetch initial data
    fetchFeedbackData();
    fetchStats();
});
