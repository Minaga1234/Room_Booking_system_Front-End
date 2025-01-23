document.addEventListener('DOMContentLoaded', () => {
  const AUTH_TOKEN = '03ab28a2c76066500ef6b931ada35a38f14557cb'; // Replace with user's token
  const BASE_URL = 'http://127.0.0.1:8000/penalties/penalties/user/';

  let currentPage = 1;

  // Dummy data for penalties
  const dummyPenalties = [
    {
      id: 1,
      reason: 'Late return',
      status: 'Active',
      booking: 'Booking #123',
      created_at: '2023-06-01T10:00:00Z',
    },
    {
      id: 2,
      reason: 'No-show',
      status: 'Paid',
      booking: 'Booking #456',
      created_at: '2023-05-15T14:30:00Z',
    },
    {
      id: 3,
      reason: 'Cancellation',
      status: 'Unpaid',
      booking: 'Booking #789',
      created_at: '2023-04-20T09:15:00Z',
    },
  ];

  const loadPenalties = (page = 1) => {
    // Simulate API response with dummy data
    const response = {
      results: dummyPenalties,
      previous: null,
      next: null,
    };

    const penaltyHistory = document.getElementById('user-penalty-history');
    const paginationControls = document.querySelector('.pagination-controls');

    // Update Active Penalties Count
    const activePenaltiesCount = response.results.filter(
      (penalty) => penalty.status === 'Active' || penalty.status === 'Unpaid'
    ).length;
    document.querySelector('.penalty-card h2').textContent = activePenaltiesCount;

    // Clear existing rows and pagination
    penaltyHistory.innerHTML = '';
    paginationControls.innerHTML = '';

    // Populate penalty history table
    if (response.results && response.results.length > 0) {
      response.results.forEach((penalty) => {
        const row = `
          <tr>
            <td>${new Date(penalty.created_at).toLocaleDateString()}</td>
            <td>${penalty.reason}</td>
            <td>${penalty.status}</td>
            <td>${penalty.booking || 'N/A'}</td>
          </tr>
        `;
        penaltyHistory.insertAdjacentHTML('beforeend', row);
      });
    } else {
      penaltyHistory.innerHTML = `<tr class="no-penalties"><td colspan="4">No penalties found.</td></tr>`;
    }

    // Handle pagination
    if (response.previous || response.next) {
      if (response.previous) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.addEventListener('click', () => {
          currentPage--;
          loadPenalties(currentPage);
        });
        paginationControls.appendChild(prevButton);
      }

      const pageIndicator = document.createElement('span');
      pageIndicator.textContent = `Page ${currentPage}`;
      paginationControls.appendChild(pageIndicator);

      if (response.next) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.addEventListener('click', () => {
          currentPage++;
          loadPenalties(currentPage);
        });
        paginationControls.appendChild(nextButton);
      }
    }
  };

  // Show Modal for Request Review
  const showReviewModal = () => {
    // Filter active penalties from dummy data
    const activePenalties = dummyPenalties.filter(
      (penalty) => penalty.status === 'Active' || penalty.status === 'Unpaid'
    );

    if (activePenalties.length === 0) {
      alert('No active penalties available for review.');
      return;
    }

    // Populate the modal with active penalties
    const modalContent = document.getElementById('review-modal-content');
    modalContent.innerHTML = ''; // Clear previous entries
    activePenalties.forEach((penalty) => {
      const penaltyItem = `
        <div class="penalty-item">
          <p>Reason: ${penalty.reason}</p>
          <p>Booking: ${penalty.booking || 'N/A'}</p>
          <button class="submit-review-btn" data-id="${penalty.id}">Request Review</button>
        </div>
      `;
      modalContent.insertAdjacentHTML('beforeend', penaltyItem);
    });

    // Show the modal
    document.getElementById('review-modal').style.display = 'block';

    // Attach event listeners to dynamically created buttons
    document.querySelectorAll('.submit-review-btn').forEach((button) => {
      button.addEventListener('click', (event) => {
        const penaltyId = event.target.dataset.id;
        requestReview(penaltyId);
      });
    });
  };

  const requestReview = (penaltyId) => {
    // Simulate review request with dummy data
    alert(`Review requested for penalty with ID: ${penaltyId}`);
    document.getElementById('review-modal').style.display = 'none'; // Hide modal
  };

  // Attach event listener to show review modal
  const reviewButton = document.querySelector('.request-review-btn');
  if (reviewButton) {
    reviewButton.addEventListener('click', showReviewModal);
  }

  // Attach event listener to close modal
  const closeModalButton = document.getElementById('close-review-modal');
  if (closeModalButton) {
    closeModalButton.addEventListener('click', () => {
      document.getElementById('review-modal').style.display = 'none';
    });
  }

  // Initial load
  loadPenalties();
});