document.addEventListener('DOMContentLoaded', () => {
    const feedbackEndpoint = 'http://127.0.0.1:8000/feedback/feedback/';
    const statsEndpoint = 'http://127.0.0.1:8000/feedback/feedback/stats/';

    // Comprehensive dummy data
    const dummyFeedbackData = [
        {
            id: 1,
            content: "Great study room! The lighting is perfect for long study sessions and the chairs are very comfortable. The temperature control works well too.",
            full_name: "John Doe",
            room: "Study Room A",
            rating: 5,
            sentiment: "positive",
            admin_response: "Thank you for your detailed feedback! We're glad you enjoyed the study space."
        },
        {
            id: 2,
            content: "The air conditioning was not working properly today. Made it difficult to concentrate on studying.",
            full_name: "Jane Smith",
            room: "Conference Room B",
            rating: 2,
            sentiment: "negative",
            admin_response: null
        },
        {
            id: 3,
            content: "Average experience. The room was clean but the WiFi connection was a bit spotty.",
            full_name: "Mike Johnson",
            room: "Group Study Room C",
            rating: 3,
            sentiment: "neutral",
            admin_response: null
        },
        {
            id: 4,
            content: "Excellent facilities! The whiteboard and markers were all working perfectly. Would definitely book again.",
            full_name: "Sarah Williams",
            room: "Collaboration Space 1",
            rating: 5,
            sentiment: "positive",
            admin_response: "We're happy to hear you had a great experience!"
        },
        {
            id: 5,
            content: "The room was double booked. Had to wait 30 minutes to get this sorted out.",
            full_name: "Robert Brown",
            room: "Meeting Room 2",
            rating: 1,
            sentiment: "negative",
            admin_response: null
        },
        {
            id: 6,
            content: "The space was okay. Nothing special but served its purpose for our quick team meeting.",
            full_name: "Emily Davis",
            room: "Quick Meet Room",
            rating: 3,
            sentiment: "neutral",
            admin_response: null
        },
        {
            id: 7,
            content: "Love the new monitors! The screen sharing feature made our presentation super smooth.",
            full_name: "",
            room: "Presentation Room A",
            rating: 5,
            sentiment: "positive",
            admin_response: "Thanks for noticing our new equipment!"
        },
        {
            id: 8,
            content: "Tables were a bit wobbly and some chairs need maintenance.",
            full_name: "Daniel Wilson",
            room: "Study Room D",
            rating: 2,
            sentiment: "negative",
            admin_response: null
        }
    ];

    const dummyStats = {
        total_feedback: 8,
        pending_review: 5,
        reviewed: 3
    };

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
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Filter dummy data based on filters
            let filteredData = [...dummyFeedbackData];

            if (filters.room) {
                filteredData = filteredData.filter(item =>
                    item.room.toLowerCase().includes(filters.room.toLowerCase())
                );
            }
            if (filters.sentiment) {
                filteredData = filteredData.filter(item =>
                    item.sentiment === filters.sentiment
                );
            }

            if (filteredData.length === 0) {
                showNoResults(true);
            } else {
                renderFeedbackCards(filteredData);
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
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));
            updateStats(dummyStats);
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    };

    // Toggle loading state
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

    // Error handling
    const showError = (show) => {
        errorMessage.classList.toggle('hidden', !show);
        if (show) {
            loadingSpinner.classList.add('hidden');
            noResultsMessage.classList.add('hidden');
        }
    };

    // No results handling
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

            // Create sentiment class based on feedback sentiment
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
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // Update dummy data
            const feedbackIndex = dummyFeedbackData.findIndex(f => f.id === parseInt(id));
            if (feedbackIndex !== -1) {
                dummyFeedbackData[feedbackIndex].admin_response = "Thank you for your feedback!";
                dummyStats.pending_review--;
                dummyStats.reviewed++;
            }

            await fetchFeedbackData(currentFilters);
            await fetchStats();
        } catch (error) {
            console.error('Error marking feedback as reviewed:', error);
        }
    };

    // Event Listeners
    filterToggleBtn.addEventListener('click', () => {
        filterContainer.classList.toggle('show');
        filterToggleBtn.classList.toggle('active');
    });

    filterForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(filterForm);
        currentFilters = Object.fromEntries(formData.entries());

        // Remove empty filters
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

    // Initialize
    fetchFeedbackData();
    fetchStats();
});