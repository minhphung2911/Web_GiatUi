/**
 * Utilities for Fresh Laundry
 * Contains common utility functions
 */

const utils = {
    /**
     * Format currency values to VND
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency string
     */
    formatCurrency: function(amount) {
        if (amount === null || amount === undefined) return 'N/A';
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(amount);
    },

    /**
     * Format date values to Vietnamese format
     * @param {string} dateStr - Date string to format
     * @returns {string} Formatted date string
     */
    formatDate: function(dateStr) {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            return new Intl.DateTimeFormat('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch (e) {
            console.error('Error formatting date:', e);
            return dateStr || 'N/A';
        }
    },

    /**
     * Format booking status to Vietnamese
     * @param {string} status - Status to format
     * @returns {string} Formatted status in Vietnamese
     */
    formatStatus: function(status) {
        if (!status) return 'N/A';
        
        const statusMap = {
            'PENDING': 'Chờ xác nhận',
            'CONFIRMED': 'Đã xác nhận',
            'PROCESSING': 'Đang xử lý',
            'COMPLETED': 'Hoàn thành',
            'CANCELLED': 'Đã hủy',
            'DELIVERING': 'Đang giao hàng'
        };
        
        return statusMap[status] || status;
    },

    /**
     * Format payment status to Vietnamese
     * @param {string} status - Status to format
     * @returns {string} Formatted payment status in Vietnamese
     */
    formatPaymentStatus: function(status) {
        if (!status) return 'N/A';
        
        const statusMap = {
            'PENDING': 'Chưa thanh toán',
            'PAID': 'Đã thanh toán',
            'REFUNDED': 'Đã hoàn tiền',
            'FAILED': 'Thanh toán thất bại'
        };
        
        return statusMap[status] || status;
    },

    /**
     * Generate a random ID
     * @param {number} length - Length of the ID
     * @returns {string} Random ID
     */
    generateRandomId: function(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let id = '';
        for (let i = 0; i < length; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    },

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if email is valid
     */
    validateEmail: function(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    },

    /**
     * Validate phone number format (Vietnamese)
     * @param {string} phone - Phone to validate
     * @returns {boolean} True if phone is valid
     */
    validatePhone: function(phone) {
        const re = /^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/;
        return re.test(String(phone));
    },

    /**
     * Debounce function to limit how often a function can fire
     * @param {function} func - The function to debounce
     * @param {number} wait - The time to wait in milliseconds
     * @returns {function} Debounced function
     */
    debounce: function(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
};

// Export the utils object to the window
window.utils = utils; 