// manage-users.js

document.addEventListener('DOMContentLoaded', () => {
    const BASE_URL = 'http://127.0.0.1:8000/api/users/'; // Backend API base URL
    const AUTH_HEADERS = {
        'Authorization': 'Token 1302a014c8ed6564eafe2c6c547ebb4c42f9c873', // Use 'Token' prefix for Django REST framework
        'Content-Type': 'application/json',
    };    

    const searchBar = document.querySelector('.search-bar'); // Search bar element

    searchBar.addEventListener('input', async (event) => {
        const query = event.target.value.trim(); // Get the search input value
        await renderUserTable({ search: query }); // Call renderUserTable with the search query
    });


    const editButtons = document.querySelectorAll('.edit-btn');
    const deactivateButtons = document.querySelectorAll('.deactivate-btn');
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

    async function fetchUsers(filters = {}) {
        const queryString = new URLSearchParams(filters).toString(); // Convert filters to query string
        console.log(`Fetching users with query: ${queryString}`); // Debug: Query string
    
        const response = await fetch(`${BASE_URL}?${queryString}`, {
            headers: AUTH_HEADERS,
        });
    
        if (!response.ok) {
            console.error(`Error fetching users: ${response.status} ${response.statusText}`);
            return [];
        }
    
        const data = await response.json();
        console.log('Fetched users:', data); // Debug: API response
        return data;
    }
    
    
    

    async function addUser(user) {
        const payload = {
            username: user.username,
            email: user.email,
            role: user.role,
            phone_number: user.phone, // Correct the key to match the backend
            password: user.password,
        };
    
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: AUTH_HEADERS,
            body: JSON.stringify(payload),
        });
        return response.json();
    }
    

    async function editUser(userId, updatedUser) {
        const payload = {
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            phone_number: updatedUser.phone || null,
            is_active: updatedUser.is_active,
        };
    
        try {
            const response = await fetch(`${BASE_URL}${userId}/`, {
                method: 'PUT',
                headers: AUTH_HEADERS,
                body: JSON.stringify(payload), // Exclude password field unless updating it
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to update user:', errorData);
                throw new Error(errorData.detail || 'Error. ' + response.status);
            }
    
            return response.json();
        } catch (error) {
            console.error('Failed to update user:', error.message);
            return { error: error.message };
        }
    }
    
    
    
    editUserForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const userId = usernameField.dataset.id; // Retrieve the user ID
        if (!userId) {
            console.error('User ID is undefined');
            alert('Failed to update user: User ID is missing.');
            return;
        }
    
        const updatedUser = {
            username: usernameField.value,
            email: emailField.value,
            role: roleField.value,
            phone: phoneField.value,
            is_active: statusField.value === 'active',
        };
    
        console.log("Payload being sent:", updatedUser);
    
        const result = await editUser(userId, updatedUser);
    
        if (result.error) {
            alert('Failed to update user: ' + JSON.stringify(result));
        } else {
            alert('User updated successfully!');
            closeModal(editModal);
            renderUserTable();
        }
    });
    
    
    
    
    

    async function deactivateUser(userId) {
        const response = await fetch(`${BASE_URL}${userId}/deactivate/`, {
            method: 'PATCH',
            headers: AUTH_HEADERS,
        });
        return response.json();
    }

    async function renderUserTable(filters = {}) {
        const searchQuery = filters.search || ''; // Get search query from filters
        const roleFilter = document.getElementById('role-filter').value;
        const statusFilter = document.getElementById('status-filter').value;
    
        const queryParams = {
            role: roleFilter,
            status: statusFilter,
            search: searchQuery, // Include the search query
        };
    
        console.log('Filters applied:', queryParams); // Debug: Check applied filters
    
        const users = await fetchUsers(queryParams);
    
        if (!Array.isArray(users)) {
            console.error('Unexpected response:', users);
            alert('Failed to fetch users. Please try again.');
            return;
        }
    
        const tbody = document.querySelector('.user-table tbody');
        tbody.innerHTML = '';
    
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.username}</td>
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
    
    
    
    

    async function handleEditButtonClick(user) {
        usernameField.value = user.username; // Populate username
        usernameField.dataset.id = user.id; // Store user ID in a dataset attribute
        emailField.value = user.email; // Populate email
        roleField.value = user.role; // Populate role
        phoneField.value = user.phone_number || ''; // Handle null values for phone
        statusField.value = user.is_active ? 'active' : 'inactive'; // Set status
        usernameField.dataset.email = user.email; // Store the original email in a dataset attribute
        openModal(editModal); // Open the modal for editing
    }
    
    
    

    async function handleDeactivateButtonClick(userId) {
        if (confirm(`Are you sure you want to deactivate this user?`)) {
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
        const newUser = {
            username: document.getElementById('new-username').value,
            email: document.getElementById('new-email').value,
            role: document.getElementById('new-role').value,
            phone: document.getElementById('new-phone').value,
            password: document.getElementById('new-password').value,
        };

        const result = await addUser(newUser);
        if (result.id) {
            alert('User added successfully!');
            closeModal(addUserModal);
            renderUserTable();
        } else {
            alert('Failed to add user: ' + JSON.stringify(result));
        }
    });

    editUserForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const userId = usernameField.dataset.id; // Retrieve the user ID
        const originalEmail = usernameField.dataset.email; // Retrieve original email
    
        const updatedUser = {
            username: usernameField.value, // Include username
            email: emailField.value !== originalEmail ? emailField.value : originalEmail, // Only update if changed
            role: roleField.value, // Include role
            phone: phoneField.value, // Include phone number
            is_active: statusField.value === 'active', // Include status
        };
    
        console.log("Payload being sent:", updatedUser); // Debug: Log the payload being sent
    
        const result = await editUser(userId, updatedUser); // Call the API to update the user
    
        if (result.id) {
            alert('User updated successfully!'); // Success message
            closeModal(editModal); // Close the modal
            renderUserTable(); // Refresh the user table
        } else {
            alert('Failed to update user: ' + JSON.stringify(result)); // Display error message
        }
    });
    
    

    applyFiltersButton.addEventListener('click', renderUserTable);
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
