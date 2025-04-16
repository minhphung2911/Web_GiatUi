/**
 * Profile Service
 * Contains API functions for user profile management
 */

// Base URLs for API endpoints
const PROFILE_API_URL = '/api/profile';
const DASHBOARD_API_URL = '/api/dashboard';
const ORDERS_API_URL = '/api/orders';

/**
 * Fetch user profile data
 * @returns {Promise<Object>} User profile data
 */
async function fetchUserProfile() {
    try {
        const response = await fetch(PROFILE_API_URL);
        
        if (!response.ok) {
            throw new Error('Không thể tải thông tin hồ sơ');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}

/**
 * Update user profile
 * @param {Object} profileData - User profile data to update
 * @returns {Promise<Object>} Updated user profile
 */
async function updateUserProfile(profileData) {
    try {
        const response = await fetch(PROFILE_API_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            let errorMessage = 'Cập nhật hồ sơ thất bại';
            
            if (errorData.email) {
                errorMessage = errorData.email;
            }
            
            throw new Error(errorMessage);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
}

/**
 * Change user password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @param {string} confirmPassword - Confirm new password
 * @returns {Promise<string>} Success message
 */
async function changePassword(currentPassword, newPassword, confirmPassword) {
    try {
        const response = await fetch(`${PROFILE_API_URL}/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currentPassword,
                newPassword,
                confirmPassword
            })
        });
        
        if (!response.ok) {
            const responseText = await response.text();
            let errorMessage;
            
            try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.message || 'Thay đổi mật khẩu thất bại';
            } catch (e) {
                errorMessage = responseText || 'Thay đổi mật khẩu thất bại';
            }
            
            throw new Error(errorMessage);
        }
        
        return 'Mật khẩu đã được thay đổi thành công';
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
}

/**
 * Fetch user dashboard summary
 * @returns {Promise<Object>} Dashboard summary data
 */
async function fetchDashboardSummary() {
    try {
        const response = await fetch(`${DASHBOARD_API_URL}/summary`);
        
        if (!response.ok) {
            throw new Error('Không thể tải thông tin tổng quan');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        throw error;
    }
}

/**
 * Fetch user's upcoming orders
 * @returns {Promise<Array>} List of upcoming orders
 */
async function fetchUpcomingOrders() {
    try {
        const response = await fetch(`${DASHBOARD_API_URL}/upcoming-orders`);
        
        if (!response.ok) {
            throw new Error('Không thể tải lịch hẹn sắp tới');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching upcoming orders:', error);
        throw error;
    }
}

/**
 * Fetch user's completed orders
 * @returns {Promise<Array>} List of completed orders
 */
async function fetchCompletedOrders() {
    try {
        const response = await fetch(`${DASHBOARD_API_URL}/completed-orders`);
        
        if (!response.ok) {
            throw new Error('Không thể tải lịch hẹn đã hoàn thành');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching completed orders:', error);
        throw error;
    }
}

/**
 * Fetch order details by ID
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Order details
 */
async function fetchOrderDetails(orderId) {
    try {
        const response = await fetch(`${ORDERS_API_URL}/${orderId}`);
        
        if (!response.ok) {
            throw new Error('Không thể tải thông tin đơn hàng');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching order details:', error);
        throw error;
    }
}

/**
 * Cancel an order
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Updated order
 */
async function cancelOrder(orderId) {
    try {
        const response = await fetch(`${ORDERS_API_URL}/${orderId}/status/CANCELED`, {
            method: 'PATCH'
        });
        
        if (!response.ok) {
            throw new Error('Không thể hủy đơn hàng');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error canceling order:', error);
        throw error;
    }
}

// Export functions for use in other scripts
window.profileService = {
    fetchUserProfile,
    updateUserProfile,
    changePassword,
    fetchDashboardSummary,
    fetchUpcomingOrders,
    fetchCompletedOrders,
    fetchOrderDetails,
    cancelOrder
}; 