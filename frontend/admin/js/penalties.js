document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = 'http://127.0.0.1:8000/penalties/';
  const AUTH_TOKEN = '19f8eb05c52c9e98834d2d1c2dfe8dfa4c386a02';
  let currentPage = 1;
  const PAGE_SIZE = 4; // Ensure this matches your backend page size

  const applyFilters = () => {
      const status = document.getElementById('status-filter').value; // Get selected status
      console.log('Selected Status:', status); // Debug log
      const startDate = document.getElementById('start-date-filter').value || '';
      const endDate = document.getElementById('end-date-filter').value || '';

      console.log('Applying filters:', { status, startDate, endDate });

      // Reset pagination state
      currentPage = 1;

      // Pass the filters to loadPenalties
      loadPenalties(currentPage, status, startDate, endDate);
  };

  const loadPenalties = async (page = 1, status = 'all', startDate = '', endDate = '') => {
      try {
          const queryParams = new URLSearchParams();
          queryParams.append('page', page);
          if (status && status !== 'all') queryParams.append('status', status); // Only include status if not "all"
          if (startDate) queryParams.append('start_date', startDate);
          if (endDate) queryParams.append('end_date', endDate);

          console.log('Fetching penalties with params:', queryParams.toString());

          const response = await fetch(`${API_BASE}?${queryParams.toString()}`, {
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Token ${AUTH_TOKEN}`,
              },
          });

          if (!response.ok) throw new Error(`Error fetching penalties: ${response.statusText}`);
          const penalties = await response.json();
          console.log('Fetched penalties:', penalties);

          renderPenalties(penalties.results || [], status); // Pass the status filter for re-validation
          const totalPages = Math.ceil(penalties.count / PAGE_SIZE) || 1;
          updatePaginationControls(penalties, page, totalPages);
      } catch (error) {
          console.error('Failed to load penalties:', error);
      }
  };

  const updatePaginationControls = (penalties, page, totalPages) => {
      currentPage = page; // Update current page correctly

      const paginationContainer = document.querySelector('.pagination');

      if (!paginationContainer) {
          console.error('Pagination container not found in the DOM.');
          return;
      }

      paginationContainer.innerHTML = ''; // Clear existing controls

      // Previous Button
      const prevButton = document.createElement('button');
      prevButton.textContent = 'Previous';
      prevButton.disabled = !penalties.previous; // Disable if no previous page
      prevButton.addEventListener('click', () => {
          if (penalties.previous) {
              loadPenalties(currentPage - 1);
          }
      });
      paginationContainer.appendChild(prevButton);

      // Page Indicator
      const pageIndicator = document.createElement('span');
      pageIndicator.textContent = `Page ${currentPage} of ${totalPages || 1}`;
      paginationContainer.appendChild(pageIndicator);

      // Next Button
      const nextButton = document.createElement('button');
      nextButton.textContent = 'Next';
      nextButton.disabled = !penalties.next; // Disable if no next page
      nextButton.addEventListener('click', () => {
          if (penalties.next) {
              loadPenalties(currentPage + 1);
          }
      });
      paginationContainer.appendChild(nextButton);
  };

  const renderPenalties = (penalties, statusFilter) => {
      const tableBody = document.getElementById('penalty-table-body');
      tableBody.innerHTML = '';

      if (penalties.length === 0) {
          tableBody.innerHTML = '<tr><td colspan="7">No penalties found.</td></tr>';
          return;
      }

      // Render the penalties
      penalties.forEach((penalty) => {
          const row = `
              <tr>
                  <td>${penalty.id}</td>
                  <td>${penalty.user}</td>
                  <td>${penalty.booking}</td>
                  <td>${penalty.reason}</td>
                  <td>${new Date(penalty.created_at).toLocaleDateString()}</td>
                  <td>${penalty.status}</td>
                  <td>
                      ${
                          penalty.status !== 'paid'
                              ? `<button class="resolve-btn" data-id="${penalty.id}">Resolve</button>`
                              : '<span class="resolved">Paid</span>'
                      }
                  </td>
              </tr>
          `;
          tableBody.insertAdjacentHTML('beforeend', row);
      });

      attachResolveEvent();
  };

  const attachResolveEvent = () => {
      document.querySelectorAll('.resolve-btn').forEach((button) => {
          button.addEventListener('click', async (event) => {
              const penaltyId = event.target.dataset.id;
              try {
                  const response = await fetch(`${API_BASE}${penaltyId}/resolve/`, {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Token ${AUTH_TOKEN}`,
                      },
                  });

                  if (!response.ok) throw new Error('Error resolving penalty');

                  alert('Penalty resolved successfully.');
                  loadPenalties(currentPage);
              } catch (error) {
                  console.error('Failed to resolve penalty:', error);
                  alert('Failed to resolve penalty. Check console for details.');
              }
          });
      });
  };

  document.getElementById('apply-filters').addEventListener('click', applyFilters);


  
    const loadPenaltiesOverview = async () => {
      try {
        const response = await fetch(`${API_BASE}overview/`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${AUTH_TOKEN}`,
          },
        });
  
        if (!response.ok) throw new Error(`Error fetching overview: ${response.statusText}`);
  
        const overview = await response.json();
        document.querySelector('.active-penalties').textContent = overview.active_penalties || 0;
        document.querySelector('.new-penalties').textContent = overview.new_penalties || 0;
        document.querySelector('.resolved-penalties').textContent = overview.resolved_penalties || 0;
        document.querySelector('.repeat-offenders').textContent = overview.repeat_offenders || 0;
      } catch (error) {
        console.error('Failed to load penalties overview:', error);
      }
    };
    
    document.getElementById('download-report').addEventListener('click', async () => {
        try {
            const response = await fetch(`${API_BASE}download-report/`, {
                headers: {
                    'Authorization': `Token ${AUTH_TOKEN}`,
                },
            });
    
            if (!response.ok) throw new Error('Failed to download report');
    
            // Convert the response into a Blob
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
    
            // Create an anchor element to trigger the download
            const a = document.createElement('a');
            a.href = url;
            a.download = 'penalties_report.csv'; // Name of the downloaded file
            document.body.appendChild(a);
            a.click(); // Simulate a click to start the download
            document.body.removeChild(a); // Remove the anchor element after the click
            window.URL.revokeObjectURL(url); // Release the blob URL
        } catch (error) {
            console.error('Error downloading report:', error);
            alert('Failed to download the report. Please try again.');
        }
    });
    
  
    loadPenaltiesOverview();
    loadPenalties(currentPage);
  });
  
  