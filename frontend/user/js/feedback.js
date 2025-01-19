document.addEventListener('DOMContentLoaded', () => {
    const populateRoomDropdown = async () => {
        try {
            const roomDropdown = document.getElementById('room');
            const response = await fetch('http://127.0.0.1:8000/api/rooms/');
            if (!response.ok) throw new Error(`Error fetching rooms: ${response.statusText}`);
            const rooms = await response.json();
            roomDropdown.innerHTML = '<option value="" disabled selected>Select a room</option>';
            rooms.forEach(room => {
                const option = document.createElement('option');
                option.value = room.id;
                option.textContent = `${room.name} (${room.location || 'No location specified'})`;
                roomDropdown.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching room data:', error);
            document.getElementById('room').innerHTML = '<option value="">No rooms available</option>';
        }
    };

    const submitFeedbackForm = async (event) => {
        event.preventDefault();
        const feedbackForm = document.getElementById('feedback-form');
        const formData = new FormData(feedbackForm);

        const feedbackData = {
            field_of_study: formData.get('fieldOfStudy'),
            room: formData.get('room') || null,
            content: formData.get('content'),
            rating: parseInt(formData.get('rating'), 10),
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/feedback/feedback/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(feedbackData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server Error:', errorData);
                alert('Failed to submit feedback. Please try again.');
            } else {
                alert('Feedback submitted successfully!');
                feedbackForm.reset();
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Failed to submit feedback. Please try again later.');
        }
    };

    const initialize = async () => {
        await populateRoomDropdown();
        document.getElementById('feedback-form').addEventListener('submit', submitFeedbackForm);
    };

    initialize();
});
