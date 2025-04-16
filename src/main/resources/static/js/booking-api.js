/**
 * Booking API
 * Handles all API calls for booking functionality
 */

// Base URL for booking API
const BOOKING_API_BASE_URL = '/api/booking';

/**
 * Fetch available laundry services
 * @returns {Promise<Array>} List of available services
 */
async function fetchLaundryServices() {
    try {
        showSpinner();
        
        const response = await fetch(`${BOOKING_API_BASE_URL}/services`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch services: ${response.status}`);
        }
        
        const services = await response.json();
        return services;
    } catch (error) {
        console.error('Error fetching services:', error);
        showToast('Không thể tải dịch vụ. Vui lòng thử lại sau.', 'error');
        return [];
    } finally {
        hideSpinner();
    }
}

/**
 * Create a booking for a logged-in user
 * @param {Object} bookingData - Booking data
 * @returns {Promise<Object>} Created booking
 */
async function createUserBooking(bookingData) {
    try {
        if (!isLoggedIn()) {
            showToast('Vui lòng đăng nhập để đặt lịch.', 'warning');
            return null;
        }
        
        showSpinner();
        
        const response = await fetch(`${BOOKING_API_BASE_URL}/user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Đặt lịch thất bại');
        }
        
        const result = await response.json();
        showToast('Đặt lịch thành công!', 'success');
        return result;
    } catch (error) {
        console.error('Error creating booking:', error);
        showToast(error.message || 'Đặt lịch thất bại. Vui lòng thử lại.', 'error');
        return null;
    } finally {
        hideSpinner();
    }
}

/**
 * Create a booking for a guest user
 * @param {Object} bookingData - Booking data with guest info
 * @returns {Promise<Object>} Created booking
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
            const errorData = await response.json();
            throw new Error(errorData.message || 'Đặt lịch thất bại');
        }
        
        const result = await response.json();
        showToast('Đặt lịch thành công!', 'success');
        return result;
    } catch (error) {
        console.error('Error creating guest booking:', error);
        showToast(error.message || 'Đặt lịch thất bại. Vui lòng thử lại.', 'error');
        return null;
    } finally {
        hideSpinner();
    }
}

/**
 * Check available time slots for a given date
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {number} serviceId - Service ID
 * @returns {Promise<Object>} Available time slots
 */
async function checkAvailableTimeSlots(date, serviceId) {
    try {
        showSpinner();
        
        const url = `${BOOKING_API_BASE_URL}/available-slots?date=${date}&serviceId=${serviceId}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch time slots: ${response.status}`);
        }
        
        const availableSlots = await response.json();
        return availableSlots;
    } catch (error) {
        console.error('Error checking available slots:', error);
        showToast('Không thể tải khung giờ. Vui lòng thử lại sau.', 'error');
        return {};
    } finally {
        hideSpinner();
    }
}

/**
 * Check if user is logged in
 * Uses the auth.js isLoggedIn() function if available
 */
function isLoggedIn() {
    if (typeof window.authService !== 'undefined' && typeof window.authService.isLoggedIn === 'function') {
        return window.authService.isLoggedIn();
    }
    
    // Fallback implementation
    return !!localStorage.getItem('user');
}

/**
 * Show notification
 * Uses the main.js showToast() function if available
 */
function showToast(message, type = 'info', title = null) {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type, title);
        return;
    }
    
    // Fallback
    alert(message);
}

/**
 * Show loading spinner
 */
function showSpinner() {
    if (typeof window.showSpinner === 'function') {
        window.showSpinner();
    }
}

/**
 * Hide loading spinner
 */
function hideSpinner() {
    if (typeof window.hideSpinner === 'function') {
        window.hideSpinner();
    }
}

// Export functions for use in other modules
window.bookingApi = {
    fetchLaundryServices,
    createUserBooking,
    createGuestBooking,
    checkAvailableTimeSlots
}; 