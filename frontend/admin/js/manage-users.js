document.addEventListener('DOMContentLoaded', () => {
    const BASE_URL = 'http://127.0.0.1:8000/api/users/';

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

    const searchBar = document.querySelector('.search-bar');
    const addUserButton = document.getElementById('add-user');
    const applyFiltersButton = document.getElementById('apply-filters');

    const editModal = document.getElementById('edit-modal');
    const addUserModal = document.getElementById('add-user-modal');
    const closeModalButtons = document.querySelectorAll('.close-modal');

    const usernameField = document.getElementById('username');
    const emailField = document.getElementById('email');
    const roleField = document.getElementById('role');
    const phoneField = document.getElementById('phone');
    const statusField = document.getElementById('status');

    const newUserForm = document.getElementById('add-user-form');
    const editUserForm = document.getElementById('edit-user-form');

    searchBar.addEventListener('input', async (event) => {
        const query = event.target.value.trim();
        await renderUserTable({ search: query });
    });

    async function fetchUsers(filters = {}) {
        const queryString = new URLSearchParams(filters).toString();
        const headers = await getAuthHeaders();

        const response = await fetch(`${BASE_URL}?${queryString}`, { headers });
        if (!response.ok) {
            console.error(`Error fetching users: ${response.status} ${response.statusText}`);
            return [];
        }

        return response.json();
    }

    async function renderUserTable(filters = {}) {
        const roleFilter = filters.role || document.getElementById('role-filter').value || '';
        const statusFilter = filters.status || document.getElementById('status-filter').value || '';
        const searchQuery = filters.search || '';
    
        const queryParams = {
            role: roleFilter,
            status: statusFilter,
            search: searchQuery,
            timestamp: new Date().getTime(), // Cache-busting parameter
        };
    
        console.log('Fetching updated users with filters:', queryParams);
    
        const users = await fetchUsers(queryParams);
    
        console.log('Fetched users:', users);
    
        const tbody = document.querySelector('.user-table tbody');
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
    
            row.querySelector('.edit-btn').addEventListener('click', () => handleEditButtonClick(user));
            row.querySelector('.deactivate-btn').addEventListener('click', () => handleDeactivateButtonClick(user.id));
        });
    }
    
        
    

    applyFiltersButton.addEventListener('click', async () => {
        const roleFilter = document.getElementById('role-filter').value || '';
        const statusFilter = document.getElementById('status-filter').value || '';
        console.log('Sending filters:', { role: roleFilter, status: statusFilter });
    
        await renderUserTable({ role: roleFilter, status: statusFilter });
    });
    

    async function addUser(user) {
        const payload = {
            email: user.email,
            role: user.role,
            phone_number: user.phone,
            password: user.password,
        };

        const headers = await getAuthHeaders();
        const response = await fetch(`${BASE_URL}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const data = await response.json();
            console.error('Failed to add user:', data);
            return { error: data };
        }

        return response.json();
    }

    async function editUser(userId, updatedUser) {
        const payload = {
            role: updatedUser.role,
            phone_number: updatedUser.phone || null,
            is_active: updatedUser.is_active,
        };

        const headers = await getAuthHeaders();
        const response = await fetch(`${BASE_URL}${userId}/`, {
            method: 'PATCH', // Adjusted to allow partial updates
            headers,
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const data = await response.json();
            console.error('Failed to update user:', data);
            return { error: data };
        }

        return response.json();
    }

    async function deactivateUser(userId) {
        const headers = await getAuthHeaders();
        const response = await fetch(`${BASE_URL}${userId}/deactivate/`, {
            method: 'PATCH',
            headers,
        });

        return response.json();
    }

    
    function handleEditButtonClick(user) {
        usernameField.value = user.username;
        usernameField.dataset.id = user.id;
        emailField.value = user.email;
        roleField.value = user.role;
        phoneField.value = user.phone_number || '';
        statusField.value = user.is_active ? 'active' : 'inactive';
        openModal(editModal);
    }

    async function handleDeactivateButtonClick(userId) {
        if (confirm('Are you sure you want to deactivate this user?')) {
            const result = await deactivateUser(userId);
            if (result.message) {
                alert(result.message);
                renderUserTable();
            } else {
                alert('Failed to deactivate user.');
            }
        }
    }

    newUserForm.addEventListener('submit', async (event) => {
        event.preventDefault();
    
        const email = document.getElementById('new-email').value;
        const phone = document.getElementById('new-phone').value;
        const role = document.getElementById('new-role').value;
        const username = email.split('@')[0];
        const password = Math.random().toString(36).slice(-8);
    
        const newUser = { username, email, role, phone, password };
        const result = await addUser(newUser);
    
        if (result.id) {
            alert(`User added successfully! Username: ${newUser.username}, Password: ${newUser.password}`);
            closeModal(addUserModal);
            await renderUserTable({}); // Fetch all users without filters
        } else {
            alert('Failed to add user: ' + JSON.stringify(result));
        }
    });
    
    editUserForm.addEventListener('submit', async (event) => {
        event.preventDefault();
    
        const userId = usernameField.dataset.id;
        const updatedUser = {
            role: roleField.value,
            phone: phoneField.value,
            is_active: statusField.value === 'active',
        };
    
        const result = await editUser(userId, updatedUser);
    
        if (result && !result.error) {
            alert('User updated successfully!');
            closeModal(editModal);
            await renderUserTable({}); // Fetch all users without filters
        } else {
            alert('Failed to update user: ' + JSON.stringify(result));
        }
    });
    

    addUserButton.addEventListener('click', () => openModal(addUserModal));
    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => closeModal(button.closest('.modal')));
    });

    renderUserTable();

    function openModal(modal) {
        modal.classList.remove('hidden');
    }

    function closeModal(modal) {
        modal.classList.add('hidden');
    }
});