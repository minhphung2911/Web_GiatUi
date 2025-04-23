/**
 * Home page script for Fresh Laundry
 */

document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra xem phần hiển thị dịch vụ có tồn tại không
    if (document.querySelector('#services .services-grid')) {
        loadServices();
    }

    // Xử lý hiệu ứng phần testimonials
    initTestimonialSlider();
});

/**
 * Tải dịch vụ từ API
 */
function loadServices() {
    const servicesGrid = document.querySelector('#services .services-grid');
    
    // Hiển thị trạng thái đang tải
    servicesGrid.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div></div>';
    
    // Sử dụng apiService để lấy danh sách dịch vụ
    apiService.getAllServices()
        .then(function(services) {
            // Xóa nội dung hiện tại của dịch vụ
            servicesGrid.innerHTML = '';
            
            // Giới hạn chỉ hiển thị tối đa 4 dịch vụ trên trang chủ
            const displayServices = services.slice(0, 4);
            
            // Tạo các card dịch vụ
            displayServices.forEach(function(service, index) {
                const serviceCard = createServiceCard(service, index);
                servicesGrid.appendChild(serviceCard);
            });
        })
        .catch(function(error) {
            console.error('Error loading services:', error);
            // Hiển thị thông báo lỗi
            servicesGrid.innerHTML = '<div class="error-message">Không thể tải dịch vụ. Vui lòng thử lại sau.</div>';
        });
}

/**
 * Tạo card dịch vụ
 * @param {Object} service - Thông tin dịch vụ
 * @param {number} index - Vị trí hiển thị (dùng cho animation delay)
 * @returns {HTMLElement} - Phần tử HTML card dịch vụ
 */
function createServiceCard(service, index) {
    // Tạo element mới cho service card
    const serviceCard = document.createElement('div');
    serviceCard.className = `service-card fade-in${index > 0 ? ' delay-' + index : ''}`;
    
    // Xác định icon dựa vào tên dịch vụ
    let iconClass = 'fas fa-tshirt'; // icon mặc định
    
    if (service.name.toLowerCase().includes('khô')) {
        iconClass = 'fas fa-wind';
    } else if (service.name.toLowerCase().includes('ủi')) {
        iconClass = 'fas fa-iron';
    } else if (service.name.toLowerCase().includes('giao') || service.name.toLowerCase().includes('đón')) {
        iconClass = 'fas fa-truck';
    } else if (service.name.toLowerCase().includes('đặc biệt') || service.name.toLowerCase().includes('special')) {
        iconClass = 'fas fa-star';
    }
    
    // Tạo nội dung HTML cho card
    serviceCard.innerHTML = `
        <div class="service-icon">
            <i class="${iconClass}"></i>
        </div>
        <h3>${service.name}</h3>
        <p>${service.description}</p>
        <a href="/booking?service=${service.id}" class="btn btn-secondary">Đặt dịch vụ</a>
    `;
    
    return serviceCard;
}

/**
 * Khởi tạo slider cho testimonials
 */
function initTestimonialSlider() {
    const slider = document.getElementById('testimonial-slider');
    const dots = document.getElementById('testimonial-dots');
    const prevBtn = document.getElementById('prev-testimonial');
    const nextBtn = document.getElementById('next-testimonial');
    
    if (!slider || !dots || !prevBtn || !nextBtn) return;
    
    let currentSlide = 0;
    const slides = slider.querySelectorAll('.testimonial-slide');
    const totalSlides = slides.length;
    
    // Hàm hiển thị slide
    function showSlide(index) {
        // Ẩn tất cả slides
        slides.forEach(slide => {
            slide.style.display = 'none';
        });
        
        // Hiển thị slide hiện tại
        slides[index].style.display = 'block';
        
        // Cập nhật điểm chỉ báo (dots)
        const dotElements = dots.querySelectorAll('.dot');
        dotElements.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }
    
    // Hiển thị slide đầu tiên
    showSlide(currentSlide);
    
    // Xử lý nút next
    nextBtn.addEventListener('click', function() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    });
    
    // Xử lý nút prev
    prevBtn.addEventListener('click', function() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(currentSlide);
    });
    
    // Xử lý khi nhấp vào dots
    const dotElements = dots.querySelectorAll('.dot');
    dotElements.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });
    
    // Tự động chuyển slide sau mỗi 5 giây
    setInterval(function() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }, 5000);
} 