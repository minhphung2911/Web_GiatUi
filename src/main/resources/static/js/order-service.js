/**
 * Order Service JavaScript
 * Provides functions to interact with the Order API endpoints
 */

// Base URL for order-related API endpoints
const ORDER_API_BASE_URL = '/api/orders';

/**
 * Fetch all orders
 * @param {Object} params - Optional query parameters (status, page, size, etc.)
 * @returns {Promise<Array>} - List of orders
 */
async function fetchOrders(params = {}) {
    try {
        showSpinner();
        
        // Build URL with query parameters
        let url = ORDER_API_BASE_URL;
        if (Object.keys(params).length > 0) {
            const queryString = Object.entries(params)
                .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
                .join('&');
            url += `?${queryString}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        showNotification('Error', 'Could not load orders: ' + error.message, 'error');
        return [];
    } finally {
        hideSpinner();
    }
}

/**
 * Fetch an order by ID
 * @param {string|number} id - Order ID
 * @returns {Promise<Object>} - Order details
 */
async function fetchOrderById(id) {
    try {
        showSpinner();
        
        const response = await fetch(`${ORDER_API_BASE_URL}/${id}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch order: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching order ${id}:`, error);
        showNotification('Error', 'Could not load order details: ' + error.message, 'error');
        return null;
    } finally {
        hideSpinner();
    }
}

/**
 * Fetch orders by customer ID
 * @param {string|number} customerId - Customer ID
 * @returns {Promise<Array>} - List of customer orders
 */
async function fetchOrdersByCustomerId(customerId) {
    try {
        showSpinner();
        
        const response = await fetch(`${ORDER_API_BASE_URL}/customer/${customerId}`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch customer orders: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching orders for customer ${customerId}:`, error);
        showNotification('Error', 'Could not load your orders: ' + error.message, 'error');
        return [];
    } finally {
        hideSpinner();
    }
}

/**
 * Create a new order
 * @param {Object} orderData - Order data to be created
 * @returns {Promise<Object>} - Created order
 */
async function createOrder(orderData) {
    try {
        showSpinner();
        
        const response = await fetch(ORDER_API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            throw new Error(`Failed to create order: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        showNotification('Success', 'Order created successfully!', 'success');
        return data;
    } catch (error) {
        console.error('Error creating order:', error);
        showNotification('Error', 'Could not create order: ' + error.message, 'error');
        return null;
    } finally {
        hideSpinner();
    }
}

/**
 * Update an existing order
 * @param {string|number} id - Order ID
 * @param {Object} orderData - Updated order data
 * @returns {Promise<Object>} - Updated order
 */
async function updateOrder(id, orderData) {
    try {
        showSpinner();
        
        const response = await fetch(`${ORDER_API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            throw new Error(`Failed to update order: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        showNotification('Success', 'Order updated successfully!', 'success');
        return data;
    } catch (error) {
        console.error(`Error updating order ${id}:`, error);
        showNotification('Error', 'Could not update order: ' + error.message, 'error');
        return null;
    } finally {
        hideSpinner();
    }
}

/**
 * Delete an order
 * @param {string|number} id - Order ID
 * @returns {Promise<boolean>} - Success status
 */
async function deleteOrder(id) {
    try {
        showSpinner();
        
        const response = await fetch(`${ORDER_API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`Failed to delete order: ${response.status} ${response.statusText}`);
        }
        
        showNotification('Success', 'Order deleted successfully!', 'success');
        return true;
    } catch (error) {
        console.error(`Error deleting order ${id}:`, error);
        showNotification('Error', 'Could not delete order: ' + error.message, 'error');
        return false;
    } finally {
        hideSpinner();
    }
}

/**
 * Update order status
 * @param {string|number} id - Order ID
 * @param {string} status - New status (PENDING, WASHING, COMPLETED, etc.)
 * @returns {Promise<Object>} - Updated order
 */
async function updateOrderStatus(id, status) {
    try {
        showSpinner();
        
        const response = await fetch(`${ORDER_API_BASE_URL}/${id}/status/${status}`, {
            method: 'PATCH'
        });
        
        if (!response.ok) {
            throw new Error(`Failed to update order status: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        showNotification('Success', 'Order status updated successfully!', 'success');
        return data;
    } catch (error) {
        console.error(`Error updating status for order ${id}:`, error);
        showNotification('Error', 'Could not update order status: ' + error.message, 'error');
        return null;
    } finally {
        hideSpinner();
    }
}

/**
 * Format order status text for display
 * @param {string} status - Order status code (PENDING, WASHING, COMPLETED, etc.)
 * @returns {string} - Formatted status text
 */
function formatOrderStatus(status) {
    const statusMap = {
        'PENDING': 'Chờ Xử Lý',
        'WASHING': 'Đang Giặt',
        'COMPLETED': 'Hoàn Tất',
        'CANCELLED': 'Đã Hủy'
    };
    
    return statusMap[status] || status;
}

/**
 * Get CSS class for status badge
 * @param {string} status - Order status code
 * @returns {string} - CSS class name
 */
function getStatusBadgeClass(status) {
    const classMap = {
        'PENDING': 'badge-warning',
        'WASHING': 'badge-info',
        'COMPLETED': 'badge-success',
        'CANCELLED': 'badge-danger'
    };
    
    return classMap[status] || 'badge-secondary';
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
function formatOrderDate(dateString) {
    if (!dateString) return 'N/A';
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
}

/**
 * Display notification (if not defined elsewhere)
 */
function showNotification(title, message, type = 'info') {
    // First check if a notification system is available from the main app
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
        return;
    }
    
    // Fallback to alert if no notification system is available
    alert(`${title}: ${message}`);
}

/**
 * Show loading spinner (if not defined elsewhere)
 */
function showSpinner() {
    const spinner = document.getElementById('spinner');
    if (spinner) {
        spinner.classList.add('active');
    }
}

/**
 * Hide loading spinner (if not defined elsewhere)
 */
function hideSpinner() {
    const spinner = document.getElementById('spinner');
    if (spinner) {
        spinner.classList.remove('active');
    }
}

// Export the functions for use in other modules
window.orderService = {
    fetchOrders,
    fetchOrderById,
    fetchOrdersByCustomerId,
    createOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    formatOrderStatus,
    getStatusBadgeClass,
    formatOrderDate
}; 