/**
 * Booking Service for Fresh Laundry
 * Handles all booking-related API interactions
 */

// Use window global variable to prevent redeclaration
window.BOOKING_API_BASE_URL = window.BOOKING_API_BASE_URL || '/api/bookings';
window.DEMO_MODE = false; // Disable demo mode to use real API

const bookingService = {
    /**
     * Create a new booking
     * @param {Object} bookingData - The booking data
     * @returns {Promise} - The booking response
     */
    createBooking: function(bookingData) {
        console.log('Creating booking:', bookingData);
        
        return apiService.post('/bookings', bookingData);
    },

    /**
     * Get all bookings for current user
     * @param {number} userId - Optional user ID, will use current user from localStorage if not provided
     * @returns {Promise} - The bookings response
     */
    getUserBookings: function(userId) {
        if (!userId) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
            
            if (!currentUser) {
                return Promise.reject(new Error('User not authenticated'));
            }
            
            userId = currentUser.id;
        }
        
        return apiService.get(`/bookings/user/${userId}`);
    },

    /**
     * Get booking by ID
     * @param {number} bookingId - The booking ID
     * @returns {Promise} - The booking response
     */
    getBookingById: function(bookingId) {
        return apiService.get(`/bookings/${bookingId}`);
    },

    /**
     * Update booking
     * @param {number} bookingId - The booking ID
     * @param {Object} bookingData - The booking data
     * @returns {Promise} - The booking response
     */
    updateBooking: function(bookingId, bookingData) {
        return apiService.put(`/bookings/${bookingId}`, bookingData);
    },

    /**
     * Cancel booking
     * @param {number} bookingId - The booking ID
     * @returns {Promise} - The booking response
     */
    cancelBooking: function(bookingId) {
        return apiService.put(`/bookings/${bookingId}/cancel`, {});
    },

    /**
     * Get available time slots
     * @param {string} date - The date in YYYY-MM-DD format
     * @returns {Promise} - The time slots response
     */
    getAvailableTimeSlots: function(date) {
        return apiService.get(`/bookings/time-slots?date=${date}`);
    },

    /**
     * Calculate booking price
     * @param {Object} bookingData - The booking data
     * @returns {Promise} - The price calculation response
     */
    calculatePrice: function(bookingData) {
        return apiService.post(`/bookings/calculate-price`, bookingData);
    }
};

// Make service available globally
window.bookingService = bookingService; 