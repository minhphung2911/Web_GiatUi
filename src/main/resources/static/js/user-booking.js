document.addEventListener('DOMContentLoaded', function() {
    // Set global demo mode to false
    window.DEMO_MODE = false;
    
    // Load danh sách dịch vụ
    loadServices();
    
    // Load lịch sử đặt lịch
    loadBookingHistory();
    
    // Xử lý form đặt lịch
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', createBooking);
    }
    
    // Xử lý form đặt lịch của khách
    const guestBookingForm = document.getElementById('guest-booking-form');
    if (guestBookingForm) {
        guestBookingForm.addEventListener('submit', createGuestBooking);
    }
});

// Load danh sách dịch vụ
function loadServices() {
    // Hiển thị các dropdown dịch vụ
    const serviceDropdowns = document.querySelectorAll('.service-dropdown');
    if (serviceDropdowns.length === 0) return;
    
    // Show loading state
    serviceDropdowns.forEach(dropdown => {
        dropdown.innerHTML = '<option value="">Đang tải dịch vụ...</option>';
    });
    
    // Use apiService to fetch services
    apiService.get('/services')
        .then(services => {
            if (services && Array.isArray(services) && services.length > 0) {
                populateServiceDropdown(services);
            } else {
                throw new Error('No services returned from API');
            }
        })
        .catch(error => {
            console.error('Error loading services:', error);
            showToast('Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.', 'error');
            
            // Set default service options
            const defaultServices = [
                { id: 1, name: 'Giặt & Gấp', price: 70000, priceUnit: 'kg' },
                { id: 2, name: 'Giặt Khô', price: 150000, priceUnit: 'món' },
                { id: 3, name: 'Dịch Vụ Ủi', price: 75000, priceUnit: 'món' },
                { id: 4, name: 'Gói Cao Cấp', price: 600000, priceUnit: 'lần' }
            ];
            
            populateServiceDropdown(defaultServices);
        });
}

// Populate service dropdown with data
function populateServiceDropdown(services) {
    const serviceSelect = document.getElementById('service');
    if (!serviceSelect) return;
    
    // Xóa options cũ
    serviceSelect.innerHTML = '<option value="">-- Chọn dịch vụ --</option>';
    
    // Thêm options mới
    services.forEach(service => {
        const option = document.createElement('option');
        option.value = service.id;
        option.textContent = `${service.name} (${service.price.toLocaleString('vi-VN')}đ/${service.priceUnit || 'kg'})`;
        serviceSelect.appendChild(option);
    });
    
    // Thêm radio buttons cho dịch vụ nếu cần
    const serviceRadioContainer = document.querySelector('.service-radio-group');
    if (serviceRadioContainer) {
        serviceRadioContainer.innerHTML = '';
        
        services.forEach(service => {
            const radioDiv = document.createElement('div');
            radioDiv.className = 'service-radio';
            
            const radioInput = document.createElement('input');
            radioInput.type = 'radio';
            radioInput.name = 'service';
            radioInput.id = `service-${service.id}`;
            radioInput.value = service.id;
            
            const radioLabel = document.createElement('label');
            radioLabel.htmlFor = `service-${service.id}`;
            radioLabel.textContent = `${service.name} (${service.price.toLocaleString('vi-VN')}đ/${service.priceUnit || 'kg'})`;
            
            radioDiv.appendChild(radioInput);
            radioDiv.appendChild(radioLabel);
            serviceRadioContainer.appendChild(radioDiv);
        });
    }
}

// Tạo dữ liệu dịch vụ mẫu khi không thể tải từ API
function generateMockServices() {
    return [
        { id: 1, name: 'Giặt ủi thường', price: 15000, priceUnit: 'kg' },
        { id: 2, name: 'Giặt hấp', price: 25000, priceUnit: 'kg' },
        { id: 3, name: 'Giặt khô', price: 35000, priceUnit: 'kg' },
        { id: 4, name: 'Giặt đồ đặc biệt', price: 50000, priceUnit: 'món' }
    ];
}

// Load lịch sử đặt lịch
function loadBookingHistory() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser) {
        const historyContainer = document.getElementById('booking-history');
        if (historyContainer) {
            historyContainer.innerHTML = '<p>Vui lòng <a href="/login">đăng nhập</a> để xem lịch sử đặt lịch.</p>';
        }
        return;
    }
    
    console.log('Đang tải lịch sử đặt lịch cho user ID:', currentUser.id);
    
    // Hiển thị trạng thái đang tải
    const historyContainer = document.getElementById('booking-history');
    if (historyContainer) {
        historyContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...</div>';
    }
    
    // Sử dụng fetch API để gọi trực tiếp endpoint
    fetch(`/api/users/${currentUser.id}/bookings`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`Error: ${res.status} - ${res.statusText}`);
            }
            return res.json();
        })
        .then(bookings => {
            if (!historyContainer) return;
            
            if (!bookings || bookings.length === 0) {
                historyContainer.innerHTML = '<p>Bạn chưa có đơn đặt dịch vụ nào.</p>';
                return;
            }
            
            // Tạo bảng hiển thị lịch sử
            let html = `
            <table class="booking-table">
                <thead>
                    <tr>
                        <th>Mã đơn</th>
                        <th>Dịch vụ</th>
                        <th>Ngày đặt</th>
                        <th>Tình trạng</th>
                        <th>Tổng tiền</th>
                    </tr>
                </thead>
                <tbody>
            `;
            
            bookings.forEach(booking => {
                const serviceName = booking.serviceName || (booking.service ? booking.service.name : 'Dịch vụ giặt là');
                html += `
                <tr>
                    <td>${booking.bookingCode || 'BK-' + booking.id}</td>
                    <td>${serviceName}</td>
                    <td>${formatDate(booking.bookingDate)}</td>
                    <td>${getStatusText(booking.status)}</td>
                    <td>${formatCurrency(booking.totalPrice)}</td>
                </tr>
                `;
            });
            
            html += '</tbody></table>';
            historyContainer.innerHTML = html;
        })
        .catch(err => {
            console.error('Lỗi tải lịch sử đặt lịch:', err);
            if (historyContainer) {
                historyContainer.innerHTML = `
                    <p class="error-message">Không thể tải lịch sử đặt lịch: ${err.message}</p>
                    <button id="retry-load-history" class="btn btn-primary">Thử lại</button>
                `;
                
                // Add retry button event listener
                const retryButton = document.getElementById('retry-load-history');
                if (retryButton) {
                    retryButton.addEventListener('click', loadBookingHistory);
                }
            }
        });
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    } catch (e) {
        return 'N/A';
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

// Create booking for logged in user
function createBooking(e) {
    e.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser) {
        showToast('Vui lòng đăng nhập để đặt lịch', 'error');
        setTimeout(() => {
            window.location.href = '/login?redirect=booking';
        }, 2000);
        return;
    }
    
    // Show loading state
    const submitBtn = document.getElementById('user-submit-btn');
    const spinner = document.getElementById('user-spinner');
    
    if (submitBtn) submitBtn.disabled = true;
    if (spinner) spinner.style.display = 'inline-block';
    
    // Lấy thông tin từ form
    const form = e.target;
    
    // Lấy thông tin đặt lịch
    const serviceSelect = document.getElementById('service');
    const serviceElement = form.querySelector('input[name="service"]:checked') || (serviceSelect && { value: serviceSelect.value });
    const pickupDateElement = document.getElementById('user-date');
    const pickupTimeElement = document.getElementById('user-time');
    const notesElement = document.getElementById('user-notes');
    const weightElement = document.getElementById('user-weight');
    const addressElement = document.getElementById('user-address');
    
    // Validate required fields
    if (!serviceElement || !serviceElement.value || !pickupDateElement || !pickupDateElement.value || !pickupTimeElement || !pickupTimeElement.value) {
        showToast('Vui lòng điền đầy đủ thông tin dịch vụ và thời gian', 'error');
        
        // Reset UI
        if (submitBtn) submitBtn.disabled = false;
        if (spinner) spinner.style.display = 'none';
        
        return;
    }
    
    // Tạo booking data
    const pickupDateTimeStr = `${pickupDateElement.value}T${pickupTimeElement.value}:00`;
    const pickupDateTime = new Date(pickupDateTimeStr);
    
    // Tính ngày giao mặc định (pickup date + 2 days)
    const deliveryDateTime = new Date(pickupDateTime);
    deliveryDateTime.setDate(deliveryDateTime.getDate() + 2);
    
    const serviceId = serviceElement.value;
    const weight = weightElement ? parseFloat(weightElement.value) || 1 : 1;
    
    // Call price API to get price
    const pricePerKg = getPricePerKg(serviceId);
    const totalPrice = pricePerKg * weight;
    
    // Prepare booking data
    const bookingData = {
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        userPhone: currentUser.phoneNumber || '',
        serviceId: serviceId,
        weight: weight,
        totalPrice: totalPrice,
        pickupDate: pickupDateTime.toISOString(),
        deliveryDate: deliveryDateTime.toISOString(),
        address: addressElement ? addressElement.value : (currentUser.address || ''),
        notes: notesElement ? notesElement.value : '',
        status: 'PENDING',
        paymentStatus: 'PENDING'
    };
    
    console.log('Creating booking with data:', bookingData);
    
    // Call API to create booking
    let apiCallPromise;
    
    if (typeof bookingService !== 'undefined' && bookingService.createBooking) {
        // Use booking service if available
        apiCallPromise = bookingService.createBooking(bookingData);
    } else if (typeof apiService !== 'undefined' && apiService.post) {
        // Use apiService if available
        apiCallPromise = apiService.post('/bookings', bookingData);
    } else {
        // Fallback to direct fetch
        apiCallPromise = fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized. Please login again.');
                } else if (response.status === 500) {
                    throw new Error('Server error. Please try again later.');
                }
                throw new Error('Failed to create booking');
            }
            return response.json();
        });
    }
    
    apiCallPromise
        .then(booking => {
            // Handle success
            console.log('Booking created successfully:', booking);
            
            // Reset UI
            if (submitBtn) submitBtn.disabled = false;
            if (spinner) spinner.style.display = 'none';
            
            // Reset form and show success message
            handleBookingSuccess(booking, form, false);
        })
        .catch(error => {
            console.error('Error creating booking:', error);
            
            // Reset UI
            if (submitBtn) submitBtn.disabled = false;
            if (spinner) spinner.style.display = 'none';
            
            // Demo mode or development
            if (window.DEMO_MODE || error.message.includes('Failed to fetch')) {
                console.log('Running in DEMO mode, creating mock booking');
                
                // Generate a mock booking response
                const mockBooking = {
                    id: Math.floor(Math.random() * 10000),
                    bookingCode: 'BK-' + Math.floor(Math.random() * 10000),
                    userId: currentUser.id,
                    userName: currentUser.name,
                    serviceId: serviceId,
                    serviceName: getServiceName(serviceId),
                    weight: weight,
                    totalPrice: totalPrice,
                    status: 'PENDING',
                    paymentStatus: 'PENDING',
                    bookingDate: new Date().toISOString(),
                    pickupDate: pickupDateTime.toISOString(),
                    deliveryDate: deliveryDateTime.toISOString(),
                    address: addressElement ? addressElement.value : (currentUser.address || ''),
                    notes: notesElement ? notesElement.value : ''
                };
                
                // Simulate a successful booking
                handleBookingSuccess(mockBooking, form, false);
                return;
            }
            
            // Show error message
            showToast('Không thể tạo đơn đặt lịch. Vui lòng thử lại sau. Lỗi: ' + error.message, 'error');
        });
}

// Create booking for guest user
function createGuestBooking(e) {
    e.preventDefault();
    
    // Show loading state
    const submitBtn = document.getElementById('guest-submit-btn');
    const spinner = document.getElementById('guest-spinner');
    
    if (submitBtn) submitBtn.disabled = true;
    if (spinner) spinner.style.display = 'inline-block';
    
    // Get form data
    const form = e.target;
    
    // Get guest information
    const name = form.elements['guest-name'] ? form.elements['guest-name'].value : '';
    const email = form.elements['guest-email'] ? form.elements['guest-email'].value : '';
    const phone = form.elements['guest-phone'] ? form.elements['guest-phone'].value : '';
    const address = form.elements['guest-address'] ? form.elements['guest-address'].value : '';
    
    // Get booking information
    const serviceElement = form.elements['service'];
    const pickupDateElement = document.getElementById('guest-date');
    const pickupTimeElement = document.getElementById('guest-time');
    const notesElement = document.getElementById('guest-notes');
    const weightElement = document.getElementById('guest-weight');
    
    // Validate required fields
    if (!serviceElement || !serviceElement.value || !pickupDateElement || !pickupDateElement.value || 
        !pickupTimeElement || !pickupTimeElement.value || !name || !email || !phone || !address) {
        showToast('Vui lòng điền đầy đủ thông tin', 'error');
        
        // Reset UI
        if (submitBtn) submitBtn.disabled = false;
        if (spinner) spinner.style.display = 'none';
        
        return;
    }
    
    // Create temporary user for the booking
    const guestUserData = {
        name: name,
        email: email,
        phoneNumber: phone,
        address: address
    };
    
    // First, create a temporary user or get existing user by email
    fetch('/api/users/guest', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(guestUserData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to create guest user');
        }
        return response.json();
    })
    .then(user => {
        // Now create the booking using the user ID
        // Tạo booking data
        const pickupDateTimeStr = `${pickupDateElement.value}T${pickupTimeElement.value}:00`;
        const pickupDateTime = new Date(pickupDateTimeStr);
        
        // Tính ngày giao mặc định (pickup date + 2 days)
        const deliveryDateTime = new Date(pickupDateTime);
        deliveryDateTime.setDate(deliveryDateTime.getDate() + 2);
        
        const serviceId = serviceElement.value;
        const weight = weightElement ? parseFloat(weightElement.value) || 1 : 1;
        
        // Call price API to get price
        const pricePerKg = getPricePerKg(serviceId);
        const totalPrice = pricePerKg * weight;
        
        const bookingData = {
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            userPhone: user.phoneNumber,
            serviceId: serviceId,
            serviceName: getServiceName(serviceId),
            weight: weight,
            totalPrice: totalPrice,
            address: user.address || '',
            notes: notesElement ? notesElement.value : '',
            pickupDate: pickupDateTime.toISOString(),
            deliveryDate: deliveryDateTime.toISOString()
        };
        
        // Call API to create booking
        return fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to create booking');
        }
        return response.json();
    })
    .then(booking => {
        handleBookingSuccess(booking, form, true);
    })
    .catch(error => {
        console.error('Error in guest booking process:', error);
        showToast('Đã xảy ra lỗi khi đặt lịch. Vui lòng thử lại sau.', 'error');
        
        // Reset UI
        if (submitBtn) submitBtn.disabled = false;
        if (spinner) spinner.style.display = 'none';
    });
}

// Reset form
function resetBookingForm() {
    const userForm = document.getElementById('user-booking-form');
    const guestForm = document.getElementById('guest-booking-form');
    
    if (userForm) userForm.reset();
    if (guestForm) guestForm.reset();
    
    // Reset spinners and buttons
    const userSubmitBtn = document.getElementById('user-submit-btn');
    const userSpinner = document.getElementById('user-spinner');
    const guestSubmitBtn = document.getElementById('guest-submit-btn');
    const guestSpinner = document.getElementById('guest-spinner');
    
    if (userSubmitBtn) userSubmitBtn.disabled = false;
    if (userSpinner) userSpinner.style.display = 'none';
    if (guestSubmitBtn) guestSubmitBtn.disabled = false;
    if (guestSpinner) guestSpinner.style.display = 'none';
}

// Hàm xử lý khi đặt lịch thành công
function handleBookingSuccess(booking, form, isGuest) {
    // Hiển thị thông báo thành công
    showToast('Đặt lịch thành công!', 'success');
    
    // Reset form
    form.reset();
    
    // Ẩn spinner và kích hoạt lại nút đặt lịch
    const spinnerElement = form.id === 'guest-booking-form' ?
        document.getElementById('guest-spinner') :
        document.getElementById('user-spinner');
    
    if (spinnerElement) {
        spinnerElement.style.display = 'none';
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = false;
    }
    
    // Hiển thị thông báo thành công dưới dạng popup
    if (booking) {
        showBookingConfirmation(booking);
        
        // Hiển thị màn hình thành công nếu có
        showSuccessScreen(booking);
    } else {
        showToast('Đã xảy ra lỗi khi lấy thông tin đặt lịch. Vui lòng kiểm tra email để xem chi tiết.', 'warning');
    }
    
    // Nếu đã đăng nhập, cập nhật lịch sử đặt lịch
    if (!isGuest) {
        loadBookingHistory();
    }
}

// Hiển thị màn hình thành công
function showSuccessScreen(booking) {
    const bookingContainer = document.querySelector('.booking-container');
    const successScreen = document.createElement('div');
    
    successScreen.className = 'success-screen fade-in';
    successScreen.innerHTML = `
        <div class="success-icon">
            <i class="fas fa-check-circle"></i>
        </div>
        <h2>Đặt Lịch Thành Công!</h2>
        <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
        <p class="booking-code">Mã đơn hàng: <strong>${booking.bookingCode || 'BK-' + booking.id}</strong></p>
        <p>Chúng tôi sẽ gửi thông tin chi tiết qua email <strong>${booking.userEmail || ''}</strong>.</p>
        <div class="success-actions">
            <a href="/booking" class="btn btn-outline">Đặt Lịch Mới</a>
            <a href="/" class="btn btn-primary">Về Trang Chủ</a>
        </div>
    `;
    
    if (bookingContainer) {
        bookingContainer.innerHTML = '';
        bookingContainer.appendChild(successScreen);
    }
}

// Hiển thị xác nhận đặt lịch
function showBookingConfirmation(booking) {
    // Create modal background
    const modalBg = document.createElement('div');
    modalBg.className = 'modal-bg';
    modalBg.style.position = 'fixed';
    modalBg.style.top = '0';
    modalBg.style.left = '0';
    modalBg.style.width = '100%';
    modalBg.style.height = '100%';
    modalBg.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modalBg.style.display = 'flex';
    modalBg.style.alignItems = 'center';
    modalBg.style.justifyContent = 'center';
    modalBg.style.zIndex = '9999';
    
    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'booking-confirmation-modal';
    modal.style.backgroundColor = 'white';
    modal.style.borderRadius = '10px';
    modal.style.padding = '25px';
    modal.style.maxWidth = '500px';
    modal.style.width = '90%';
    modal.style.maxHeight = '80vh';
    modal.style.overflowY = 'auto';
    modal.style.position = 'relative';
    modal.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.2)';
    
    // Format date for display
    const pickupDate = booking.pickupDate ? new Date(booking.pickupDate) : null;
    const deliveryDate = booking.deliveryDate ? new Date(booking.deliveryDate) : null;
    
    const formattedPickupDate = pickupDate ? pickupDate.toLocaleDateString('vi-VN') : 'N/A';
    const formattedPickupTime = pickupDate ? pickupDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
    const formattedDeliveryDate = deliveryDate ? deliveryDate.toLocaleDateString('vi-VN') : 'N/A';
    
    // Set modal content
    modal.innerHTML = `
        <div class="modal-header" style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #3498db; margin: 0;">Xác Nhận Đặt Lịch</h2>
        </div>
        <div class="modal-content">
            <div class="confirmation-message" style="text-align: center; margin-bottom: 20px;">
                <i class="fas fa-check-circle" style="color: #2ecc71; font-size: 50px;"></i>
                <p style="font-size: 18px; margin-top: 10px;">Đặt lịch thành công!</p>
            </div>
            <div class="booking-details" style="margin-bottom: 20px;">
                <p><strong>Mã đơn hàng:</strong> ${booking.bookingCode || 'BK-' + booking.id}</p>
                <p><strong>Dịch vụ:</strong> ${booking.serviceName || 'Dịch vụ giặt là'}</p>
                <p><strong>Khối lượng:</strong> ${booking.weight || 1} kg</p>
                <p><strong>Tổng tiền:</strong> ${formatCurrency(booking.totalPrice)}</p>
                <p><strong>Ngày lấy đồ:</strong> ${formattedPickupDate} ${formattedPickupTime}</p>
                <p><strong>Ngày giao (dự kiến):</strong> ${formattedDeliveryDate}</p>
                <p><strong>Địa chỉ:</strong> ${booking.address || 'Chưa cập nhật'}</p>
                ${booking.notes ? `<p><strong>Ghi chú:</strong> ${booking.notes}</p>` : ''}
            </div>
        </div>
        <div class="modal-footer" style="text-align: center;">
            <button class="close-modal-btn" style="background-color: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Đóng</button>
        </div>
    `;
    
    // Append modal to body
    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);
    
    // Close modal when clicking close button
    const closeBtn = modal.querySelector('.close-modal-btn');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modalBg);
    });
    
    // Close modal when clicking outside
    modalBg.addEventListener('click', (e) => {
        if (e.target === modalBg) {
            document.body.removeChild(modalBg);
        }
    });
}

// Lấy user hiện tại
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
}

// Cập nhật tóm tắt đặt lịch
function updateBookingSummary(bookingData) {
    const summaryService = document.getElementById('summary-service');
    const summaryDate = document.getElementById('summary-date');
    const summaryTime = document.getElementById('summary-time');
    const summaryPrice = document.getElementById('summary-price');
    
    if (summaryService) summaryService.textContent = bookingData.serviceName || 'Chưa chọn';
    if (summaryDate) summaryDate.textContent = bookingData.date ? new Date(bookingData.date).toLocaleDateString('vi-VN') : 'Chưa chọn';
    if (summaryTime) summaryTime.textContent = bookingData.time || 'Chưa chọn';
    if (summaryPrice) summaryPrice.textContent = bookingData.price ? formatCurrency(bookingData.price) : (bookingData.pricePerKg ? `${formatCurrency(bookingData.pricePerKg)} / kg` : 'Chưa xác định');
}

// Lấy giá cho từng kg dựa vào dịch vụ
function getPricePerKg(serviceId) {
    const servicePrices = {
        '1': 70000, // Standard
        '2': 150000, // Cao cấp
        '3': 100000, // Express
        '4': 75000, // Ủi
        'wash-fold': 70000,
        'dry-cleaning': 150000,
        'ironing': 75000,
        'premium': 200000
    };
    
    return servicePrices[serviceId] || 70000;
}

// Lấy tên dịch vụ
function getServiceName(serviceId) {
    const serviceNames = {
        '1': 'Giặt & Là Standard',
        '2': 'Giặt Khô Cao Cấp',
        '3': 'Giặt Nhanh Express',
        '4': 'Dịch Vụ Ủi',
        'wash-fold': 'Giặt & Gấp',
        'dry-cleaning': 'Giặt Khô',
        'ironing': 'Dịch Vụ Ủi',
        'premium': 'Gói Cao Cấp'
    };
    
    return serviceNames[serviceId] || 'Dịch vụ giặt là';
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