// Testimonials Slider

document.addEventListener('DOMContentLoaded', function() {
    // Initialize testimonials slider
    initTestimonialsSlider();
});

// Initialize testimonials slider
function initTestimonialsSlider() {
    const slider = document.getElementById('testimonial-slider');
    const dots = document.getElementById('testimonial-dots');
    const prevBtn = document.getElementById('prev-testimonial');
    const nextBtn = document.getElementById('next-testimonial');
    
    if (slider && dots && prevBtn && nextBtn) {
        const slides = slider.querySelectorAll('.testimonial-slide');
        let currentSlide = 0;
        
        // Show first slide
        slides[currentSlide].classList.add('active');
        
        // Set up dots
        const dotElements = dots.querySelectorAll('.dot');
        
        // Show slide
        function showSlide(index) {
            // Hide all slides
            slides.forEach(slide => {
                slide.classList.remove('active');
            });
            
            // Remove active class from all dots
            dotElements.forEach(dot => {
                dot.classList.remove('active');
            });
            
            // Show current slide
            slides[index].classList.add('active');
            
            // Add active class to current dot
            dotElements[index].classList.add('active');
            
            // Update current slide
            currentSlide = index;
        }
        
        // Previous slide
        function prevSlide() {
            let index = currentSlide - 1;
            
            if (index < 0) {
                index = slides.length - 1;
            }
            
            showSlide(index);
        }
        
        // Next slide
        function nextSlide() {
            let index = currentSlide + 1;
            
            if (index >= slides.length) {
                index = 0;
            }
            
            showSlide(index);
        }
        
        // Event listeners
        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);
        
        // Dot navigation
        dotElements.forEach(dot => {
            dot.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                showSlide(index);
            });
        });
        
        // Auto slide
        let slideInterval = setInterval(nextSlide, 5000);
        
        // Pause on hover
        slider.addEventListener('mouseenter', function() {
            clearInterval(slideInterval);
        });
        
        slider.addEventListener('mouseleave', function() {
            slideInterval = setInterval(nextSlide, 5000);
        });
        
        // Touch events for mobile
        let startX = 0;
        let endX = 0;
        
        slider.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
        });
        
        slider.addEventListener('touchend', function(e) {
            endX = e.changedTouches[0].clientX;
            
            if (startX - endX > 50) {
                // Swipe left
                nextSlide();
            } else if (endX - startX > 50) {
                // Swipe right
                prevSlide();
            }
        });
    }
}
