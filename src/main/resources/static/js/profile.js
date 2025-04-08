// Profile JavaScript

// Mock functions for missing dependencies
function getCurrentUser() {
    // Replace with actual implementation to retrieve current user
    return JSON.parse(localStorage.getItem('currentUser'));
}

function showNotification(title, message) {
    // Replace with actual implementation to display notifications
    alert(`${title}: ${message}`);
}

function updateUserProfile(userData) {
    // Replace with actual implementation to update user profile
    const user = getCurrentUser();
    if (user) {
        user.firstName = userData.firstName;
        user.lastName = userData.lastName;
        user.email = userData.email;
        user.phone = userData.phone;
        user.address = userData.address;

        localStorage.setItem('currentUser', JSON.stringify(user));

        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === user.id);

        if (userIndex !== -1) {
            users[userIndex] = user;
            localStorage.setItem('users', JSON.stringify(users));
        }
        return true;
    }
    return false;
}

function updateUserPreferences(preferences) {
    const user = getCurrentUser();

    if (!user) {
        return false;
    }

    user.preferences = {
        detergent: preferences.detergent,
        fabricSoftener: preferences.fabricSoftener,
        starchLevel: preferences.starchLevel,
        deliveryTime: preferences.deliveryTime,
        deliveryInstructions: preferences.deliveryInstructions,
        emailNotifications: preferences.emailNotifications,
        smsNotifications: preferences.smsNotifications,
        promoEmails: preferences.promoEmails
    };

    localStorage.setItem('currentUser', JSON.stringify(user));

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === user.id);

    if (userIndex !== -1) {
        users[userIndex].preferences = user.preferences;
        localStorage.setItem('users', JSON.stringify(users));
    }

    return true;
}

function showConfirmation(title, message, callback) {
    if (confirm(message)) {
        callback();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize profile functionality
    initProfile();
});

// Initialize profile
function initProfile() {
    // Check if user is logged in
    const user = getCurrentUser();
    
    // If on profile page
    if (document.querySelector('.profile-section')) {
        // Redirect if not logged in
        if (!user) {
            window.location.href = 'login.html?redirect=profile.html';
            return;
        }
        
        // Load user data
        loadUserData();
        
        // Initialize profile tabs
        initProfileTabs();
        
        // Initialize avatar upload
        initAvatarUpload();
        
        // Initialize password strength meter
        initPasswordStrength();
        
        // Initialize form submissions
        initFormSubmissions();
        
        // Initialize bookings calendar
        initBookingsCalendar();
        
        // Load user bookings
        loadUserBookings();
    }
}

// Load user data
function loadUserData() {
    const user = getCurrentUser();
    
    if (user) {
        // Update profile sidebar
        document.getElementById('profile-user-name').textContent = `${user.firstName} ${user.lastName}`;
        document.getElementById('profile-user-email').textContent = user.email;
        
        // Format join date
        const joinDate = new Date(user.createdAt);
        const options = { year: 'numeric', month: 'long' };
        document.getElementById('profile-join-date').textContent = `Member since: ${joinDate.toLocaleDateString('en-US', options)}`;
        
        // Update avatar
        if (user.avatar) {
            document.getElementById('user-avatar').src = user.avatar;
            document.getElementById('nav-user-avatar').src = user.avatar;
        }
        
        // Update nav username
        document.getElementById('nav-user-name').textContent = user.firstName;
        
        // Update personal info form
        document.getElementById('first-name').value = user.firstName || '';
        document.getElementById('last-name').value = user.lastName || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('phone').value = user.phone || '';
        document.getElementById('address').value = user.address || '';
        
        // Update preferences form
        if (user.preferences) {
            document.getElementById('detergent-preference').value = user.preferences.detergent || 'regular';
            document.getElementById('fabric-softener').checked = user.preferences.fabricSoftener !== false;
            document.getElementById('starch-level').value = user.preferences.starchLevel || 'none';
            document.getElementById('delivery-time').value = user.preferences.deliveryTime || 'afternoon';
            document.getElementById('delivery-instructions').value = user.preferences.deliveryInstructions || '';
            document.getElementById('email-notifications').checked = user.preferences.emailNotifications !== false;
            document.getElementById('sms-notifications').checked = user.preferences.smsNotifications !== false;
            document.getElementById('promo-emails').checked = user.preferences.promoEmails === true;
        }
    }
}

// Initialize profile tabs
function initProfileTabs() {
    const tabButtons = document.querySelectorAll('.profile-menu-item');
    const tabContents = document.querySelectorAll('.profile-tab');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked button and corresponding tab
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Initialize date range filter
    const dateRangeSelect = document.getElementById('booking-date-range');
    const customDateRange = document.querySelector('.custom-date-range');
    
    if (dateRangeSelect && customDateRange) {
        dateRangeSelect.addEventListener('change', function() {
            if (this.value === 'custom') {
                customDateRange.classList.remove('hidden');
            } else {
                customDateRange.classList.add('hidden');
            }
        });
    }
}

// Initialize avatar upload
function initAvatarUpload() {
    const avatarContainer = document.querySelector('.profile-avatar-container');
    const avatarUpload = document.getElementById('avatar-upload');
    
    if (avatarContainer && avatarUpload) {
        avatarContainer.addEventListener('click', function() {
            avatarUpload.click();
        });
        
        avatarUpload.addEventListener('change', function() {
            const file = this.files[0];
            
            if (file) {
                // Check if file is an image
                if (!file.type.match('image.*')) {
                    showNotification('Error', 'Please select an image file.');
                    return;
                }
                
                // Check file size (max 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    showNotification('Error', 'Image size should be less than 2MB.');
                    return;
                }
                
                // Read file and update avatar
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const avatarImg = document.getElementById('user-avatar');
                    const navAvatarImg = document.getElementById('nav-user-avatar');
                    
                    avatarImg.src = e.target.result;
                    navAvatarImg.src = e.target.result;
                    
                    // Save avatar to user data
                    updateUserAvatar(e.target.result);
                };
                
                reader.readAsDataURL(file);
            }
        });
    }
}

// Update user avatar
function updateUserAvatar(avatarData) {
    const user = getCurrentUser();
    
    if (user) {
        // Update user avatar
        user.avatar = avatarData;
        
        // Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Update all users
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === user.id);
        
        if (userIndex !== -1) {
            users[userIndex].avatar = avatarData;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        showNotification('Success', 'Profile picture updated successfully.');
    }
}

// Initialize password strength meter
function initPasswordStrength() {
    const newPassword = document.getElementById('new-password');
    const strengthMeter = document.querySelector('.strength-meter-fill');
    const strengthText = document.querySelector('.strength-text span');
    
    // Password requirement elements
    const reqLength = document.getElementById('req-length');
    const reqUppercase = document.getElementById('req-uppercase');
    const reqLowercase = document.getElementById('req-lowercase');
    const reqNumber = document.getElementById('req-number');
    const reqSpecial = document.getElementById('req-special');
    
    if (newPassword && strengthMeter && strengthText) {
        newPassword.addEventListener('input', function() {
            const password = this.value;
            let strength = 0;
            
            // Check length
            if (password.length >= 8) {
                strength++;
                reqLength.innerHTML = '<i class="fas fa-check"></i> Be at least 8 characters long';
            } else {
                reqLength.innerHTML = '<i class="fas fa-times"></i> Be at least 8 characters long';
            }
            
            // Check uppercase
            if (/[A-Z]/.test(password)) {
                strength++;
                reqUppercase.innerHTML = '<i class="fas fa-check"></i> Include at least one uppercase letter';
            } else {
                reqUppercase.innerHTML = '<i class="fas fa-times"></i> Include at least one uppercase letter';
            }
            
            // Check lowercase
            if (/[a-z]/.test(password)) {
                strength++;
                reqLowercase.innerHTML = '<i class="fas fa-check"></i> Include at least one lowercase letter';
            } else {
                reqLowercase.innerHTML = '<i class="fas fa-times"></i> Include at least one lowercase letter';
            }
            
            // Check number
            if (/[0-9]/.test(password)) {
                strength++;
                reqNumber.innerHTML = '<i class="fas fa-check"></i> Include at least one number';
            } else {
                reqNumber.innerHTML = '<i class="fas fa-times"></i> Include at least one number';
            }
            
            // Check special character
            if (/[^A-Za-z0-9]/.test(password)) {
                strength++;
                reqSpecial.innerHTML = '<i class="fas fa-check"></i> Include at least one special character';
            } else {
                reqSpecial.innerHTML = '<i class="fas fa-times"></i> Include at least one special character';
            }
            
            // Update strength meter
            strengthMeter.setAttribute('data-strength', strength);
            
            // Update strength text
            switch (strength) {
                case 0:
                    strengthText.textContent = 'Very Weak';
                    strengthText.style.color = '#ff4d4d';
                    break;
                case 1:
                    strengthText.textContent = 'Weak';
                    strengthText.style.color = '#ffa64d';
                    break;
                case 2:
                    strengthText.textContent = 'Fair';
                    strengthText.style.color = '#ffff4d';
                    break;
                case 3:
                    strengthText.textContent = 'Good';
                    strengthText.style.color = '#4dff4d';
                    break;
                case 4:
                case 5:
                    strengthText.textContent = 'Strong';
                    strengthText.style.color = '#4dff4d';
                    break;
            }
        });
    }
    
    // Toggle password visibility
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

// Initialize form submissions
function initFormSubmissions() {
    // Personal info form
    const personalInfoForm = document.getElementById('personal-info-form');
    
    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const firstName = document.getElementById('first-name').value;
            const lastName = document.getElementById('last-name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const address = document.getElementById('address').value;
            
            // Validate form data
            if (!firstName || !lastName || !email || !phone) {
                showNotification('Error', 'Please fill in all required fields.');
                return;
            }
            
            // Update user data
            const userData = {
                firstName,
                lastName,
                email,
                phone,
                address
            };
            
            const success = updateUserProfile(userData);
            
            if (success) {
                showNotification('Success', 'Your profile has been updated successfully.');
                
                // Update displayed name
                document.getElementById('profile-user-name').textContent = `${firstName} ${lastName}`;
                document.getElementById('nav-user-name').textContent = firstName;
            } else {
                showNotification('Error', 'There was an error updating your profile. Please try again.');
            }
        });
    }
    
    // Change password form
    const changePasswordForm = document.getElementById('change-password-form');
    
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Validate form data
            if (!currentPassword || !newPassword || !confirmPassword) {
                showNotification('Error', 'Please fill in all required fields.');
                return;
            }
            
            // Check if current password is correct
            const user = getCurrentUser();
            
            if (user.password !== currentPassword) {
                showNotification('Error', 'Current password is incorrect.');
                return;
            }
            
            // Check if new password meets requirements
            if (newPassword.length < 8 || 
                !/[A-Z]/.test(newPassword) || 
                !/[a-z]/.test(newPassword) || 
                !/[0-9]/.test(newPassword) || 
                !/[^A-Za-z0-9]/.test(newPassword)) {
                showNotification('Error', 'New password does not meet the requirements.');
                return;
            }
            
            // Check if passwords match
            if (newPassword !== confirmPassword) {
                showNotification('Error', 'Passwords do not match.');
                return;
            }
            
            // Update password
            const success = updateUserPassword(newPassword);
            
            if (success) {
                showNotification('Success', 'Your password has been updated successfully.');
                
                // Clear form
                changePasswordForm.reset();
                
                // Reset strength meter
                document.querySelector('.strength-meter-fill').setAttribute('data-strength', '0');
                document.querySelector('.strength-text span').textContent = 'Weak';
                
                // Reset requirements
                document.getElementById('req-length').innerHTML = '<i class="fas fa-times"></i> Be at least 8 characters long';
                document.getElementById('req-uppercase').innerHTML = '<i class="fas fa-times"></i> Include at least one uppercase letter';
                document.getElementById('req-lowercase').innerHTML = '<i class="fas fa-times"></i> Include at least one lowercase letter';
                document.getElementById('req-number').innerHTML = '<i class="fas fa-times"></i> Include at least one number';
                document.getElementById('req-special').innerHTML = '<i class="fas fa-times"></i> Include at least one special character';
            } else {
                showNotification('Error', 'There was an error updating your password. Please try again.');
            }
        });
    }
    
    // Preferences form
    const preferencesForm = document.getElementById('preferences-form');
    
    if (preferencesForm) {
        preferencesForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const detergent = document.getElementById('detergent-preference').value;
            const fabricSoftener = document.getElementById('fabric-softener').checked;
            const starchLevel = document.getElementById('starch-level').value;
            const deliveryTime = document.getElementById('delivery-time').value;
            const deliveryInstructions = document.getElementById('delivery-instructions').value;
            const emailNotifications = document.getElementById('email-notifications').checked;
            const smsNotifications = document.getElementById('sms-notifications').checked;
            const promoEmails = document.getElementById('promo-emails').checked;
            
            // Update preferences
            const preferences = {
                detergent,
                fabricSoftener,
                starchLevel,
                deliveryTime,
                deliveryInstructions,
                emailNotifications,
                smsNotifications,
                promoEmails
            };
            
            const success = updateUserPreferences(preferences);
            
            if (success) {
                showNotification('Success', 'Your preferences have been saved successfully.');
            } else {
                showNotification('Error', 'There was an error saving your preferences. Please try again.');
            }
        });
    }
}

// Update user password
function updateUserPassword(newPassword) {
    const user = getCurrentUser();
    
    if (!user) {
        return false;
    }
    
    // Update user password
    user.password = newPassword;
    
    // Save to localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Update all users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === user.id);
    
    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    return true;
}

// Initialize bookings calendar
function initBookingsCalendar() {
    const calendarDays = document.getElementById('calendar-days');
    const calendarMonth = document.getElementById('calendar-month');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    
    if (calendarDays && calendarMonth && prevMonthBtn && nextMonthBtn) {
        let currentDate = new Date();
        let currentMonth = currentDate.getMonth();
        let currentYear = currentDate.getFullYear();
        
        // Generate calendar
        function generateCalendar(month, year) {
            // Clear calendar
            calendarDays.innerHTML = '';
            
            // Set month and year
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            calendarMonth.textContent = `${monthNames[month]} ${year}`;
            
            // Get first day of month
            const firstDay = new Date(year, month, 1).getDay();
            
            // Get last day of month
            const lastDay = new Date(year, month + 1, 0).getDate();
            
            // Get last day of previous month
            const prevMonthLastDay = new Date(year, month, 0).getDate();
            
            // Get bookings for this month
            const bookings = getUserBookingsForMonth(month, year);
            
            // Add days from previous month
            for (let i = firstDay - 1; i >= 0; i--) {
                const day = prevMonthLastDay - i;
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day other-month';
                dayElement.innerHTML = `<div class="day-number">${day}</div>`;
                calendarDays.appendChild(dayElement);
            }
            
            // Add days of current month
            const today = new Date();
            
            for (let i = 1; i <= lastDay; i++) {
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day';
                
                // Check if it's today
                if (today.getDate() === i && today.getMonth() === month && today.getFullYear() === year) {
                    dayElement.classList.add('today');
                }
                
                dayElement.innerHTML = `<div class="day-number">${i}</div>`;
                
                // Add bookings for this day
                const dayBookings = bookings.filter(booking => {
                    const bookingDate = new Date(booking.date);
                    return bookingDate.getDate() === i;
                });
                
                if (dayBookings.length > 0) {
                    const bookingsContainer = document.createElement('div');
                    bookingsContainer.className = 'day-bookings';
                    
                    dayBookings.forEach(booking => {
                        const bookingDot = document.createElement('span');
                        bookingDot.className = `booking-dot ${booking.status}`;
                        bookingDot.setAttribute('title', `${getServiceName(booking.service)} - ${formatTime(booking.time)}`);
                        bookingsContainer.appendChild(bookingDot);
                    });
                    
                    dayElement.appendChild(bookingsContainer);
                }
                
                calendarDays.appendChild(dayElement);
            }
            
            // Add days from next month
            const totalDays = firstDay + lastDay;
            const remainingDays = 42 - totalDays; // 6 rows x 7 days
            
            for (let i = 1; i <= remainingDays; i++) {
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day other-month';
                dayElement.innerHTML = `<div class="day-number">${i}</div>`;
                calendarDays.appendChild(dayElement);
            }
        }
        
        // Generate initial calendar
        generateCalendar(currentMonth, currentYear);
        
        // Previous month button
        prevMonthBtn.addEventListener('click', function() {
            currentMonth--;
            
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            
            generateCalendar(currentMonth, currentYear);
        });
        
        // Next month button
        nextMonthBtn.addEventListener('click', function() {
            currentMonth++;
            
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            
            generateCalendar(currentMonth, currentYear);
        });
        
        // Booking status filter
        const bookingStatus = document.getElementById('booking-status');
        
        if (bookingStatus) {
            bookingStatus.addEventListener('change', function() {
                loadUserBookings();
            });
        }
        
        // Booking date range filter
        const bookingDateRange = document.getElementById('booking-date-range');
        const dateFrom = document.getElementById('date-from');
        const dateTo = document.getElementById('date-to');
        
        if (bookingDateRange && dateFrom && dateTo) {
            bookingDateRange.addEventListener('change', function() {
                loadUserBookings();
            });
            
            dateFrom.addEventListener('change', function() {
                loadUserBookings();
            });
            
            dateTo.addEventListener('change', function() {
                loadUserBookings();
            });
        }
    }
}

// Get user bookings for month
function getUserBookingsForMonth(month, year) {
    const user = getCurrentUser();
    
    if (!user) {
        return [];
    }
    
    // Get appointments from localStorage
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    
    // Filter user appointments for the specified month
    return appointments.filter(appointment => {
        if (appointment.userId !== user.id) {
            return false;
        }
        
        const appointmentDate = new Date(appointment.date);
        return appointmentDate.getMonth() === month && appointmentDate.getFullYear() === year;
    });
}

// Load user bookings
function loadUserBookings() {
    const user = getCurrentUser();
    const bookingsListContainer = document.getElementById('bookings-list-container');
    const noBookings = document.getElementById('no-bookings');
    
    if (!user || !bookingsListContainer || !noBookings) {
        return;
    }
    
    // Get appointments from localStorage
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    
    // Filter user appointments
    let userAppointments = appointments.filter(appointment => appointment.userId === user.id);
    
    // Apply status filter
    const statusFilter = document.getElementById('booking-status').value;
    
    if (statusFilter !== 'all') {
        userAppointments = userAppointments.filter(appointment => appointment.status === statusFilter);
    }
    
    // Apply date range filter
    const dateRangeFilter = document.getElementById('booking-date-range').value;
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;
    
    if (dateRangeFilter !== 'all') {
        const today = new Date();
        let fromDate, toDate;
        
        switch (dateRangeFilter) {
            case 'this-month':
                fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
                toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case 'last-month':
                fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                toDate = new Date(today.getFullYear(), today.getMonth(), 0);
                break;
            case 'last-3-months':
                fromDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
                toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case 'custom':
                if (dateFrom && dateTo) {
                    fromDate = new Date(dateFrom);
                    toDate = new Date(dateTo);
                }
                break;
        }
        
        if (fromDate && toDate) {
            userAppointments = userAppointments.filter(appointment => {
                const appointmentDate = new Date(appointment.date);
                return appointmentDate >= fromDate && appointmentDate <= toDate;
            });
        }
    }
    
    // If no appointments
    if (userAppointments.length === 0) {
        bookingsListContainer.innerHTML = '';
        noBookings.classList.remove('hidden');
        return;
    }
    
    // Hide no bookings message
    noBookings.classList.add('hidden');
    
    // Sort appointments by date (newest first)
    userAppointments.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Generate bookings list
    let bookingsHTML = '';
    
    userAppointments.forEach(appointment => {
        bookingsHTML += `
            <div class="appointment-item">
                <div class="appointment-status ${appointment.status}">
                    <span>${appointment.status}</span>
                </div>
                <div class="appointment-details">
                    <div class="appointment-service">
                        <h4>${getServiceName(appointment.service)}</h4>
                        <span class="appointment-id">#${appointment.id}</span>
                    </div>
                    <div class="appointment-date">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${formatDate(appointment.date)}</span>
                    </div>
                    <div class="appointment-time">
                        <i class="fas fa-clock"></i>
                        <span>${formatTime(appointment.time)}</span>
                    </div>
                    <div class="appointment-notes">
                        <strong>Notes:</strong> ${appointment.notes || 'No special instructions'}
                    </div>
                </div>
                <div class="appointment-actions">
                    <div class="appointment-price">${getServicePrice(appointment.service)}</div>
                    <div class="action-buttons">
                        ${appointment.status === 'upcoming' ? `
                            <button class="btn btn-secondary btn-sm" data-action="edit" data-id="${appointment.id}"><i class="fas fa-edit"></i> Edit</button>
                            <button class="btn btn-danger btn-sm" data-action="cancel" data-id="${appointment.id}"><i class="fas fa-times"></i> Cancel</button>
                        ` : ''}
                        <button class="btn btn-primary btn-sm" data-action="details" data-id="${appointment.id}"><i class="fas fa-eye"></i> Details</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    bookingsListContainer.innerHTML = bookingsHTML;
    
    // Add event listeners for booking actions
    document.querySelectorAll('[data-action="edit"]').forEach(button => {
        button.addEventListener('click', function() {
            const appointmentId = this.getAttribute('data-id');
            window.location.href = `booking.html?edit=${appointmentId}`;
        });
    });
    
    document.querySelectorAll('[data-action="cancel"]').forEach(button => {
        button.addEventListener('click', function() {
            const appointmentId = this.getAttribute('data-id');
            
            showConfirmation(
                'Cancel Appointment',
                'Are you sure you want to cancel this appointment? This action cannot be undone.',
                function() {
                    cancelAppointment(appointmentId);
                }
            );
        });
    });
    
    document.querySelectorAll('[data-action="details"]').forEach(button => {
        button.addEventListener('click', function() {
            const appointmentId = this.getAttribute('data-id');
            showAppointmentDetails(appointmentId);
        });
    });
}

// Cancel appointment
function cancelAppointment(appointmentId) {
    // Get appointments from localStorage
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    
    // Find appointment index
    const appointmentIndex = appointments.findIndex(appointment => appointment.id === appointmentId);
    
    if (appointmentIndex === -1) {
        showNotification('Error', 'Appointment not found. Please try again.');
        return;
    }
    
    // Update appointment status
    appointments[appointmentIndex].status = 'cancelled';
    appointments[appointmentIndex].cancelledAt = new Date().toISOString();
    
    // Save to localStorage
    localStorage.setItem('appointments', JSON.stringify(appointments));
    
    // Reload bookings
    loadUserBookings();
    
    // Reload calendar
    const calendarMonth = document.getElementById('calendar-month');
    
    if (calendarMonth) {
        const [month, year] = calendarMonth.textContent.split(' ');
        const monthIndex = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].indexOf(month);
        
        if (monthIndex !== -1) {
            initBookingsCalendar();
        }
    }
    
    // Show success message
    showNotification('Success', 'Your appointment has been cancelled successfully.');
}

// Show appointment details
function showAppointmentDetails(appointmentId) {
    // Get appointments from localStorage
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    
    // Find appointment
    const appointment = appointments.find(appointment => appointment.id === appointmentId);
    
    if (!appointment) {
        showNotification('Error', 'Appointment not found. Please try again.');
        return;
    }
    
    // Show appointment details
    showNotification(
        `Appointment #${appointment.id}`,
        `
        <div class="appointment-details-modal">
            <p><strong>Service:</strong> ${getServiceName(appointment.service)}</p>
            <p><strong>Date:</strong> ${formatDate(appointment.date)}</p>
            <p><strong>Time:</strong> ${formatTime(appointment.time)}</p>
            <p><strong>Status:</strong> <span  ${formatTime(appointment.time)}</p>
            <p><strong>Status:</strong> <span class="status-badge ${appointment.status}">${appointment.status}</span></p>
            <p><strong>Notes:</strong> ${appointment.notes || 'No special instructions'}</p>
            <p><strong>Price:</strong> ${getServicePrice(appointment.service)}</p>
            <p><strong>Created:</strong> ${formatDate(appointment.createdAt)}</p>
            ${appointment.cancelledAt ? `<p><strong>Cancelled:</strong> ${formatDate(appointment.cancelledAt)}</p>` : ''}
        </div>
        `
    );
}

// Get service name
function getServiceName(service) {
    switch (service) {
        case 'wash-fold':
            return 'Wash & Fold';
        case 'dry-cleaning':
            return 'Dry Cleaning';
        case 'ironing':
            return 'Ironing Service';
        case 'pickup-delivery':
            return 'Pickup & Delivery';
        case 'premium':
            return 'Premium Package';
        default:
            return 'Wash & Fold';
    }
}

// Get service price
function getServicePrice(service) {
    switch (service) {
        case 'wash-fold':
            return '$2.50/lb';
        case 'dry-cleaning':
            return '$6.00/item';
        case 'ironing':
            return '$3.00/item';
        case 'pickup-delivery':
            return '$5.00 + service cost';
        case 'premium':
            return '$3.50/lb';
        default:
            return '$2.50/lb';
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Format time
function formatTime(timeString) {
    if (!timeString) return 'N/A';
    
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    
    return `${formattedHour}:${minutes} ${period}`;
}

// Initialize profile
initProfile();
