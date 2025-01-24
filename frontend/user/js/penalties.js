document.addEventListener('DOMContentLoaded', () => {
  const AUTH_TOKEN = '03ab28a2c76066500ef6b931ada35a38f14557cb'; // Replace with user's token
  const BASE_URL = 'http://127.0.0.1:8000/penalties/penalties/user/';

  let currentPage = 1;

  const loadPenalties = (page = 1) => {
    fetch(`${BASE_URL}?page=${page}`, {
      headers: { Authorization: `Token ${AUTH_TOKEN}` },
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch penalties');
        return response.json();
      })
      .then((data) => {
        console.log('Fetched penalties data:', data); // Debugging response

        const penaltyHistory = document.getElementById('user-penalty-history');
        const paginationControls = document.querySelector('.pagination-controls');

        // Update Active Penalties Count
        const activePenaltiesCount = data.results.filter(
          (penalty) => penalty.status === 'Active' || penalty.status === 'unpaid' // Corrected filter condition
        ).length;
        document.querySelector('.penalty-card h2').textContent = activePenaltiesCount;

        // Clear existing rows and pagination
        penaltyHistory.innerHTML = '';
        paginationControls.innerHTML = '';

        // Populate penalty history table
        if (data.results && data.results.length > 0) {
          data.results.forEach((penalty) => {
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
          penaltyHistory.innerHTML = `<tr><td colspan="4">No penalties found.</td></tr>`;
        }

        // Handle pagination
        if (data.previous || data.next) {
          if (data.previous) {
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

          if (data.next) {
            const nextButton = document.createElement('button');
            nextButton.textContent = 'Next';
            nextButton.addEventListener('click', () => {
              currentPage++;
              loadPenalties(currentPage);
            });
            paginationControls.appendChild(nextButton);
          }
        }
      })
      .catch((error) => {
        console.error('Error fetching user penalties:', error);
        alert('Failed to load penalties. Please try again later.');
      });
  };

  // Show Modal for Request Review
  const showReviewModal = () => {
    fetch(BASE_URL, {
      headers: { Authorization: `Token ${AUTH_TOKEN}` },
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch active penalties');
        return response.json();
      })
      .then((data) => {
        // Filter active penalties
        const activePenalties = data.results.filter(
          (penalty) => penalty.status === 'Active' || penalty.status === 'unpaid'
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
      })
      .catch((error) => {
        console.error('Error fetching active penalties:', error);
        alert('Failed to load active penalties. Please try again later.');
      });
  };

  const requestReview = (penaltyId) => {
    fetch(`${BASE_URL.split('/user/')[0]}/${penaltyId}/request-review/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${AUTH_TOKEN}`,
      },
      body: JSON.stringify({}),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Review request failed');
        return response.json();
      })
      .then((data) => {
        alert(data.message || 'Review request submitted successfully!');
        document.getElementById('review-modal').style.display = 'none'; // Hide modal
      })
      .catch((error) => {
        console.error('Error requesting review:', error);
        alert('Failed to request review. Please try again.');
      });
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
