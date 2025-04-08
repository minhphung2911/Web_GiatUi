// Authentication JavaScript

// Generate a unique ID
function generateId(prefix = '') {
    return prefix + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Get current user from localStorage
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// Check if user is authenticated and redirect if not
function checkUserAuth() {
    if (!isLoggedIn()) {
        // Redirect to login page if not logged in
        window.location.href = 'login.html';
    }
}

// Show a confirmation dialog
function showConfirmation(title, message, callback) {
    if (confirm(message)) {
        callback();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize logout functionality
    initLogout();
    
    // Check if user is logged in
    checkUserAuth();
});

// Register a new user
async function registerUser(userData) {
    try {
        const response = await fetch('/register/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Registration failed');
        }

        // Handle successful registration
        window.location.href = '/register?success';
    } catch (error) {
        // Display error message
        document.getElementById('register-error').style.display = 'block';
        document.getElementById('error-message').textContent = error.message;
    }
}

// Login user
async function loginUser(email, password, remember = false) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, remember })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        if (remember) {
            localStorage.setItem('rememberToken', data.token);
        }
        return true;
    } catch (error) {
        console.error('Login error:', error);
        return false;
    }
}

// Logout user
async function logoutUser() {
    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('rememberToken')}`
            }
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    // Clear local storage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('rememberToken');
    
    // Redirect to home page
    window.location.href = 'index.html';
}

// Initialize logout functionality
function initLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            showConfirmation(
                'Logout Confirmation',
                'Are you sure you want to logout?',
                function() {
                    logoutUser();
                }
            );
        });
    }
}

// Update user profile
function updateUserProfile(userData) {
    // Get current user
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        return false;
    }
    
    // Get all users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Find user index
    const userIndex = users.findIndex(user => user.id === currentUser.id);
    
    if (userIndex === -1) {
        return false;
    }
    
    // Update user data
    const updatedUser = {
        ...users[userIndex],
        ...userData,
        updatedAt: new Date().toISOString()
    };
    
    // Update users array
    users[userIndex] = updatedUser;
    
    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    return true;
}

// Update user preferences
function updateUserPreferences(preferences) {
    // Get current user
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        return false;
    }
    
    // Get all users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Find user index
    const userIndex = users.findIndex(user => user.id === currentUser.id);
    
    if (userIndex === -1) {
        return false;
    }
    
    // Update user preferences
    const updatedUser = {
        ...users[userIndex],
        preferences: {
            ...users[userIndex].preferences,
            ...preferences
        },
        updatedAt: new Date().toISOString()
    };
    
    // Update users array
    users[userIndex] = updatedUser;
    
    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    return true;
}

// Check if user is logged in
function isLoggedIn() {
    return !!getCurrentUser();
}

// Require authentication
function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
        return false;
    }
    return true;
}

// Initialize demo data
function initDemoData() {
    // Check if demo data already exists
    if (localStorage.getItem('demoDataInitialized')) {
        return;
    }
    
    // Create demo users
    const users = [
        {
            id: 'user_demo1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '(123) 456-7890',
            password: 'password123',
            createdAt: new Date().toISOString(),
            preferences: {
                detergent: 'hypoallergenic',
                fabricSoftener: true,
                starchLevel: 'light',
                deliveryTime: 'afternoon',
                deliveryInstructions: 'Please call 10 minutes before arrival.',
                emailNotifications: true,
                smsNotifications: true,
                promoEmails: false
            }
        }
    ];
    
    // Create demo appointments
    const appointments = [
        {
            id: 'appt_demo1',
            userId: 'user_demo1',
            service: 'wash-fold',
            date: '2023-07-15',
            time: '10:00',
            status: 'upcoming',
            notes: 'Please use fragrance-free detergent',
            items: '8 shirts, 2 pants, 5 towels',
            price: 45.00,
            createdAt: new Date().toISOString()
        },
        {
            id: 'appt_demo2',
            userId: 'user_demo1',
            service: 'dry-cleaning',
            date: '2023-07-20',
            time: '14:00',
            status: 'upcoming',
            notes: '',
            items: '1 suit, 3 dresses, 2 jackets',
            price: 75.50,
            createdAt: new Date().toISOString()
        }
    ];
    
    // Create demo orders
    const orders = [
        {
            id: 'ord_demo1',
            userId: 'user_demo1',
            service: 'ironing',
            date: '2023-07-01',
            time: '13:00',
            status: 'completed',
            notes: 'Extra starch on dress shirts',
            items: '12 shirts, 3 pants',
            price: 35.00,
            createdAt: '2023-07-01T13:00:00Z',
            completedAt: '2023-07-02T15:00:00Z'
        },
        {
            id: 'ord_demo2',
            userId: 'user_demo1',
            service: 'premium',
            date: '2023-06-20',
            time: '11:00',
            status: 'completed',
            notes: 'Hypoallergenic washing preferred',
            items: 'Winter bedding, 4 comforters, 8 pillows',
            price: 120.00,
            createdAt: '2023-06-20T11:00:00Z',
            completedAt: '2023-06-22T14:00:00Z'
        }
    ];
    
    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('appointments', JSON.stringify(appointments));
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('demoDataInitialized', 'true');
}

// Initialize demo data on page load
initDemoData();
