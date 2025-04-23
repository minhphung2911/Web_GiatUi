/**
 * Admin Services Management
 * This file handles CRUD operations for services in the admin dashboard
 */

// Service data
// Check if services is already defined
if (typeof window.services === 'undefined') {
    window.services = [];
}
let currentService = null;

// DOM Elements
const serviceTableBody = document.getElementById('services-table-body');
const serviceModalTitle = document.getElementById('service-modal-title');
const serviceForm = document.getElementById('service-form');
const serviceDetailsModal = document.getElementById('service-details-modal');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupServiceEventListeners();
});

/**
 * Set up event listeners for service management
 */
function setupServiceEventListeners() {
    // Add service button
    const addServiceBtn = document.getElementById('add-service-btn');
    if (addServiceBtn) {
        addServiceBtn.addEventListener('click', function() {
            openServiceModal();
        });
    }

    // Service form submission
    if (serviceForm) {
        serviceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveService();
        });
    }

    // Close modal buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            closeServiceModal();
            closeServiceDetailsModal();
        });
    });
}

/**
 * Load services data from API
 */
function loadServices() {
    // Show loading state in table
    if (serviceTableBody) {
        serviceTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...
                    </div>
                </td>
            </tr>
        `;
    }
    
    // Sử dụng apiService để lấy danh sách dịch vụ
    apiService.getAllServices()
        .then(data => {
            if (!data || data.length === 0) {
                // If no data returned, use mock data
                console.warn('No services data returned, using mock data');
                window.services = generateMockServices(5);
            } else {
                window.services = data;
            }
            renderServices(window.services);
        })
        .catch(error => {
            console.error('Error loading services:', error);
            showToast('Không thể tải dữ liệu dịch vụ từ máy chủ, đang sử dụng dữ liệu mẫu', 'warning');
            window.services = generateMockServices(5);
            renderServices(window.services);
        });
}

/**
 * Generate mock service data for demonstration
 */
function generateMockServices(count = 5) {
    const mockServices = [
        {
            id: 1,
            name: 'Giặt thường',
            description: 'Dịch vụ giặt thông thường với máy giặt công nghiệp',
            price: 15000,
            imageUrl: '/img/services/default.jpg',
            status: 'ACTIVE'
        },
        {
            id: 2,
            name: 'Giặt hấp',
            description: 'Dịch vụ giặt hấp chuyên nghiệp cho quần áo đẹp',
            price: 25000,
            imageUrl: '/img/services/default.jpg',
            status: 'ACTIVE'
        },
        {
            id: 3,
            name: 'Giặt khô',
            description: 'Dịch vụ giặt khô cao cấp cho các loại vải đặc biệt',
            price: 35000,
            imageUrl: '/img/services/default.jpg',
            status: 'ACTIVE'
        },
        {
            id: 4,
            name: 'Giặt đồ da',
            description: 'Dịch vụ giặt chuyên nghiệp cho các sản phẩm da',
            price: 50000,
            imageUrl: '/img/services/default.jpg',
            status: 'ACTIVE'
        },
        {
            id: 5,
            name: 'Giặt đồ cao cấp',
            description: 'Dịch vụ giặt dành cho các sản phẩm thời trang cao cấp',
            price: 70000,
            imageUrl: '/img/services/default.jpg',
            status: 'INACTIVE'
        }
    ];
    
    return mockServices.slice(0, count);
}

/**
 * Render services in the table
 */
function renderServices(services) {
    if (!serviceTableBody) return;
    
    serviceTableBody.innerHTML = '';
    
    if (services.length === 0) {
        serviceTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Không có dữ liệu dịch vụ</td></tr>';
        return;
    }
    
    services.forEach(service => {
        const row = document.createElement('tr');
        
        // Create active status badge
        const statusBadge = `<span class="status-badge ${service.status === 'ACTIVE' ? 'completed' : 'cancelled'}">
                               ${service.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                             </span>`;
        
        row.innerHTML = `
            <td>${service.id}</td>
            <td>
                <div class="service-info">
                    <img src="${service.imageUrl || '/img/services/default.jpg'}" alt="${service.name}">
                    <span>${service.name}</span>
                </div>
            </td>
            <td>${service.description.substring(0, 50)}${service.description.length > 50 ? '...' : ''}</td>
            <td>${formatCurrency(service.price)}</td>
            <td>${statusBadge}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon view-service" data-id="${service.id}" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon edit-service" data-id="${service.id}" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-service" data-id="${service.id}" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        serviceTableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    addServiceActionListeners();
}

/**
 * Add event listeners to service action buttons
 */
function addServiceActionListeners() {
    // View service details
    document.querySelectorAll('.view-service').forEach(button => {
        button.addEventListener('click', function() {
            const serviceId = this.getAttribute('data-id');
            viewServiceDetails(serviceId);
        });
    });
    
    // Edit service
    document.querySelectorAll('.edit-service').forEach(button => {
        button.addEventListener('click', function() {
            const serviceId = this.getAttribute('data-id');
            editService(serviceId);
        });
    });
    
    // Delete service
    document.querySelectorAll('.delete-service').forEach(button => {
        button.addEventListener('click', function() {
            const serviceId = this.getAttribute('data-id');
            confirmDeleteService(serviceId);
        });
    });
}

/**
 * View service details
 */
function viewServiceDetails(serviceId) {
    // First find the service in the current list
    const service = window.services.find(s => s.id == serviceId);
    
    if (!service) {
        showToast('Không tìm thấy thông tin dịch vụ', 'error');
        return;
    }
    
    // Sử dụng apiService để lấy chi tiết dịch vụ
    apiService.getServiceById(serviceId)
        .then(serviceData => {
            currentService = serviceData || service;
            
            if (!serviceDetailsModal) return;
            
            // Update modal content
            document.getElementById('service-detail-name').textContent = currentService.name || 'N/A';
            document.getElementById('service-detail-price').textContent = formatCurrency(currentService.price);
            document.getElementById('service-detail-description').textContent = currentService.description || 'Không có mô tả';
            
            // Update service image
            const serviceImage = document.getElementById('service-detail-image');
            if (serviceImage) {
                serviceImage.src = currentService.imageUrl || '/img/services/default.jpg';
                serviceImage.onerror = function() {
                    this.src = '/img/services/default.jpg';
                };
            }
            
            // Update status badge
            const statusBadge = document.getElementById('service-detail-status');
            if (statusBadge) {
                statusBadge.textContent = currentService.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động';
                statusBadge.className = `status-badge ${currentService.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}`;
            }
            
            // Show edit and delete buttons if they exist
            const editButton = document.getElementById('service-detail-edit');
            if (editButton) {
                editButton.setAttribute('data-id', currentService.id);
                editButton.style.display = 'inline-block';
            }
            
            const deleteButton = document.getElementById('service-detail-delete');
            if (deleteButton) {
                deleteButton.setAttribute('data-id', currentService.id);
                deleteButton.style.display = 'inline-block';
            }
            
            // Show the modal
            serviceDetailsModal.style.display = 'block';
        })
        .catch(error => {
            console.error('Error loading service details:', error);
            
            // If we fail to fetch from API but have a service from the list, use that
            if (service) {
                currentService = service;
                
                if (!serviceDetailsModal) return;
                
                // Update modal content with what we have
                document.getElementById('service-detail-name').textContent = currentService.name || 'N/A';
                document.getElementById('service-detail-price').textContent = formatCurrency(currentService.price);
                document.getElementById('service-detail-description').textContent = currentService.description || 'Không có mô tả';
                
                // Update service image
                const serviceImage = document.getElementById('service-detail-image');
                if (serviceImage) {
                    serviceImage.src = currentService.imageUrl || '/img/services/default.jpg';
                    serviceImage.onerror = function() {
                        this.src = '/img/services/default.jpg';
                    };
                }
                
                // Update status badge
                const statusBadge = document.getElementById('service-detail-status');
                if (statusBadge) {
                    statusBadge.textContent = currentService.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động';
                    statusBadge.className = `status-badge ${currentService.status === 'ACTIVE' ? 'status-active' : 'status-inactive'}`;
                }
                
                // Show edit and delete buttons if they exist
                const editButton = document.getElementById('service-detail-edit');
                if (editButton) {
                    editButton.setAttribute('data-id', currentService.id);
                    editButton.style.display = 'inline-block';
                }
                
                const deleteButton = document.getElementById('service-detail-delete');
                if (deleteButton) {
                    deleteButton.setAttribute('data-id', currentService.id);
                    deleteButton.style.display = 'inline-block';
                }
                
                // Show the modal
                serviceDetailsModal.style.display = 'block';
            } else {
                showToast('Không thể tải thông tin chi tiết dịch vụ', 'error');
            }
        });
}

/**
 * Open service modal for adding/editing
 */
function openServiceModal(service = null) {
    currentService = service;
    
    // Update modal title
    if (serviceModalTitle) {
        serviceModalTitle.textContent = service ? 'Chỉnh Sửa Dịch Vụ' : 'Thêm Dịch Vụ Mới';
    }
    
    // Fill form with service data if editing
    if (serviceForm) {
        if (service) {
            serviceForm.elements['id'].value = service.id || '';
            serviceForm.elements['name'].value = service.name || '';
            serviceForm.elements['description'].value = service.description || '';
            serviceForm.elements['price'].value = service.pricePerKg || service.price || '';
            serviceForm.elements['imageUrl'].value = service.imageUrl || '';
            serviceForm.elements['active'].checked = service.status === 'ACTIVE';
        } else {
            serviceForm.reset();
            serviceForm.elements['id'].value = '';
            serviceForm.elements['active'].checked = true;
        }
    }
    
    // Show the modal
    const serviceModal = document.getElementById('service-modal');
    if (serviceModal) {
        serviceModal.style.display = 'block';
    }
}

/**
 * Close service modal
 */
function closeServiceModal() {
    const serviceModal = document.getElementById('service-modal');
    if (serviceModal) {
        serviceModal.style.display = 'none';
    }
    currentService = null;
}

/**
 * Close service details modal
 */
function closeServiceDetailsModal() {
    if (serviceDetailsModal) {
        serviceDetailsModal.style.display = 'none';
    }
}

/**
 * Edit service
 */
function editService(serviceId) {
    const service = window.services.find(s => s.id == serviceId);
    if (service) {
        openServiceModal(service);
    }
}

/**
 * Save service (create or update)
 */
function saveService() {
    if (!serviceForm) return;
    
    // Get form data
    const formData = new FormData(serviceForm);
    const serviceData = {
        id: formData.get('id') || null,
        name: formData.get('name'),
        description: formData.get('description'),
        pricePerKg: parseFloat(formData.get('price')),
        imageUrl: formData.get('imageUrl'),
        status: formData.get('active') === 'on' ? 'ACTIVE' : 'INACTIVE'
    };
    
    // Validate
    if (!serviceData.name || !serviceData.description || isNaN(serviceData.pricePerKg)) {
        showToast('Vui lòng điền đầy đủ thông tin dịch vụ', 'error');
        return;
    }
    
    // Determine if this is a create or update operation
    const isUpdate = serviceData.id !== null;
    
    // Dùng apiService để lưu dịch vụ
    const apiCall = isUpdate 
        ? apiService.updateService(serviceData.id, serviceData)
        : apiService.createService(serviceData);
    
    apiCall
        .then(data => {
            // Update services list
            if (isUpdate) {
                const index = window.services.findIndex(s => s.id == serviceData.id);
                if (index !== -1) {
                    window.services[index] = data;
                }
            } else {
                window.services.push(data);
            }
            
            // Render updated list
            renderServices(window.services);
            
            // Close modal and show success message
            closeServiceModal();
            showToast(isUpdate ? 'Cập nhật dịch vụ thành công' : 'Thêm dịch vụ thành công', 'success');
        })
        .catch(error => {
            console.error('Error saving service:', error);
            
            // Nếu trong môi trường phát triển, giả lập thành công
            if (isDemoMode()) {
                // Giả lập thành công để demo
                if (isUpdate) {
                    const index = window.services.findIndex(s => s.id == serviceData.id);
                    if (index !== -1) {
                        window.services[index] = serviceData;
                    }
                } else {
                    // Tạo ID mới cho dịch vụ mới
                    serviceData.id = Math.max(...window.services.map(s => s.id), 0) + 1;
                    window.services.push(serviceData);
                }
                
                // Render updated list
                renderServices(window.services);
                
                // Close modal and show success message
                closeServiceModal();
                showToast(isUpdate ? 'Cập nhật dịch vụ thành công (demo)' : 'Thêm dịch vụ thành công (demo)', 'success');
            } else {
                showToast('Lỗi khi lưu dịch vụ', 'error');
            }
        });
}

/**
 * Confirm delete service
 */
function confirmDeleteService(serviceId) {
    if (confirm('Bạn có chắc chắn muốn xóa dịch vụ này không?')) {
        deleteService(serviceId);
    }
}

/**
 * Delete service
 */
function deleteService(serviceId) {
    if (!serviceId) {
        showToast('ID dịch vụ không hợp lệ', 'error');
        return;
    }
    
    if (!confirm('Bạn có chắc chắn muốn xóa dịch vụ này không?')) {
        return;
    }
    
    // Show loading state
    showToast('Đang xóa dịch vụ...', 'info');
    
    // Sử dụng apiService để xóa dịch vụ
    apiService.deleteService(serviceId)
        .then(data => {
            // Xóa dịch vụ khỏi danh sách
            window.services = window.services.filter(s => s.id != serviceId);
                
            // Cập nhật lại bảng dịch vụ
            renderServices(window.services);
                
            // Đóng modal nếu đang mở
            closeServiceModal();
            closeServiceDetailsModal();
                
            // Hiển thị thông báo thành công
            showToast('Dịch vụ đã được xóa thành công!', 'success');
        })
        .catch(error => {
            console.error('Error deleting service:', error);
            
            // Trong môi trường phát triển, giả lập thành công
            if (isDemoMode() || error.message.includes('Failed to fetch')) {
                // Xóa dịch vụ khỏi danh sách local
                window.services = window.services.filter(s => s.id != serviceId);
                
                // Cập nhật lại bảng dịch vụ
                renderServices(window.services);
                
                // Đóng modal nếu đang mở
                closeServiceModal();
                closeServiceDetailsModal();
                
                // Hiển thị thông báo thành công (demo)
                showToast('Dịch vụ đã được xóa thành công (demo)!', 'success');
            } else {
                showToast('Không thể xóa dịch vụ', 'error');
            }
        });
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    // Check if toast function exists in global scope
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        // Simple fallback
        alert(message);
    }
}

/**
 * Helper function to check if we're in demo mode
 */
function isDemoMode() {
    return window.location.search.includes('demo=true') || 
           localStorage.getItem('demo_mode') === 'true';
} 