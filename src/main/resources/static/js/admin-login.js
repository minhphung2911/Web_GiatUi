/**
 * Admin Login JavaScript
 * This file handles the admin login functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('admin-login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleAdminLogin);
    }
    
    // Kiểm tra đã đăng nhập chưa
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser && currentUser.roles && 
        currentUser.roles.some(role => role.name === 'ROLE_ADMIN')) {
        // Redirect to dashboard if already logged in as admin
        window.location.href = '/admin-dashboard';
    }
});

/**
 * Handle admin login form submission
 * @param {Event} event - The form submit event
 */
function handleAdminLogin(event) {
    event.preventDefault();
    
    // Get form data
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    
    // Validate form data
    if (!email || !password) {
        showLoginError('Vui lòng nhập đầy đủ thông tin đăng nhập');
        return;
    }
    
    // Clear previous error message
    hideLoginError();
    
    // Show loading indicator
    const submitButton = document.querySelector('#admin-login-form button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
    
    // Gọi API đăng nhập thật
    fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Kiểm tra role
            const user = data.user;
            const roles = user.roles || [];
            
            if (roles.some(role => role.name === 'ROLE_ADMIN')) {
                // Lưu thông tin người dùng
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                // Chuyển hướng đến dashboard
                window.location.href = '/admin-dashboard';
            } else {
                showLoginError('Tài khoản không có quyền admin');
            }
        } else {
            showLoginError(data.message || 'Đăng nhập thất bại');
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        showLoginError('Lỗi kết nối máy chủ');
    })
    .finally(() => {
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    });
}

/**
 * Show login error message
 * @param {string} message - The error message
 */
function showLoginError(message) {
    const errorElement = document.getElementById('login-error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Add error class to the form
        const form = document.getElementById('admin-login-form');
        if (form) {
            form.classList.add('form-error');
        }
    }
}

/**
 * Hide login error message
 */
function hideLoginError() {
    const errorElement = document.getElementById('login-error');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
        
        // Remove error class from the form
        const form = document.getElementById('admin-login-form');
        if (form) {
            form.classList.remove('form-error');
        }
    }
} 