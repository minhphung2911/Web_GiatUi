/**
 * API Service
 * This file handles all the API requests to the backend
 */

const apiService = {
    /**
     * Base URL for all API requests
     */
    baseUrl: '/api',

    /**
     * Send a GET request to the specified endpoint
     * @param {string} endpoint - The API endpoint to call
     * @returns {Promise} - The fetch promise
     */
    get: function(endpoint) {
        // For demo purposes (when the server isn't running)
        if (typeof window.DEMO_MODE !== 'undefined' && window.DEMO_MODE === true) {
            console.log('DEMO MODE: Using mock data for:', endpoint);
            return Promise.resolve(this.getMockData(endpoint));
        }

        console.log(`Đang gọi API: ${this.baseUrl + endpoint}`);
        
        return fetch(this.baseUrl + endpoint)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) {
                        // Redirect to login if unauthorized
                        console.error(`Lỗi xác thực 401 khi gọi: ${endpoint}`);
                        window.location.href = '/login?error=session_expired';
                        return Promise.reject('Không được xác thực. Vui lòng đăng nhập lại.');
                    }
                    if (response.status === 500) {
                        console.error(`Lỗi server 500 khi gọi: ${endpoint}`);
                        // Don't use mock data, throw the error instead
                        return Promise.reject(new Error(`Lỗi server khi gọi: ${endpoint}`));
                    }
                    if (response.status === 404) {
                        console.error(`Không tìm thấy tài nguyên (404) khi gọi: ${endpoint}`);
                        return Promise.reject(new Error(`Không tìm thấy tài nguyên: ${endpoint}`));
                    }
                    return Promise.reject(new Error(`Lỗi kết nối tới server: ${response.status} - ${response.statusText}`));
                }
                return response.json();
            })
            .catch(error => {
                console.error('Lỗi API:', error.message || error);
                // Throw the error instead of using mock data
                return Promise.reject(error);
            });
    },

    /**
     * Send a POST request to the specified endpoint
     * @param {string} endpoint - The API endpoint to call
     * @param {object} data - The data to send
     * @returns {Promise} - The fetch promise
     */
    post: function(endpoint, data) {
        return fetch(this.baseUrl + endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/login?error=session_expired';
                    return Promise.reject('Unauthorized');
                }
                return Promise.reject(new Error(`Network response was not ok: ${response.status}`));
            }
            return response.json();
        });
    },

    /**
     * Send a PUT request to the specified endpoint
     * @param {string} endpoint - The API endpoint to call
     * @param {object} data - The data to send
     * @returns {Promise} - The fetch promise
     */
    put: function(endpoint, data) {
        return fetch(this.baseUrl + endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/login?error=session_expired';
                    return Promise.reject('Unauthorized');
                }
                return Promise.reject(new Error(`Network response was not ok: ${response.status}`));
            }
            return response.json();
        });
    },

    /**
     * Send a DELETE request to the specified endpoint
     * @param {string} endpoint - The API endpoint to call
     * @returns {Promise} - The fetch promise
     */
    delete: function(endpoint) {
        return fetch(this.baseUrl + endpoint, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/login?error=session_expired';
                    return Promise.reject('Unauthorized');
                }
                return Promise.reject(new Error(`Network response was not ok: ${response.status}`));
            }
            return response.json();
        });
    },

    /**
     * Get headers for API requests
     * @returns {object} - The headers
     */
    getHeaders: function() {
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    },

    /**
     * Handle API response
     * @param {Response} response - The fetch response
     * @returns {Promise} - The response data
     */
    handleResponse: function(response) {
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        // Check if response is empty
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return response.json();
        }
        return response.text();
    },

    /**
     * Handle API error
     * @param {Error} error - The error
     * @param {string} endpoint - The endpoint that was called
     * @param {object} data - The data that was sent (for POST/PUT)
     * @throws {Error} - Rethrow the error
     */
    handleError: function(endpoint, data) {
        console.error('API Error for endpoint:', endpoint);
        throw new Error(`API Error for endpoint: ${endpoint}`);
    },
    
    /**
     * Get mock data for development
     * @param {string} endpoint - The endpoint that was called
     * @param {object} data - The data that was sent (for POST/PUT)
     * @returns {object|array} - Mock data
     */
    getMockData: function(endpoint, data) {
        // Check if we're in a booking-related endpoint
        if (endpoint.includes('/bookings')) {
            // If it's a specific booking
            if (endpoint.match(/\/bookings\/\d+$/)) {
                const bookingId = parseInt(endpoint.split('/').pop());
                return this.getMockBooking(bookingId);
            }
            
            // If it's a booking creation
            if (endpoint === '/api/bookings' && data) {
                return this.createMockBooking(data);
            }
            
            // Otherwise return all bookings
            return this.getMockBookings();
        }
        
        // Check if we're in a service-related endpoint
        if (endpoint.includes('/services')) {
            // If it's a specific service
            if (endpoint.match(/\/services\/\d+$/)) {
                const serviceId = parseInt(endpoint.split('/').pop());
                return this.getMockService(serviceId);
            }
            
            // Otherwise return all services
            return this.getMockServices();
        }
        
        // Check if we're in a user-related endpoint
        if (endpoint.includes('/users') || endpoint.includes('/user-management')) {
            // If it's a specific user
            if (endpoint.match(/\/(users|user-management)\/\d+$/)) {
                const userId = parseInt(endpoint.split('/').pop());
                return this.getMockUser(userId);
            }
            
            // If it's user update
            if (endpoint.match(/\/(users|user-management)\/\d+$/) && data) {
                return data; // Return the data they tried to update with
            }
            
            // Otherwise return all users
            return this.getMockUsers();
        }
        
        // Default empty response
        return {};
    },
    
    /**
     * Get service name by ID
     * @param {number} serviceId - The service ID
     * @returns {string} - The service name
     */
    getServiceNameById: function(serviceId) {
        const services = {
            1: 'Giặt Ủi Thường',
            2: 'Giặt Khô',
            3: 'Giặt Đồ Lớn',
            4: 'Làm Sạch Đặc Biệt',
            5: 'Giặt Ủi Nhanh',
            6: 'Giặt Đồ Da'
        };
        return services[serviceId] || 'Dịch vụ giặt là';
    },
    
    /**
     * Mock admin data
     * @returns {object} - Mock admin data
     */
    mockAdminData: function() {
        return {
            id: 1,
            email: 'admin@freshlaundry.com',
            name: 'Administrator',
            role: 'ROLE_ADMIN',
            avatar: '/images/admin-avatar.jpg'
        };
    },
    
    /**
     * Mock dashboard stats
     * @returns {object} - Mock dashboard stats
     */
    mockDashboardStats: function() {
        return {
            totalBookings: 128,
            totalCustomers: 85,
            totalRevenue: 25800000,
            completedBookings: 95,
            customerStats: {
                labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
                newCustomers: [5, 8, 12, 7, 10, 9, 15, 12, 8, 6, 4, 7],
                returningCustomers: [3, 5, 7, 4, 6, 5, 8, 6, 4, 3, 2, 4]
            },
            revenueByMonth: {
                'T1': 1200000,
                'T2': 1500000,
                'T3': 1800000,
                'T4': 2100000,
                'T5': 1900000,
                'T6': 2300000,
                'T7': 2600000,
                'T8': 2800000,
                'T9': 2500000,
                'T10': 2700000,
                'T11': 2400000,
                'T12': 3000000
            },
            serviceStats: {
                labels: ['Giặt Ủi', 'Giặt Khô', 'Giặt Đồ Lớn', 'Làm Sạch Đặc Biệt'],
                data: [45, 25, 20, 10]
            }
        };
    },
    
    /**
     * Mock bookings data
     * @returns {array} - Mock bookings
     */
    mockBookings: function() {
        const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'DELIVERING'];
        const services = [
            { id: 1, name: 'Giặt Ủi', price: 50000 },
            { id: 2, name: 'Giặt Khô', price: 80000 },
            { id: 3, name: 'Giặt Đồ Lớn', price: 120000 },
            { id: 4, name: 'Làm Sạch Đặc Biệt', price: 150000 }
        ];
        const users = [
            { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', phone: '0901234567' },
            { id: 2, name: 'Trần Thị B', email: 'tranthib@example.com', phone: '0909876543' },
            { id: 3, name: 'Lê Văn C', email: 'levanc@example.com', phone: '0905555555' },
            { id: 4, name: 'Phạm Thị D', email: 'phamthid@example.com', phone: '0908888888' }
        ];
        
        const bookings = [];
        
        for (let i = 1; i <= 20; i++) {
            const serviceIndex = Math.floor(Math.random() * services.length);
            const userIndex = Math.floor(Math.random() * users.length);
            const statusIndex = Math.floor(Math.random() * statuses.length);
            const weight = Math.floor(Math.random() * 5) + 1; // 1-5 kg
            
            const today = new Date();
            const randomDays = Math.floor(Math.random() * 30); // Random day within last 30 days
            const bookingDate = new Date(today);
            bookingDate.setDate(today.getDate() - randomDays);
            
            bookings.push({
                id: i,
                bookingCode: `BK${10000 + i}`,
                service: services[serviceIndex],
                serviceName: services[serviceIndex].name,
                serviceId: services[serviceIndex].id,
                user: users[userIndex],
                userName: users[userIndex].name,
                userId: users[userIndex].id,
                weight: weight,
                totalPrice: services[serviceIndex].price * weight,
                status: statuses[statusIndex],
                paymentStatus: Math.random() > 0.3 ? 'PAID' : 'PENDING',
                bookingDate: bookingDate.toISOString(),
                pickupDate: new Date(bookingDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
                deliveryDate: new Date(bookingDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                address: `${Math.floor(Math.random() * 100) + 1} Đường ${Math.floor(Math.random() * 100) + 1}, Quận ${Math.floor(Math.random() * 10) + 1}, TP.HCM`,
                notes: Math.random() > 0.7 ? 'Giặt nhiệt độ thấp, không sấy khô.' : ''
            });
        }
        
        return bookings.sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));
    },
    
    /**
     * Mock users data
     * @returns {array} - Mock users
     */
    mockUsers: function() {
        const users = [];
        
        const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Võ', 'Phan', 'Trương', 'Bùi'];
        const middleNames = ['Văn', 'Thị', 'Hữu', 'Đức', 'Minh', 'Thành', 'Quốc', 'Đình', 'Thanh', 'Tuấn'];
        const lastNames = ['An', 'Bình', 'Cường', 'Dũng', 'Em', 'Giang', 'Hải', 'Lan', 'Minh', 'Nam'];
        
        for (let i = 1; i <= 30; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const middleName = middleNames[Math.floor(Math.random() * middleNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const fullName = `${firstName} ${middleName} ${lastName}`;
            
            const today = new Date();
            const randomDays = Math.floor(Math.random() * 365); // Random day within last year
            const registrationDate = new Date(today);
            registrationDate.setDate(today.getDate() - randomDays);
            
            users.push({
                id: i,
                name: fullName,
                email: `${lastName.toLowerCase()}${i}@example.com`,
                phone: `090${Math.floor(1000000 + Math.random() * 9000000)}`,
                address: `${Math.floor(Math.random() * 100) + 1} Đường ${Math.floor(Math.random() * 100) + 1}, Quận ${Math.floor(Math.random() * 10) + 1}, TP.HCM`,
                registrationDate: registrationDate.toISOString(),
                totalBookings: Math.floor(Math.random() * 10),
                totalSpend: Math.floor(Math.random() * 10000000)
            });
        }
        
        return users;
    },
    
    /**
     * Mock services data
     * @returns {array} - Mock services
     */
    mockServices: function() {
        return [
            {
                id: 1,
                name: 'Giặt Ủi Thường',
                description: 'Dịch vụ giặt ủi thông thường cho quần áo hàng ngày.',
                price: 50000,
                priceUnit: 'kg',
                status: 'ACTIVE',
                active: true,
                imageUrl: '/img/services/default.jpg'
            },
            {
                id: 2,
                name: 'Giặt Khô',
                description: 'Dịch vụ giặt khô chuyên nghiệp cho quần áo cao cấp, vải nhạy cảm.',
                price: 80000,
                priceUnit: 'kg',
                status: 'ACTIVE',
                active: true,
                imageUrl: '/img/services/default.jpg'
            },
            {
                id: 3,
                name: 'Giặt Đồ Lớn',
                description: 'Dịch vụ giặt các vật dụng kích thước lớn như chăn, ga, gối, đệm.',
                price: 120000,
                priceUnit: 'kg',
                status: 'ACTIVE',
                active: true,
                imageUrl: '/img/services/default.jpg'
            },
            {
                id: 4,
                name: 'Làm Sạch Đặc Biệt',
                description: 'Dịch vụ làm sạch đặc biệt cho các vết bẩn cứng đầu, khó xử lý.',
                price: 150000,
                priceUnit: 'kg',
                status: 'ACTIVE',
                active: true,
                imageUrl: '/img/services/default.jpg'
            },
            {
                id: 5,
                name: 'Giặt Ủi Nhanh',
                description: 'Dịch vụ giặt ủi nhanh trong vòng 6 giờ.',
                price: 70000,
                priceUnit: 'kg',
                status: 'ACTIVE',
                active: true,
                imageUrl: '/img/services/default.jpg'
            },
            {
                id: 6,
                name: 'Giặt Đồ Da',
                description: 'Dịch vụ làm sạch chuyên nghiệp cho các sản phẩm từ da.',
                price: 200000,
                priceUnit: 'cái',
                status: 'ACTIVE',
                active: true,
                imageUrl: '/img/services/default.jpg'
            }
        ];
    },

    /**
     * Admin login
     * @param {object} credentials - The login credentials
     * @returns {Promise} - The login response
     */
    adminLogin: function(credentials) {
        // Skip API call for development, allow any login
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return Promise.resolve(this.mockAdminData());
        }
        return this.post('/admin/login', credentials);
    },

    /**
     * Admin logout
     * @returns {Promise} - The logout response
     */
    adminLogout: function() {
        return this.post('/admin/logout', {});
    },

    /**
     * Get dashboard statistics
     * @returns {Promise} - The dashboard stats
     */
    getDashboardStats: function() {
        return this.get('/admin/dashboard/stats');
    },

    /**
     * Get all bookings
     * @returns {Promise} - The bookings
     */
    getAllBookings: function() {
        return this.get('/admin/bookings');
    },

    /**
     * Get booking by ID
     * @param {number} id - The booking ID
     * @returns {Promise} - The booking
     */
    getBookingById: function(id) {
        return this.get(`/bookings/${id}`);
    },

    /**
     * Update booking status
     * @param {number} bookingId - The booking ID
     * @param {string} status - The new status
     * @returns {Promise} - The fetch promise
     */
    updateBookingStatus: function(bookingId, status) {
        return this.put(`/bookings/${bookingId}/status`, { status: status });
    },

    /**
     * Get all users
     * @returns {Promise} - The users
     */
    getAllUsers: function() {
        return this.get('/admin/users');
    },

    /**
     * Get user by ID
     * @param {number} id - The user ID
     * @returns {Promise} - The user
     */
    getUserById: function(id) {
        return this.get(`/users/${id}`);
    },

    /**
     * Create user
     * @param {object} user - The user data
     * @returns {Promise} - The created user
     */
    createUser: function(user) {
        return this.post('/users', user);
    },

    /**
     * Update user
     * @param {number} id - The user ID
     * @param {object} user - The user data
     * @returns {Promise} - The updated user
     */
    updateUser: function(id, user) {
        return this.put(`/users/${id}`, user);
    },

    /**
     * Delete user
     * @param {number} id - The user ID
     * @returns {Promise} - The delete response
     */
    deleteUser: function(id) {
        return this.delete(`/users/${id}`);
    },

    /**
     * Get all services
     * @returns {Promise} - The services
     */
    getAllServices: function() {
        return this.get('/admin/services');
    },

    /**
     * Get service by ID
     * @param {number} id - The service ID
     * @returns {Promise} - The service
     */
    getServiceById: function(id) {
        return this.get(`/services/${id}`);
    },

    /**
     * Create service
     * @param {object} service - The service data
     * @returns {Promise} - The created service
     */
    createService: function(service) {
        return this.post('/admin/services', service);
    },

    /**
     * Update service
     * @param {number} id - The service ID
     * @param {object} service - The service data
     * @returns {Promise} - The updated service
     */
    updateService: function(id, service) {
        return this.put(`/admin/services/${id}`, service);
    },

    /**
     * Delete service
     * @param {number} id - The service ID
     * @returns {Promise} - The delete response
     */
    deleteService: function(id) {
        return this.delete(`/admin/services/${id}`);
    },

    /**
     * Get all feedbacks
     * @returns {Promise} - The feedbacks
     */
    getAllFeedbacks: function() {
        return this.get('/admin/feedback');
    },

    /**
     * Get booking statistics by status
     * @returns {Promise} - The booking stats
     */
    getBookingStatsByStatus: function() {
        return this.get('/admin/bookings/stats/status');
    },

    /**
     * Get revenue by month
     * @returns {Promise} - The revenue stats
     */
    getRevenueByMonth: function() {
        return this.get('/admin/bookings/stats/revenue');
    },

    /**
     * Get user statistics
     * @returns {Promise} - The user stats
     */
    getUserStats: function() {
        return this.get('/admin/users/stats');
    },

    /**
     * Update payment status
     * @param {number} bookingId - The booking ID
     * @param {string} status - The new payment status
     * @returns {Promise} - The fetch promise
     */
    updatePaymentStatus: function(bookingId, status) {
        return this.put(`/bookings/${bookingId}/payment-status`, { status: status });
    },

    /**
     * Get bookings for a user
     * @param {number} userId - The user ID
     * @returns {Promise} - The user's bookings
     */
    getUserBookings: function(userId) {
        return this.get(`/users/${userId}/bookings`);
    },

    /**
     * Create a new booking
     * @param {Object} bookingData - The booking data
     * @returns {Promise} - The created booking
     */
    createBooking: function(bookingData) {
        return this.post('/bookings', bookingData);
    },

    /**
     * Update booking completion date
     * @param {number} bookingId - The booking ID
     * @param {string} completionDate - The completion date
     * @returns {Promise} - The fetch promise
     */
    updateCompletionDate: function(bookingId, completionDate) {
        return this.put(`/bookings/${bookingId}/completion-date`, { completionDate: completionDate });
    },

    // Mock data generators
    getMockServices: function() {
        return [
            {
                id: 1,
                name: 'Giặt Ủi Thường',
                description: 'Dịch vụ giặt ủi thông thường cho quần áo hàng ngày',
                pricePerKg: 30000,
                estimatedTime: 24,
                imageUrl: '/img/services/default.jpg'
            },
            {
                id: 2,
                name: 'Giặt Hấp',
                description: 'Dịch vụ giặt hấp cao cấp cho quần áo sang trọng',
                pricePerKg: 50000,
                estimatedTime: 48,
                imageUrl: '/img/services/default.jpg'
            },
            {
                id: 3,
                name: 'Giặt Khô',
                description: 'Dịch vụ giặt khô chuyên nghiệp',
                pricePerItem: 120000,
                estimatedTime: 72,
                imageUrl: '/img/services/default.jpg'
            }
        ];
    },
    
    getMockService: function(id) {
        const services = this.getMockServices();
        return services.find(service => service.id === id) || services[0];
    },
    
    getMockBookings: function() {
        return [
            {
                id: 1,
                userId: 1,
                userName: 'Nguyễn Văn A',
                userEmail: 'nguyenvana@example.com',
                serviceId: 1,
                serviceName: 'Giặt Ủi Thường',
                weight: 3.5,
                totalPrice: 105000,
                bookingDate: '2023-06-15T09:30:00',
                pickupDate: '2023-06-16T14:00:00',
                deliveryDate: '2023-06-17T18:00:00',
                status: 'COMPLETED',
                paymentStatus: 'PAID',
                paymentMethod: 'Tiền mặt',
                address: '123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
                notes: 'Gọi trước khi giao hàng'
            },
            {
                id: 2,
                userId: 2,
                userName: 'Trần Thị B',
                userEmail: 'tranthib@example.com',
                serviceId: 2,
                serviceName: 'Giặt Hấp',
                weight: 2.0,
                totalPrice: 100000,
                bookingDate: '2023-06-16T10:15:00',
                pickupDate: '2023-06-17T09:00:00',
                deliveryDate: null,
                status: 'PROCESSING',
                paymentStatus: 'PENDING',
                paymentMethod: 'Chuyển khoản',
                address: '456 Đường Lê Lợi, Quận 3, TP. Hồ Chí Minh',
                notes: ''
            },
            {
                id: 3,
                userId: 3,
                userName: 'Lê Văn C',
                userEmail: 'levanc@example.com',
                serviceId: 3,
                serviceName: 'Giặt Khô',
                weight: null,
                items: 2,
                totalPrice: 240000,
                bookingDate: '2023-06-14T16:45:00',
                pickupDate: '2023-06-15T11:30:00',
                deliveryDate: '2023-06-18T10:00:00',
                status: 'COMPLETED',
                paymentStatus: 'PAID',
                paymentMethod: 'Ví điện tử',
                address: '789 Đường Võ Văn Tần, Quận 10, TP. Hồ Chí Minh',
                notes: 'Áo vest cần được xử lý cẩn thận'
            }
        ];
    },
    
    getMockBooking: function(id) {
        const bookings = this.getMockBookings();
        return bookings.find(booking => booking.id === id) || bookings[0];
    },
    
    createMockBooking: function(data) {
        // Generate a new mock booking based on the submitted data
        const mockBooking = {
            id: Math.floor(Math.random() * 1000) + 10,
            userId: data.userId || null,
            userName: data.userName || 'Khách hàng mới',
            userEmail: data.userEmail || 'guest@example.com',
            serviceId: data.serviceId || 1,
            serviceName: data.serviceName || 'Giặt Ủi Thường',
            weight: data.weight || 2.0,
            totalPrice: data.totalPrice || 60000,
            bookingDate: new Date().toISOString(),
            pickupDate: data.pickupDate || new Date().toISOString(),
            deliveryDate: null,
            status: 'PENDING',
            paymentStatus: 'PENDING',
            paymentMethod: data.paymentMethod || 'Tiền mặt',
            address: data.address || 'Địa chỉ mặc định',
            notes: data.notes || ''
        };
        
        return mockBooking;
    },
    
    getMockUsers: function() {
        return [
            {
                id: 1,
                name: 'Nguyễn Văn A',
                email: 'nguyenvana@example.com',
                phone: '0901234567',
                address: '123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
                role: 'USER',
                createdAt: '2023-01-15T08:30:00'
            },
            {
                id: 2,
                name: 'Trần Thị B',
                email: 'tranthib@example.com',
                phone: '0912345678',
                address: '456 Đường Lê Lợi, Quận 3, TP. Hồ Chí Minh',
                role: 'USER',
                createdAt: '2023-02-20T14:45:00'
            },
            {
                id: 3,
                name: 'Lê Văn C',
                email: 'levanc@example.com',
                phone: '0923456789',
                address: '789 Đường Võ Văn Tần, Quận 10, TP. Hồ Chí Minh',
                role: 'USER',
                createdAt: '2023-03-10T11:15:00'
            }
        ];
    },
    
    getMockUser: function(id) {
        const users = this.getMockUsers();
        return users.find(user => user.id === id) || users[0];
    }
};

// Expose API service globally
window.apiService = apiService;

// Set demo mode to false
window.DEMO_MODE = false; 