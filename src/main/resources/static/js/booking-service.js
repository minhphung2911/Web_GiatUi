/**
 * Booking Service JavaScript
 * Handles the booking flow for both guests and authenticated users
 */

// Base URL for booking API endpoints
const BOOKING_API_BASE_URL = '/api/booking';

/**
 * Fetch available services for booking
 * @returns {Promise<Array>} - List of available services
 */
async function fetchAvailableServices() {
    try {
        showSpinner();
        
        const response = await fetch(`${BOOKING_API_BASE_URL}/services`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch services: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching services:', error);
        showNotification('Error', 'Could not load services: ' + error.message, 'error');
        return [];
    } finally {
        hideSpinner();
    }
}

/**
 * Create a booking for an authenticated user
 * @param {Object} bookingData - Booking data
 * @returns {Promise<Object>} - Created booking
 */
async function createUserBooking(bookingData) {
    try {
        showSpinner();
        
        const response = await fetch(`${BOOKING_API_BASE_URL}/user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });
        
        if (!response.ok) {
            // Try to get error message from response
            let errorMessage;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || `Error: ${response.status} ${response.statusText}`;
            } catch {
                errorMessage = `Error: ${response.status} ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        showNotification('Success', 'Đặt lịch thành công!', 'success');
        return data;
    } catch (error) {
        console.error('Error creating booking:', error);
        showNotification('Error', 'Không thể đặt lịch: ' + error.message, 'error');
        return null;
    } finally {
        hideSpinner();
    }
}

/**
 * Create a booking for a guest user
 * @param {Object} bookingData - Guest booking data including contact information
 * @returns {Promise<Object>} - Created booking
 */
async function createGuestBooking(bookingData) {
    try {
        showSpinner();
        
        const response = await fetch(`${BOOKING_API_BASE_URL}/guest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });
        
        if (!response.ok) {
            // Try to get error message from response
            let errorMessage;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || `Error: ${response.status} ${response.statusText}`;
            } catch {
                errorMessage = `Error: ${response.status} ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        showNotification('Success', 'Đặt lịch thành công!', 'success');
        return data;
    } catch (error) {
        console.error('Error creating guest booking:', error);
        showNotification('Error', 'Không thể đặt lịch: ' + error.message, 'error');
        return null;
    } finally {
        hideSpinner();
    }
}

/**
 * Check availability of time slots for a given date
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {number} serviceId - Service ID
 * @returns {Promise<Object>} - Map of time slots and their availability
 */
async function checkAvailableTimeSlots(date, serviceId) {
    try {
        showSpinner();
        
        const response = await fetch(
            `${BOOKING_API_BASE_URL}/available-slots?date=${date}&serviceId=${serviceId}`
        );
        
        if (!response.ok) {
            throw new Error(`Failed to fetch available slots: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error checking available slots:', error);
        showNotification('Error', 'Could not check available time slots: ' + error.message, 'error');
        return {};
    } finally {
        hideSpinner();
    }
}

/**
 * Initialize the booking form tabs
 */
function initBookingTabs() {
    const guestTab = document.getElementById('guest-tab');
    const userTab = document.getElementById('user-tab');
    const guestBookingForm = document.getElementById('guest-booking');
    const userBookingForm = document.getElementById('user-booking');
    
    if (!guestTab || !userTab) return;
    
    // Check if user is logged in
    const isUserLoggedIn = isLoggedIn();
    
    // Set the active tab based on user login status
    if (isUserLoggedIn) {
        userTab.click();
    } else {
        guestTab.click();
    }
    
    // Setup tab click events
    guestTab.addEventListener('click', function() {
        guestTab.classList.add('active');
        userTab.classList.remove('active');
        guestBookingForm.classList.add('active');
        userBookingForm.classList.remove('active');
    });
    
    userTab.addEventListener('click', function() {
        if (!isUserLoggedIn) {
            // Show login prompt
            document.getElementById('login-required').style.display = 'block';
            return;
        }
        
        userTab.classList.add('active');
        guestTab.classList.remove('active');
        userBookingForm.classList.add('active');
        guestBookingForm.classList.remove('active');
    });
}

/**
 * Update the booking summary sidebar
 * @param {Object} data - Booking data
 */
function updateBookingSummary(data) {
    // Get summary elements
    const summaryService = document.getElementById('summary-service');
    const summaryDate = document.getElementById('summary-date');
    const summaryTime = document.getElementById('summary-time');
    const summaryPrice = document.getElementById('summary-price');
    
    // Update summary with booking data
    if (summaryService && data.service) {
        summaryService.textContent = data.service;
    }
    
    if (summaryDate && data.date) {
        // Format date: 15 tháng 7, 2023
        const dateObj = new Date(data.date);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        summaryDate.textContent = dateObj.toLocaleDateString('vi-VN', options);
    } else if (summaryDate) {
        summaryDate.textContent = 'Chưa chọn';
    }
    
    if (summaryTime && data.time) {
        // Format time: 10:00 Sáng
        summaryTime.textContent = formatTime(data.time);
    } else if (summaryTime) {
        summaryTime.textContent = 'Chưa chọn';
    }
    
    if (summaryPrice && data.price) {
        summaryPrice.textContent = data.price;
    }
}

/**
 * Format time for display (24h to 12h format)
 * @param {string} timeString - Time in 24h format (HH:MM)
 * @returns {string} - Formatted time string
 */
function formatTime(timeString) {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':');
    let period = 'Sáng';
    let hour = parseInt(hours, 10);
    
    if (hour >= 12) {
        period = hour >= 18 ? 'Tối' : 'Chiều';
        hour = hour === 12 ? 12 : hour - 12;
    }
    
    return `${hour}:${minutes} ${period}`;
}

/**
 * Populate service selection with radio buttons
 * @param {Array} services - List of service objects
 */
function populateServiceOptions(services) {
    // Populate for both guest and user forms
    populateServiceOptionsForForm(services, 'guest');
    populateServiceOptionsForForm(services, 'user');
}

/**
 * Populate service options for a specific form
 * @param {Array} services - List of service objects
 * @param {string} formPrefix - Prefix for form elements (guest or user)
 */
function populateServiceOptionsForForm(services, formPrefix) {
    const serviceSelection = document.querySelector(`#${formPrefix}-booking .service-selection`);
    if (!serviceSelection || !services || services.length === 0) return;
    
    // Clear existing options
    serviceSelection.innerHTML = '';
    
    // Create radio options for each service
    services.forEach((service, index) => {
        // Determine icon based on service type
        let iconClass = 'fas fa-tshirt'; // Default icon
        if (service.name.toLowerCase().includes('khô')) {
            iconClass = 'fas fa-wind';
        } else if (service.name.toLowerCase().includes('ủi')) {
            iconClass = 'fas fa-iron';
        } else if (service.name.toLowerCase().includes('cao cấp')) {
            iconClass = 'fas fa-gem';
        }
        
        // Format price
        const formattedPrice = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(service.pricePerKg);
        
        // Create service option HTML
        const serviceOption = document.createElement('div');
        serviceOption.className = 'service-option';
        serviceOption.innerHTML = `
            <input type="radio" id="${formPrefix}-service-${index + 1}" 
                   name="service" value="${service.id}" 
                   ${index === 0 ? 'checked' : ''}>
            <label for="${formPrefix}-service-${index + 1}">
                <i class="${iconClass}"></i>
                <div class="service-details">
                    <span class="service-name">${service.name}</span>
                    <span class="service-price">${formattedPrice}/kg</span>
                </div>
            </label>
        `;
        
        // Add radio change event to update summary
        const radioInput = serviceOption.querySelector('input[type="radio"]');
        radioInput.addEventListener('change', function() {
            if (this.checked) {
                updateBookingSummary({
                    service: service.name,
                    price: `${formattedPrice}/kg`
                });
            }
        });
        
        serviceSelection.appendChild(serviceOption);
    });
    
    // Initialize summary with first service
    if (services.length > 0) {
        const firstService = services[0];
        const formattedPrice = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(firstService.pricePerKg);
        
        updateBookingSummary({
            service: firstService.name,
            price: `${formattedPrice}/kg`
        });
    }
}

/**
 * Initialize date pickers with minimum date
 */
function initDatePickers() {
    const guestDate = document.getElementById('guest-date');
    const userDate = document.getElementById('user-date');
    
    // Set minimum date to today
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    if (guestDate) {
        guestDate.min = formattedDate;
        guestDate.addEventListener('change', function() {
            updateBookingSummary({ date: this.value });
            updateAvailableTimeSlots('guest', this.value);
        });
    }
    
    if (userDate) {
        userDate.min = formattedDate;
        userDate.addEventListener('change', function() {
            updateBookingSummary({ date: this.value });
            updateAvailableTimeSlots('user', this.value);
        });
    }
}

/**
 * Update available time slots based on selected date
 * @param {string} formPrefix - Form prefix (guest or user)
 * @param {string} date - Selected date
 */
async function updateAvailableTimeSlots(formPrefix, date) {
    // Get selected service
    const serviceInput = document.querySelector(`#${formPrefix}-booking input[name="service"]:checked`);
    if (!serviceInput) return;
    
    const serviceId = serviceInput.value;
    
    // Fetch available slots
    const availableSlots = await checkAvailableTimeSlots(date, serviceId);
    
    // Update time dropdown
    const timeSelect = document.getElementById(`${formPrefix}-time`);
    if (!timeSelect) return;
    
    // Clear existing options
    timeSelect.innerHTML = '<option value="" disabled selected>Chọn thời gian</option>';
    
    // Add options for available time slots
    Object.entries(availableSlots).forEach(([time, available]) => {
        if (available) {
            const timeFormatted = formatTime(time);
            const option = document.createElement('option');
            option.value = time;
            option.textContent = timeFormatted;
            timeSelect.appendChild(option);
        }
    });
    
    // Add change listener to time select
    timeSelect.addEventListener('change', function() {
        updateBookingSummary({ time: this.value });
    });
}

/**
 * Initialize the guest booking form
 */
function initGuestBookingForm() {
    const guestForm = document.getElementById('guest-booking-form');
    const guestSubmitBtn = document.getElementById('guest-submit-btn');
    const guestSpinner = document.getElementById('guest-spinner');
    
    if (!guestForm) return;
    
    guestForm.addEventListener('submit', async function(e) {
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
        const serviceInput = document.querySelector('#guest-booking input[name="service"]:checked');
        const notes = document.getElementById('guest-notes').value;
        
        // Validate form data
        if (!name || !email || !phone || !address || !date || !time || !serviceInput) {
            showNotification('Error', 'Vui lòng điền đầy đủ thông tin', 'error');
            
            // Hide spinner
            guestSubmitBtn.disabled = false;
            guestSubmitBtn.querySelector('span').style.opacity = '1';
            guestSpinner.style.display = 'none';
            return;
        }
        
        // Prepare booking data
        const bookingData = {
            name: name,
            email: email,
            phone: phone,
            address: address,
            date: date,
            time: time,
            serviceId: parseInt(serviceInput.value),
            notes: notes
        };
        
        // Submit booking
        const result = await createGuestBooking(bookingData);
        
        // Hide spinner
        guestSubmitBtn.disabled = false;
        guestSubmitBtn.querySelector('span').style.opacity = '1';
        guestSpinner.style.display = 'none';
        
        if (result) {
            // Update success message
            const successService = document.getElementById('success-service');
            const successDate = document.getElementById('success-date');
            const successTime = document.getElementById('success-time');
            
            if (successService) {
                successService.textContent = document.querySelector(`label[for="${serviceInput.id}"] .service-name`).textContent;
            }
            
            if (successDate) {
                const dateObj = new Date(date);
                const options = { day: 'numeric', month: 'long', year: 'numeric' };
                successDate.textContent = dateObj.toLocaleDateString('vi-VN', options);
            }
            
            if (successTime) {
                successTime.textContent = formatTime(time);
            }
            
            // Show success message
            document.getElementById('booking-success').classList.add('active');
            
            // Hide dashboard button for guests
            document.getElementById('view-dashboard-btn').style.display = 'none';
        }
    });
}

/**
 * Initialize the user booking form
 */
function initUserBookingForm() {
    const userForm = document.getElementById('user-booking-form');
    const userSubmitBtn = document.getElementById('user-submit-btn');
    const userSpinner = document.getElementById('user-spinner');
    
    if (!userForm) return;
    
    // Check if user is logged in
    if (isLoggedIn()) {
        // Hide login required message
        document.getElementById('login-required').style.display = 'none';
        
        // Show form
        userForm.classList.remove('hidden');
        
        // Populate user info
        const currentUser = getCurrentUser();
        if (currentUser) {
            document.getElementById('user-info-name').textContent = currentUser.name || `${currentUser.firstName} ${currentUser.lastName}`;
            document.getElementById('user-info-email').textContent = currentUser.email;
            document.getElementById('user-info-phone').textContent = currentUser.phoneNumber || 'Chưa cung cấp';
            document.getElementById('user-info-address').textContent = currentUser.address || 'Chưa cung cấp';
        }
        
        // Setup form submission
        userForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Show spinner
            userSubmitBtn.disabled = true;
            userSubmitBtn.querySelector('span').style.opacity = '0';
            userSpinner.style.display = 'inline-block';
            
            // Get form data
            const date = document.getElementById('user-date').value;
            const time = document.getElementById('user-time').value;
            const serviceInput = document.querySelector('#user-booking input[name="service"]:checked');
            const notes = document.getElementById('user-notes').value;
            
            // Validate form data
            if (!date || !time || !serviceInput) {
                showNotification('Error', 'Vui lòng điền đầy đủ thông tin', 'error');
                
                // Hide spinner
                userSubmitBtn.disabled = false;
                userSubmitBtn.querySelector('span').style.opacity = '1';
                userSpinner.style.display = 'none';
                return;
            }
            
            // Prepare booking data
            const bookingData = {
                date: date,
                time: time,
                serviceId: parseInt(serviceInput.value),
                notes: notes
            };
            
            // Submit booking
            const result = await createUserBooking(bookingData);
            
            // Hide spinner
            userSubmitBtn.disabled = false;
            userSubmitBtn.querySelector('span').style.opacity = '1';
            userSpinner.style.display = 'none';
            
            if (result) {
                // Update success message
                const successService = document.getElementById('success-service');
                const successDate = document.getElementById('success-date');
                const successTime = document.getElementById('success-time');
                
                if (successService) {
                    successService.textContent = document.querySelector(`label[for="${serviceInput.id}"] .service-name`).textContent;
                }
                
                if (successDate) {
                    const dateObj = new Date(date);
                    const options = { day: 'numeric', month: 'long', year: 'numeric' };
                    successDate.textContent = dateObj.toLocaleDateString('vi-VN', options);
                }
                
                if (successTime) {
                    successTime.textContent = formatTime(time);
                }
                
                // Show success message
                document.getElementById('booking-success').classList.add('active');
                
                // Show dashboard button for users
                document.getElementById('view-dashboard-btn').style.display = 'inline-block';
            }
        });
    }
}

/**
 * Check if user is logged in (depends on auth.js)
 * @returns {boolean} - True if user is logged in
 */
function isLoggedIn() {
    // Use isLoggedIn from auth.js if available
    if (typeof window.isLoggedIn === 'function') {
        return window.isLoggedIn();
    }
    
    // Fallback implementation
    return !!localStorage.getItem('currentUser');
}

/**
 * Get current user (depends on auth.js)
 * @returns {Object|null} - Current user or null
 */
function getCurrentUser() {
    // Use getCurrentUser from auth.js if available
    if (typeof window.getCurrentUser === 'function') {
        return window.getCurrentUser();
    }
    
    // Fallback implementation
    try {
        return JSON.parse(localStorage.getItem('currentUser'));
    } catch (e) {
        return null;
    }
}

/**
 * Initialize the booking page
 */
async function initBookingPage() {
    // Initialize tabs
    initBookingTabs();
    
    // Initialize date pickers
    initDatePickers();
    
    // Fetch and populate services
    const services = await fetchAvailableServices();
    populateServiceOptions(services);
    
    // Initialize forms
    initGuestBookingForm();
    initUserBookingForm();
}

/**
 * Show notification function (if not already defined)
 */
function showNotification(title, message, type = 'info') {
    // Check if defined elsewhere
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
        return;
    }
    
    // Fallback notification
    alert(`${title}: ${message}`);
}

/**
 * Show spinner function (if not already defined)
 */
function showSpinner() {
    const spinner = document.getElementById('spinner');
    if (spinner) {
        spinner.classList.add('active');
    }
}

/**
 * Hide spinner function (if not already defined)
 */
function hideSpinner() {
    const spinner = document.getElementById('spinner');
    if (spinner) {
        spinner.classList.remove('active');
    }
}

// Initialize booking when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize booking page if we're on the booking page
    const bookingContainer = document.querySelector('.booking-section');
    if (bookingContainer) {
        initBookingPage();
    }
});

// Export the functions for use in other modules
window.bookingService = {
    fetchAvailableServices,
    createUserBooking,
    createGuestBooking,
    checkAvailableTimeSlots,
    formatTime,
    updateBookingSummary
}; 