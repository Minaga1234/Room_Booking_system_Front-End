document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = 'http://127.0.0.1:8000/penalties/';
    let currentPage = 1;
    const PAGE_SIZE = 4;

    const refreshAccessToken = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) throw new Error('No refresh token found. Please log in again.');

            const response = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: refreshToken }),
            });

            if (!response.ok) throw new Error('Failed to refresh token.');

            const data = await response.json();
            localStorage.setItem('accessToken', data.access);
            return data.access;
        } catch (error) {
            console.error('Error refreshing token:', error);
            alert('Session expired. Please log in again.');
            window.location.href = '/frontend/user/login.html';
        }
    };

    const getAuthHeaders = async () => {
        let accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            accessToken = await refreshAccessToken();
        }

        return {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        };
    };

    const applyFilters = () => {
        const status = document.getElementById('status-filter').value;
        const startDate = document.getElementById('start-date-filter').value || '';
        const endDate = document.getElementById('end-date-filter').value || '';

        currentPage = 1;
        loadPenalties(currentPage, status, startDate, endDate);
    };

    const loadPenalties = async (page = 1, status = 'all', startDate = '', endDate = '') => {
        try {
            const queryParams = new URLSearchParams({
                page,
                status: status !== 'all' ? status : '',
                start_date: startDate,
                end_date: endDate,
            }).toString();

            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE}?${queryParams}`, { headers });

            if (!response.ok) throw new Error(`Error fetching penalties: ${response.statusText}`);

            const penalties = await response.json();
            renderPenalties(penalties.results || [], status);
            const totalPages = Math.ceil(penalties.count / PAGE_SIZE) || 1;
            updatePaginationControls(penalties, page, totalPages);
        } catch (error) {
            console.error('Failed to load penalties:', error);
        }
    };

    const updatePaginationControls = (penalties, page, totalPages) => {
        currentPage = page;
        const paginationContainer = document.querySelector('.pagination');

        if (!paginationContainer) {
            console.error('Pagination container not found.');
            return;
        }

        paginationContainer.innerHTML = '';

        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.disabled = !penalties.previous;
        prevButton.addEventListener('click', () => {
            if (penalties.previous) {
                loadPenalties(currentPage - 1);
            }
        });
        paginationContainer.appendChild(prevButton);

        const pageIndicator = document.createElement('span');
        pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
        paginationContainer.appendChild(pageIndicator);

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.disabled = !penalties.next;
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

        penalties.forEach((penalty) => {
            if (statusFilter !== 'all' && penalty.status !== statusFilter) return;

            const row = `
                <tr>
                    <td>${penalty.id}</td>
                    <td>${penalty.user}</td>
                    <td>${penalty.booking}</td>
                    <td>${penalty.reason}</td>
                    <td>${new Date(penalty.created_at).toLocaleDateString()}</td>
                    <td>${penalty.status}</td>
                    <td>
                        ${penalty.status === 'review_requested' ? 
                            `<button class="approve-review-btn" data-id="${penalty.id}">Approve</button>
                             <button class="reject-review-btn" data-id="${penalty.id}">Reject</button>` :
                            penalty.status !== 'paid' ?
                            `<button class="resolve-btn" data-id="${penalty.id}">Resolve</button>` :
                            '<span class="resolved">Paid</span>'
                        }
                    </td>
                </tr>
            `;
            tableBody.insertAdjacentHTML('beforeend', row);
        });

        attachResolveEvent();
        attachReviewButtons();
    };

    const attachResolveEvent = () => {
        document.querySelectorAll('.resolve-btn').forEach((button) => {
            button.addEventListener('click', async (event) => {
                const penaltyId = event.target.dataset.id;
                try {
                    const headers = await getAuthHeaders();
                    const response = await fetch(`${API_BASE}${penaltyId}/resolve/`, {
                        method: 'POST',
                        headers,
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

    const attachReviewButtons = () => {
        document.querySelectorAll('.approve-review-btn').forEach((button) => {
            button.addEventListener('click', async (event) => {
                const penaltyId = event.target.dataset.id;
                try {
                    const headers = await getAuthHeaders();
                    const response = await fetch(`${API_BASE}${penaltyId}/approve_review/`, {
                        method: 'POST',
                        headers,
                    });

                    if (!response.ok) throw new Error('Error approving review');

                    alert('Review approved successfully.');
                    loadPenalties(currentPage);
                } catch (error) {
                    console.error('Failed to approve review:', error);
                    alert('Failed to approve review. Check console for details.');
                }
            });
        });

        document.querySelectorAll('.reject-review-btn').forEach((button) => {
            button.addEventListener('click', async (event) => {
                const penaltyId = event.target.dataset.id;
                try {
                    const headers = await getAuthHeaders();
                    const response = await fetch(`${API_BASE}${penaltyId}/reject_review/`, {
                        method: 'POST',
                        headers,
                    });

                    if (!response.ok) throw new Error('Error rejecting review');

                    alert('Review rejected successfully.');
                    loadPenalties(currentPage);
                } catch (error) {
                    console.error('Failed to reject review:', error);
                    alert('Failed to reject review. Check console for details.');
                }
            });
        });
    };

    const loadPenaltiesOverview = async () => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE}overview/`, { headers });

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

    document.getElementById('apply-filters').addEventListener('click', applyFilters);

    document.getElementById('download-report').addEventListener('click', async () => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE}download-report/`, { headers });

            if (!response.ok) throw new Error('Failed to download report');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'penalties_report.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading report:', error);
            alert('Failed to download the report. Please try again.');
        }
    });

    loadPenaltiesOverview();
    loadPenalties(currentPage);
});
