/**
 * Animation utilities for Fresh Laundry
 */

// Animation durations
const ANIMATION_DURATION = 300; // ms

/**
 * Add fade-in animation to element
 * @param {HTMLElement} element - The element to animate
 * @param {number} duration - Animation duration in ms
 */
function fadeIn(element, duration = ANIMATION_DURATION) {
    if (!element) return;
    
    element.style.opacity = 0;
    element.style.display = 'block';
    element.style.transition = `opacity ${duration}ms ease`;
    
    setTimeout(() => {
        element.style.opacity = 1;
    }, 10);
}

/**
 * Add fade-out animation to element
 * @param {HTMLElement} element - The element to animate
 * @param {number} duration - Animation duration in ms
 * @returns {Promise} - Promise that resolves when animation is complete
 */
function fadeOut(element, duration = ANIMATION_DURATION) {
    if (!element) return Promise.resolve();
    
    return new Promise(resolve => {
        element.style.opacity = 1;
        element.style.transition = `opacity ${duration}ms ease`;
        
        element.style.opacity = 0;
        
        setTimeout(() => {
            element.style.display = 'none';
            resolve();
        }, duration);
    });
}

/**
 * Slide down animation
 * @param {HTMLElement} element - The element to animate
 * @param {number} duration - Animation duration in ms
 */
function slideDown(element, duration = ANIMATION_DURATION) {
    if (!element) return;
    
    const height = element.scrollHeight;
    element.style.display = 'block';
    element.style.height = '0';
    element.style.overflow = 'hidden';
    element.style.transition = `height ${duration}ms ease`;
    
    setTimeout(() => {
        element.style.height = `${height}px`;
    }, 10);
    
    setTimeout(() => {
        element.style.height = '';
        element.style.overflow = '';
    }, duration);
}

/**
 * Slide up animation
 * @param {HTMLElement} element - The element to animate
 * @param {number} duration - Animation duration in ms
 * @returns {Promise} - Promise that resolves when animation is complete
 */
function slideUp(element, duration = ANIMATION_DURATION) {
    if (!element) return Promise.resolve();
    
    return new Promise(resolve => {
        element.style.height = `${element.scrollHeight}px`;
        element.style.overflow = 'hidden';
        element.style.transition = `height ${duration}ms ease`;
        
        setTimeout(() => {
            element.style.height = '0';
        }, 10);
        
        setTimeout(() => {
            element.style.display = 'none';
            element.style.height = '';
            element.style.overflow = '';
            resolve();
        }, duration);
    });
}

/**
 * Add loading spinner animation
 * @param {HTMLElement} container - The container to add spinner to
 * @param {string} size - Size of spinner (small, medium, large)
 * @returns {HTMLElement} - The created spinner element
 */
function addLoadingSpinner(container, size = 'medium') {
    if (!container) return null;
    
    const spinner = document.createElement('div');
    spinner.classList.add('loading-spinner', `spinner-${size}`);
    
    const spinnerInner = document.createElement('div');
    spinnerInner.classList.add('spinner-inner');
    spinner.appendChild(spinnerInner);
    
    container.appendChild(spinner);
    
    return spinner;
}

/**
 * Remove loading spinner
 * @param {HTMLElement} spinner - The spinner element to remove
 */
function removeLoadingSpinner(spinner) {
    if (!spinner || !spinner.parentNode) return;
    
    fadeOut(spinner, 200).then(() => {
        spinner.parentNode.removeChild(spinner);
    });
}

// Export animation functions
window.Animation = {
    fadeIn,
    fadeOut,
    slideDown,
    slideUp,
    addLoadingSpinner,
    removeLoadingSpinner
}; 