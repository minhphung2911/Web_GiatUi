/**
 * Admin Customers Management
 * This file handles CRUD operations for customers in the admin dashboard
 */

// Customer data
// Check if customers is already defined
if (typeof window.customers === 'undefined') {
    window.customers = [];
}
let currentCustomer = null;

// DOM Elements
const customerTableBody = document.getElementById('customers-table-body');
const customerModalTitle = document.getElementById('customer-modal-title');
const customerForm = document.getElementById('customer-form');
const customerDetailsModal = document.getElementById('customer-details-modal');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupCustomerEventListeners();
});

/**
 * Set up event listeners for customer management
 */
function setupCustomerEventListeners() {
    // Add customer button
    const addCustomerBtn = document.getElementById('add-customer-btn');
    if (addCustomerBtn) {
        addCustomerBtn.addEventListener('click', function() {
            openCustomerModal();
        });
    }

    // Customer form submission
    if (customerForm) {
        customerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveCustomer();
        });
    }

    // Close modal buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            closeCustomerModal();
            closeCustomerDetailsModal();
        });
    });
}

/**
 * Load customers data from API
 */
function loadCustomers() {
    fetch('/api/user-management')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load customers');
            }
            return response.json();
        })
        .then(data => {
            window.customers = data;
            renderCustomers();
        })
        .catch(error => {
            console.error('Error loading customers:', error);
            showToast('Không thể tải dữ liệu khách hàng', 'error');
        });
}

/**
 * Render customers in the table
 */
function renderCustomers() {
    if (!customerTableBody) return;
    
    customerTableBody.innerHTML = '';
    
    if (window.customers.length === 0) {
        customerTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Không có dữ liệu khách hàng</td></tr>';
        return;
    }
    
    window.customers.forEach(customer => {
        const row = document.createElement('tr');
        
        // Create active status badge
        const statusBadge = `<span class="status-badge ${customer.active ? 'completed' : 'cancelled'}">
                               ${customer.active ? 'Hoạt động' : 'Không hoạt động'}
                             </span>`;
        
        row.innerHTML = `
            <td>${customer.id}</td>
            <td>
                <div class="user-info">
                    <img src="${customer.avatar || '/img/default-avatar.svg'}" alt="${customer.name}">
                    <span>${customer.name}</span>
                </div>
            </td>
            <td>${customer.email}</td>
            <td>${customer.phoneNumber || 'N/A'}</td>
            <td>${statusBadge}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon view-customer" data-id="${customer.id}" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon edit-customer" data-id="${customer.id}" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-customer" data-id="${customer.id}" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        customerTableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    addCustomerActionListeners();
}

/**
 * Add event listeners to customer action buttons
 */
function addCustomerActionListeners() {
    // View customer details
    document.querySelectorAll('.view-customer').forEach(button => {
        button.addEventListener('click', function() {
            const customerId = this.getAttribute('data-id');
            viewCustomerDetails(customerId);
        });
    });
    
    // Edit customer
    document.querySelectorAll('.edit-customer').forEach(button => {
        button.addEventListener('click', function() {
            const customerId = this.getAttribute('data-id');
            editCustomer(customerId);
        });
    });
    
    // Delete customer
    document.querySelectorAll('.delete-customer').forEach(button => {
        button.addEventListener('click', function() {
            const customerId = this.getAttribute('data-id');
            confirmDeleteCustomer(customerId);
        });
    });
}

/**
 * View customer details
 */
function viewCustomerDetails(customerId) {
    // First, fetch detailed customer data
    fetch(`/api/user-management/${customerId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load customer details');
            }
            return response.json();
        })
        .then(customer => {
            currentCustomer = customer;
            
            if (!customerDetailsModal) return;
            
            // Update modal content
            document.getElementById('customer-detail-name').textContent = customer.name;
            document.getElementById('customer-detail-email').textContent = customer.email;
            document.getElementById('customer-detail-phone').textContent = customer.phoneNumber || 'N/A';
            document.getElementById('customer-detail-address').textContent = customer.address || 'N/A';
            document.getElementById('customer-detail-status').textContent = customer.active ? 'Hoạt động' : 'Không hoạt động';
            document.getElementById('customer-detail-status').className = 
                `status-badge ${customer.active ? 'completed' : 'cancelled'}`;
            document.getElementById('customer-detail-avatar').src = customer.avatar || '/img/default-avatar.svg';
            
            // Load customer's booking history if available
            if (document.getElementById('customer-booking-history')) {
                loadCustomerBookings(customerId);
            }
            
            // Show the modal
            customerDetailsModal.style.display = 'block';
        })
        .catch(error => {
            console.error('Error loading customer details:', error);
            showToast('Không thể tải thông tin chi tiết khách hàng', 'error');
        });
}

/**
 * Load customer bookings
 */
function loadCustomerBookings(customerId) {
    const bookingHistoryElement = document.getElementById('customer-booking-history');
    if (!bookingHistoryElement) return;
    
    // Show loading indicator
    bookingHistoryElement.innerHTML = '<p class="text-center">Đang tải lịch sử đặt hàng...</p>';
    
    fetch(`/api/bookings/user/${customerId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load customer bookings');
            }
            return response.json();
        })
        .then(bookings => {
            if (bookings.length === 0) {
                bookingHistoryElement.innerHTML = '<p class="text-center">Không có lịch sử đặt hàng</p>';
                return;
            }
            
            // Create booking history table
            let bookingHistoryHTML = `
                <table class="admin-table booking-history-table">
                    <thead>
                        <tr>
                            <th>Mã đơn</th>
                            <th>Dịch vụ</th>
                            <th>Ngày đặt</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            bookings.forEach(booking => {
                const statusClass = getStatusClass(booking.status);
                bookingHistoryHTML += `
                    <tr>
                        <td>${booking.bookingCode || booking.id}</td>
                        <td>${booking.serviceName}</td>
                        <td>${formatDate(booking.bookingDate)}</td>
                        <td>${formatCurrency(booking.totalPrice)}</td>
                        <td><span class="status-badge ${statusClass}">${booking.status}</span></td>
                    </tr>
                `;
            });
            
            bookingHistoryHTML += `
                    </tbody>
                </table>
            `;
            
            bookingHistoryElement.innerHTML = bookingHistoryHTML;
        })
        .catch(error => {
            console.error('Error loading customer bookings:', error);
            bookingHistoryElement.innerHTML = '<p class="text-center text-danger">Không thể tải lịch sử đặt hàng</p>';
        });
}

/**
 * Open customer modal for adding/editing
 */
function openCustomerModal(customer = null) {
    currentCustomer = customer;
    
    // Update modal title
    if (customerModalTitle) {
        customerModalTitle.textContent = customer ? 'Chỉnh Sửa Khách Hàng' : 'Thêm Khách Hàng Mới';
    }
    
    // Fill form with customer data if editing
    if (customerForm) {
        if (customer) {
            customerForm.elements['id'].value = customer.id || '';
            customerForm.elements['name'].value = customer.name || '';
            customerForm.elements['email'].value = customer.email || '';
            customerForm.elements['phoneNumber'].value = customer.phoneNumber || '';
            customerForm.elements['address'].value = customer.address || '';
            customerForm.elements['avatar'].value = customer.avatar || '';
            customerForm.elements['active'].checked = customer.active !== false;
            
            // If we're editing, disable password fields or make them optional
            if (customerForm.elements['password']) {
                customerForm.elements['password'].required = false;
                customerForm.elements['password'].placeholder = 'Để trống nếu không thay đổi';
            }
        } else {
            customerForm.reset();
            customerForm.elements['id'].value = '';
            customerForm.elements['active'].checked = true;
            
            // If we're adding a new customer, password is required
            if (customerForm.elements['password']) {
                customerForm.elements['password'].required = true;
                customerForm.elements['password'].placeholder = 'Nhập mật khẩu';
            }
        }
    }
    
    // Show the modal
    const customerModal = document.getElementById('customer-modal');
    if (customerModal) {
        customerModal.style.display = 'block';
    }
}

/**
 * Close customer modal
 */
function closeCustomerModal() {
    const customerModal = document.getElementById('customer-modal');
    if (customerModal) {
        customerModal.style.display = 'none';
    }
    currentCustomer = null;
}

/**
 * Close customer details modal
 */
function closeCustomerDetailsModal() {
    if (customerDetailsModal) {
        customerDetailsModal.style.display = 'none';
    }
}

/**
 * Edit customer
 */
function editCustomer(customerId) {
    // First, fetch detailed customer data
    fetch(`/api/user-management/${customerId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load customer details for editing');
            }
            return response.json();
        })
        .then(customer => {
            openCustomerModal(customer);
        })
        .catch(error => {
            console.error('Error loading customer details for editing:', error);
            showToast('Không thể tải thông tin khách hàng để chỉnh sửa', 'error');
        });
}

/**
 * Save customer (create or update)
 */
function saveCustomer() {
    if (!customerForm) return;
    
    // Get form data
    const formData = new FormData(customerForm);
    const customerData = {
        id: formData.get('id') || null,
        name: formData.get('name'),
        email: formData.get('email'),
        phoneNumber: formData.get('phoneNumber'),
        address: formData.get('address'),
        avatar: formData.get('avatar'),
        active: formData.get('active') === 'on'
    };
    
    // Only include password if it's provided and not empty
    const password = formData.get('password');
    if (password && password.trim() !== '') {
        customerData.password = password;
    }
    
    // Validate
    if (!customerData.name || !customerData.email) {
        showToast('Vui lòng điền đầy đủ thông tin khách hàng', 'error');
        return;
    }
    
    // Check if this is a create operation and password is required
    if (!customerData.id && (!customerData.password || customerData.password.trim() === '')) {
        showToast('Vui lòng nhập mật khẩu cho khách hàng mới', 'error');
        return;
    }
    
    // Determine if this is a create or update operation
    const isUpdate = customerData.id !== null;
    const url = isUpdate ? `/api/user-management/${customerData.id}` : '/api/user-management';
    const method = isUpdate ? 'PUT' : 'POST';
    
    // Send request
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(customerData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save customer');
        }
        return response.json();
    })
    .then(data => {
        // Update customers list
        if (isUpdate) {
            const index = window.customers.findIndex(c => c.id == customerData.id);
            if (index !== -1) {
                window.customers[index] = data;
            }
        } else {
            window.customers.push(data);
        }
        
        // Render updated list
        renderCustomers();
        
        // Close modal and show success message
        closeCustomerModal();
        showToast(isUpdate ? 'Cập nhật khách hàng thành công' : 'Thêm khách hàng thành công', 'success');
    })
    .catch(error => {
        console.error('Error saving customer:', error);
        showToast('Lỗi khi lưu thông tin khách hàng', 'error');
    });
}

/**
 * Confirm delete customer
 */
function confirmDeleteCustomer(customerId) {
    if (confirm('Bạn có chắc chắn muốn xóa khách hàng này không? Tất cả đơn đặt hàng của khách hàng này cũng sẽ bị xóa.')) {
        deleteCustomer(customerId);
    }
}

/**
 * Delete customer
 */
function deleteCustomer(customerId) {
    fetch(`/api/user-management/${customerId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete customer');
        }
        
        // Remove from customers array
        window.customers = window.customers.filter(c => c.id != customerId);
        
        // Render updated list
        renderCustomers();
        
        // Show success message
        showToast('Xóa khách hàng thành công', 'success');
    })
    .catch(error => {
        console.error('Error deleting customer:', error);
        showToast('Lỗi khi xóa khách hàng', 'error');
    });
}

/**
 * Get CSS class for booking status
 */
function getStatusClass(status) {
    switch (status) {
        case 'PENDING':
            return 'pending';
        case 'PROCESSING':
            return 'processing';
        case 'COMPLETED':
            return 'completed';
        case 'CANCELLED':
            return 'cancelled';
        default:
            return 'pending';
    }
}

/**
 * Format date
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    
    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    // Check if toast function exists in global scope
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        // Simple fallback
        alert(message);
    }
} 