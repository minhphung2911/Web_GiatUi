/**
 * Admin Bookings Management
 * This file handles CRUD operations for bookings in the admin dashboard
 */

// Booking data
// Check if bookings is already defined
if (typeof window.bookings === 'undefined') {
    window.bookings = [];
}
let currentBooking = null;
// Check if services is already defined
if (typeof window.bookingServices === 'undefined') {
    window.bookingServices = [];
}

// DOM Elements
const bookingTableBody = document.getElementById('bookings-table-body');
const bookingModalTitle = document.getElementById('booking-modal-title');
const bookingForm = document.getElementById('booking-form');
const bookingDetailsModal = document.getElementById('booking-details-modal');

// Initialize when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load bookings and services when the page loads
    loadBookings();
    loadServices();
    
    // Set up event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Event listener for filter buttons
    document.querySelectorAll('.status-filter').forEach(button => {
        button.addEventListener('click', function() {
            const status = this.dataset.status;
            filterBookingsByStatus(status);
            
            // Update active button
            document.querySelectorAll('.status-filter').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Event listener for booking status update
    document.getElementById('updateStatusBtn').addEventListener('click', function() {
        const bookingId = this.dataset.bookingId;
        const status = document.getElementById('bookingStatusSelect').value;
        updateBookingStatus(bookingId, status);
    });
    
    // Event listener for payment status update
    document.getElementById('updatePaymentBtn').addEventListener('click', function() {
        const bookingId = this.dataset.bookingId;
        const paymentStatus = document.getElementById('paymentStatusSelect').value;
        updatePaymentStatus(bookingId, paymentStatus);
    });
}

/**
 * Load bookings data from API
 */
function loadBookings() {
    const bookingsTable = document.getElementById('bookings-table-body');
    if (!bookingsTable) return;
    
    // Show loading state
    bookingsTable.innerHTML = '<tr><td colspan="8" class="text-center"><div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>Đang tải danh sách đơn đặt hàng...</td></tr>';
    
    // Use the apiService to get bookings
    apiService.get('/admin/bookings')
        .then(bookings => {
            if (!bookings || !Array.isArray(bookings)) {
                console.warn('Dữ liệu trả về không phải là mảng đơn đặt hàng:', bookings);
                throw new Error('Dữ liệu không hợp lệ');
            }
            
            console.log(`Đã tải ${bookings.length} đơn đặt hàng`);
            displayBookings(bookings);
            // Update booking counts
            updateBookingCounts(bookings);
            
            // Lưu dữ liệu vào cache để sử dụng khi offline
            localStorage.setItem('cachedBookings', JSON.stringify(bookings));
        })
        .catch(error => {
            console.error('Lỗi khi tải danh sách đơn đặt hàng:', error);
            
            // Thử lấy dữ liệu từ cache nếu có
            const cachedData = localStorage.getItem('cachedBookings');
            if (cachedData) {
                try {
                    const bookings = JSON.parse(cachedData);
                    console.log('Sử dụng dữ liệu cache cho đơn đặt hàng');
                    displayBookings(bookings);
                    updateBookingCounts(bookings);
                    
                    // Hiển thị thông báo
                    showToast('Sử dụng dữ liệu đã lưu. Vui lòng kiểm tra kết nối mạng.', 'warning');
                    return;
                } catch (e) {
                    console.error('Lỗi khi parse dữ liệu cache:', e);
                }
            }
            
            // Nếu không có cache hoặc parse lỗi, sử dụng mock data
            const mockBookings = generateMockBookings();
            displayBookings(mockBookings);
            updateBookingCounts(mockBookings);
            bookingsTable.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center">
                        <div class="alert alert-warning mb-0">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Không thể kết nối đến server. Hiển thị dữ liệu mẫu. Vui lòng kiểm tra kết nối mạng.
                        </div>
                    </td>
                </tr>
            ` + bookingsTable.innerHTML;
            
            showToast('Không thể tải dữ liệu từ server. Hiển thị dữ liệu mẫu.', 'error');
        });
}

/**
 * Generate mock bookings for demo or when API fails
 */
function generateMockBookings() {
    const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'DELIVERING', 'COMPLETED', 'CANCELLED'];
    const paymentStatuses = ['PENDING', 'PAID', 'REFUNDED'];
    const serviceNames = ['Giặt Ủi Thường', 'Giặt Hấp', 'Giặt Khô', 'Giặt Đồ Đặc Biệt'];
    const userNames = [
        'Nguyễn Văn A', 
        'Trần Thị B', 
        'Lê Văn C', 
        'Phạm Thị D', 
        'Hồ Văn E', 
        'Đỗ Thị F'
    ];
    
    // Generate 20 mock bookings
    const bookings = [];
    
    for (let i = 1; i <= 20; i++) {
        const today = new Date();
        const bookingDate = new Date(today);
        bookingDate.setDate(today.getDate() - Math.floor(Math.random() * 30)); // Random date in the last 30 days
        
        const pickupDate = new Date(bookingDate);
        pickupDate.setDate(bookingDate.getDate() + 1);
        
        const deliveryDate = new Date(pickupDate);
        deliveryDate.setDate(pickupDate.getDate() + 2);
        
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
        
        bookings.push({
            id: i,
            userId: Math.floor(Math.random() * 10) + 1,
            userName: userNames[Math.floor(Math.random() * userNames.length)],
            serviceName: serviceNames[Math.floor(Math.random() * serviceNames.length)],
            weight: (Math.random() * 5 + 1).toFixed(1),
            totalPrice: Math.floor(Math.random() * 200000) + 50000,
            bookingDate: bookingDate.toISOString(),
            pickupDate: pickupDate.toISOString(),
            deliveryDate: deliveryDate.toISOString(),
            status: status,
            paymentStatus: paymentStatus,
            address: '123 Đường Nguyễn Huệ, Quận 1, TP HCM',
            notes: 'Gọi điện trước khi đến lấy đồ'
        });
    }
    
    return bookings;
}

/**
 * Display bookings in the table
 */
function displayBookings(bookings) {
    const bookingsTable = document.getElementById('bookings-table-body');
    bookingsTable.innerHTML = '';
    
    // Check if we have bookings to display
    if (!bookings || bookings.length === 0) {
        bookingsTable.innerHTML = '<tr><td colspan="7" class="text-center">Không có đơn đặt hàng nào</td></tr>';
        return;
    }
    
    // Sort bookings by date (newest first)
    bookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
    
    // Store the bookings globally for filtering
    window.allBookings = bookings;
    
    bookings.forEach(booking => {
        const row = document.createElement('tr');
        row.dataset.bookingId = booking.id;
        
        // Format the date
        const bookingDate = new Date(booking.bookingDate);
        const formattedDate = bookingDate.toLocaleDateString('vi-VN');
        
        // Create the status badge
        const statusBadge = getStatusBadge(booking.status);
        const paymentBadge = getPaymentStatusBadge(booking.paymentStatus);
        
        row.innerHTML = `
            <td>${booking.id}</td>
            <td>${booking.userName || 'N/A'}</td>
            <td>${booking.serviceName || 'N/A'}</td>
            <td>${formatCurrency(booking.totalPrice || 0)}</td>
            <td>${formattedDate}</td>
            <td>${statusBadge}</td>
            <td>${paymentBadge}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary view-booking-btn" data-booking-id="${booking.id}">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        bookingsTable.appendChild(row);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-booking-btn').forEach(button => {
        button.addEventListener('click', function() {
            const bookingId = parseInt(this.dataset.bookingId);
            viewBookingDetails(bookingId);
        });
    });
}

/**
 * Load services for the dropdown
 */
function loadServices() {
    // Use apiService to fetch services
    apiService.get('/services')
        .then(services => {
            // Store services for later use
            window.allServices = services;
            
            // Populate service select fields if they exist
            const serviceSelects = document.querySelectorAll('.service-select');
            if (serviceSelects.length > 0) {
                populateServiceSelect(serviceSelects, services);
            }
        })
        .catch(error => {
            console.error('Error loading services:', error);
            showToast('Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.', 'error');
        });
}

/**
 * Populate service select dropdowns
 */
function populateServiceSelect(selects, services) {
    selects.forEach(select => {
        select.innerHTML = '<option value="">Chọn dịch vụ</option>';
        
        services.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = service.name;
            select.appendChild(option);
        });
    });
}

/**
 * View booking details
 */
function viewBookingDetails(bookingId) {
    const modal = document.getElementById('bookingDetailModal');
    const modalContent = document.getElementById('booking-detail-content');
    
    if (!modal || !modalContent) {
        console.error('Không tìm thấy modal hoặc nội dung modal');
        showToast('Không thể hiển thị chi tiết đơn hàng', 'error');
        return;
    }
    
    // Show loading state in the modal
    modalContent.innerHTML = `
        <div class="text-center p-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2">Đang tải thông tin đơn hàng...</p>
        </div>
    `;
    
    // Show the modal using either Bootstrap or vanilla JS
    try {
        // Try using Bootstrap first if available
        if (typeof bootstrap !== 'undefined' && typeof bootstrap.Modal !== 'undefined') {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        } else {
            // Fallback to vanilla JS
            modal.style.display = 'block';
            modal.classList.add('show');
            document.body.classList.add('modal-open');
            
            // Add backdrop if it doesn't exist
            let backdrop = document.querySelector('.modal-backdrop');
            if (!backdrop) {
                backdrop = document.createElement('div');
                backdrop.className = 'modal-backdrop fade show';
                document.body.appendChild(backdrop);
            }
            
            // Add close button event listeners
            const closeButtons = modal.querySelectorAll('[data-bs-dismiss="modal"], .close, .btn-close');
            closeButtons.forEach(button => {
                button.addEventListener('click', function() {
                    closeBookingModal();
                });
            });
        }
    } catch (error) {
        console.error('Lỗi khi hiển thị modal:', error);
        
        // Fallback to vanilla JS
        modal.style.display = 'block';
        modal.classList.add('show');
        document.body.classList.add('modal-open');
    }
    
    // Find the booking, first check in the global bookings array
    let booking = window.allBookings ? window.allBookings.find(b => b.id === bookingId) : null;
    
    if (booking) {
        console.log('Đã tìm thấy booking trong bộ nhớ:', booking);
        displayBookingDetails(booking);
    } else {
        console.log('Không tìm thấy booking trong bộ nhớ, tải từ API');
        // If not found in the global array, fetch it from the API
        apiService.get(`/admin/bookings/${bookingId}`)
            .then(booking => {
                if (!booking || !booking.id) {
                    throw new Error('Dữ liệu booking không hợp lệ');
                }
                displayBookingDetails(booking);
            })
            .catch(error => {
                console.error(`Lỗi khi tải thông tin đơn hàng ID ${bookingId}:`, error);
                
                // Use mock data as fallback
                const mockBooking = createMockBooking(bookingId);
                displayBookingDetails(mockBooking);
                
                // Show warning in the modal
                const warningDiv = document.createElement('div');
                warningDiv.className = 'alert alert-warning mt-3';
                warningDiv.innerHTML = `
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <strong>Lưu ý:</strong> Hiển thị dữ liệu mẫu do không thể kết nối đến server
                `;
                modalContent.prepend(warningDiv);
            });
    }
}

/**
 * Close booking modal
 */
function closeBookingModal() {
    const modal = document.getElementById('bookingDetailModal');
    if (!modal) return;
    
    modal.style.display = 'none';
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
    
    // Remove backdrop
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
        backdrop.remove();
    }
}

/**
 * Create mock booking data for a specific ID
 */
function createMockBooking(id) {
    const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'DELIVERING', 'COMPLETED'];
    const paymentStatuses = ['PENDING', 'PAID'];
    
    const today = new Date();
    const bookingDate = new Date(today);
    bookingDate.setDate(today.getDate() - Math.floor(Math.random() * 5));
    
    const pickupDate = new Date(bookingDate);
    pickupDate.setDate(bookingDate.getDate() + 1);
    
    const deliveryDate = new Date(pickupDate);
    deliveryDate.setDate(pickupDate.getDate() + 2);
    
    return {
        id: id,
        userId: Math.floor(Math.random() * 10) + 1,
        userName: 'Nguyễn Văn A',
        serviceName: 'Giặt Ủi Thường',
        weight: 2.5,
        totalPrice: 75000,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
        bookingDate: bookingDate.toISOString(),
        pickupDate: pickupDate.toISOString(),
        deliveryDate: deliveryDate.toISOString(),
        address: '123 Đường Nguyễn Huệ, Quận 1, TP HCM',
        notes: 'Gọi điện trước khi đến lấy đồ'
    };
}

/**
 * Display booking details in the modal
 */
function displayBookingDetails(booking) {
    const modalContent = document.getElementById('booking-detail-content');
    
    // Create HTML content for the modal
    const statusClass = getStatusClass(booking.status);
    const paymentStatusClass = getPaymentStatusClass(booking.paymentStatus);
    
    const statusText = getStatusText(booking.status);
    const paymentStatusText = getPaymentStatusText(booking.paymentStatus);
    
    const pickupDate = formatDate(booking.pickupDate);
    const deliveryDate = formatDate(booking.deliveryDate);
    const bookingDate = formatDate(booking.bookingDate);
    
    // Create booking details HTML
    modalContent.innerHTML = `
        <div class="booking-details">
            <div class="row">
                <div class="col-md-6">
                    <h5>Thông Tin Đơn Hàng</h5>
                    <table class="table">
                        <tr>
                            <td>Mã đơn hàng:</td>
                            <td><strong>#${booking.id}</strong></td>
                        </tr>
                        <tr>
                            <td>Ngày đặt:</td>
                            <td>${bookingDate}</td>
                        </tr>
                        <tr>
                            <td>Dịch vụ:</td>
                            <td>${booking.serviceName || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td>Trọng lượng:</td>
                            <td>${booking.weight ? booking.weight + 'kg' : 'N/A'}</td>
                        </tr>
                        <tr>
                            <td>Giá:</td>
                            <td>${formatCurrency(booking.totalPrice || 0)}</td>
                        </tr>
                        <tr>
                            <td>Trạng thái:</td>
                            <td>
                                <select id="bookingStatusSelect" class="form-select form-select-sm">
                                    <option value="PENDING" ${booking.status === 'PENDING' ? 'selected' : ''}>Chờ xác nhận</option>
                                    <option value="CONFIRMED" ${booking.status === 'CONFIRMED' ? 'selected' : ''}>Đã xác nhận</option>
                                    <option value="PROCESSING" ${booking.status === 'PROCESSING' ? 'selected' : ''}>Đang xử lý</option>
                                    <option value="DELIVERING" ${booking.status === 'DELIVERING' ? 'selected' : ''}>Đang giao</option>
                                    <option value="COMPLETED" ${booking.status === 'COMPLETED' ? 'selected' : ''}>Hoàn thành</option>
                                    <option value="CANCELLED" ${booking.status === 'CANCELLED' ? 'selected' : ''}>Đã hủy</option>
                                </select>
                                <button id="updateStatusBtn" class="btn btn-sm btn-primary mt-2" data-booking-id="${booking.id}">Cập nhật</button>
                            </td>
                        </tr>
                        <tr>
                            <td>Thanh toán:</td>
                            <td>
                                <select id="paymentStatusSelect" class="form-select form-select-sm">
                                    <option value="PENDING" ${booking.paymentStatus === 'PENDING' ? 'selected' : ''}>Chưa thanh toán</option>
                                    <option value="PAID" ${booking.paymentStatus === 'PAID' ? 'selected' : ''}>Đã thanh toán</option>
                                    <option value="REFUNDED" ${booking.paymentStatus === 'REFUNDED' ? 'selected' : ''}>Đã hoàn tiền</option>
                                </select>
                                <button id="updatePaymentBtn" class="btn btn-sm btn-primary mt-2" data-booking-id="${booking.id}">Cập nhật</button>
                            </td>
                        </tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <h5>Thông Tin Khách Hàng</h5>
                    <table class="table">
                        <tr>
                            <td>Họ tên:</td>
                            <td>${booking.userName || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td>Email:</td>
                            <td>${booking.user && booking.user.email ? booking.user.email : 'N/A'}</td>
                        </tr>
                        <tr>
                            <td>Điện thoại:</td>
                            <td>${booking.phone || (booking.user && booking.user.phone ? booking.user.phone : 'N/A')}</td>
                        </tr>
                        <tr>
                            <td>Địa chỉ:</td>
                            <td>${booking.address || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td>Ngày lấy:</td>
                            <td>${pickupDate}</td>
                        </tr>
                        <tr>
                            <td>Ngày giao:</td>
                            <td>${deliveryDate || 'Chưa xác định'}</td>
                        </tr>
                    </table>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-12">
                    <h5>Ghi chú</h5>
                    <p>${booking.notes || 'Không có ghi chú'}</p>
                </div>
            </div>
        </div>
    `;
    
    // Set up the status update button
    const updateStatusBtn = document.getElementById('updateStatusBtn');
    updateStatusBtn.dataset.bookingId = booking.id;
    updateStatusBtn.addEventListener('click', function() {
        const bookingId = this.dataset.bookingId;
        const status = document.getElementById('bookingStatusSelect').value;
        updateBookingStatus(bookingId, status);
    });
    
    // Set up the payment status update button
    const updatePaymentBtn = document.getElementById('updatePaymentBtn');
    updatePaymentBtn.dataset.bookingId = booking.id;
    updatePaymentBtn.addEventListener('click', function() {
        const bookingId = this.dataset.bookingId;
        const paymentStatus = document.getElementById('paymentStatusSelect').value;
        updatePaymentStatus(bookingId, paymentStatus);
    });
    
    // Set the current status in the select field
    const statusSelect = document.getElementById('bookingStatusSelect');
    if (statusSelect) {
        statusSelect.value = booking.status || 'PENDING';
    }
    
    // Set the current payment status in the select field
    const paymentSelect = document.getElementById('paymentStatusSelect');
    if (paymentSelect) {
        paymentSelect.value = booking.paymentStatus || 'PENDING';
    }
}

/**
 * Update booking status
 */
function updateBookingStatus(bookingId, status) {
    // Show loading
    const updateBtn = document.getElementById('updateStatusBtn');
    const originalText = updateBtn.textContent;
    updateBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang cập nhật...';
    updateBtn.disabled = true;
    
    // If status is COMPLETED, ask for completion date
    if (status === 'COMPLETED') {
        // Set default completion date to now
        const now = new Date();
        const completionDate = now.toISOString();
        
        // Update completion date
        apiService.updateCompletionDate(bookingId, completionDate)
            .then(response => {
                console.log('Completion date updated:', response);
            })
            .catch(error => {
                console.error('Error updating completion date:', error);
            });
    }
    
    // Call the API service
    apiService.updateBookingStatus(bookingId, status)
        .then(response => {
            // Update the UI
            const statusCell = document.querySelector(`tr[data-booking-id="${bookingId}"] td:nth-child(6)`);
            if (statusCell) {
                statusCell.innerHTML = getStatusBadge(status);
            }
            
            // Show success message
            Toast.success('Cập nhật thành công', 'Trạng thái đơn hàng đã được cập nhật');
            
            // Update in memory data
            if (window.allBookings) {
                const booking = window.allBookings.find(b => b.id === parseInt(bookingId));
                if (booking) {
                    booking.status = status;
                }
            }
        })
        .catch(error => {
            console.error('Error updating status:', error);
            Toast.error('Lỗi cập nhật', 'Không thể cập nhật trạng thái đơn hàng');
        })
        .finally(() => {
            // Reset button
            updateBtn.innerHTML = originalText;
            updateBtn.disabled = false;
        });
}

/**
 * Update payment status
 */
function updatePaymentStatus(bookingId, paymentStatus) {
    // Show loading
    const updateBtn = document.getElementById('updatePaymentBtn');
    const originalText = updateBtn.textContent;
    updateBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang cập nhật...';
    updateBtn.disabled = true;
    
    // Call the API service
    apiService.updatePaymentStatus(bookingId, paymentStatus)
        .then(response => {
            // Update the UI
            const paymentCell = document.querySelector(`tr[data-booking-id="${bookingId}"] td:nth-child(7)`);
            if (paymentCell) {
                paymentCell.innerHTML = getPaymentStatusBadge(paymentStatus);
            }
            
            // Show success message
            Toast.success('Cập nhật thành công', 'Trạng thái thanh toán đã được cập nhật');
            
            // Update in memory data
            if (window.allBookings) {
                const booking = window.allBookings.find(b => b.id === parseInt(bookingId));
                if (booking) {
                    booking.paymentStatus = paymentStatus;
                }
            }
        })
        .catch(error => {
            console.error('Error updating payment status:', error);
            Toast.error('Lỗi cập nhật', 'Không thể cập nhật trạng thái thanh toán');
        })
        .finally(() => {
            // Reset button
            updateBtn.innerHTML = originalText;
            updateBtn.disabled = false;
        });
}

/**
 * Filter bookings by status
 */
function filterBookingsByStatus(status) {
    if (!window.allBookings) return;
    
    const bookingsToShow = status === 'ALL' 
        ? window.allBookings 
        : window.allBookings.filter(booking => booking.status === status);
    
    displayBookings(bookingsToShow);
}

/**
 * Update booking counts for dashboard
 */
function updateBookingCounts(bookings) {
    if (!bookings) return;
    
    // Count bookings by status
    const pendingCount = bookings.filter(b => b.status === 'PENDING').length;
    const processingCount = bookings.filter(b => ['CONFIRMED', 'PICKUP_SCHEDULED', 'PROCESSING', 'READY_FOR_DELIVERY', 'DELIVERY_SCHEDULED'].includes(b.status)).length;
    const completedCount = bookings.filter(b => b.status === 'COMPLETED').length;
    const cancelledCount = bookings.filter(b => b.status === 'CANCELLED').length;
    
    // Update badges
    document.getElementById('pending-count').textContent = pendingCount;
    document.getElementById('processing-count').textContent = processingCount;
    document.getElementById('completed-count').textContent = completedCount;
    document.getElementById('cancelled-count').textContent = cancelledCount;
    document.getElementById('all-count').textContent = bookings.length;
}

/**
 * Helper function to get status badge HTML
 */
function getStatusBadge(status) {
    let badgeClass = 'bg-secondary';
    let statusText = 'Không xác định';
    
    switch(status) {
        case 'PENDING':
            badgeClass = 'bg-warning text-dark';
            statusText = 'Đang chờ xử lý';
            break;
        case 'CONFIRMED':
            badgeClass = 'bg-info text-dark';
            statusText = 'Đã xác nhận';
            break;
        case 'PICKUP_SCHEDULED':
            badgeClass = 'bg-info text-dark';
            statusText = 'Lên lịch lấy đồ';
            break;
        case 'PROCESSING':
            badgeClass = 'bg-primary';
            statusText = 'Đang xử lý';
            break;
        case 'READY_FOR_DELIVERY':
            badgeClass = 'bg-info text-dark';
            statusText = 'Sẵn sàng giao hàng';
            break;
        case 'DELIVERY_SCHEDULED':
            badgeClass = 'bg-info text-dark';
            statusText = 'Lên lịch giao hàng';
            break;
        case 'COMPLETED':
            badgeClass = 'bg-success';
            statusText = 'Hoàn thành';
            break;
        case 'CANCELLED':
            badgeClass = 'bg-danger';
            statusText = 'Đã hủy';
            break;
    }
    
    return `<span class="badge ${badgeClass}">${statusText}</span>`;
}

/**
 * Helper function to get payment status badge HTML
 */
function getPaymentStatusBadge(status) {
    let badgeClass = 'bg-secondary';
    let statusText = 'Không xác định';
    
    switch(status) {
        case 'PENDING':
            badgeClass = 'bg-warning text-dark';
            statusText = 'Chưa thanh toán';
            break;
        case 'PAID':
            badgeClass = 'bg-success';
            statusText = 'Đã thanh toán';
            break;
        case 'REFUNDED':
            badgeClass = 'bg-info';
            statusText = 'Đã hoàn tiền';
            break;
    }
    
    return `<span class="badge ${badgeClass}">${statusText}</span>`;
}

/**
 * Helper function to format currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
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
 * Get CSS class for payment status
 */
function getPaymentStatusClass(status) {
    switch (status) {
        case 'PAID':
            return 'completed';
        case 'PENDING':
            return 'pending';
        case 'CANCELLED':
            return 'cancelled';
        default:
            return 'pending';
    }
}

/**
 * Get status text in Vietnamese
 */
function getStatusText(status) {
    switch (status) {
        case 'PENDING':
            return 'Đang chờ';
        case 'PROCESSING':
            return 'Đang xử lý';
        case 'COMPLETED':
            return 'Hoàn thành';
        case 'CANCELLED':
            return 'Đã hủy';
        default:
            return status;
    }
}

/**
 * Get payment status text in Vietnamese
 */
function getPaymentStatusText(status) {
    switch (status) {
        case 'PAID':
            return 'Đã thanh toán';
        case 'PENDING':
            return 'Chưa thanh toán';
        case 'CANCELLED':
            return 'Đã hủy';
        default:
            return status;
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
 * Format date for input field (YYYY-MM-DDTHH:MM)
 */
function formatDateForInput(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    
    return date.toISOString().substring(0, 16);
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    if (typeof Toast !== 'undefined') {
        Toast.show({
            message: message,
            type: type
        });
    } else {
        // Simple fallback
        alert(message);
    }
}
