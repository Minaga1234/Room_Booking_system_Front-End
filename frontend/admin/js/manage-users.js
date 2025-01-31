document.addEventListener('DOMContentLoaded', () => {
    const BASE_URL = 'http://127.0.0.1:8000/api/users/';

    // Utility function to safely add event listeners
    const addEventListenerIfExists = (element, event, handler) => {
        if (element) {
            element.addEventListener(event, handler);
        } else {
            console.warn(`Element not found for event listener: ${event}`);
        }
    };

    // Token Refresh Function
    const refreshAccessToken = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) throw new Error('No refresh token found. Please log in again.');

            const response = await fetch('http://127.0.0.1:8000/api/auth/token/refresh/', {
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

    // Get Auth Headers
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

    // Fetch Users
    const fetchUsers = async (filters = {}) => {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const headers = await getAuthHeaders();
            const response = await fetch(`${BASE_URL}?${queryString}`, { headers });

            if (!response.ok) throw new Error(`Error fetching users: ${response.status} ${response.statusText}`);
            return response.json();
        } catch (error) {
            console.error('Failed to fetch users:', error);
            return [];
        }
    };

    // Render User Table
    const renderUserTable = async (filters = {}) => {
        const roleFilter = filters.role || document.getElementById('role-filter')?.value || '';
        const statusFilter = filters.status || document.getElementById('status-filter')?.value || '';
        const searchQuery = filters.search || '';

        const queryParams = { role: roleFilter, status: statusFilter, search: searchQuery };
        const users = await fetchUsers(queryParams);

        const tbody = document.querySelector('.user-table tbody');
        if (!tbody) {
            console.warn('User table tbody not found.');
            return;
        }

        tbody.innerHTML = '';

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No users found.</td></tr>';
            return;
        }

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.username || 'N/A'}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${user.phone_number || 'N/A'}</td>
                <td>${user.is_active ? 'Active' : 'Inactive'}</td>
                <td>
                    <button class="edit-btn" data-id="${user.id}">Edit</button>
                    <button class="deactivate-btn" data-id="${user.id}">Deactivate</button>
                </td>
            `;
            tbody.appendChild(row);

            row.querySelector('.edit-btn').addEventListener('click', () => openEditModal(user));
            row.querySelector('.deactivate-btn').addEventListener('click', () => handleDeactivateUser(user.id));
        });
    };

    // Add event listener for the search input
document.getElementById('search-users').addEventListener('input', (event) => {
    const searchQuery = event.target.value.trim();
    renderUserTable({ search: searchQuery });
});


    // Add User
    const addUser = async (user) => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(BASE_URL, {
                method: 'POST',
                headers,
                body: JSON.stringify(user),
            });

            if (!response.ok) throw new Error('Failed to add user.');
            return response.json();
        } catch (error) {
            console.error('Failed to add user:', error);
            return { error: error.message };
        }
    };

    // Edit User
    const editUser = async (userId, updatedUser) => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${BASE_URL}${userId}/`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(updatedUser),
            });

            if (!response.ok) throw new Error('Failed to update user.');
            return response.json();
        } catch (error) {
            console.error('Failed to update user:', error);
            return { error: error.message };
        }
    };

    // Deactivate User
    const deactivateUser = async (userId) => {
        try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${BASE_URL}${userId}/deactivate/`, {
                method: 'PATCH',
                headers,
            });

            if (!response.ok) throw new Error('Failed to deactivate user.');
            return response.json();
        } catch (error) {
            console.error('Failed to deactivate user:', error);
        }
    };

    // Handle Edit Modal
    const openEditModal = (user) => {
        const usernameField = document.getElementById('username');
        const emailField = document.getElementById('email');
        const roleField = document.getElementById('role');
        const phoneField = document.getElementById('phone');
        const statusField = document.getElementById('status');

        if (usernameField && emailField && roleField && phoneField && statusField) {
            usernameField.value = user.username;
            emailField.value = user.email;
            roleField.value = user.role;
            phoneField.value = user.phone_number || '';
            statusField.value = user.is_active ? 'active' : 'inactive';
            usernameField.dataset.id = user.id;
        }

        openModal(document.getElementById('edit-modal'));
    };

    // Handle Deactivate User
    const handleDeactivateUser = async (userId) => {
        if (confirm('Are you sure you want to deactivate this user?')) {
            const result = await deactivateUser(userId);
            if (result && result.message) {
                alert(result.message);
                renderUserTable();
            } else {
                alert('Failed to deactivate user.');
            }
        }
    };

    // Add User Modal Submission
    const newUserForm = document.getElementById('add-user-form');
    addEventListenerIfExists(newUserForm, 'submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('new-email')?.value;
        const phone = document.getElementById('new-phone')?.value;
        const role = document.getElementById('new-role')?.value;
        const password = Math.random().toString(36).slice(-8);

        const newUser = { email, phone_number: phone, role, password };
        const result = await addUser(newUser);

        if (result && result.id) {
            alert(`User added successfully! Password: ${password}`);
            closeModal(document.getElementById('add-user-modal'));
            renderUserTable();
        } else {
            alert('Failed to add user.');
        }
    });

    // Edit User Modal Submission
    const editUserForm = document.getElementById('edit-user-form');
    addEventListenerIfExists(editUserForm, 'submit', async (event) => {
        event.preventDefault();

        const userId = document.getElementById('username')?.dataset.id;
        const updatedUser = {
            role: document.getElementById('role')?.value,
            phone_number: document.getElementById('phone')?.value,
            is_active: document.getElementById('status')?.value === 'active',
        };

        const result = await editUser(userId, updatedUser);

        if (result && !result.error) {
            alert('User updated successfully!');
            closeModal(document.getElementById('edit-modal'));
            renderUserTable();
        } else {
            alert('Failed to update user.');
        }
    });

    // Open and Close Modals
    const openModal = (modal) => modal?.classList.remove('hidden');
    const closeModal = (modal) => modal?.classList.add('hidden');

    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => closeModal(button.closest('.modal')));
    });

    // Initialize
    renderUserTable();
    addEventListenerIfExists(document.getElementById('apply-filters'), 'click', async () => {
        const roleFilter = document.getElementById('role-filter')?.value;
        const statusFilter = document.getElementById('status-filter')?.value;
        renderUserTable({ role: roleFilter, status: statusFilter });
    });
    addEventListenerIfExists(document.querySelector('.search-bar'), 'input', (event) => {
        renderUserTable({ search: event.target.value.trim() });
    });
    addEventListenerIfExists(document.getElementById('add-user'), 'click', () => {
        openModal(document.getElementById('add-user-modal'));
    });
});
