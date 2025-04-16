// Booking JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize booking functionality
    initBooking();
});

// Mock functions (replace with actual implementations or imports)
function getCurrentUser() {
    // Replace with your actual user retrieval logic (e.g., from localStorage, cookies, or API)
    return JSON.parse(localStorage.getItem('currentUser')); // Example: retrieve from localStorage
}

function showNotification(title, message, onClose) {
    alert(`${title}: ${message}`); // Replace with a proper notification system
    if (onClose) onClose();
}

function generateId(prefix) {
    return prefix + Math.random().toString(36).substring(2, 15);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    let period = 'AM';
    let hour = parseInt(hours, 10);

    if (hour >= 12) {
        period = 'PM';
        hour = hour === 12 ? 12 : hour - 12;
    } else if (hour === 0) {
        hour = 12; // Midnight
    }

    return `${hour}:${minutes} ${period}`;
}

// Initialize booking
function initBooking() {
    // Get DOM elements
    const guestTab = document.getElementById('guest-tab');
    const userTab = document.getElementById('user-tab');
    const guestBooking = document.getElementById('guest-booking');
    const userBooking = document.getElementById('user-booking');
    const loginRequired = document.getElementById('login-required');
    const userBookingForm = document.getElementById('user-booking-form');
    const viewDashboardBtn = document.getElementById('view-dashboard-btn');
    
    // If not on booking page, exit early
    if (!guestTab || !userTab || !guestBooking || !userBooking) {
        return;
    }
    
    // Check if user is logged in using authService
    let isUserLoggedIn = false;
    let user = null;
    
    if (typeof window.authService !== 'undefined' && typeof window.authService.isLoggedIn === 'function') {
        isUserLoggedIn = window.authService.isLoggedIn();
        user = window.authService.getCurrentUser();
    } else {
        // Fallback to localStorage
        const userData = localStorage.getItem('user');
        isUserLoggedIn = !!userData;
        if (userData) {
            try {
                user = JSON.parse(userData);
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
    }
    
    // Update UI based on authentication status
    if (isUserLoggedIn && user) {
        // Show user booking tab
        userTab.click();
        
        // Hide login required message
        if (loginRequired) loginRequired.style.display = 'none';
        
        // Show user booking form
        if (userBookingForm) userBookingForm.classList.remove('hidden');
        
        // Populate user info
        const nameEl = document.getElementById('user-info-name');
        const emailEl = document.getElementById('user-info-email');
        const phoneEl = document.getElementById('user-info-phone');
        const addressEl = document.getElementById('user-info-address');
        
        if (nameEl) nameEl.textContent = user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.name || 'Unknown';
            
        if (emailEl) emailEl.textContent = user.email || 'No email provided';
        if (phoneEl) phoneEl.textContent = user.phoneNumber || user.phone || 'No phone provided';
        if (addressEl) addressEl.textContent = user.address || 'No address provided';
        
        // Show dashboard button
        if (viewDashboardBtn) viewDashboardBtn.style.display = 'inline-block';
    } else {
        // Show guest booking tab
        guestTab.click();
        
        // Hide dashboard button
        if (viewDashboardBtn) viewDashboardBtn.style.display = 'none';
    }
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const serviceParam = urlParams.get('service');
    const planParam = urlParams.get('plan');
    
    // Set service based on URL parameter
    if (serviceParam) {
        const guestServiceRadio = document.querySelector(`#guest-booking input[value="${serviceParam}"]`);
        const userServiceRadio = document.querySelector(`#user-booking input[value="${serviceParam}"]`);
        
        if (guestServiceRadio) guestServiceRadio.checked = true;
        if (userServiceRadio) userServiceRadio.checked = true;
        
        updateSummary();
    }
    
    // Set plan based on URL parameter
    if (planParam) {
        let serviceValue = '';
        
        switch (planParam) {
            case 'basic':
                serviceValue = 'wash-fold';
                break;
            case 'premium':
                serviceValue = 'premium';
                break;
            case 'dry-cleaning':
                serviceValue = 'dry-cleaning';
                break;
            default:
                serviceValue = 'wash-fold';
        }
        
        const guestServiceRadio = document.querySelector(`#guest-booking input[value="${serviceValue}"]`);
        const userServiceRadio = document.querySelector(`#user-booking input[value="${serviceValue}"]`);
        
        if (guestServiceRadio) guestServiceRadio.checked = true;
        if (userServiceRadio) userServiceRadio.checked = true;
        
        updateSummary();
    }
    
    // Handle guest booking form submission
    const guestBookingForm = document.getElementById('guest-booking-form');
    const guestSubmitBtn = document.getElementById('guest-submit-btn');
    const guestSpinner = document.getElementById('guest-spinner');
    
    if (guestBookingForm) {
        guestBookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show spinner
            guestSubmitBtn.disabled = true;
            guestSubmitBtn.querySelector('span').style.opacity = '0';
            guestSpinner.style.display = 'inline-block';
            
            // Get form data
            const name = document.getElementById('guest-name').value;
            const email = document.getElementById('guest-email').value;
            const phone = document.getElementById('guest-phone').value;
            const address = document.getElementById('guest-address').value;
            const date = document.getElementById('guest-date').value;
            const time = document.getElementById('guest-time').value;
            const service = document.querySelector('input[name="service"]:checked').value;
            const notes = document.getElementById('guest-notes').value;
            
            // Validate form data
            if (!name || !email || !phone || !address || !date || !time) {
                showNotification('Error', 'Please fill in all required fields.', () => {
                    // Hide spinner
                    guestSubmitBtn.disabled = false;
                    guestSubmitBtn.querySelector('span').style.opacity = '1';
                    guestSpinner.style.display = 'none';
                });
                return;
            }
            
            // Simulate API call
            setTimeout(function() {
                // Create booking
                const booking = {
                    id: generateId('appt_'),
                    name,
                    email,
                    phone,
                    address,
                    date,
                    time,
                    service,
                    notes,
                    status: 'upcoming',
                    createdAt: new Date().toISOString()
                };
                
                // Save booking to localStorage
                const guestBookings = JSON.parse(localStorage.getItem('guestBookings')) || [];
                guestBookings.push(booking);
                localStorage.setItem('guestBookings', JSON.stringify(guestBookings));
                
                // Update success message
                document.getElementById('success-service').textContent = getServiceName(service);
                document.getElementById('success-date').textContent = formatDate(date);
                document.getElementById('success-time').textContent = formatTime(time);
                
                // Hide spinner
                guestSubmitBtn.disabled = false;
                guestSubmitBtn.querySelector('span').style.opacity = '1';
                guestSpinner.style.display = 'none';
                
                // Show success message
                document.getElementById('booking-success').classList.add('active');
            }, 1500);
        });
    }
    
    // Handle user booking form submission
    const userSubmitBtn = document.getElementById('user-submit-btn');
    const userSpinner = document.getElementById('user-spinner');
    
    if (userBookingForm) {
        userBookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show spinner
            userSubmitBtn.disabled = true;
            userSubmitBtn.querySelector('span').style.opacity = '0';
            userSpinner.style.display = 'inline-block';
            
            // Get form data
            const date = document.getElementById('user-date').value;
            const time = document.getElementById('user-time').value;
            const service = document.querySelector('#user-booking input[name="service"]:checked').value;
            const notes = document.getElementById('user-notes').value;
            
            // Validate form data
            if (!date || !time) {
                showNotification('Error', 'Please fill in all required fields.', () => {
                    // Hide spinner
                    userSubmitBtn.disabled = false;
                    userSubmitBtn.querySelector('span').style.opacity = '1';
                    userSpinner.style.display = 'none';
                });
                return;
            }
            
            // Simulate API call
            setTimeout(function() {
                // Create booking
                const booking = {
                    id: generateId('appt_'),
                    userId: user.id,
                    date,
                    time,
                    service,
                    notes,
                    status: 'upcoming',
                    createdAt: new Date().toISOString()
                };
                
                // Save booking to localStorage
                const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
                appointments.push(booking);
                localStorage.setItem('appointments', JSON.stringify(appointments));
                
                // Update success message
                document.getElementById('success-service').textContent = getServiceName(service);
                document.getElementById('success-date').textContent = formatDate(date);
                document.getElementById('success-time').textContent = formatTime(time);
                
                // Hide spinner
                userSubmitBtn.disabled = false;
                userSubmitBtn.querySelector('span').style.opacity = '1';
                userSpinner.style.display = 'none';
                
                // Show success message
                document.getElementById('booking-success').classList.add('active');
            }, 1500);
        });
    }
    
    // Update booking summary
    function updateSummary() {
        const guestService = document.querySelector('#guest-booking input[name="service"]:checked');
        const userService = document.querySelector('#user-booking input[name="service"]:checked');
        const guestDate = document.getElementById('guest-date');
        const userDate = document.getElementById('user-date');
        const guestTime = document.getElementById('guest-time');
        const userTime = document.getElementById('user-time');
        
        // Get active tab
        const activeTab = document.querySelector('.tab-button.active');
        
        let service, date, time;
        
        if (activeTab.getAttribute('data-tab') === 'guest-booking') {
            service = guestService ? guestService.value : 'wash-fold';
            date = guestDate ? guestDate.value : '';
            time = guestTime ? guestTime.value : '';
        } else {
            service = userService ? userService.value : 'wash-fold';
            date = userDate ? userDate.value : '';
            time = userTime ? userTime.value : '';
        }
        
        // Update summary
        document.getElementById('summary-service').textContent = getServiceName(service);
        document.getElementById('summary-date').textContent = date ? formatDate(date) : 'Not selected';
        document.getElementById('summary-time').textContent = time ? formatTime(time) : 'Not selected';
        document.getElementById('summary-price').textContent = getServicePrice(service);
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
    
    // Event listeners for updating summary
    const serviceRadios = document.querySelectorAll('input[name="service"]');
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const timeSelects = document.querySelectorAll('select[name="time"]');
    
    serviceRadios.forEach(radio => {
        radio.addEventListener('change', updateSummary);
    });
    
    dateInputs.forEach(input => {
        input.addEventListener('change', updateSummary);
    });
    
    timeSelects.forEach(select => {
        select.addEventListener('change', updateSummary);
    });
    
    // Update summary on tab change
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', updateSummary);
    });
    
    // Initial summary update
    updateSummary();
}
