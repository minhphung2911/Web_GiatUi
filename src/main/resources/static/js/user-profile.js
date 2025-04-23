document.addEventListener('DOMContentLoaded', function() {
    // Set demo mode to false - using real API calls
    window.DEMO_MODE = false;
    
    // Load dữ liệu người dùng
    loadUserProfile();
    
    // Xử lý form cập nhật
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', updateProfile);
    }
    
    // Xử lý các tab
    const profileTabs = document.querySelectorAll('.profile-tabs a');
    const tabContents = document.querySelectorAll('.tab-content');
    
    profileTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs and contents
            profileTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to current tab and content
            this.classList.add('active');
            const target = this.getAttribute('href').substring(1);
            document.getElementById(target).classList.add('active');
            
            // Load data if needed
            if (target === 'appointments-tab' || target === 'history-tab') {
                loadUserBookings();
            }
        });
    });
});

/**
 * Load user profile from API
 */
function loadUserProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser) {
        showLoginMessage();
        return;
    }
    
    // Show loading state
    document.getElementById('profile-name').textContent = 'Đang tải...';
    document.getElementById('profile-email').textContent = 'Đang tải...';
    document.getElementById('profile-phone').textContent = 'Đang tải...';
    document.getElementById('profile-address').textContent = 'Đang tải...';
    
    // Update UI based on current user basic info from localStorage
    updateBasicUserInfo(currentUser);
    
    // Fetch full user details
    apiService.get(`/user-management/${currentUser.id}`)
        .then(userData => {
            // Update UI with full user details
            updateUserInfo(userData);
            populateProfileForm(userData);
        })
        .catch(error => {
            console.error('Lỗi khi tải thông tin người dùng:', error);
            
            // Hiển thị thông báo lỗi thân thiện
            Toast.show({
                message: 'Không thể tải thông tin đầy đủ. Hiển thị thông tin cơ bản.',
                type: 'warning'
            });
            
            // Sử dụng thông tin cơ bản từ localStorage nếu không thể lấy từ API
            updateUserInfo(currentUser);
            populateProfileForm(currentUser);
        });
}

/**
 * Update the basic user info UI from localStorage data
 */
function updateBasicUserInfo(user) {
    if (!user) return;
    
    // Update navigation user info
    const navUserName = document.getElementById('nav-user-name');
    if (navUserName) navUserName.textContent = user.name || 'Người dùng';
    
    // Update avatar if exists
    const navUserAvatar = document.getElementById('nav-user-avatar');
    const profileAvatar = document.getElementById('user-avatar');
    
    const avatarUrl = user.avatarUrl || '/img/default-avatar.svg';
    if (navUserAvatar) navUserAvatar.src = avatarUrl;
    if (profileAvatar) profileAvatar.src = avatarUrl;
    
    // Update basic profile info
    document.getElementById('profile-name').textContent = user.name || 'Chưa cập nhật';
    document.getElementById('profile-email').textContent = user.email || 'Chưa cập nhật';
    document.getElementById('profile-phone').textContent = user.phone || user.phoneNumber || 'Chưa cập nhật';
    document.getElementById('profile-address').textContent = user.address || 'Chưa cập nhật';
}

// Display no bookings message - Alias for displayNoBookingsFound
function showNoBookingsMessage() {
    displayNoBookingsFound();
}

// Tạo user demo
function createDemoUser() {
    // This function is no longer used but kept for reference
    console.warn('createDemoUser is deprecated and should not be called');
    return null;
}

// Cập nhật form profile
function updateProfileForm(user) {
    const form = document.getElementById('profile-form');
    if (!form || !form.elements) return;
    
    // Tách tên thành firstName và lastName
    const nameParts = user.name ? user.name.split(' ') : ['Demo', 'User'];
    const firstName = nameParts[0] || 'Demo';
    const lastName = nameParts.slice(1).join(' ') || 'User';
    
    // Điền thông tin vào form
    if (form.elements['first-name']) form.elements['first-name'].value = firstName;
    if (form.elements['last-name']) form.elements['last-name'].value = lastName;
    if (form.elements['email']) form.elements['email'].value = user.email || '';
    if (form.elements['phone']) form.elements['phone'].value = user.phoneNumber || '';
    if (form.elements['address']) form.elements['address'].value = user.address || '';
}

// Cập nhật hiển thị thông tin user
function updateProfileDisplay(user) {
    // Cập nhật thông tin cơ bản
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profilePhone = document.getElementById('profile-phone');
    const profileAddress = document.getElementById('profile-address');
    
    if (profileName) profileName.textContent = user.name || 'Demo User';
    if (profileEmail) profileEmail.textContent = user.email || 'demo@example.com';
    if (profilePhone) profilePhone.textContent = user.phoneNumber || 'Chưa cập nhật';
    if (profileAddress) profileAddress.textContent = user.address || 'Chưa cập nhật';
    
    // Cập nhật avatar nếu có
    const userAvatar = document.getElementById('user-avatar');
    const navUserAvatar = document.getElementById('nav-user-avatar');
    
    if (userAvatar) {
        userAvatar.src = user.avatar || '/img/default-avatar.svg';
    }
    
    if (navUserAvatar) {
        navUserAvatar.src = user.avatar || '/img/default-avatar.svg';
    }
}

// Cập nhật thông tin người dùng
function updateProfile(e) {
    e.preventDefault();
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang cập nhật...';
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    if (!currentUser) {
        // Redirect to login if not logged in
        showToast('Vui lòng đăng nhập để cập nhật thông tin', 'error');
        setTimeout(() => {
            window.location.href = '/login?redirect=profile';
        }, 2000);
        
        // Reset button state
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Cập nhật thông tin';
        }
        return;
    }
    
    const form = e.target;
    
    // Tạo userData từ form
    const firstName = form.elements['first-name'] ? form.elements['first-name'].value : '';
    const lastName = form.elements['last-name'] ? form.elements['last-name'].value : '';
    const name = `${firstName} ${lastName}`.trim();
    
    const userData = {
        id: currentUser.id,
        name: name,
        firstName: firstName, 
        lastName: lastName,
        email: form.elements['email'] ? form.elements['email'].value : '',
        phoneNumber: form.elements['phone'] ? form.elements['phone'].value : '',
        address: form.elements['address'] ? form.elements['address'].value : ''
    };
    
    // API call to update user
    fetch(`/api/user-management/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    })
    .then(res => {
        if (!res.ok) {
            if (res.status === 401) {
                showToast('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
                setTimeout(() => {
                    window.location.href = '/login?redirect=profile';
                }, 2000);
                throw new Error('Unauthorized');
            }
            throw new Error('Server error');
        }
        return res.json();
    })
    .then(data => {
        // Cập nhật dữ liệu người dùng trong localStorage
        localStorage.setItem('currentUser', JSON.stringify(data));
        showToast('Cập nhật thông tin thành công', 'success');
        
        // Update UI
        updateProfileDisplay(data);
        
        // Reset button state
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Cập nhật thông tin';
        }
    })
    .catch(err => {
        console.error('Lỗi cập nhật thông tin:', err);
        showToast('Có lỗi xảy ra khi cập nhật thông tin', 'error');
        
        // Reset button state
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Cập nhật thông tin';
        }
    });
}

// Load lịch sử đặt lịch
function loadUserBookings() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    if (!currentUser) {
        showNoBookingsMessage();
        return;
    }
    
    // Show loading indicator for bookings section
    const spinner = document.getElementById('bookings-spinner');
    if (spinner) spinner.style.display = 'block';
    
    // Find containers
    const upcomingContainer = document.getElementById('upcoming-appointments');
    const completedContainer = document.getElementById('completed-appointments');
    const historyTable = document.getElementById('appointment-history-table');
    
    // Set loading states
    if (upcomingContainer) upcomingContainer.innerHTML = '<p class="loading-message">Đang tải lịch hẹn...</p>';
    if (completedContainer) completedContainer.innerHTML = '<p class="loading-message">Đang tải lịch hẹn...</p>';
    if (historyTable && historyTable.querySelector('tbody')) {
        historyTable.querySelector('tbody').innerHTML = '<tr><td colspan="6" class="text-center">Đang tải dữ liệu...</td></tr>';
    }
    
    // Try to use booking service if available
    if (window.bookingService && typeof bookingService.getUserBookings === 'function') {
        console.log('Using bookingService to fetch bookings');
        bookingService.getUserBookings(currentUser.id)
            .then(bookings => {
                if (spinner) spinner.style.display = 'none';
                
                if (!bookings || bookings.length === 0) {
                    showNoBookingsMessage();
                } else {
                    displayBookings(bookings);
                }
            })
            .catch(error => {
                console.error('Error loading bookings using service:', error);
                if (spinner) spinner.style.display = 'none';
                showNoBookingsMessage();
                showToast('Không thể tải lịch sử đặt lịch. Vui lòng thử lại sau.', 'error');
            });
        return;
    }
    
    // Fallback to direct API call
    console.log('Using direct API call to fetch bookings');
    apiService.get(`/user-management/${currentUser.id}/bookings`)
        .then(bookings => {
            if (spinner) spinner.style.display = 'none';
            
            if (!bookings || bookings.length === 0) {
                showNoBookingsMessage();
            } else {
                displayBookings(bookings);
            }
        })
        .catch(error => {
            console.error('Error loading bookings:', error);
            if (spinner) spinner.style.display = 'none';
            showNoBookingsMessage();
            showToast('Không thể tải lịch sử đặt lịch. Vui lòng thử lại sau.', 'error');
        });
}

// Display no bookings message
function displayNoBookingsFound() {
    const upcomingContainer = document.getElementById('upcoming-appointments');
    const completedContainer = document.getElementById('completed-appointments');
    const historyTable = document.getElementById('appointment-history-table');
    
    if (upcomingContainer) {
        upcomingContainer.innerHTML = '<p class="no-data">Bạn không có lịch hẹn sắp tới nào.</p>';
    }
    
    if (completedContainer) {
        completedContainer.innerHTML = '<p class="no-data">Bạn chưa có lịch hẹn đã hoàn thành nào.</p>';
    }
    
    if (historyTable && historyTable.querySelector('tbody')) {
        historyTable.querySelector('tbody').innerHTML = '<tr><td colspan="6" class="text-center">Không có dữ liệu lịch sử.</td></tr>';
    }
    
    // Update counters
    const upcomingCounter = document.getElementById('upcoming-counter');
    const completedCounter = document.getElementById('completed-counter');
    
    if (upcomingCounter) upcomingCounter.textContent = 0;
    if (completedCounter) completedCounter.textContent = 0;
}

// Hiển thị danh sách đặt lịch
function displayBookings(bookings) {
    // Store bookings for later reference
    window.currentBookings = bookings;
    
    // Group bookings
    const upcoming = [];
    const completed = [];
    
    bookings.forEach(booking => {
        const status = booking.status || 'PENDING';
        if (status === 'COMPLETED' || status === 'CANCELLED') {
            completed.push(booking);
        } else {
            upcoming.push(booking);
        }
    });
    
    // Update upcoming section
    const upcomingContainer = document.getElementById('upcoming-appointments');
    if (upcomingContainer) {
        if (upcoming.length === 0) {
            upcomingContainer.innerHTML = '<p class="no-data">Bạn không có lịch hẹn sắp tới nào.</p>';
        } else {
            upcomingContainer.innerHTML = upcoming.map(booking => createBookingCard(booking)).join('');
        }
    }
    
    // Update completed section
    const completedContainer = document.getElementById('completed-appointments');
    if (completedContainer) {
        if (completed.length === 0) {
            completedContainer.innerHTML = '<p class="no-data">Bạn chưa có lịch hẹn đã hoàn thành nào.</p>';
        } else {
            completedContainer.innerHTML = completed.map(booking => createBookingCard(booking)).join('');
        }
    }
    
    // Update history table
    const historyTable = document.getElementById('appointment-history-table');
    if (historyTable && historyTable.querySelector('tbody')) {
        if (bookings.length === 0) {
            historyTable.querySelector('tbody').innerHTML = '<tr><td colspan="6" class="text-center">Không có dữ liệu lịch sử.</td></tr>';
        } else {
            historyTable.querySelector('tbody').innerHTML = bookings.map(booking => `
                <tr>
                    <td>${booking.bookingCode || 'BK-' + booking.id}</td>
                    <td>${booking.serviceName || 'Dịch vụ giặt là'}</td>
                    <td>${formatDate(booking.pickupDate)}</td>
                    <td>${formatDate(booking.deliveryDate)}</td>
                    <td><span class="status-badge ${booking.status.toLowerCase()}">${getStatusText(booking.status)}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary view-booking" data-id="${booking.id}">Chi tiết</button>
                        ${booking.status === 'COMPLETED' && !booking.hasReview ? 
                        `<button class="btn btn-sm btn-outline-success add-review-btn" data-id="${booking.id}">Đánh giá</button>` : ''}
                    </td>
                </tr>
            `).join('');
        }
    }
    
    // Update counters
    const upcomingCounter = document.getElementById('upcoming-counter');
    const completedCounter = document.getElementById('completed-counter');
    
    if (upcomingCounter) upcomingCounter.textContent = upcoming.length;
    if (completedCounter) completedCounter.textContent = completed.length;
    
    // Add event listeners for view buttons
    document.querySelectorAll('.view-booking').forEach(button => {
        button.addEventListener('click', () => {
            const bookingId = button.getAttribute('data-id');
            if (bookingId) {
                showBookingDetails(bookings.find(b => b.id == bookingId));
            }
        });
    });
    
    // Add event listeners for cancel buttons
    document.querySelectorAll('.cancel-booking').forEach(button => {
        button.addEventListener('click', () => {
            const bookingId = button.getAttribute('data-id');
            if (bookingId && confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
                cancelBooking(bookingId);
            }
        });
    });
    
    // Add event listeners for review buttons
    addReviewButtonListeners();
}

// Create booking card HTML
function createBookingCard(booking) {
    return `
        <div class="appointment-card ${booking.status.toLowerCase()}">
            <div class="appointment-header">
                <div class="service-info">
                    <h4>${booking.serviceName || 'Dịch vụ giặt là'}</h4>
                    <p class="booking-code">Mã đơn: ${booking.bookingCode || 'BK-' + booking.id}</p>
                </div>
                <div class="status-badge ${booking.status.toLowerCase()}">${getStatusText(booking.status)}</div>
            </div>
            <div class="appointment-details">
                <div class="detail-item">
                    <i class="fas fa-calendar-day"></i>
                    <div class="detail-content">
                        <span class="detail-label">Ngày lấy đồ:</span>
                        <span class="detail-value">${formatDate(booking.pickupDate)}</span>
                    </div>
                </div>
                <div class="detail-item">
                    <i class="fas fa-truck"></i>
                    <div class="detail-content">
                        <span class="detail-label">Ngày giao:</span>
                        <span class="detail-value">${formatDate(booking.deliveryDate)}</span>
                    </div>
                </div>
                <div class="detail-item">
                    <i class="fas fa-money-bill-wave"></i>
                    <div class="detail-content">
                        <span class="detail-label">Tổng tiền:</span>
                        <span class="detail-value">${formatCurrency(booking.totalPrice)}</span>
                    </div>
                </div>
            </div>
            <div class="appointment-actions">
                <button class="btn btn-outline-primary btn-sm view-booking" data-id="${booking.id}">Chi tiết</button>
                ${booking.status === 'PENDING' ? 
                    `<button class="btn btn-outline-danger btn-sm cancel-booking" data-id="${booking.id}">Hủy đơn</button>` : ''}
                ${booking.status === 'COMPLETED' && !booking.hasReview ? 
                    `<button class="btn btn-outline-success btn-sm add-review-btn" data-id="${booking.id}">Đánh giá</button>` : ''}
                ${booking.status === 'COMPLETED' && booking.hasReview ? 
                    `<button class="btn btn-outline-info btn-sm view-review-btn" data-id="${booking.id}">Xem đánh giá</button>` : ''}
            </div>
        </div>
    `;
}

// Hiển thị chi tiết đơn hàng
function showBookingDetails(booking) {
    if (!booking) return;
    
    // Create modal HTML
    const modalHTML = `
        <div class="booking-modal">
            <div class="booking-modal-content">
                <div class="booking-modal-header">
                    <h3>Chi tiết đơn hàng</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="booking-modal-body">
                    <div class="booking-detail-section">
                        <h4>Thông tin đơn hàng</h4>
                        <p><strong>Mã đơn:</strong> ${booking.bookingCode || 'BK-' + booking.id}</p>
                        <p><strong>Dịch vụ:</strong> ${booking.serviceName || 'Dịch vụ giặt là'}</p>
                        <p><strong>Trạng thái:</strong> <span class="status-badge ${booking.status.toLowerCase()}">${getStatusText(booking.status)}</span></p>
                        <p><strong>Thanh toán:</strong> <span class="status-badge ${booking.paymentStatus.toLowerCase()}">${getPaymentStatusText(booking.paymentStatus)}</span></p>
                    </div>
                    
                    <div class="booking-detail-section">
                        <h4>Thông tin giao nhận</h4>
                        <p><strong>Ngày đặt:</strong> ${formatDate(booking.bookingDate)}</p>
                        <p><strong>Ngày lấy đồ:</strong> ${formatDate(booking.pickupDate)}</p>
                        <p><strong>Ngày giao:</strong> ${formatDate(booking.deliveryDate)}</p>
                        <p><strong>Địa chỉ:</strong> ${booking.address || 'Chưa cập nhật'}</p>
                    </div>
                    
                    <div class="booking-detail-section">
                        <h4>Chi tiết dịch vụ</h4>
                        <p><strong>Khối lượng:</strong> ${booking.weight || 0} kg</p>
                        <p><strong>Đơn giá:</strong> ${formatCurrency(booking.totalPrice / booking.weight)} / kg</p>
                        <p><strong>Tổng tiền:</strong> ${formatCurrency(booking.totalPrice)}</p>
                        <p><strong>Ghi chú:</strong> ${booking.notes || 'Không có ghi chú'}</p>
                    </div>
                    
                    ${booking.status === 'COMPLETED' && booking.hasReview ? `
                    <div class="booking-detail-section">
                        <h4>Đánh giá dịch vụ</h4>
                        <div class="review-display">
                            <div class="rating-display" data-rating="${booking.review?.rating || 0}">
                                ${generateStars(booking.review?.rating || 0)}
                            </div>
                            <p class="review-comment">${booking.review?.comment || 'Không có nhận xét'}</p>
                            <p class="review-date">Đánh giá vào: ${formatDate(booking.review?.createdAt)}</p>
                        </div>
                    </div>
                    ` : ''}
                </div>
                <div class="booking-modal-footer">
                    ${booking.status === 'PENDING' ? 
                        `<button class="btn btn-danger cancel-booking-btn" data-id="${booking.id}">Hủy đơn hàng</button>` : ''}
                    ${booking.status === 'COMPLETED' && !booking.hasReview ? 
                        `<button class="btn btn-success add-review-modal-btn" data-id="${booking.id}">Đánh giá dịch vụ</button>` : ''}
                    <button class="btn btn-primary close-btn">Đóng</button>
                </div>
            </div>
        </div>
    `;
    
    // Create style element
    const style = document.createElement('style');
    style.textContent = `
        .booking-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        .booking-modal-content {
            background: white;
            border-radius: 8px;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
        }
        .booking-modal-header {
            padding: 15px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .booking-modal-header h3 {
            margin: 0;
        }
        .close-modal {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
        }
        .booking-modal-body {
            padding: 20px;
        }
        .booking-detail-section {
            margin-bottom: 20px;
        }
        .booking-detail-section h4 {
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }
        .booking-modal-footer {
            padding: 15px;
            border-top: 1px solid #eee;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
        .rating-display {
            font-size: 24px;
            color: #FFD700;
            margin-bottom: 10px;
        }
        .review-comment {
            font-style: italic;
            margin-bottom: 5px;
        }
        .review-date {
            font-size: 0.8em;
            color: #666;
        }
    `;
    
    // Add to document
    document.head.appendChild(style);
    const modalElement = document.createElement('div');
    modalElement.innerHTML = modalHTML;
    document.body.appendChild(modalElement);
    
    // Add event listeners
    const closeModal = () => {
        document.body.removeChild(modalElement);
    };
    
    modalElement.querySelector('.close-modal').addEventListener('click', closeModal);
    modalElement.querySelector('.close-btn').addEventListener('click', closeModal);
    
    const cancelButton = modalElement.querySelector('.cancel-booking-btn');
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            const bookingId = cancelButton.getAttribute('data-id');
            if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
                cancelBooking(bookingId);
                closeModal();
            }
        });
    }
    
    const addReviewButton = modalElement.querySelector('.add-review-modal-btn');
    if (addReviewButton) {
        addReviewButton.addEventListener('click', () => {
            const bookingId = addReviewButton.getAttribute('data-id');
            closeModal();
            showAddReviewModal(booking);
        });
    }
}

// Generate star rating HTML
function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 <= rating) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// Show add review modal
function showAddReviewModal(booking) {
    // Create modal HTML
    const modalHTML = `
        <div class="review-modal">
            <div class="review-modal-content">
                <div class="review-modal-header">
                    <h3>Đánh giá dịch vụ</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="review-modal-body">
                    <p>Dịch vụ: <strong>${booking.serviceName || 'Dịch vụ giặt là'}</strong></p>
                    <p>Mã đơn: <strong>${booking.bookingCode || 'BK-' + booking.id}</strong></p>
                    
                    <form id="review-form">
                        <div class="form-group">
                            <label>Đánh giá của bạn:</label>
                            <div class="rating-selector">
                                <i class="far fa-star" data-rating="1"></i>
                                <i class="far fa-star" data-rating="2"></i>
                                <i class="far fa-star" data-rating="3"></i>
                                <i class="far fa-star" data-rating="4"></i>
                                <i class="far fa-star" data-rating="5"></i>
                            </div>
                            <input type="hidden" name="rating" id="rating-value" value="0">
                        </div>
                        
                        <div class="form-group">
                            <label for="review-comment">Nhận xét của bạn:</label>
                            <textarea class="form-control" id="review-comment" name="comment" rows="4" placeholder="Chia sẻ trải nghiệm của bạn về dịch vụ..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="review-modal-footer">
                    <button class="btn btn-secondary close-btn">Hủy</button>
                    <button class="btn btn-primary submit-review-btn" data-id="${booking.id}">Gửi đánh giá</button>
                </div>
            </div>
        </div>
    `;
    
    // Create style element
    const style = document.createElement('style');
    style.textContent = `
        .review-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        .review-modal-content {
            background: white;
            border-radius: 8px;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
        }
        .review-modal-header {
            padding: 15px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .review-modal-header h3 {
            margin: 0;
        }
        .close-modal {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
        }
        .review-modal-body {
            padding: 20px;
        }
        .review-modal-footer {
            padding: 15px;
            border-top: 1px solid #eee;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
        .rating-selector {
            font-size: 30px;
            color: #ddd;
            cursor: pointer;
            direction: rtl;
            display: inline-block;
            margin-bottom: 15px;
        }
        .rating-selector i {
            display: inline-block;
            padding: 0 5px;
            transition: all 0.2s;
        }
        .rating-selector i:hover,
        .rating-selector i:hover ~ i,
        .rating-selector i.active,
        .rating-selector i.active ~ i {
            color: #FFD700;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
        }
        textarea.form-control {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
    `;
    
    // Add to document
    document.head.appendChild(style);
    const modalElement = document.createElement('div');
    modalElement.innerHTML = modalHTML;
    document.body.appendChild(modalElement);
    
    // Add event listeners
    const closeModal = () => {
        document.body.removeChild(modalElement);
    };
    
    modalElement.querySelector('.close-modal').addEventListener('click', closeModal);
    modalElement.querySelector('.close-btn').addEventListener('click', closeModal);
    
    // Star rating selection
    const stars = modalElement.querySelectorAll('.rating-selector i');
    const ratingInput = modalElement.querySelector('#rating-value');
    
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = star.getAttribute('data-rating');
            ratingInput.value = rating;
            
            // Reset all stars
            stars.forEach(s => {
                s.className = 'far fa-star';
            });
            
            // Set selected stars
            stars.forEach(s => {
                if (s.getAttribute('data-rating') <= rating) {
                    s.className = 'fas fa-star active';
                }
            });
        });
    });
    
    // Submit review
    const submitBtn = modalElement.querySelector('.submit-review-btn');
    submitBtn.addEventListener('click', () => {
        const bookingId = submitBtn.getAttribute('data-id');
        const rating = ratingInput.value;
        const comment = modalElement.querySelector('#review-comment').value;
        
        if (rating === '0') {
            alert('Vui lòng chọn số sao đánh giá!');
            return;
        }
        
        submitReview(bookingId, rating, comment, closeModal);
    });
}

// Submit review to server
function submitReview(bookingId, rating, comment, closeCallback) {
    // Disable submit button to prevent double submission
    const submitBtn = document.querySelector('.submit-review-btn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
    }
    
    const reviewData = {
        bookingId: bookingId,
        rating: parseInt(rating),
        comment: comment
    };
    
    fetch('/api/reviews', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                showToast('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
                setTimeout(() => {
                    window.location.href = '/login?redirect=profile';
                }, 2000);
                throw new Error('Unauthorized');
            }
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        showToast('Cảm ơn bạn đã đánh giá dịch vụ!', 'success');
        
        // Close modal if callback provided
        if (typeof closeCallback === 'function') {
            closeCallback();
        }
        
        // Reload bookings to show updated status
        loadUserBookings();
    })
    .catch(error => {
        console.error('Error submitting review:', error);
        showToast('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại sau.', 'error');
        
        // Re-enable button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Gửi đánh giá';
        }
    });
}

// Add event listeners for review buttons
function addReviewButtonListeners() {
    // Add review buttons
    document.querySelectorAll('.add-review-btn').forEach(button => {
        button.addEventListener('click', () => {
            const bookingId = button.getAttribute('data-id');
            const booking = getBookingById(bookingId);
            if (booking) {
                showAddReviewModal(booking);
            }
        });
    });
    
    // View review buttons
    document.querySelectorAll('.view-review-btn').forEach(button => {
        button.addEventListener('click', () => {
            const bookingId = button.getAttribute('data-id');
            const booking = getBookingById(bookingId);
            if (booking) {
                showBookingDetails(booking);
            }
        });
    });
}

// Helper to get booking by ID from current bookings
function getBookingById(id) {
    // This assumes we have a global or accessible bookings variable
    // If not, we need to fetch the booking details from the server
    if (window.currentBookings && Array.isArray(window.currentBookings)) {
        return window.currentBookings.find(b => b.id == id);
    }
    
    // If no cached bookings, fetch from server
    return fetch(`/api/bookings/${id}`)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .catch(error => {
            console.error('Error fetching booking:', error);
            return null;
        });
}

// Hủy đơn hàng
function cancelBooking(bookingId) {
    // Show cancelling indicator
    showToast('Đang hủy đơn hàng...', 'info');
    
    // API call to cancel booking
    fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                showToast('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại', 'error');
                setTimeout(() => {
                    window.location.href = '/login?redirect=profile';
                }, 2000);
                throw new Error('Unauthorized');
            }
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        showToast('Đã hủy đơn hàng thành công', 'success');
        loadUserBookings();
    })
    .catch(error => {
        console.error('Error cancelling booking:', error);
        showToast('Không thể hủy đơn hàng. Vui lòng thử lại sau.', 'error');
    });
}

// Format date
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

// Format currency
function formatCurrency(value) {
    if (!value && value !== 0) return 'N/A';
    
    try {
        return value.toLocaleString('vi-VN') + 'đ';
    } catch (e) {
        return value + 'đ';
    }
}

// Get status text
function getStatusText(status) {
    const statusMap = {
        'PENDING': 'Chờ xác nhận',
        'CONFIRMED': 'Đã xác nhận',
        'PROCESSING': 'Đang xử lý',
        'DELIVERING': 'Đang giao',
        'COMPLETED': 'Hoàn thành',
        'CANCELLED': 'Đã hủy'
    };
    
    return statusMap[status] || status;
}

// Get payment status text
function getPaymentStatusText(status) {
    const statusMap = {
        'PENDING': 'Chờ thanh toán',
        'PAID': 'Đã thanh toán',
        'FAILED': 'Thanh toán thất bại',
        'REFUNDED': 'Đã hoàn tiền'
    };
    
    return statusMap[status] || status;
}

// Show toast notification
function showToast(message, type = 'success') {
    // Check if we're already in a recursive call
    if (window._showToastInProgress) {
        console.warn('Avoiding recursive showToast call');
        return;
    }
    
    // Use existing showToast if available but not this function
    if (typeof window.showToast === 'function' && window.showToast !== showToast) {
        window.showToast(message, type);
        return;
    }
    
    // Set flag to prevent recursion
    window._showToastInProgress = true;
    
    // Create a simple toast
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = type === 'success' ? '#4CAF50' : 
                                type === 'error' ? '#F44336' : 
                                type === 'info' ? '#2196F3' : '#FFC107';
    toast.style.color = 'white';
    toast.style.padding = '15px';
    toast.style.borderRadius = '4px';
    toast.style.zIndex = '9999';
    toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        document.body.removeChild(toast);
        // Clear flag after toast is removed
        window._showToastInProgress = false;
    }, 3000);
} 