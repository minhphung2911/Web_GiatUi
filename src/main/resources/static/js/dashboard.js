// Dashboard JavaScript

// Mock functions (replace with actual implementations or imports)
function getCurrentUser() {
    // Replace with actual user retrieval logic (e.g., from localStorage, cookies, or API)
    return JSON.parse(localStorage.getItem('currentUser')); // Example: retrieve from localStorage
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

function formatTime(timeString) {
    const date = new Date(`1970-01-01T${timeString}`);
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    return date.toLocaleTimeString(undefined, options);
}

function updateUserPreferences(preferences) {
    const user = getCurrentUser();
    if (!user) return false;

    user.preferences = preferences;
    localStorage.setItem('currentUser', JSON.stringify(user)); // Example: save to localStorage
    return true;
}

function showNotification(title, message) {
    alert(`${title}: ${message}`); // Replace with a better notification system
}

function showConfirmation(title, message, callback) {
    if (confirm(`${title}: ${message}`)) {
        callback();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard functionality
    initDashboard();
});

// Initialize dashboard
function initDashboard() {
    // Check if on dashboard page
    if (!document.querySelector('.dashboard-section')) {
        return;
    }
    
    // Check if user is logged in using authService
    if (typeof window.authService !== 'undefined' && typeof window.authService.isLoggedIn === 'function') {
        if (!window.authService.isLoggedIn()) {
            // Redirect to login page with proper path (no .html)
            window.location.href = '/login?redirect=dashboard';
            return;
        }
        
        // Get user data from authService
        const user = window.authService.getCurrentUser();
        if (user) {
            // Update user name if element exists
            const userNameElement = document.getElementById('user-name');
            if (userNameElement) {
                userNameElement.textContent = user.firstName || '';
            }
        }
    } else {
        // Fallback if authService not available
        console.warn('Auth service not available, using fallback authentication check');
        
        // Get user from localStorage directly
        const userData = localStorage.getItem('user');
        if (!userData) {
            window.location.href = '/login?redirect=dashboard';
            return;
        }
        
        try {
            const user = JSON.parse(userData);
            // Update user name if element exists
            const userNameElement = document.getElementById('user-name');
            if (userNameElement && user) {
                userNameElement.textContent = user.firstName || '';
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
            window.location.href = '/login?redirect=dashboard';
            return;
        }
    }
    
    // Load dashboard data
    loadAppointments();
    loadOrders();
    loadPreferences();
    initDashboardActions();
}

// Load user appointments
function loadAppointments() {
    const user = getCurrentUser();
    const appointmentList = document.getElementById('appointment-list');
    const noAppointments = document.getElementById('no-appointments');
    const upcomingCount = document.getElementById('upcoming-count');
    
    if (appointmentList && noAppointments) {
        // Get appointments from localStorage
        const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        
        // Filter user appointments
        const userAppointments = appointments.filter(appointment => appointment.userId === user.id && appointment.status === 'upcoming');
        
        // Update upcoming count
        if (upcomingCount) {
            upcomingCount.textContent = userAppointments.length;
        }
        
        // If no appointments
        if (userAppointments.length === 0) {
            appointmentList.innerHTML = '';
            noAppointments.classList.remove('hidden');
            return;
        }
        
        // Hide no appointments message
        noAppointments.classList.add('hidden');
        
        // Clear appointment list
        appointmentList.innerHTML = '';
        
        // Sort appointments by date
        userAppointments.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Add appointments to list
        userAppointments.forEach(appointment => {
            const appointmentItem = document.createElement('div');
            appointmentItem.className = 'appointment-item';
            appointmentItem.setAttribute('data-id', appointment.id);
            
            appointmentItem.innerHTML = `
                <div class="appointment-status ${appointment.status}">
                    <span>${appointment.status}</span>
                </div>
                <div class="appointment-details">
                    <div class="appointment-service">
                        <h4>${getServiceName(appointment.service)}</h4>
                        <span class="appointment-id">#${appointment.id}</span>
                    </div>
                    <div class="appointment-date">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${formatDate(appointment.date)}</span>
                    </div>
                    <div class="appointment-time">
                        <i class="fas fa-clock"></i>
                        <span>${formatTime(appointment.time)}</span>
                    </div>
                    <div class="appointment-notes">
                        <strong>Notes:</strong> ${appointment.notes || 'No special instructions'}
                    </div>
                </div>
                <div class="appointment-actions">
                    <div class="appointment-price">${getServicePrice(appointment.service)}</div>
                    <div class="action-buttons">
                        <button class="btn btn-secondary btn-sm" data-action="edit" data-id="${appointment.id}"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn btn-danger btn-sm" data-action="cancel" data-id="${appointment.id}"><i class="fas fa-times"></i> Cancel</button>
                    </div>
                </div>
            `;
            
            appointmentList.appendChild(appointmentItem);
        });
    }
}

// Load user orders
function loadOrders() {
    const user = getCurrentUser();
    const orderList = document.getElementById('order-list');
    const noOrders = document.getElementById('no-orders');
    const pastCount = document.getElementById('past-count');
    const totalSpent = document.getElementById('total-spent');
    
    if (orderList && noOrders) {
        // Get orders from localStorage
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        
        // Filter user orders
        const userOrders = orders.filter(order => order.userId === user.id);
        
        // Update past count
        if (pastCount) {
            pastCount.textContent = userOrders.length;
        }
        
        // Update total spent
        if (totalSpent) {
            const total = userOrders.reduce((sum, order) => sum + order.price, 0);
            totalSpent.textContent = `$${total.toFixed(2)}`;
        }
        
        // If no orders
        if (userOrders.length === 0) {
            orderList.innerHTML = '';
            noOrders.classList.remove('hidden');
            return;
        }
        
        // Hide no orders message
        noOrders.classList.add('hidden');
        
        // Clear order list
        orderList.innerHTML = '';
        
        // Sort orders by date (newest first)
        userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Add orders to list
        userOrders.forEach(order => {
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            orderItem.setAttribute('data-id', order.id);
            
            orderItem.innerHTML = `
                <div class="order-header">
                    <div class="order-id">
                        <h4>Order #${order.id}</h4>
                        <span class="order-date">${formatDate(order.date)}</span>
                    </div>
                    <div class="order-status ${order.status}">
                        <span>${order.status}</span>
                    </div>
                </div>
                <div class="order-body">
                    <div class="order-service">
                        <span class="service-name">${getServiceName(order.service)}</span>
                        <span class="service-items">${order.items || 'No items specified'}</span>
                    </div>
                    <div class="order-notes">
                        <span>${order.notes || 'No special instructions'}</span>
                    </div>
                    <div class="order-price">
                        <span>$${order.price.toFixed(2)}</span>
                    </div>
                </div>
                <div class="order-footer">
                    <button class="btn btn-text" data-action="details" data-id="${order.id}"><i class="fas fa-eye"></i> View Details</button>
                    <button class="btn btn-text" data-action="receipt" data-id="${order.id}"><i class="fas fa-file-invoice"></i> Receipt</button>
                    <button class="btn btn-text" data-action="reorder" data-id="${order.id}"><i class="fas fa-redo"></i> Reorder</button>
                </div>
            `;
            
            orderList.appendChild(orderItem);
        });
    }
}

// Load user preferences
function loadPreferences() {
    const user = getCurrentUser();
    
    if (user && user.preferences) {
        const detergentPreference = document.getElementById('detergent-preference');
        const fabricSoftener = document.getElementById('fabric-softener');
        const starchLevel = document.getElementById('starch-level');
        const deliveryTime = document.getElementById('delivery-time');
        const deliveryInstructions = document.getElementById('delivery-instructions');
        const emailNotifications = document.getElementById('email-notifications');
        const smsNotifications = document.getElementById('sms-notifications');
        const promoEmails = document.getElementById('promo-emails');
        
        if (detergentPreference) detergentPreference.value = user.preferences.detergent || 'regular';
        if (fabricSoftener) fabricSoftener.checked = user.preferences.fabricSoftener !== false;
        if (starchLevel) starchLevel.value = user.preferences.starchLevel || 'none';
        if (deliveryTime) deliveryTime.value = user.preferences.deliveryTime || 'afternoon';
        if (deliveryInstructions) deliveryInstructions.value = user.preferences.deliveryInstructions || '';
        if (emailNotifications) emailNotifications.checked = user.preferences.emailNotifications !== false;
        if (smsNotifications) smsNotifications.checked = user.preferences.smsNotifications !== false;
        if (promoEmails) promoEmails.checked = user.preferences.promoEmails === true;
    }
}

// Initialize dashboard actions
function initDashboardActions() {
    // Save preferences
    const savePreferencesBtn = document.getElementById('save-preferences');
    
    if (savePreferencesBtn) {
        savePreferencesBtn.addEventListener('click', function() {
            // Get preferences
            const detergentPreference = document.getElementById('detergent-preference').value;
            const fabricSoftener = document.getElementById('fabric-softener').checked;
            const starchLevel = document.getElementById('starch-level').value;
            const deliveryTime = document.getElementById('delivery-time').value;
            const deliveryInstructions = document.getElementById('delivery-instructions').value;
            const emailNotifications = document.getElementById('email-notifications').checked;
            const smsNotifications = document.getElementById('sms-notifications').checked;
            const promoEmails = document.getElementById('promo-emails').checked;
            
            // Update preferences
            const preferences = {
                detergent: detergentPreference,
                fabricSoftener,
                starchLevel,
                deliveryTime,
                deliveryInstructions,
                emailNotifications,
                smsNotifications,
                promoEmails
            };
            
            // Save preferences
            const success = updateUserPreferences(preferences);
            
            if (success) {
                showNotification('Success', 'Your preferences have been saved successfully.');
            } else {
                showNotification('Error', 'There was an error saving your preferences. Please try again.');
            }
        });
    }
    
    // Appointment actions
    document.addEventListener('click', function(e) {
        // Edit appointment
        if (e.target.closest('[data-action="edit"]')) {
            const button = e.target.closest('[data-action="edit"]');
            const appointmentId = button.getAttribute('data-id');
            
            // Redirect to booking page with appointment ID
            window.location.href = `booking.html?edit=${appointmentId}`;
        }
        
        // Cancel appointment
        if (e.target.closest('[data-action="cancel"]')) {
            const button = e.target.closest('[data-action="cancel"]');
            const appointmentId = button.getAttribute('data-id');
            
            // Show confirmation modal
            showConfirmation(
                'Cancel Appointment',
                'Are you sure you want to cancel this appointment? This action cannot be undone.',
                function() {
                    // Cancel appointment
                    cancelAppointment(appointmentId);
                }
            );
        }
        
        // Order details
        if (e.target.closest('[data-action="details"]')) {
            const button = e.target.closest('[data-action="details"]');
            const orderId = button.getAttribute('data-id');
            
            // Show order details
            showOrderDetails(orderId);
        }
        
        // Order receipt
        if (e.target.closest('[data-action="receipt"]')) {
            const button = e.target.closest('[data-action="receipt"]');
            const orderId = button.getAttribute('data-id');
            
            // Show receipt
            showReceipt(orderId);
        }
        
        // Reorder
        if (e.target.closest('[data-action="reorder"]')) {
            const button = e.target.closest('[data-action="reorder"]');
            const orderId = button.getAttribute('data-id');
            
            // Reorder
            reorder(orderId);
        }
    });
}

// Cancel appointment
function cancelAppointment(appointmentId) {
    // Get appointments from localStorage
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    
    // Find appointment index
    const appointmentIndex = appointments.findIndex(appointment => appointment.id === appointmentId);
    
    if (appointmentIndex === -1) {
        showNotification('Error', 'Appointment not found. Please try again.');
        return;
    }
    
    // Update appointment status
    appointments[appointmentIndex].status = 'cancelled';
    appointments[appointmentIndex].cancelledAt = new Date().toISOString();
    
    // Save to localStorage
    localStorage.setItem('appointments', JSON.stringify(appointments));
    
    // Reload appointments
    loadAppointments();
    
    // Show success message
    showNotification('Success', 'Your appointment has been cancelled successfully.');
}

// Show order details
function showOrderDetails(orderId) {
    // Get orders from localStorage
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Find order
    const order = orders.find(order => order.id === orderId);
    
    if (!order) {
        showNotification('Error', 'Order not found. Please try again.');
        return;
    }
    
    // Show order details
    showNotification(
        `Order #${order.id}`,
        `
        <div class="order-details">
            <p><strong>Service:</strong> ${getServiceName(order.service)}</p>
            <p><strong>Date:</strong> ${formatDate(order.date)}</p>
            <p><strong>Time:</strong> ${formatTime(order.time)}</p>
            <p><strong>Items:</strong> ${order.items || 'No items specified'}</p>
            <p><strong>Notes:</strong> ${order.notes || 'No special instructions'}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Price:</strong> $${order.price.toFixed(2)}</p>
        </div>
        `
    );
}

// Show receipt
function showReceipt(orderId) {
    // Get orders from localStorage
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Find order
    const order = orders.find(order => order.id === orderId);
    
    if (!order) {
        showNotification('Error', 'Order not found. Please try again.');
        return;
    }
    
    // Show receipt
    showNotification(
        `Receipt for Order #${order.id}`,
        `
        <div class="receipt">
            <div class="receipt-header">
                <h4>Fresh Laundry</h4>
                <p>123 Laundry Street, Clean City</p>
                <p>Tel: (123) 456-7890</p>
            </div>
            <div class="receipt-details">
                <p><strong>Order ID:</strong> ${order.id}</p>
                <p><strong>Date:</strong> ${formatDate(order.date)}</p>
                <p><strong>Time:</strong> ${formatTime(order.time)}</p>
                <p><strong>Service:</strong> ${getServiceName(order.service)}</p>
                <p><strong>Items:</strong> ${order.items || 'No items specified'}</p>
            </div>
            <div class="receipt-total">
                <p><strong>Total:</strong> $${order.price.toFixed(2)}</p>
            </div>
            <div class="receipt-footer">
                <p>Thank you for choosing Fresh Laundry!</p>
            </div>
        </div>
        `
    );
}

// Reorder
function reorder(orderId) {
    // Get orders from localStorage
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Find order
    const order = orders.find(order => order.id === orderId);
    
    if (!order) {
        showNotification('Error', 'Order not found. Please try again.');
        return;
    }
    
    // Redirect to booking page with service
    window.location.href = `booking.html?service=${order.service}`;
}

// Get service name
function getServiceName(service) {
    switch (service) {
        case 'wash-fold':
            return 'Wash & Fold';
        case 'dry-cleaning':
            return 'Dry Cleaning';
        case 'ironing':
            return 'Ironing Service';
        case 'pickup-delivery':
            return 'Pickup & Delivery';
        case 'premium':
            return 'Premium Package';
        default:
            return 'Wash & Fold';
    }
}

// Get service price
function getServicePrice(service) {
    switch (service) {
        case 'wash-fold':
            return '$2.50/lb';
        case 'dry-cleaning':
            return '$6.00/item';
        case 'ironing':
            return '$3.00/item';
        case 'pickup-delivery':
            return '$5.00 + service cost';
        case 'premium':
            return '$3.50/lb';
        default:
            return '$2.50/lb';
    }
}

// Initialize dashboard
initDashboard();
