/**
 * Orders JavaScript
 * Handles the orders page functionality
 */

// Global variables
let currentPage = 0;
const pageSize = 10;
let totalPages = 1;
let currentStatus = 'all';
let currentSearchQuery = '';
let currentOrderId = null;

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the orders page
    const ordersTable = document.getElementById('orders-table');
    if (!ordersTable) return;

    // Check if user is logged in, redirect to login if not
    if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        return;
    }

    // Load initial data
    loadOrders();
    
    // Initialize filters
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            currentStatus = this.value;
            currentPage = 0; // Reset to first page when filter changes
            loadOrders();
        });
    }
    
    // Initialize search
    const searchInput = document.getElementById('search-order');
    const searchButton = document.getElementById('search-button');
    
    if (searchInput && searchButton) {
        // Search on button click
        searchButton.addEventListener('click', function() {
            currentSearchQuery = searchInput.value.trim();
            currentPage = 0; // Reset to first page when search changes
            loadOrders();
        });
        
        // Search on Enter key
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                currentSearchQuery = this.value.trim();
                currentPage = 0; // Reset to first page when search changes
                loadOrders();
            }
        });
    }
    
    // Initialize pagination
    initPagination();
    
    // Initialize modal close buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            // Find the parent modal and hide it
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Initialize cancel order button
    const cancelOrderBtn = document.getElementById('cancel-order-btn');
    if (cancelOrderBtn) {
        cancelOrderBtn.addEventListener('click', function() {
            // Show confirmation modal
            document.getElementById('order-details-modal').classList.remove('active');
            document.getElementById('confirm-cancel-modal').classList.add('active');
        });
    }
    
    // Initialize confirm cancel button
    const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
    if (confirmCancelBtn) {
        confirmCancelBtn.addEventListener('click', async function() {
            if (!currentOrderId) return;
            
            const reason = document.getElementById('cancel-reason').value;
            if (!reason.trim()) {
                showNotification('Lỗi', 'Vui lòng nhập lý do hủy đơn hàng', 'error');
                return;
            }
            
            try {
                showSpinner();
                
                // Call API to cancel order
                const response = await fetch(`/api/orders/${currentOrderId}/status/CANCELLED`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ cancelReason: reason })
                });
                
                if (!response.ok) {
                    throw new Error(`Failed to cancel order: ${response.status} ${response.statusText}`);
                }
                
                // Close modal and reload orders
                document.getElementById('confirm-cancel-modal').classList.remove('active');
                showNotification('Thành công', 'Đơn hàng đã được hủy thành công', 'success');
                
                // Reset form
                document.getElementById('cancel-reason').value = '';
                
                // Reload orders
                loadOrders();
            } catch (error) {
                console.error('Error cancelling order:', error);
                showNotification('Lỗi', 'Không thể hủy đơn hàng: ' + error.message, 'error');
            } finally {
                hideSpinner();
            }
        });
    }
});

/**
 * Load orders from the API based on current filters and page
 */
async function loadOrders() {
    try {
        showSpinner();
        
        // Prepare query params
        const params = {
            page: currentPage,
            size: pageSize
        };
        
        // Add status filter if not 'all'
        if (currentStatus && currentStatus !== 'all') {
            params.status = currentStatus;
        }
        
        // Add search query if present
        if (currentSearchQuery) {
            params.search = currentSearchQuery;
        }
        
        // Get current user
        const currentUser = getCurrentUser();
        
        let orders;
        
        if (currentUser) {
            // Fetch orders for the current user
            orders = await window.orderService.fetchOrdersByCustomerId(currentUser.id);
        } else {
            // Fallback to all orders (should not happen due to redirect)
            orders = await window.orderService.fetchOrders(params);
        }
        
        // Apply client-side filtering if needed
        if (currentStatus && currentStatus !== 'all') {
            orders = orders.filter(order => order.status === currentStatus);
        }
        
        if (currentSearchQuery) {
            const query = currentSearchQuery.toLowerCase();
            orders = orders.filter(order => 
                (order.orderCode && order.orderCode.toLowerCase().includes(query)) ||
                (order.serviceName && order.serviceName.toLowerCase().includes(query))
            );
        }
        
        // Calculate total pages
        totalPages = Math.ceil(orders.length / pageSize);
        
        // Paginate orders
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedOrders = orders.slice(startIndex, endIndex);
        
        // Update pagination UI
        updatePagination();
        
        // Populate table
        populateOrdersTable(paginatedOrders);
    } catch (error) {
        console.error('Error loading orders:', error);
        showNotification('Lỗi', 'Không thể tải danh sách đơn hàng: ' + error.message, 'error');
        
        // Show empty state
        const tableBody = document.getElementById('orders-table-body');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.</td>
                </tr>
            `;
        }
    } finally {
        hideSpinner();
    }
}

/**
 * Populate the orders table with data
 * @param {Array} orders - List of order objects
 */
function populateOrdersTable(orders) {
    const tableBody = document.getElementById('orders-table-body');
    if (!tableBody) return;
    
    if (!orders || orders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">Không có đơn hàng nào.</td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    
    orders.forEach(order => {
        const formattedStatus = window.orderService.formatOrderStatus(order.status);
        const statusClass = window.orderService.getStatusBadgeClass(order.status);
        const receivedDate = window.orderService.formatOrderDate(order.receivedDate);
        const returnDate = order.returnDate ? window.orderService.formatOrderDate(order.returnDate) : 'Chưa cập nhật';
        
        // Calculate price (simple example - would be more complex in real app)
        const price = order.weight && order.service?.pricePerKg 
            ? formatCurrency(order.weight * order.service.pricePerKg)
            : 'N/A';
        
        html += `
            <tr data-order-id="${order.id}">
                <td>${order.orderCode || 'N/A'}</td>
                <td>${order.serviceName || 'N/A'}</td>
                <td>${receivedDate}</td>
                <td>${returnDate}</td>
                <td><span class="status-badge ${statusClass}">${formattedStatus}</span></td>
                <td>${price}</td>
                <td class="actions">
                    <button class="btn-icon view-order" title="Xem chi tiết" data-id="${order.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${order.status === 'PENDING' ? `
                        <button class="btn-icon cancel-order" title="Hủy đơn hàng" data-id="${order.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
    
    // Attach event listeners to action buttons
    attachTableEventListeners();
}

/**
 * Attach event listeners to table action buttons
 */
function attachTableEventListeners() {
    // View order details
    document.querySelectorAll('.view-order').forEach(button => {
        button.addEventListener('click', async function() {
            const orderId = this.getAttribute('data-id');
            if (!orderId) return;
            
            await viewOrderDetails(orderId);
        });
    });
    
    // Cancel order
    document.querySelectorAll('.cancel-order').forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.getAttribute('data-id');
            if (!orderId) return;
            
            currentOrderId = orderId;
            document.getElementById('confirm-cancel-modal').classList.add('active');
        });
    });
}

/**
 * View order details
 * @param {string|number} orderId - Order ID
 */
async function viewOrderDetails(orderId) {
    try {
        showSpinner();
        
        // Fetch order details
        const order = await window.orderService.fetchOrderById(orderId);
        
        if (!order) {
            throw new Error('Could not load order details');
        }
        
        // Save current order ID for cancel action
        currentOrderId = order.id;
        
        // Populate modal with order details
        document.getElementById('detail-order-code').textContent = order.orderCode || 'N/A';
        document.getElementById('detail-service').textContent = order.serviceName || 'N/A';
        document.getElementById('detail-weight').textContent = order.weight ? `${order.weight} kg` : 'N/A';
        document.getElementById('detail-received-date').textContent = window.orderService.formatOrderDate(order.receivedDate);
        document.getElementById('detail-return-date').textContent = order.returnDate ? window.orderService.formatOrderDate(order.returnDate) : 'Chưa cập nhật';
        
        // Format status with badge
        const statusBadge = document.getElementById('detail-status');
        statusBadge.textContent = window.orderService.formatOrderStatus(order.status);
        statusBadge.className = 'info-value status-badge ' + window.orderService.getStatusBadgeClass(order.status);
        
        document.getElementById('detail-note').textContent = order.note || 'Không có ghi chú';
        
        // Show/hide cancel button based on status
        const cancelBtn = document.getElementById('cancel-order-btn');
        if (cancelBtn) {
            if (order.status === 'PENDING') {
                cancelBtn.style.display = 'inline-block';
            } else {
                cancelBtn.style.display = 'none';
            }
        }
        
        // Show modal
        document.getElementById('order-details-modal').classList.add('active');
    } catch (error) {
        console.error(`Error viewing order details ${orderId}:`, error);
        showNotification('Lỗi', 'Không thể tải chi tiết đơn hàng: ' + error.message, 'error');
    } finally {
        hideSpinner();
    }
}

/**
 * Initialize pagination controls
 */
function initPagination() {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentPage > 0) {
                currentPage--;
                loadOrders();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            if (currentPage < totalPages - 1) {
                currentPage++;
                loadOrders();
            }
        });
    }
}

/**
 * Update pagination UI based on current page and total pages
 */
function updatePagination() {
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const pageNumbers = document.getElementById('page-numbers');
    
    if (!prevBtn || !nextBtn || !pageNumbers) return;
    
    // Update disabled state
    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage >= totalPages - 1;
    
    // Generate page numbers
    let pageNumbersHtml = '';
    
    // Determine page range to show
    let startPage = Math.max(0, currentPage - 2);
    let endPage = Math.min(totalPages - 1, startPage + 4);
    
    // Ensure we show at least 5 pages if available
    if (endPage - startPage < 4 && totalPages > 5) {
        startPage = Math.max(0, endPage - 4);
    }
    
    // First page link if not in range
    if (startPage > 0) {
        pageNumbersHtml += `
            <span class="page-number" data-page="0">1</span>
            ${startPage > 1 ? '<span class="page-ellipsis">...</span>' : ''}
        `;
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        pageNumbersHtml += `
            <span class="page-number ${i === currentPage ? 'active' : ''}" data-page="${i}">
                ${i + 1}
            </span>
        `;
    }
    
    // Last page link if not in range
    if (endPage < totalPages - 1) {
        pageNumbersHtml += `
            ${endPage < totalPages - 2 ? '<span class="page-ellipsis">...</span>' : ''}
            <span class="page-number" data-page="${totalPages - 1}">${totalPages}</span>
        `;
    }
    
    pageNumbers.innerHTML = pageNumbersHtml;
    
    // Add click event to page numbers
    document.querySelectorAll('.page-number').forEach(pageNumber => {
        pageNumber.addEventListener('click', function() {
            const page = parseInt(this.getAttribute('data-page'), 10);
            if (!isNaN(page) && page !== currentPage) {
                currentPage = page;
                loadOrders();
            }
        });
    });
}

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
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
 * Show notification function (if not already defined)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, info, warning)
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