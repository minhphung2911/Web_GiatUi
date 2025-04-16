// Main JavaScript File

document.addEventListener("DOMContentLoaded", () => {
  // Initialize mobile navigation
  initMobileNav()

  // Initialize scroll effects
  initScrollEffects()

  // Initialize back to top button
  initBackToTop()

  // Initialize modal functionality
  initModals()

  // Set minimum date for date inputs to today
  setMinDates()

  // Initialize tabs
  initTabs()

  // Check if user is logged in - we'll use the one from auth.js
  // This is commented out since auth.js's checkUserAuth will handle it
  // checkUserAuth()
})

// Mobile Navigation
function initMobileNav() {
  const hamburger = document.querySelector(".hamburger")
  const navLinks = document.querySelector(".nav-links")

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", function () {
      navLinks.classList.toggle("active")
      this.classList.toggle("active")
    })
  }

  if (hamburger) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("active")
      document.body.classList.toggle("nav-open")
    })

    // Close mobile menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".nav-links") && !e.target.closest(".hamburger") && navLinks.classList.contains("active")) {
        navLinks.classList.remove("active")
        document.body.classList.remove("nav-open")
      }
    })

    // Close mobile menu when clicking on a link
    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active")
        document.body.classList.remove("nav-open")
      })
    })
  }
}

// Scroll Effects
function initScrollEffects() {
  // Header scroll effect
  const header = document.getElementById("header")

  if (header) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        header.classList.add("scrolled")
      } else {
        header.classList.remove("scrolled")
      }
    })
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href")

      if (targetId === "#") return

      e.preventDefault()

      const targetElement = document.querySelector(targetId)

      if (targetElement) {
        const headerHeight = document.getElementById("header").offsetHeight
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        })
      }
    })
  })

  // Animate elements on scroll
  const animateElements = document.querySelectorAll(".animate-on-scroll")

  if (animateElements.length > 0) {
    const checkScroll = () => {
      animateElements.forEach((element) => {
        const elementPosition = element.getBoundingClientRect().top
        const windowHeight = window.innerHeight

        if (elementPosition < windowHeight - 100) {
          element.classList.add("animated")
        }
      })
    }

    // Check on load
    checkScroll()

    // Check on scroll
    window.addEventListener("scroll", checkScroll)
  }
}

// Back to Top Button
function initBackToTop() {
  const backToTopButton = document.getElementById("back-to-top")

  if (backToTopButton) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        backToTopButton.classList.add("active")
      } else {
        backToTopButton.classList.remove("active")
      }
    })

    backToTopButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    })
  }
}

// Modal Functionality
function initModals() {
  const modals = document.querySelectorAll(".modal")
  const modalTriggers = document.querySelectorAll("[data-modal]")
  const closeButtons = document.querySelectorAll(".close-modal")

  // Open modal
  modalTriggers.forEach((trigger) => {
    trigger.addEventListener("click", function () {
      const modalId = this.getAttribute("data-modal")
      const modal = document.getElementById(modalId)

      if (modal) {
        modal.classList.add("active")
        document.body.style.overflow = "hidden"
      }
    })
  })

  // Close modal with close button
  closeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const modal = this.closest(".modal")
      modal.classList.remove("active")
      document.body.style.overflow = ""
    })
  })

  // Close modal when clicking outside
  modals.forEach((modal) => {
    modal.addEventListener("click", function (e) {
      if (e.target === this) {
        this.classList.remove("active")
        document.body.style.overflow = ""
      }
    })
  })

  // Close modal with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      modals.forEach((modal) => {
        if (modal.classList.contains("active")) {
          modal.classList.remove("active")
          document.body.style.overflow = ""
        }
      })
    }
  })
}

// Set minimum date for date inputs
function setMinDates() {
  const dateInputs = document.querySelectorAll('input[type="date"]')

  if (dateInputs.length > 0) {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    const formattedDate = `${year}-${month}-${day}`

    dateInputs.forEach((input) => {
      input.setAttribute("min", formattedDate)

      // If no value is set, set it to today
      if (!input.value) {
        input.value = formattedDate
      }
    })
  }
}

// Initialize Tabs
function initTabs() {
  const tabButtons = document.querySelectorAll(".tab-button")

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const tabId = this.getAttribute("data-tab")
      const tabContent = document.getElementById(tabId)
      const tabContainer = this.closest(".tab-buttons").parentElement

      // Remove active class from all buttons and content
      tabContainer.querySelectorAll(".tab-button").forEach((btn) => {
        btn.classList.remove("active")
      })

      tabContainer.querySelectorAll(".tab-content").forEach((content) => {
        content.classList.remove("active")
      })

      // Add active class to clicked button and corresponding content
      this.classList.add("active")
      tabContent.classList.add("active")
    })
  })
}

// Show notification modal
function showNotification(title, message, callback) {
  const modal = document.getElementById("notification-modal")
  const modalTitle = document.getElementById("modal-title")
  const modalBody = document.getElementById("modal-body")
  const primaryBtn = document.getElementById("modal-primary-btn")
  const secondaryBtn = document.getElementById("modal-secondary-btn")

  if (modal && modalTitle && modalBody) {
    modalTitle.textContent = title
    modalBody.innerHTML = `<p>${message}</p>`

    // Show primary button, hide secondary button
    primaryBtn.style.display = "inline-block"
    secondaryBtn.style.display = "none"

    // Set callback for primary button
    primaryBtn.onclick = () => {
      modal.classList.remove("active")
      document.body.style.overflow = ""

      if (typeof callback === "function") {
        callback()
      }
    }

    // Show modal
    modal.classList.add("active")
    document.body.style.overflow = "hidden"
  }
}

// Show confirmation modal
function showConfirmation(title, message, confirmCallback, cancelCallback) {
  const modal = document.getElementById("notification-modal")
  const modalTitle = document.getElementById("modal-title")
  const modalBody = document.getElementById("modal-body")
  const primaryBtn = document.getElementById("modal-primary-btn")
  const secondaryBtn = document.getElementById("modal-secondary-btn")

  if (modal && modalTitle && modalBody) {
    modalTitle.textContent = title
    modalBody.innerHTML = `<p>${message}</p>`

    // Show both buttons
    primaryBtn.style.display = "inline-block"
    secondaryBtn.style.display = "inline-block"

    // Set text for buttons
    primaryBtn.textContent = "Confirm"
    secondaryBtn.textContent = "Cancel"

    // Set callbacks
    primaryBtn.onclick = () => {
      modal.classList.remove("active")
      document.body.style.overflow = ""

      if (typeof confirmCallback === "function") {
        confirmCallback()
      }
    }

    secondaryBtn.onclick = () => {
      modal.classList.remove("active")
      document.body.style.overflow = ""

      if (typeof cancelCallback === "function") {
        cancelCallback()
      }
    }

    // Show modal
    modal.classList.add("active")
    document.body.style.overflow = "hidden"
  }
}

// Show loading spinner
function showSpinner() {
  const spinner = document.getElementById("spinner")

  if (spinner) {
    spinner.classList.add("active")
  }
}

// Hide loading spinner
function hideSpinner() {
  const spinner = document.getElementById("spinner")

  if (spinner) {
    spinner.classList.remove("active")
  }
}

// Format date for display
function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" }
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", options)
}

// Format time for display
function formatTime(timeString) {
  const options = { hour: "numeric", minute: "numeric", hour12: true }
  const time = new Date(`2000-01-01T${timeString}`)
  return time.toLocaleTimeString("en-US", options)
}

// Generate random ID
function generateId(prefix = "") {
  return `${prefix}${Math.random().toString(36).substr(2, 9)}`
}

// Check if user is logged in
function checkUserAuth() {
  // Call the auth.js version if it exists
  if (typeof window.authService !== 'undefined' && typeof window.authService.updateAuthUI === 'function') {
    window.authService.updateAuthUI();
    return;
  }
  
  // Fallback implementation if auth.js isn't loaded
  const user = getCurrentUser();
  const authButtons = document.getElementById("auth-buttons");
  const userProfile = document.getElementById("user-profile");

  if (user) {
    // User is logged in
    if (authButtons) authButtons.classList.add("hidden");
    if (userProfile) userProfile.classList.remove("hidden");
  } else {
    // User is not logged in
    if (authButtons) authButtons.classList.remove("hidden");
    if (userProfile) userProfile.classList.add("hidden");
  }
}

// Get current user from localStorage
function getCurrentUser() {
  // Call the auth.js version if it exists
  if (typeof window.authService !== 'undefined' && typeof window.authService.getCurrentUser === 'function') {
    return window.authService.getCurrentUser();
  }
  
  // Fallback implementation
  const userJson = localStorage.getItem("user") || localStorage.getItem("currentUser");
  return userJson ? JSON.parse(userJson) : null;
}

// Show toast notification
function showToast(message, type = 'info', title = null) {
  const toastContainer = document.getElementById('toast-container');
  
  if (!toastContainer) {
    console.error('Toast container not found!');
    return;
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Get proper icon based on type
  let icon = 'info-circle';
  if (type === 'success') icon = 'check-circle';
  if (type === 'error') icon = 'exclamation-circle';
  if (type === 'warning') icon = 'exclamation-triangle';
  
  // Set toast title if not provided
  if (!title) {
    if (type === 'success') title = 'Thành công';
    if (type === 'error') title = 'Lỗi';
    if (type === 'warning') title = 'Cảnh báo';
    if (type === 'info') title = 'Thông báo';
  }
  
  // Create toast content
  toast.innerHTML = `
    <div class="toast-icon">
      <i class="fas fa-${icon}"></i>
    </div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <div class="toast-close">
      <i class="fas fa-times"></i>
    </div>
  `;
  
  // Add toast to container
  toastContainer.appendChild(toast);
  
  // Add event listener to close button
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    toast.remove();
  });
  
  // Remove toast after 3 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 3000);
}

// Make showToast available globally
window.showToast = showToast;

