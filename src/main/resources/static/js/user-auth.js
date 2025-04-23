document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 User auth script loaded');
    ensureUsersExist();
    
    // Kiểm tra và gắn sự kiện cho form đăng nhập
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        console.log('📝 Login form detected, attaching event listener');
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Kiểm tra và gắn sự kiện cho form đăng ký
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        console.log('📝 Register form detected, attaching event listener');
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Kiểm tra và gắn sự kiện cho nút đăng xuất
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        console.log('📝 Logout button detected, attaching event listener');
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Hiển thị thông tin người dùng nếu đã đăng nhập
    updateUserUI();
    
    // Hiển thị trạng thái đăng nhập trong console
    const currentUser = getCurrentUser();
    if (currentUser) {
        console.log('✅ ĐĂNG NHẬP THÀNH CÔNG:', currentUser);
    } else {
        console.log('❌ CHƯA ĐĂNG NHẬP');
    }
});

// Hàm xử lý đăng nhập
function handleLogin(event) {
    event.preventDefault();
    console.log('🔒 Attempting login...');
    
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Demo - Login with hardcoded credentials for testing
    if (email === 'admin@example.com' && password === 'password') {
        const demoUser = {
            id: 1,
            firstName: 'Admin',
            lastName: 'User',
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password',
            phoneNumber: '0123456789',
            address: '123 Demo Street',
            roles: ['ROLE_USER', 'ROLE_ADMIN']
        };
        
        console.log('✅ DEMO LOGIN SUCCESS!', demoUser);
        localStorage.setItem('currentUser', JSON.stringify(demoUser));
        
        showToast('Đăng nhập thành công!', 'success');
        
        setTimeout(function() {
            window.location.href = '/';
        }, 1000);
        return;
    }
    
    // Thực tế - Tìm kiếm trong danh sách users đã đăng ký
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        console.log('✅ LOGIN SUCCESS!', user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        showToast('Đăng nhập thành công!', 'success');
        
        setTimeout(function() {
            window.location.href = '/';
        }, 1000);
    } else {
        console.log('❌ LOGIN FAILED: Invalid credentials');
        showToast('Email hoặc mật khẩu không đúng!', 'error');
    }
}

// Hàm xử lý đăng ký
function handleRegister(event) {
    event.preventDefault();
    console.log('🔒 Attempting registration...');
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm') ? document.getElementById('passwordConfirm').value : password;
    
    if (password !== passwordConfirm) {
        showToast('Mật khẩu xác nhận không khớp!', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Kiểm tra email đã tồn tại chưa
    if (users.some(user => user.email === email)) {
        showToast('Email đã được sử dụng!', 'error');
        return;
    }
    
    // Tạo user mới
    const newUser = {
        id: users.length + 1,
        name: name,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' '),
        email: email,
        password: password,
        roles: ['ROLE_USER']
    };
    
    // Thêm user mới vào danh sách
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    console.log('✅ REGISTRATION SUCCESS!', newUser);
    
    // Tự động đăng nhập
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    showToast('Đăng ký thành công!', 'success');
    
    setTimeout(function() {
        window.location.href = '/';
    }, 1000);
}

// Hàm xử lý đăng xuất
function handleLogout(event) {
    if (event) event.preventDefault();
    console.log('🔒 Logging out...');
    
    localStorage.removeItem('currentUser');
    showToast('Đăng xuất thành công!', 'success');
    
    setTimeout(function() {
        window.location.href = '/login?logout=true';
    }, 1000);
}

// Hàm hiển thị thông báo
function showToast(message, type = 'success') {
    console.log(`🔔 TOAST: ${message} (${type})`);
    
    // Kiểm tra xem đã có container cho toast chưa
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.top = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    // Tạo toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.backgroundColor = type === 'success' ? '#4CAF50' : '#F44336';
    toast.style.color = '#ffffff';
    toast.style.padding = '15px';
    toast.style.marginBottom = '10px';
    toast.style.borderRadius = '4px';
    toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    toast.style.minWidth = '250px';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease-in-out';
    
    // Nội dung
    toast.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>${message}</span>
            <button style="background: none; border: none; color: white; cursor: pointer; font-size: 16px;">&times;</button>
        </div>
    `;
    
    // Thêm toast vào container
    toastContainer.appendChild(toast);
    
    // Hiển thị toast (sau một chút để animation hoạt động)
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);
    
    // Đóng toast khi nhấp vào nút đóng
    const closeBtn = toast.querySelector('button');
    closeBtn.addEventListener('click', function() {
        closeToast(toast);
    });
    
    // Tự động đóng sau 3 giây
    setTimeout(function() {
        closeToast(toast);
    }, 3000);
    
    function closeToast(toast) {
        toast.style.opacity = '0';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
}

// Hàm đảm bảo rằng có người dùng trong localStorage
function ensureUsersExist() {
    // Kiểm tra nếu users đã tồn tại
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Nếu không có user nào, thêm một số user mẫu
    if (users.length === 0) {
        console.log('📊 No users found, creating demo users');
        const demoUsers = [
            {
                id: 1,
                firstName: 'Admin',
                lastName: 'User',
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password',
                phoneNumber: '0123456789',
                address: '123 Demo Street',
                roles: ['ROLE_USER', 'ROLE_ADMIN']
            },
            {
                id: 2,
                firstName: 'Test',
                lastName: 'User',
                name: 'Test User',
                email: 'user@example.com',
                password: 'password',
                phoneNumber: '0987654321',
                address: '456 Test Avenue',
                roles: ['ROLE_USER']
            }
        ];
        
        localStorage.setItem('users', JSON.stringify(demoUsers));
        console.log('✅ Demo users created:', demoUsers);
    } else {
        console.log('📊 Found existing users:', users.length);
    }
}

// Cập nhật UI dựa trên trạng thái đăng nhập
function updateUserUI() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    // Các phần tử cần cập nhật
    const userNameElements = document.querySelectorAll('.user-name');
    const guestElements = document.querySelectorAll('.guest-only');
    const userElements = document.querySelectorAll('.user-only');
    
    if (currentUser) {
        // Đã đăng nhập
        userNameElements.forEach(el => {
            el.textContent = currentUser.name || currentUser.email || 'Người dùng';
        });
        
        // Hiển thị phần tử dành cho người đã đăng nhập
        userElements.forEach(el => {
            if (el) el.style.display = 'block';
        });
        guestElements.forEach(el => {
            if (el) el.style.display = 'none';
        });
        
        // Hiển thị user profile nếu có
        const userProfile = document.getElementById('user-profile');
        const authButtons = document.getElementById('auth-buttons');
        
        if (userProfile) {
            userProfile.classList.remove('hidden');
        }
        
        if (authButtons) {
            authButtons.classList.add('hidden');
        }
        
        // Cập nhật thông tin người dùng trên các form đặt lịch
        const userInfoName = document.getElementById('user-info-name');
        const userInfoEmail = document.getElementById('user-info-email');
        const userInfoPhone = document.getElementById('user-info-phone');
        const userInfoAddress = document.getElementById('user-info-address');
        
        if (userInfoName) userInfoName.textContent = currentUser.name || 'Chưa cập nhật';
        if (userInfoEmail) userInfoEmail.textContent = currentUser.email || 'Chưa cập nhật';
        if (userInfoPhone) userInfoPhone.textContent = currentUser.phoneNumber || 'Chưa cập nhật';
        if (userInfoAddress) userInfoAddress.textContent = currentUser.address || 'Chưa cập nhật';
        
        // Ẩn thông báo yêu cầu đăng nhập
        const loginRequired = document.getElementById('login-required');
        if (loginRequired) loginRequired.style.display = 'none';
        
        // Hiển thị form đặt lịch của user nếu có
        const userBookingForm = document.getElementById('user-booking-form');
        if (userBookingForm) userBookingForm.classList.remove('hidden');
    } else {
        // Chưa đăng nhập
        userNameElements.forEach(el => {
            if (el) el.textContent = 'Khách';
        });
        
        userElements.forEach(el => {
            if (el) el.style.display = 'none';
        });
        
        guestElements.forEach(el => {
            if (el) el.style.display = 'block';
        });
        
        // Hiển thị nút đăng nhập/đăng ký nếu có
        const userProfile = document.getElementById('user-profile');
        const authButtons = document.getElementById('auth-buttons');
        
        if (userProfile) {
            userProfile.classList.add('hidden');
        }
        
        if (authButtons) {
            authButtons.classList.remove('hidden');
        }
        
        // Bất kỳ ai cũng có thể sử dụng chức năng đặt lịch thành viên
        // Ẩn thông báo yêu cầu đăng nhập ở trang đặt lịch
        const loginRequired = document.getElementById('login-required');
        if (loginRequired) loginRequired.style.display = 'none';
        
        // Hiển thị form đặt lịch của user nếu có, ngay cả khi không đăng nhập
        const userBookingForm = document.getElementById('user-booking-form');
        if (userBookingForm) userBookingForm.classList.remove('hidden');
        
        // Cập nhật thông tin mặc định cho khách vãng lai
        const userInfoName = document.getElementById('user-info-name');
        const userInfoEmail = document.getElementById('user-info-email');
        const userInfoPhone = document.getElementById('user-info-phone');
        const userInfoAddress = document.getElementById('user-info-address');
        
        if (userInfoName) userInfoName.textContent = 'Khách vãng lai';
        if (userInfoEmail) userInfoEmail.textContent = 'guest@example.com';
        if (userInfoPhone) userInfoPhone.textContent = '(Cập nhật khi đặt lịch)';
        if (userInfoAddress) userInfoAddress.textContent = '(Cập nhật khi đặt lịch)';
    }
}

// Lấy user hiện tại
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || 'null');
} 