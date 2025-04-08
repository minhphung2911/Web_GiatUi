// Animations JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations
    initAnimations();
});

// Initialize animations
function initAnimations() {
    // Fade in elements
    const fadeElements = document.querySelectorAll('.fade-in');
    
    fadeElements.forEach((element, index) => {
        // Add a small delay based on index
        setTimeout(() => {
            element.style.opacity = '1';
        }, 100 * index);
    });
    
    // Slide up elements
    const slideUpElements = document.querySelectorAll('.slide-up');
    
    slideUpElements.forEach((element, index) => {
        // Add a small delay based on index
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100 * index);
    });
    
    // Slide in right elements
    const slideInRightElements = document.querySelectorAll('.slide-in-right');
    
    slideInRightElements.forEach((element, index) => {
        // Add a small delay based on index
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateX(0)';
        }, 100 * index);
    });
    
    // Animate on scroll
    const animateOnScrollElements = document.querySelectorAll('.animate-on-scroll');
    
    if (animateOnScrollElements.length > 0) {
        // Check if element is in viewport
        function isInViewport(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8
            );
        }
        
        // Check elements on scroll
        function checkElements() {
            animateOnScrollElements.forEach(element => {
                if (isInViewport(element) && !element.classList.contains('animated')) {
                    element.classList.add('animated');
                }
            });
        }
        
        // Check on load
        checkElements();
        
        // Check on scroll
        window.addEventListener('scroll', checkElements);
    }
}
