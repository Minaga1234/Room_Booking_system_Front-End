document.addEventListener('DOMContentLoaded', () => {
    const feedbackEndpoint = 'http://127.0.0.1:8000/feedback/feedback/';
    const statsEndpoint = 'http://127.0.0.1:8000/feedback/feedback/stats/';

    // State management
    let currentFilters = {};
    let isLoading = false;

    // DOM Elements
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorMessage = document.getElementById('feedback-error-message');
    const noResultsMessage = document.getElementById('no-results-message');
    const filterContainer = document.getElementById('filter-container');
    const filterToggleBtn = document.getElementById('filter-toggle-btn');
    const filterForm = document.getElementById('filter-form');
    const retryBtn = document.getElementById('retry-btn');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    const refreshBtn = document.getElementById('refresh-btn');

    const fetchFeedbackData = async (filters = {}) => {
        if (isLoading) return;

        setLoading(true);
        showError(false);
        showNoResults(false);

        try {
            const params = new URLSearchParams(filters).toString();
            const url = params ? `${feedbackEndpoint}?${params}` : feedbackEndpoint;

            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();
            if (data.length === 0) {
                showNoResults(true);
            } else {
                renderFeedbackCards(data);
            }
        } catch (error) {
            console.error('Error fetching feedback data:', error);
            showError(true);
        } finally {
            setLoading(false);
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

    const setLoading = (loading) => {
        isLoading = loading;
        loadingSpinner.classList.toggle('hidden', !loading);
        if (loading) {
            document.querySelectorAll('.stat-loading').forEach(loader => {
                loader.style.display = 'block';
            });
        } else {
            document.querySelectorAll('.stat-loading').forEach(loader => {
                loader.style.display = 'none';
            });
        }
    };

    const showError = (show) => {
        errorMessage.classList.toggle('hidden', !show);
        if (show) {
            loadingSpinner.classList.add('hidden');
            noResultsMessage.classList.add('hidden');
        }
    };

    const showNoResults = (show) => {
        noResultsMessage.classList.toggle('hidden', !show);
        if (show) {
            loadingSpinner.classList.add('hidden');
            errorMessage.classList.add('hidden');
        }
    };

    const renderFeedbackCards = (data) => {
        const container = document.getElementById('feedback-cards-container');
        container.innerHTML = '';

        data.forEach((feedback) => {
            const card = document.createElement('div');
            card.classList.add('feedback-card');

            const sentimentClass = `sentiment-${feedback.sentiment}`;

            card.innerHTML = `
                <div class="feedback-content">
                    <p class="feedback-message"><strong>Feedback:</strong> ${feedback.content}</p>
                </div>
                <div class="feedback-details">
                    <p><strong>User:</strong> ${feedback.full_name || 'Anonymous User'}</p>
                    <p><strong>Room:</strong> ${feedback.room || 'N/A'}</p>
                    <p><strong>Rating:</strong> ${'★'.repeat(feedback.rating)}${'☆'.repeat(5 - feedback.rating)}</p>
                    <p><strong>Sentiment:</strong> <span class="${sentimentClass}">${feedback.sentiment || 'Not Analyzed'}</span></p>
                    ${feedback.admin_response
                    ? `<p><strong>Status:</strong> <span class="status-reviewed">Reviewed</span></p>
                           <p><strong>Response:</strong> ${feedback.admin_response}</p>`
                    : `<button class="review-btn" data-id="${feedback.id}">Mark as Reviewed</button>`}
                </div>
            `;
            container.appendChild(card);
        });

        document.querySelectorAll('.review-btn').forEach((button) =>
            button.addEventListener('click', () => markFeedbackAsReviewed(button.dataset.id))
        );
    };

    const updateStats = (stats) => {
        document.getElementById('total-feedback').textContent = stats.total_feedback || 0;
        document.getElementById('pending-review').textContent = stats.pending_review || 0;
        document.getElementById('reviewed').textContent = stats.reviewed || 0;
    };

    const markFeedbackAsReviewed = async (id) => {
        try {
            const response = await fetch(`${feedbackEndpoint}${id}/mark_reviewed/`, { method: 'POST' });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            fetchFeedbackData(currentFilters);
            fetchStats();
        } catch (error) {
            console.error('Error marking feedback as reviewed:', error);
        }
    };

    filterToggleBtn.addEventListener('click', () => {
        filterContainer.classList.toggle('show');
        filterToggleBtn.classList.toggle('active');
    });

    filterForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(filterForm);
        currentFilters = Object.fromEntries(formData.entries());

        Object.keys(currentFilters).forEach(key => {
            if (!currentFilters[key]) delete currentFilters[key];
        });

        fetchFeedbackData(currentFilters);
    });

    filterForm.addEventListener('reset', () => {
        setTimeout(() => {
            currentFilters = {};
            fetchFeedbackData();
        }, 0);
    });

    retryBtn.addEventListener('click', () => fetchFeedbackData(currentFilters));
    clearFiltersBtn.addEventListener('click', () => filterForm.reset());
    refreshBtn.addEventListener('click', () => fetchFeedbackData(currentFilters));

    fetchFeedbackData();
    fetchStats();
});
