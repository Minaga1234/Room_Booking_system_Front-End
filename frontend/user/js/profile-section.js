document.addEventListener("DOMContentLoaded", () => {
    const sidebarItems = document.querySelectorAll(".menu-item");
    const contentContainer = document.getElementById("content-container");
    const hamburgerMenu = document.querySelector(".hamburger-menu");
    const sidebar = document.querySelector(".sidebar");
    const sidebarOverlay = document.querySelector(".sidebar-overlay");
    let currentUser = null;

    // Toggle mobile menu function
    const toggleMobileMenu = () => {
        hamburgerMenu.classList.toggle("active");
        sidebar.classList.toggle("active");
        sidebarOverlay.classList.toggle("active");
        document.body.style.overflow = sidebar.classList.contains("active") ? "hidden" : "";
    };

    // Setup mobile menu handlers
    hamburgerMenu?.addEventListener("click", toggleMobileMenu);
    sidebarOverlay?.addEventListener("click", toggleMobileMenu);

    // Toast notification function
    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    // Form validation function
    const validateForm = (formData) => {
        const errors = [];
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        const ageNum = parseInt(formData.get('age'));

        if (formData.get('username').length < 3) {
            errors.push('Username must be at least 3 characters long');
        }
        if (!phoneRegex.test(formData.get('phone'))) {
            errors.push('Please enter a valid phone number');
        }
        if (ageNum < 13 || ageNum > 120 || isNaN(ageNum)) {
            errors.push('Please enter a valid age between 13 and 120');
        }
        if (formData.get('course').length < 2) {
            errors.push('Please enter a valid course name');
        }

        return errors;
    };

    // Enhanced content rendering with loading states and animations
    const renderContent = async (section = "personal-info") => {
        contentContainer.classList.add('fade-out');

        // Update active state in sidebar
        sidebarItems.forEach((item) => {
            item.classList.toggle("active", item.dataset.section === section);
        });

        // Close mobile menu if open
        if (window.innerWidth <= 768 && sidebar.classList.contains("active")) {
            toggleMobileMenu();
        }

        await new Promise(resolve => setTimeout(resolve, 300));

        switch (section) {
            case "personal-info":
                contentContainer.innerHTML = `
                    <div class="content-header">
                        <h2>Personal Information</h2>
                        <p class="subtitle">View and manage your profile details</p>
                    </div>
                    <div id="user-info" class="loading">
                        <div class="info-row">
                            <div class="info-label">Username</div>
                            <div class="info-value" id="user-username">Loading...</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Course</div>
                            <div class="info-value" id="user-course">Loading...</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Email</div>
                            <div class="info-value" id="user-email">Loading...</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Phone</div>
                            <div class="info-value" id="user-phone">Loading...</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Age</div>
                            <div class="info-value" id="user-age">Loading...</div>
                        </div>
                    </div>
                `;
                fetchPersonalInfo();
                break;

            case "account-settings":
                contentContainer.innerHTML = `
                    <div class="content-header">
                        <h2>Account Settings</h2>
                        <p class="subtitle">Update your account preferences</p>
                    </div>
                    <form id="account-settings-form" class="settings-form">
                        <div class="form-group">
                            <label for="username">Username</label>
                            <input type="text" id="username" name="username" 
                                placeholder="Enter username" required 
                                autocomplete="username" />
                            <span class="form-hint">Minimum 3 characters</span>
                        </div>

                        <div class="form-group">
                            <label for="course">Course</label>
                            <input type="text" id="course" name="course" 
                                placeholder="Enter your course" required />
                        </div>

                        <div class="form-group">
                            <label for="phone">Phone</label>
                            <input type="tel" id="phone" name="phone" 
                                placeholder="+1 234 567 890" required 
                                pattern="\\+?[\\d\\s-]{10,}"
                                autocomplete="tel" />
                            <span class="form-hint">Include country code</span>
                        </div>

                        <div class="form-group">
                            <label for="age">Age</label>
                            <input type="number" id="age" name="age" 
                                placeholder="Enter your age" required 
                                min="13" max="120" />
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn-primary">
                                <span class="btn-text">Update Profile</span>
                                <span class="btn-loader"></span>
                            </button>
                            <button type="reset" class="btn-secondary">Reset</button>
                        </div>
                    </form>
                `;
                fetchAccountSettings();
                setupAccountSettingsForm();
                break;

            case "logout":
                contentContainer.innerHTML = `
                    <div class="logout-box">
                        <div class="logout-icon">
                            <svg viewBox="0 0 24 24" width="48" height="48">
                                <path fill="currentColor" d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                            </svg>
                        </div>
                        <h2>Ready to Leave?</h2>
                        <p>You can always log back in anytime</p>
                        <div class="logout-actions">
                            <button id="confirm-logout" class="btn-danger">
                                <span class="btn-text">Yes, Log Out</span>
                            </button>
                            <button id="cancel-logout" class="btn-secondary">Cancel</button>
                        </div>
                    </div>
                `;
                setupLogoutHandlers();
                break;

            default:
                contentContainer.innerHTML = `
                    <div class="welcome-screen">
                        <h1>Welcome Back!</h1>
                        <p>Select an option from the sidebar to get started</p>
                    </div>
                `;
        }

        contentContainer.classList.remove('fade-out');
    };

    // Enhanced data fetching with error handling
    const fetchPersonalInfo = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const userData = {
                username: "john_doe",
                course: "Computer Science",
                email: "john.doe@example.com",
                phone: "+1234567890",
                age: "25"
            };

            document.getElementById("user-info").classList.remove('loading');

            Object.keys(userData).forEach(key => {
                const element = document.getElementById(`user-${key}`);
                if (element) {
                    element.textContent = userData[key];
                    element.classList.add('fade-in');
                }
            });
        } catch (error) {
            showToast('Failed to load personal information', 'error');
        }
    };

    // Enhanced account settings fetch
    const fetchAccountSettings = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));

            const form = document.getElementById("account-settings-form");
            const fields = ['username', 'course', 'phone', 'age'];

            fields.forEach(field => {
                const input = form.elements[field];
                input.value = currentUser?.[field] || '';
                input.classList.add('populated');
            });
        } catch (error) {
            showToast('Failed to load account settings', 'error');
        }
    };

    // Enhanced form handling with validation
    const setupAccountSettingsForm = () => {
        const form = document.getElementById("account-settings-form");

        form.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', (e) => {
                const field = e.target;
                field.classList.remove('error');
                field.classList.toggle('populated', field.value.length > 0);
            });
        });

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.classList.add('loading');

            const formData = new FormData(form);
            const errors = validateForm(formData);

            if (errors.length > 0) {
                errors.forEach(error => showToast(error, 'error'));
                submitBtn.classList.remove('loading');
                return;
            }

            try {
                await new Promise(resolve => setTimeout(resolve, 1500));

                currentUser = Object.fromEntries(formData);
                showToast('Profile updated successfully!');

                submitBtn.classList.add('success');
                setTimeout(() => {
                    submitBtn.classList.remove('loading', 'success');
                }, 1000);
            } catch (error) {
                showToast('Failed to update profile', 'error');
                submitBtn.classList.remove('loading');
            }
        });
    };

    // Enhanced logout handling
    const setupLogoutHandlers = () => {
        const confirmBtn = document.getElementById("confirm-logout");
        const cancelBtn = document.getElementById("cancel-logout");

        confirmBtn.addEventListener("click", async () => {
            confirmBtn.classList.add('loading');

            try {
                await new Promise(resolve => setTimeout(resolve, 1000));

                contentContainer.innerHTML = `
                    <div class="logout-success">
                        <div class="success-icon">✓</div>
                        <h2>Logged Out Successfully</h2>
                        <p>Thank you for using our application</p>
                        <a href="/login" class="btn-primary">Back to Login</a>
                    </div>
                `;
            } catch (error) {
                showToast('Logout failed', 'error');
                confirmBtn.classList.remove('loading');
            }
        });

        cancelBtn.addEventListener("click", () => {
            renderContent("personal-info");
        });
    };

    // Setup menu item click handlers
    sidebarItems.forEach((item) => {
        item.addEventListener("click", () => {
            if (item.classList.contains('active')) return;
            renderContent(item.dataset.section);
        });
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && sidebar.classList.contains('active')) {
            toggleMobileMenu();
        }
    });

    // Initialize with personal-info section
    renderContent("personal-info");
});