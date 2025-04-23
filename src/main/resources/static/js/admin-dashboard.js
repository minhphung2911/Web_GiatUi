/**
 * Admin Dashboard JavaScript
 * This file handles the functionality of the admin dashboard
 */

// Global variables
let adminData = null;
let dashboardStats = null;
let feedbacks = [];

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initializeUI();
    checkAdminSession();
    initializeCharts();
    loadDashboardData();
    setupEventListeners();
});

/**
 * Initialize the UI components
 */
function initializeUI() {
    // Setup sidebar toggle
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            const sidebar = document.getElementById('sidebar');
            const mainContent = document.querySelector('.main-content');
            
            if (sidebar) sidebar.classList.toggle('collapsed');
            if (mainContent) mainContent.classList.toggle('expanded');
        });
    }

    // Setup navigation
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            
            // Update active link
            navLinks.forEach(link => link.classList.remove('active'));
            this.classList.add('active');
            
            // Update page title and breadcrumb
            updatePageTitle(section);
            
            // Show active section
            const sections = document.querySelectorAll('.section');
            sections.forEach(section => {
                if (section) section.classList.remove('active');
            });
            
            const targetSection = document.getElementById(`${section}-section`);
            if (targetSection) targetSection.classList.add('active');
            
            // Load data for the section
            if (section === 'dashboard') {
                loadDashboardData();
            } else if (section === 'bookings') {
                // No need to call loadBookingsData since it's defined in admin-bookings.js
                if (typeof loadBookings === 'function') {
                    loadBookings();
                }
            } else if (section === 'customers') {
                // No need to call loadCustomersData since it's defined in admin-customers.js
                if (typeof loadCustomers === 'function') {
                    loadCustomers();
                }
            } else if (section === 'services') {
                // No need to call loadServicesData since it's defined in admin-services.js
                if (typeof loadServices === 'function') {
                    loadServices();
                }
            }
        });
    });

    // Setup logout
    const adminLogout = document.getElementById('admin-logout');
    if (adminLogout) {
        adminLogout.addEventListener('click', function(e) {
            e.preventDefault();
            logoutAdmin();
        });
    }
    
    // Also handle the profile logout button
    const profileLogout = document.getElementById('profile-logout');
    if (profileLogout) {
        profileLogout.addEventListener('click', function(e) {
            e.preventDefault();
            logoutAdmin();
        });
    }
}

/**
 * Update page title and breadcrumb
 */
function updatePageTitle(section) {
    let title = 'Tổng Quan';
    
    switch(section) {
        case 'dashboard':
            title = 'Tổng Quan';
            break;
        case 'bookings':
            title = 'Quản Lý Đặt Lịch';
            break;
        case 'customers':
            title = 'Quản Lý Khách Hàng';
            break;
        case 'services':
            title = 'Quản Lý Dịch Vụ';
            break;
        case 'reports':
            title = 'Báo Cáo';
            break;
        case 'settings':
            title = 'Cài Đặt';
            break;
    }
    
    const pageTitleElement = document.getElementById('page-title');
    const breadcrumbElement = document.getElementById('breadcrumb-current');
    
    if (pageTitleElement) pageTitleElement.textContent = title;
    if (breadcrumbElement) breadcrumbElement.textContent = title;
}

/**
 * Check if admin is logged in
 */
function checkAdminSession() {
    // Try to get user data from localStorage (matching how login/index pages store login state)
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    if (currentUser) {
        // User is logged in, treat them as admin for demo purposes
        adminData = currentUser;
        
        // Update admin profile with user data
        updateAdminProfile(currentUser);
        
        console.log('Admin logged in:', currentUser.name || currentUser.email);
    } else {
        console.log('No user logged in, redirecting to login page');
        // Redirect to login page if not logged in
        window.location.href = '/login';
        return;
    }
}

/**
 * Update admin profile in the sidebar
 */
function updateAdminProfile(userData) {
    // Handle null case
    if (!userData) return;
    
    // Update admin name - try different possible properties
    const adminName = userData.name || 
                      (userData.firstName && userData.lastName ? 
                      `${userData.firstName} ${userData.lastName}` : 
                      userData.email || 'Admin');
    
    // Update role based on available data
    const adminRole = userData.role || 'Quản trị viên';
    
    // Update UI elements
    const adminNameElement = document.getElementById('admin-name');
    const adminRoleElement = document.getElementById('admin-role');
    const headerAdminNameElement = document.getElementById('header-admin-name');
    
    // Update elements if they exist
    if (adminNameElement) adminNameElement.textContent = adminName;
    if (adminRoleElement) adminRoleElement.textContent = adminRole;
    if (headerAdminNameElement) headerAdminNameElement.textContent = adminName;
    
    // Update avatar if exists
    const adminAvatar = document.getElementById('admin-avatar');
    const headerAdminAvatar = document.getElementById('header-admin-avatar');
    
    // Set default avatar if none exists
    const avatarUrl = userData.avatar || '/img/default-avatar.svg';
    
    if (adminAvatar) adminAvatar.src = avatarUrl;
    if (headerAdminAvatar) headerAdminAvatar.src = avatarUrl;
    
    // Log successful update
    console.log('Admin profile updated:', adminName);
}

/**
 * Logout admin
 */
function logoutAdmin() {
    // Clear user data from localStorage (matching the approach in user-auth.js)
    localStorage.removeItem('currentUser');
    
    // Show logout message
    if (typeof showToast === 'function') {
        showToast('Đăng xuất thành công!', 'success');
        
        // Delay redirect to see the message
        setTimeout(function() {
            window.location.href = '/login?logout=true';
        }, 1000);
    } else {
        // Redirect immediately if showToast isn't available
        window.location.href = '/login?logout=true';
    }
    
    console.log('Logout successful');
}

/**
 * Initialize chart data
 */
function initializeCharts() {
    // Initialize customer chart with empty data
    const customerCtx = document.getElementById('customerChart');
    if (customerCtx) {
        window.customerChart = new Chart(customerCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
                datasets: [
                    {
                        label: 'Khách Hàng Mới',
                        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        backgroundColor: '#4ECDC4'
                    },
                    {
                        label: 'Khách Hàng Quay Lại',
                        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        backgroundColor: '#FF6B6B'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Initialize revenue chart with empty data
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        window.revenueChart = new Chart(revenueCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
                datasets: [{
                    label: 'Doanh Thu',
                    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#4ECDC4',
                    backgroundColor: 'rgba(78, 205, 196, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString() + 'đ';
                            }
                        }
                    }
                }
            }
        });
    }

    // Initialize service chart
    const serviceCtx = document.getElementById('serviceChart');
    if (serviceCtx) {
        window.serviceChart = new Chart(serviceCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Giặt Thường', 'Giặt Hấp', 'Giặt Khô', 'Giặt Đồ Da', 'Giặt Đồ Cao Cấp'],
                datasets: [{
                    data: [35, 25, 20, 10, 10],
                    backgroundColor: [
                        '#4ECDC4',
                        '#FF6B6B',
                        '#FFA900',
                        '#5D78FF',
                        '#9C27B0'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                cutout: '70%'
            }
        });
        
        // Create service chart legend
        const serviceLegend = document.getElementById('service-chart-legend');
        if (serviceLegend) {
            let legendHtml = '';
            const chartData = window.serviceChart.data;
            
            for (let i = 0; i < chartData.labels.length; i++) {
                legendHtml += `
                    <div class="legend-item">
                        <span class="legend-color" style="background-color: ${chartData.datasets[0].backgroundColor[i]};"></span>
                        <span>${chartData.labels[i]}</span>
                    </div>
                `;
            }
            
            serviceLegend.innerHTML = legendHtml;
        }
    }
}

/**
 * Load dashboard data
 */
function loadDashboardData() {
    // Update dashboard stats with mock data (simulate API call)
    updateDashboardStats(generateMockData());
    
    // Load recent bookings
    updateRecentBookings();
}

/**
 * Generate mock data for dashboard
 */
function generateMockData() {
    return {
        totalBookings: 124,
        totalCustomers: 87,
        totalRevenue: 47500000,
        completedBookings: 98,
        bookingGrowth: 12.5,
        customerGrowth: 8.3,
        revenueGrowth: 5.7,
        completionGrowth: 3.2,
        customerData: {
            newCustomers: [5, 8, 12, 10, 7, 5, 9, 11, 8, 6, 7, 9],
            returningCustomers: [3, 5, 7, 8, 6, 4, 7, 9, 6, 5, 6, 7]
        },
        revenueData: [
            2500000, 3500000, 4200000, 3800000, 4000000, 4500000, 
            5000000, 4800000, 5200000, 5500000, 4800000, 5100000
        ]
    };
}

/**
 * Update dashboard stats
 */
function updateDashboardStats(stats) {
    // Update counter elements
    const totalBookingsElement = document.getElementById('total-bookings');
    const totalCustomersElement = document.getElementById('total-customers');
    const totalRevenueElement = document.getElementById('total-revenue');
    const completedBookingsElement = document.getElementById('completed-bookings');
    
    if (totalBookingsElement) totalBookingsElement.textContent = stats.totalBookings;
    if (totalCustomersElement) totalCustomersElement.textContent = stats.totalCustomers;
    if (totalRevenueElement) totalRevenueElement.textContent = formatCurrency(stats.totalRevenue);
    if (completedBookingsElement) completedBookingsElement.textContent = stats.completedBookings;
    
    // Update charts
    updateDashboardCharts(stats);
}

/**
 * Update dashboard charts
 */
function updateDashboardCharts(stats) {
    // Update customer chart
    if (window.customerChart && stats.customerData) {
        window.customerChart.data.datasets[0].data = stats.customerData.newCustomers;
        window.customerChart.data.datasets[1].data = stats.customerData.returningCustomers;
        window.customerChart.update();
    }
    
    // Update revenue chart
    if (window.revenueChart && stats.revenueData) {
        window.revenueChart.data.datasets[0].data = stats.revenueData;
        window.revenueChart.update();
    }
}

/**
 * Load recent bookings for dashboard
 */
function updateRecentBookings() {
    const recentBookingsTable = document.getElementById('recent-bookings-body');
    if (!recentBookingsTable) return;
    
    // Show loading
    recentBookingsTable.innerHTML = '<tr><td colspan="6" class="text-center py-4"><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang tải...</td></tr>';
    
    // Call API to get recent bookings
    fetch('/api/admin/bookings?limit=5')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(bookings => {
            // Update the UI with the bookings
            displayMockBookings(bookings, recentBookingsTable);
            // Update revenue data
            updateRevenueData(bookings);
        })
        .catch(error => {
            console.error('Error fetching recent bookings:', error);
            
            // Generate mock bookings for demo
            const mockBookings = generateMockBookings();
            displayMockBookings(mockBookings, recentBookingsTable);
            // Update revenue data with mock bookings
            updateRevenueData(mockBookings);
        });
}

/**
 * Generate mock bookings for demo
 */
function generateMockBookings() {
    const statuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
    const services = ['Giặt thường', 'Giặt hấp', 'Giặt khô', 'Giặt đồ da', 'Giặt đồ cao cấp'];
    const customers = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Văn E'];
    
    const mockBookings = [];
    
    for (let i = 1; i <= 5; i++) {
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const randomService = services[Math.floor(Math.random() * services.length)];
        const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
        const randomPrice = Math.floor(Math.random() * 500000) + 100000;
        
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 10));
        
        mockBookings.push({
            id: i,
            bookingCode: 'BK-' + (1000 + i),
            userName: randomCustomer,
            serviceName: randomService,
            totalPrice: randomPrice,
            status: randomStatus,
            bookingDate: date.toISOString()
        });
    }
    
    return mockBookings;
}

/**
 * Display mock bookings in table
 */
function displayMockBookings(bookings, tableBody) {
    // Clear loading row
    tableBody.innerHTML = '';
    
    // Add booking rows
    bookings.forEach(booking => {
        const row = document.createElement('tr');
        
        // Create status badge
        const statusBadge = `<span class="status-badge ${getStatusClass(booking.status)}">${getStatusText(booking.status)}</span>`;
        
        row.innerHTML = `
            <td>${booking.bookingCode || 'BK-' + booking.id}</td>
            <td>${booking.userName || 'Khách hàng'}</td>
            <td>${booking.serviceName || 'Dịch vụ giặt là'}</td>
            <td>${formatCurrency(booking.totalPrice)}</td>
            <td>${statusBadge}</td>
            <td>${formatDate(booking.bookingDate)}</td>
            <td>
                <button class="btn-icon view-dashboard-booking" data-id="${booking.id}">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

/**
 * Set up general event listeners
 */
function setupEventListeners() {
    // Add any additional event listeners here
}

/**
 * Format date
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    if (!amount && amount !== 0) return 'N/A';
    
    try {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount).replace(/\s/g, '');
    } catch (e) {
        return amount.toLocaleString() + 'đ';
    }
}

/**
 * Get CSS class for status
 */
function getStatusClass(status) {
    switch (status) {
        case 'PENDING':
            return 'pending';
        case 'CONFIRMED':
            return 'confirmed';
        case 'PROCESSING':
            return 'processing';
        case 'DELIVERING':
            return 'delivering';
        case 'COMPLETED':
            return 'completed';
        case 'CANCELLED':
            return 'cancelled';
        default:
            return 'pending';
    }
}

/**
 * Get text for status
 */
function getStatusText(status) {
    switch (status) {
        case 'PENDING':
            return 'Chờ xác nhận';
        case 'CONFIRMED':
            return 'Đã xác nhận';
        case 'PROCESSING':
            return 'Đang xử lý';
        case 'DELIVERING':
            return 'Đang giao';
        case 'COMPLETED':
            return 'Hoàn thành';
        case 'CANCELLED':
            return 'Đã hủy';
        default:
            return status;
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    // Check if toast function exists in global scope
    if (typeof window.showToast === 'function' && window.showToast !== showToast) {
        window.showToast(message, type);
        return;
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">&times;</button>
    `;
    
    // Add to document
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        // Create container if it doesn't exist
        const newContainer = document.createElement('div');
        newContainer.id = 'toast-container';
        document.body.appendChild(newContainer);
        newContainer.appendChild(toast);
    } else {
        toastContainer.appendChild(toast);
    }
    
    // Add close event
    toast.querySelector('.toast-close').addEventListener('click', function() {
        toast.remove();
    });
    
    // Auto remove after 3 seconds
    setTimeout(function() {
        toast.classList.add('fade-out');
        setTimeout(function() {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

/**
 * Update revenue data based on completed bookings
 */
function updateRevenueData(bookings) {
    if (!bookings || bookings.length === 0) return;
    
    // Only use completed bookings for revenue calculation
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
    
    // Initialize monthly revenue with zero values
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const monthlyRevenue = {};
    months.forEach(month => monthlyRevenue[month] = 0);
    
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Calculate revenue for each month
    completedBookings.forEach(booking => {
        // Use completion date if available, otherwise use updated date
        const bookingDate = booking.completionDate ? new Date(booking.completionDate) : new Date(booking.updatedAt);
        
        // Only count this year's revenue
        if (bookingDate.getFullYear() === currentYear) {
            const month = 'T' + (bookingDate.getMonth() + 1);
            monthlyRevenue[month] += booking.totalPrice;
        }
    });
    
    // Update revenue chart
    if (window.revenueChart) {
        window.revenueChart.data.datasets[0].data = Object.values(monthlyRevenue);
        window.revenueChart.update();
    }
} 