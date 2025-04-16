/**
 * Auth JavaScript
 * Handles user authentication and UI updates based on auth state
 */

// API endpoint for authentication
const AUTH_API_BASE_URL = '/api/auth';

/**
 * Check if a user is currently logged in
 * @returns {boolean} True if user is logged in, false otherwise
 */
function isLoggedIn() {
    const userData = localStorage.getItem('user');
    return userData !== null && userData !== undefined;
}

/**
 * Get the current logged-in user data
 * @returns {Object|null} User data or null if not logged in
 */
function getCurrentUser() {
    try {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
}

/**
 * Update UI elements based on authentication state
 */
function updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userProfile = document.getElementById('user-profile');
    
    if (isLoggedIn()) {
        // User is logged in
        if (authButtons) authButtons.classList.add('hidden');
        if (userProfile) {
            userProfile.classList.remove('hidden');
            
            // Check if user has admin role
            const user = getCurrentUser();
            const isAdmin = user && user.roles && user.roles.some(role => role.name === 'ROLE_ADMIN');
            
            // Show/hide dashboard link based on user role
            const dashboardLink = userProfile.querySelector('a[href="/dashboard"]');
            if (dashboardLink) {
                if (isAdmin) {
                    dashboardLink.style.display = 'flex';
                } else {
                    dashboardLink.style.display = 'none';
                }
            }
            
            // Add user's name to profile dropdown if not already there
            if (user) {
                const userDropdown = document.querySelector('.user-profile .dropdown-menu');
                if (userDropdown && !document.querySelector('.user-profile-name')) {
                    // Create user name element at the top of dropdown
                    const nameElement = document.createElement('div');
                    nameElement.classList.add('user-profile-name');
                    nameElement.textContent = `${user.firstName} ${user.lastName}`;
                    nameElement.style.padding = '10px';
                    nameElement.style.fontWeight = 'bold';
                    nameElement.style.borderBottom = '1px solid #eee';
                    nameElement.style.marginBottom = '5px';
                    userDropdown.insertBefore(nameElement, userDropdown.firstChild);
                }
            }
        }
    } else {
        // User is not logged in
        if (authButtons) authButtons.classList.remove('hidden');
        if (userProfile) userProfile.classList.add('hidden');
    }
}

/**
 * Handle user login
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {boolean} remember - Whether to remember the user
 * @returns {Promise<Object>} Login result
 */
async function loginUser(email, password, remember = false) {
    try {
        showSpinner();
        
        const response = await fetch(`${AUTH_API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password,
                remember: remember
            })
        });
        
        // Check for response status before trying to parse JSON
        if (!response.ok) {
            let errorMessage = 'Đăng nhập thất bại';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (parseError) {
                console.error('Error parsing error response:', parseError);
            }
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        
        if (data.success) {
            // Store user data and token if available
            localStorage.setItem('user', JSON.stringify(data.user));
            
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            
            // Update UI
            updateAuthUI();
            
            // Check for redirect parameter in URL
            const urlParams = new URLSearchParams(window.location.search);
            const redirectPath = urlParams.get('redirect');
            
            // Redirect to home page if no redirect specified, else redirect to specified path
            if (redirectPath) {
                // Make sure we're using the proper Spring MVC route (not .html)
                const cleanPath = redirectPath.replace('.html', '');
                window.location.href = `/${cleanPath}`;
            } else if (window.location.pathname === '/login') {
                // Chuyển hướng về trang chủ thay vì dashboard
                window.location.href = '/';
            }
            
            return data;
        } else {
            // Show error notification
            showToast('Đăng nhập thất bại', data.message || 'Email hoặc mật khẩu không đúng', 'error');
            return null;
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Lỗi', 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.', 'error');
        return null;
    } finally {
        hideSpinner();
    }
}

/**
 * Handle user logout
 */
async function logoutUser() {
    try {
        showSpinner();
        
        // Call logout API (optional, depends on backend implementation)
        await fetch(`${AUTH_API_BASE_URL}/logout`, {
            method: 'POST'
        });
        
        // Clear local storage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        
        // Update UI
        updateAuthUI();
        

        
        // Redirect to home page
        window.location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        hideSpinner();
    }
}

/**
 * Require authentication for a page
 * Redirects to login if not authenticated
 */
function requireAuth() {
    if (!isLoggedIn()) {
        showToast('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để truy cập trang này.', 'warning');
        
        // Create redirect parameter using the current path (without .html extension)
        const currentPath = window.location.pathname.replace('/', '').replace('.html', '');
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        return false;
    }
    return true;
}

/**
 * Initialize auth-related elements and event listeners
 */
function initAuth() {
    // Update UI based on auth state
    updateAuthUI();
    
    // Kiểm tra nếu người dùng đã đăng nhập nhưng vẫn ở trang login, chuyển hướng về trang chủ
    if (isLoggedIn() && window.location.pathname === '/login') {
        window.location.href = '/';
        return;
    }
    
    // Login form handling if on login page
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Ngăn form tự submit
            
            try {
                // Hiển thị spinner
                showSpinner();
                
                // Lấy thông tin đăng nhập
                const email = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                const remember = document.getElementById('remember-me')?.checked || false;
                
                console.log("Đang thử đăng nhập với email:", email);
                
                // Gọi API đăng nhập
                const result = await loginUser(email, password, remember);
                
                if (result && result.success) {
                    console.log("Đăng nhập thành công, đang chuyển hướng...");
                    // Chuyển hướng sẽ được thực hiện trong hàm loginUser
                } else {
                    hideSpinner();
                    console.error("Đăng nhập thất bại:", result ? result.message : "Lỗi không xác định");
                    
                    // Hiển thị thông báo lỗi
                    const errorBox = document.getElementById('login-error');
                    const errorMessage = document.getElementById('error-message');
                    
                    if (errorBox && errorMessage) {
                        errorMessage.textContent = result && result.message ? result.message : "Email hoặc mật khẩu không chính xác. Vui lòng thử lại.";
                        errorBox.style.display = 'flex';
                    } else {
                        alert("Đăng nhập thất bại: " + (result && result.message ? result.message : "Email hoặc mật khẩu không chính xác"));
                    }
                }
            } catch (error) {
                hideSpinner();
                console.error("Lỗi đăng nhập:", error);
                
                // Hiển thị thông báo lỗi
                const errorBox = document.getElementById('login-error');
                const errorMessage = document.getElementById('error-message');
                
                if (errorBox && errorMessage) {
                    errorMessage.textContent = error.message || "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.";
                    errorBox.style.display = 'flex';
                } else {
                    alert("Lỗi đăng nhập: " + (error.message || "Không xác định"));
                }
            }
        });
    }
    
    // Logout button handling
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logoutUser();
        });
    }
}

/**
 * Show notification (fallback if not defined elsewhere)
 */
function showToast(message, type = 'info', title = null) {
    // Check if the global showToast is a different function than this one
    if (typeof window.showToast === 'function' && window.showToast !== showToast) {
        window.showToast(message, type, title);
        return;
    }
    
    // Fallback to alert if no toast function available
    alert(`${title || type}: ${message}`);
}

/**
 * Show loading spinner (fallback if not defined elsewhere)
 */
function showSpinner() {
    // Check if we're trying to use a function other than this one
    // We need to check if the function exists and isn't this one
    if (typeof window.showSpinner === 'function' && window.showSpinner !== showSpinner) {
        window.showSpinner();
        return;
    }
    
    const spinner = document.getElementById('spinner');
    if (spinner) {
        spinner.classList.add('active');
    }
}

/**
 * Hide loading spinner (fallback if not defined elsewhere)
 */
function hideSpinner() {
    // Check if we're trying to use a function other than this one
    // We need to check if the function exists and isn't this one
    if (typeof window.hideSpinner === 'function' && window.hideSpinner !== hideSpinner) {
        window.hideSpinner();
        return;
    }
    
    const spinner = document.getElementById('spinner');
    if (spinner) {
        spinner.classList.remove('active');
    }
}

// Initialize auth functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', initAuth);

// Export functions for use in other scripts
window.authService = {
    isLoggedIn,
    getCurrentUser,
    loginUser,
    logoutUser,
    requireAuth,
    updateAuthUI,
    showToastMessage: function(message, type, title) {
        // Use our fixed showToast function but avoid recursion
        const alertMsg = `${title || type || ''}: ${message}`;
        if (type === 'error') {
            console.error(alertMsg);
        } else {
            console.log(alertMsg);
        }
        alert(alertMsg);
    }
}; 