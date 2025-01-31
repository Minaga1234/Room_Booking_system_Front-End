document.addEventListener('DOMContentLoaded', () => {

    // Initialize variables
    const feedbackForm = document.getElementById('feedback-form');
    const feedbackTextarea = document.getElementById('feedback');
    const charCount = document.getElementById('char-count');
    const maxChars = 500;
    let isSubmitting = false;

    // Initialize star rating functionality
    const initializeStarRating = () => {
        const stars = document.querySelectorAll('.star-rating i');
        const ratingInput = document.getElementById('rating');

        stars.forEach(star => {
            star.addEventListener('mouseover', () => {
                const rating = parseInt(star.getAttribute('data-rating'));
                highlightStars(stars, rating);
            });

            star.addEventListener('mouseout', () => {
                const currentRating = parseInt(ratingInput.value) || 0;
                highlightStars(stars, currentRating);
            });

            star.addEventListener('click', () => {
                const rating = parseInt(star.getAttribute('data-rating'));
                ratingInput.value = rating;
                highlightStars(stars, rating);
                star.classList.add('selected');
            });
        });
    };

    // Highlight stars based on rating
    const highlightStars = (stars, rating) => {
        stars.forEach(star => {
            const starRating = parseInt(star.getAttribute('data-rating'));
            if (starRating <= rating) {
                star.classList.remove('far');
                star.classList.add('fas');
                star.classList.add('active');
            } else {
                star.classList.remove('fas');
                star.classList.add('far');
                star.classList.remove('active');
            }
        });
    };

    // Populate room dropdown
    const populateRoomDropdown = async () => {
        const roomDropdown = document.getElementById('room');
        try {
            const response = await fetch('http://127.0.0.1:8000/api/rooms/');
            if (!response.ok) throw new Error(`Error: ${response.statusText}`);

            const rooms = await response.json();
            roomDropdown.innerHTML = `
                <option value="" disabled selected>Select a room</option>
                <option value="">No specific room</option>
            `;

            rooms.forEach(room => {
                const option = document.createElement('option');
                option.value = room.id;
                option.textContent = `${room.name} ${room.location ? `(${room.location})` : ''}`;
                roomDropdown.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching rooms:', error);
            roomDropdown.innerHTML = `
                <option value="" disabled selected>Unable to load rooms</option>
                <option value="">No specific room</option>
            `;
            showError('Failed to load rooms. Please try again later.');
        }
    };

    // Character counter for feedback textarea
    const updateCharCount = () => {
        const currentLength = feedbackTextarea.value.length;
        charCount.textContent = currentLength;

        if (currentLength > maxChars) {
            charCount.style.color = '#e53e3e';
            feedbackTextarea.value = feedbackTextarea.value.substring(0, maxChars);
        } else if (currentLength > maxChars * 0.8) {
            charCount.style.color = '#ed8936';
        } else {
            charCount.style.color = '#718096';
        }
    };

    // Show success modal
    const showSuccess = (message = 'Feedback submitted successfully!') => {
        const modal = document.getElementById('success-modal');
        modal.classList.add('show');
        setTimeout(() => {
            modal.classList.remove('show');
        }, 3000);
    };

    // Show error modal
    const showError = (message = 'Something went wrong. Please try again.') => {
        const modal = document.getElementById('error-modal');
        const errorMessage = modal.querySelector('p');
        errorMessage.textContent = message;
        modal.classList.add('show');
    };

    // Close modal
    window.closeModal = () => {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    };

    // Form submission handler
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isSubmitting) return;

        const rating = document.getElementById('rating').value;
        if (!rating) {
            showError('Please select a rating before submitting.');
            return;
        }

        isSubmitting = true;
        const submitButton = document.getElementById('submit-feedback');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitButton.disabled = true;

        const formData = new FormData(feedbackForm);
        const feedbackData = {
            field_of_study: formData.get('fieldOfStudy'),
            room: formData.get('room') || null,
            content: formData.get('content'),
            rating: parseInt(formData.get('rating'), 10)
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/feedback/feedback/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(feedbackData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit feedback');
            }

            showSuccess();
            feedbackForm.reset();
            document.querySelectorAll('.star-rating i').forEach(star => {
                star.classList.remove('fas', 'active');
                star.classList.add('far');
            });
            updateCharCount();

        } catch (error) {
            console.error('Error:', error);
            showError(error.message);
        } finally {
            isSubmitting = false;
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    };

    // Add event listeners
    feedbackTextarea.addEventListener('input', updateCharCount);
    feedbackForm.addEventListener('submit', handleSubmit);

    // Initialize the form
    const initialize = async () => {
        await populateRoomDropdown();
        initializeStarRating();
        updateCharCount();

        // Add fade-in animation to containers
        document.querySelector('.feedback-container').classList.add('fade-in');
        document.querySelector('.note-container').classList.add('fade-in');
    };

    // Start initialization
    initialize();
});