document.addEventListener('DOMContentLoaded', function () {
    var calendarEl = document.getElementById('calendar');

    // Initialize the calendar
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: [], // Will fetch events dynamically
        eventClick: function (info) {
            if (confirm(`Do you want to cancel the booking for ${info.event.title}?`)) {
                info.event.remove(); // Remove the event
                alert('Booking cancelled.');
            }
        }
    });

    // Fetch bookings from Django backend
    fetch('/api/bookings/') // Replace with your Django API endpoint
        .then(response => response.json())
        .then(data => {
            calendar.addEventSource(data); // Add fetched bookings to calendar
        })
        .catch(error => console.error('Error fetching events:', error));

    calendar.render(); // Render the calendar
});
