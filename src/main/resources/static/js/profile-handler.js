/**
 * Profile Handler
 * Handles all profile-related functionality including loading user profile data and appointments
 */

// Base URLs for API endpoints
const PROFILE_API_URL = '/api/profile';
const DASHBOARD_API_URL = '/api/dashboard';
const ORDERS_API_URL = '/api/orders';

// DOM Elements
let profileForm;
let userNameElement;
let userEmailElement;
let userPhoneElement;
let userAddressElement;
let upcomingAppointmentsContainer;
let completedAppointmentsContainer;
let appointmentHistoryTable;

/**
 * Initialize profile page
 */
function initProfile() {
    console.log('Initializing profile...');
    
    // Check if user is logged in
    if (!isLoggedIn()) {
        // Hiển thị thông báo đăng nhập thay vì chuyển hướng
        const profileContent = document.querySelector('.profile-content');
        const profileHeader = document.querySelector('.profile-header');
        
        if (profileContent) {
            // Ẩn nội dung profile
            profileContent.style.display = 'none';
            
            // Tạo thông báo đăng nhập
            const loginMessage = document.createElement('div');
            loginMessage.className = 'login-required-message';
            loginMessage.innerHTML = `
                <div class="login-message-icon">
                    <i class="fas fa-user-lock fa-3x"></i>
                </div>
                <h3>Vui lòng đăng nhập để xem hồ sơ</h3>
                <p>Bạn cần đăng nhập để truy cập và quản lý hồ sơ cá nhân</p>
                <div class="login-actions">
                    <a href="/login?redirect=profile" class="btn btn-primary">Đăng nhập</a>
                    <a href="/register" class="btn btn-outline">Đăng ký</a>
                </div>
            `;
            
            // Thêm thông báo vào sau tiêu đề
            if (profileHeader && profileHeader.parentNode) {
                profileHeader.parentNode.insertBefore(loginMessage, profileContent);
            }
        }
        
        return;
    }
    
    // Initialize DOM elements
    initElements();
    
    // Load user profile data
    loadUserProfile();
    
    // Load user appointments
    loadUserAppointments();
    
    // Initialize event listeners
    initEventListeners();
}

/**
 * Initialize DOM elements
 */
function initElements() {
    profileForm = document.getElementById('profile-form');
    userNameElement = document.getElementById('profile-name');
    userEmailElement = document.getElementById('profile-email');
    userPhoneElement = document.getElementById('profile-phone');
    userAddressElement = document.getElementById('profile-address');
    upcomingAppointmentsContainer = document.getElementById('upcoming-appointments');
    completedAppointmentsContainer = document.getElementById('completed-appointments');
    appointmentHistoryTable = document.getElementById('appointment-history-table');
}

/**
 * Load user profile data
 */
async function loadUserProfile() {
    try {
        showSpinner();
        
        // Use the profile service to fetch user data
        const userData = await window.profileService.fetchUserProfile();
        console.log('Loaded user data:', userData);
        
        // Update profile form
        updateProfileForm(userData);
        
        // Update profile header
        updateProfileHeader(userData);
        
    } catch (error) {
        console.error('Error loading profile:', error);
        showToast('Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.', 'error');
    } finally {
        hideSpinner();
    }
}

/**
 * Update profile form with user data
 */
function updateProfileForm(userData) {
    if (!profileForm) return;
    
    const firstName = document.getElementById('first-name');
    const lastName = document.getElementById('last-name');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const address = document.getElementById('address');
    
    if (firstName && lastName) {
        firstName.value = userData.firstName || '';
        lastName.value = userData.lastName || '';
    }
    
    if (email) email.value = userData.email || '';
    if (phone) phone.value = userData.phoneNumber || '';
    if (address) address.value = userData.address || '';
}

/**
 * Update profile header with user data
 */
function updateProfileHeader(userData) {
    if (userNameElement) {
        const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
        userNameElement.textContent = fullName || 'Chưa cập nhật';
    }
    
    if (userEmailElement) userEmailElement.textContent = userData.email || '';
    if (userPhoneElement) userPhoneElement.textContent = userData.phoneNumber || 'Chưa cập nhật';
    if (userAddressElement) userAddressElement.textContent = userData.address || 'Chưa cập nhật';
    
    // Update navigation avatar if exists
    const navUserAvatar = document.getElementById('nav-user-avatar');
    if (navUserAvatar) {
        // Để sử dụng ảnh đại diện thực từ API, bạn sẽ cần thêm logic ở đây
        // Hiện tại chỉ sử dụng ảnh mặc định
    }
}

/**
 * Load user appointments (orders)
 */
async function loadUserAppointments() {
    try {
        showSpinner();
        
        // Use the profile service to fetch dashboard summary
        const summaryData = await window.profileService.fetchDashboardSummary();
        
        // Update appointment counters
        updateAppointmentCounters(summaryData);
        
        // Use the profile service to fetch upcoming orders
        const upcomingOrders = await window.profileService.fetchUpcomingOrders();
        
        // Use the profile service to fetch completed orders
        const completedOrders = await window.profileService.fetchCompletedOrders();
        
        // Update appointment displays
        updateUpcomingAppointments(upcomingOrders);
        updateCompletedAppointments(completedOrders);
        updateAppointmentHistory([...upcomingOrders, ...completedOrders]);
        
    } catch (error) {
        console.error('Error loading appointments:', error);
        showToast('Không thể tải lịch hẹn. Vui lòng thử lại sau.', 'error');
    } finally {
        hideSpinner();
    }
}

/**
 * Update appointment counters
 */
function updateAppointmentCounters(summaryData) {
    const upcomingCounter = document.getElementById('upcoming-counter');
    const completedCounter = document.getElementById('completed-counter');
    
    if (upcomingCounter) upcomingCounter.textContent = summaryData.upcomingCount || 0;
    if (completedCounter) completedCounter.textContent = summaryData.completedCount || 0;
}

/**
 * Update upcoming appointments display
 */
function updateUpcomingAppointments(orders) {
    if (!upcomingAppointmentsContainer) return;
    
    if (!orders || orders.length === 0) {
        upcomingAppointmentsContainer.innerHTML = '<p class="empty-message">Không có lịch hẹn sắp tới</p>';
        return;
    }
    
    let html = '';
    
    orders.slice(0, 3).forEach(order => {
        const serviceName = order.serviceName || 'Dịch vụ không xác định';
        const date = formatDate(order.receivedDate);
        const status = formatOrderStatus(order.status);
        const statusClass = getStatusClass(order.status);
        
        html += `
            <div class="appointment-card">
                <div class="appointment-header">
                    <h4>${serviceName}</h4>
                    <span class="status-badge ${statusClass}">${status}</span>
                </div>
                <div class="appointment-details">
                    <p><i class="fas fa-calendar"></i> Ngày nhận: ${date}</p>
                    <p><i class="fas fa-tag"></i> Mã đơn: ${order.orderCode}</p>
                </div>
                <div class="appointment-actions">
                    <button class="btn btn-sm" onclick="viewOrderDetails(${order.id})">
                        <i class="fas fa-eye"></i> Chi tiết
                    </button>
                    ${order.status === 'PENDING' ? 
                        `<button class="btn btn-sm btn-outline btn-danger" onclick="cancelOrder(${order.id})">
                            <i class="fas fa-times"></i> Hủy
                        </button>` : ''
                    }
                </div>
            </div>
        `;
    });
    
    upcomingAppointmentsContainer.innerHTML = html;
}

/**
 * Update completed appointments display
 */
function updateCompletedAppointments(orders) {
    if (!completedAppointmentsContainer) return;
    
    if (!orders || orders.length === 0) {
        completedAppointmentsContainer.innerHTML = '<p class="empty-message">Không có lịch hẹn đã hoàn thành</p>';
        return;
    }
    
    let html = '';
    
    orders.slice(0, 3).forEach(order => {
        const serviceName = order.serviceName || 'Dịch vụ không xác định';
        const date = formatDate(order.returnDate);
        
        html += `
            <div class="appointment-card">
                <div class="appointment-header">
                    <h4>${serviceName}</h4>
                    <span class="status-badge status-completed">Hoàn thành</span>
                </div>
                <div class="appointment-details">
                    <p><i class="fas fa-calendar-check"></i> Ngày hoàn thành: ${date}</p>
                    <p><i class="fas fa-tag"></i> Mã đơn: ${order.orderCode}</p>
                </div>
                <div class="appointment-actions">
                    <button class="btn btn-sm" onclick="viewOrderDetails(${order.id})">
                        <i class="fas fa-eye"></i> Chi tiết
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="reorder(${order.id})">
                        <i class="fas fa-redo"></i> Đặt lại
                    </button>
                </div>
            </div>
        `;
    });
    
    completedAppointmentsContainer.innerHTML = html;
}

/**
 * Update appointment history table
 */
function updateAppointmentHistory(orders) {
    if (!appointmentHistoryTable) return;
    
    const tbody = appointmentHistoryTable.querySelector('tbody');
    
    if (!tbody) return;
    
    if (!orders || orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">Không có lịch sử đặt lịch</td>
            </tr>
        `;
        return;
    }
    
    // Sort orders by date, most recent first
    orders.sort((a, b) => {
        const dateA = new Date(a.receivedDate);
        const dateB = new Date(b.receivedDate);
        return dateB - dateA;
    });
    
    let html = '';
    
    orders.forEach(order => {
        const serviceName = order.serviceName || 'Dịch vụ không xác định';
        const receivedDate = formatDate(order.receivedDate);
        const returnDate = formatDate(order.returnDate);
        const status = formatOrderStatus(order.status);
        const statusClass = getStatusClass(order.status);
        
        html += `
            <tr>
                <td>${order.orderCode}</td>
                <td>${serviceName}</td>
                <td>${receivedDate}</td>
                <td>${returnDate || 'Chưa xác định'}</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
                <td>
                    <button class="btn btn-sm" onclick="viewOrderDetails(${order.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${order.status === 'PENDING' ? 
                        `<button class="btn btn-sm btn-danger" onclick="cancelOrder(${order.id})">
                            <i class="fas fa-times"></i>
                        </button>` : ''
                    }
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

/**
 * Initialize event listeners
 */
function initEventListeners() {
    // Profile form submit
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileSubmit);
    }
    
    // Password change form
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordSubmit);
    }
    
    // Initialize password toggle buttons
    initPasswordToggles();
    
    // Tab navigation
    const tabLinks = document.querySelectorAll('.profile-tabs a');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all tabs
            tabLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to current tab
            e.target.classList.add('active');
            
            // Show corresponding content
            const target = e.target.getAttribute('href').substring(1);
            document.getElementById(target).classList.add('active');
        });
    });
    
    // Avatar upload
    const avatarContainer = document.querySelector('.profile-avatar');
    const avatarUpload = document.getElementById('avatar-upload');
    
    if (avatarContainer && avatarUpload) {
        avatarContainer.addEventListener('click', () => {
            avatarUpload.click();
        });
        
        avatarUpload.addEventListener('change', handleAvatarUpload);
    }
}

/**
 * Initialize password toggle buttons
 */
function initPasswordToggles() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling; // Get the password input
            const icon = this.querySelector('i');
            
            // Toggle password visibility
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

/**
 * Handle avatar upload
 */
function handleAvatarUpload(event) {
    const file = event.target.files[0];
    
    if (file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // Update avatar images
            const userAvatar = document.getElementById('user-avatar');
            const navUserAvatar = document.getElementById('nav-user-avatar');
            
            if (userAvatar) {
                userAvatar.src = e.target.result;
            }
            
            if (navUserAvatar) {
                navUserAvatar.src = e.target.result;
            }
            
            // Here you would normally upload the image to the server
            // For this demo, we'll just update the UI
            showToast('Ảnh đại diện đã được cập nhật', 'success');
        };
        
        reader.readAsDataURL(file);
    }
}

/**
 * Handle profile form submission
 */
async function handleProfileSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(profileForm);
    const firstName = formData.get('first-name');
    const lastName = formData.get('last-name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const address = formData.get('address');
    
    const profileData = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phoneNumber: phone,
        address: address
    };
    
    try {
        showSpinner();
        
        // Use the profile service to update user profile
        const updatedUserData = await window.profileService.updateUserProfile(profileData);
        
        // Update form and header with new data
        updateProfileForm(updatedUserData);
        updateProfileHeader(updatedUserData);
        
        // Update user data in localStorage if needed
        updateUserInLocalStorage(updatedUserData);
        
        showToast('Hồ sơ đã được cập nhật thành công', 'success');
    } catch (error) {
        console.error('Error updating profile:', error);
        showToast(error.message || 'Cập nhật hồ sơ thất bại. Vui lòng thử lại sau.', 'error');
    } finally {
        hideSpinner();
    }
}

/**
 * Update user data in localStorage
 */
function updateUserInLocalStorage(userData) {
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            
            // Update user data
            user.firstName = userData.firstName;
            user.lastName = userData.lastName;
            user.email = userData.email;
            user.phoneNumber = userData.phoneNumber;
            user.address = userData.address;
            
            // Save updated user
            localStorage.setItem('user', JSON.stringify(user));
            
            // Update auth UI if available
            if (typeof window.updateAuthUI === 'function') {
                window.updateAuthUI();
            }
        }
    } catch (error) {
        console.error('Error updating localStorage:', error);
    }
}

/**
 * Handle password form submission
 */
async function handlePasswordSubmit(e) {
    e.preventDefault();

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validate passwords
    if (newPassword !== confirmPassword) {
        showToast('Mật khẩu mới không khớp. Vui lòng thử lại.', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showToast('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
        return;
    }

    // Send API request
    try {
        showSpinner();

        // Use the profile service to change password
        await window.profileService.changePassword(currentPassword, newPassword, confirmPassword);

        // Clear password fields
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';

        showToast('Mật khẩu đã được thay đổi thành công', 'success');
    } catch (error) {
        console.error('Error changing password:', error);
        showToast(error.message || 'Không thể thay đổi mật khẩu. Vui lòng thử lại sau.', 'error');
    } finally {
        hideSpinner();
    }
}

/**
 * View order details
 */
async function viewOrderDetails(orderId) {
    try {
        showSpinner();
        
        // Use the profile service to fetch order details
        const order = await window.profileService.fetchOrderDetails(orderId);
        
        // Show order details modal
        showOrderDetailsModal(order);
    } catch (error) {
        console.error('Error fetching order details:', error);
        showToast('Không thể tải thông tin đơn hàng', 'error');
    } finally {
        hideSpinner();
    }
}

/**
 * Show order details modal
 */
function showOrderDetailsModal(order) {
    const modal = document.getElementById('order-details-modal');
    
    if (!modal) {
        // Create modal if it doesn't exist
        createOrderDetailsModal(order);
        return;
    }
    
    // Update modal content
    const serviceName = order.serviceName || 'Dịch vụ không xác định';
    const receivedDate = formatDate(order.receivedDate);
    const returnDate = formatDate(order.returnDate);
    const status = formatOrderStatus(order.status);
    const statusClass = getStatusClass(order.status);
    
    const modalBody = modal.querySelector('.modal-body');
    
    modalBody.innerHTML = `
        <div class="order-details">
            <div class="order-info">
                <h4>Thông tin đơn hàng</h4>
                <p><strong>Mã đơn:</strong> ${order.orderCode}</p>
                <p><strong>Dịch vụ:</strong> ${serviceName}</p>
                <p><strong>Khối lượng:</strong> ${order.weight} kg</p>
                <p><strong>Ngày nhận:</strong> ${receivedDate}</p>
                <p><strong>Ngày trả:</strong> ${returnDate || 'Chưa xác định'}</p>
                <p><strong>Trạng thái:</strong> <span class="status-badge ${statusClass}">${status}</span></p>
                <p><strong>Ghi chú:</strong> ${order.note || 'Không có ghi chú'}</p>
            </div>
            <div class="price-info">
                <h4>Thông tin giá</h4>
                <p><strong>Đơn giá:</strong> ${formatCurrency(order.servicePrice || 0)}/kg</p>
                <p><strong>Tổng tiền:</strong> ${formatCurrency((order.servicePrice || 0) * (order.weight || 0))}</p>
            </div>
        </div>
    `;
    
    // Show modal
    modal.classList.add('active');
}

/**
 * Create order details modal
 */
function createOrderDetailsModal(order) {
    const modal = document.createElement('div');
    modal.id = 'order-details-modal';
    modal.className = 'modal';
    
    const serviceName = order.serviceName || 'Dịch vụ không xác định';
    const receivedDate = formatDate(order.receivedDate);
    const returnDate = formatDate(order.returnDate);
    const status = formatOrderStatus(order.status);
    const statusClass = getStatusClass(order.status);
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Chi tiết đơn hàng</h3>
                <button class="close-modal" onclick="closeModal('order-details-modal')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="order-details">
                    <div class="order-info">
                        <h4>Thông tin đơn hàng</h4>
                        <p><strong>Mã đơn:</strong> ${order.orderCode}</p>
                        <p><strong>Dịch vụ:</strong> ${serviceName}</p>
                        <p><strong>Khối lượng:</strong> ${order.weight} kg</p>
                        <p><strong>Ngày nhận:</strong> ${receivedDate}</p>
                        <p><strong>Ngày trả:</strong> ${returnDate || 'Chưa xác định'}</p>
                        <p><strong>Trạng thái:</strong> <span class="status-badge ${statusClass}">${status}</span></p>
                        <p><strong>Ghi chú:</strong> ${order.note || 'Không có ghi chú'}</p>
                    </div>
                    <div class="price-info">
                        <h4>Thông tin giá</h4>
                        <p><strong>Đơn giá:</strong> ${formatCurrency(order.servicePrice || 0)}/kg</p>
                        <p><strong>Tổng tiền:</strong> ${formatCurrency((order.servicePrice || 0) * (order.weight || 0))}</p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn" onclick="closeModal('order-details-modal')">Đóng</button>
                ${order.status === 'PENDING' ? 
                    `<button class="btn btn-danger" onclick="cancelOrder(${order.id})">Hủy đơn hàng</button>` : ''
                }
                ${order.status === 'COMPLETED' ? 
                    `<button class="btn btn-primary" onclick="reorder(${order.id})">Đặt lại</button>` : ''
                }
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal
    modal.classList.add('active');
}

/**
 * Close modal
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Cancel an order
 */
async function cancelOrder(orderId) {
    // Show confirmation before canceling
    const confirmed = confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?');
    
    if (!confirmed) {
        return;
    }
    
    try {
        showSpinner();
        
        // Use the profile service to cancel order
        await window.profileService.cancelOrder(orderId);
        
        // Reload user appointments
        await loadUserAppointments();
        
        showToast('Đơn hàng đã được hủy thành công', 'success');
    } catch (error) {
        console.error('Error canceling order:', error);
        showToast('Không thể hủy đơn hàng. Vui lòng thử lại sau.', 'error');
    } finally {
        hideSpinner();
    }
}

/**
 * Reorder (create a new order based on an existing one)
 */
function reorder(orderId) {
    // Redirect to booking page with order ID parameter
    window.location.href = `/booking?reorder=${orderId}`;
}

/**
 * Format date string
 */
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Format order status
 */
function formatOrderStatus(status) {
    if (!status) return '';
    
    const statusMap = {
        'PENDING': 'Chờ xử lý',
        'WASHING': 'Đang giặt',
        'COMPLETED': 'Hoàn tất',
        'CANCELED': 'Đã hủy'
    };
    
    return statusMap[status] || status;
}

/**
 * Get status class for CSS styling
 */
function getStatusClass(status) {
    if (!status) return '';
    
    const classMap = {
        'PENDING': 'status-pending',
        'WASHING': 'status-washing',
        'COMPLETED': 'status-completed',
        'CANCELED': 'status-canceled'
    };
    
    return classMap[status] || '';
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
 * Check if user is logged in
 */
function isLoggedIn() {
    // Check if we have a global auth function
    if (typeof window.isLoggedIn === 'function') {
        return window.isLoggedIn();
    }
    
    // Fallback implementation
    return !!localStorage.getItem('user');
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info', title = null) {
    // Check if we have a global toast function
    if (typeof window.showToast === 'function') {
        window.showToast(message, type, title);
        return;
    }
    
    // Fallback implementation
    alert(message);
}

/**
 * Show spinner
 */
function showSpinner() {
    // Check if we have a global spinner function
    if (typeof window.showSpinner === 'function') {
        window.showSpinner();
        return;
    }
    
    // Fallback implementation
    const spinner = document.querySelector('.spinner-overlay');
    if (spinner) {
        spinner.classList.add('active');
    }
}

/**
 * Hide spinner
 */
function hideSpinner() {
    // Check if we have a global spinner function
    if (typeof window.hideSpinner === 'function') {
        window.hideSpinner();
        return;
    }
    
    // Fallback implementation
    const spinner = document.querySelector('.spinner-overlay');
    if (spinner) {
        spinner.classList.remove('active');
    }
}

// Initialize profile on DOM content loaded
document.addEventListener('DOMContentLoaded', initProfile); 