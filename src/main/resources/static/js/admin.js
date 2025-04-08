import { Chart } from "@/components/ui/chart"
// Admin JavaScript

document.addEventListener("DOMContentLoaded", () => {
  // Initialize admin functionality
  initAdmin()
})

// Initialize admin
function initAdmin() {
  // Check if on admin login page
  if (document.getElementById("admin-login-form")) {
    initAdminLogin()
  }

  // Check if on admin dashboard page
  if (document.querySelector(".admin-layout")) {
    // Check if admin is logged in
    if (!isAdminLoggedIn()) {
      window.location.href = "admin-login.html"
      return
    }

    initAdminDashboard()
  }
}

// Initialize admin login
function initAdminLogin() {
  const adminLoginForm = document.getElementById("admin-login-form")
  const adminLoginError = document.getElementById("admin-login-error")
  const adminSpinner = document.getElementById("admin-spinner")

  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", (e) => {
      e.preventDefault()

      // Get form data
      const username = document.getElementById("admin-username").value
      const password = document.getElementById("admin-password").value
      const remember = document.getElementById("admin-remember").checked

      // Validate form data
      if (!username || !password) {
        adminLoginError.textContent = "Please enter both username and password."
        adminLoginError.style.display = "block"
        return
      }

      // Show spinner
      const submitBtn = adminLoginForm.querySelector('button[type="submit"]')
      submitBtn.disabled = true
      submitBtn.querySelector("span").style.opacity = "0"
      adminSpinner.style.display = "block"

      // Simulate API call
      setTimeout(() => {
        // Check credentials
        if (loginAdmin(username, password, remember)) {
          // Redirect to admin dashboard
          window.location.href = "admin-dashboard.html"
        } else {
          // Show error
          adminLoginError.textContent = "Invalid username or password."
          adminLoginError.style.display = "block"

          // Hide spinner
          submitBtn.disabled = false
          submitBtn.querySelector("span").style.opacity = "1"
          adminSpinner.style.display = "none"
        }
      }, 1500)
    })

    // Toggle password visibility
    const togglePassword = document.querySelector(".toggle-password")

    if (togglePassword) {
      togglePassword.addEventListener("click", function () {
        const passwordInput = document.getElementById("admin-password")
        const icon = this.querySelector("i")

        if (passwordInput.type === "password") {
          passwordInput.type = "text"
          icon.classList.remove("fa-eye")
          icon.classList.add("fa-eye-slash")
        } else {
          passwordInput.type = "password"
          icon.classList.remove("fa-eye-slash")
          icon.classList.add("fa-eye")
        }
      })
    }
  }
}

// Initialize admin dashboard
function initAdminDashboard() {
  // Load admin data
  loadAdminData()

  // Initialize sidebar toggle
  initSidebarToggle()

  // Initialize section navigation
  initSectionNavigation()

  // Initialize dropdown menus
  initDropdowns()

  // Initialize logout
  initAdminLogout()

  // Initialize charts
  initCharts()

  // Load bookings data
  loadBookingsData()
}

// Load admin data
function loadAdminData() {
  const admin = getCurrentAdmin()

  if (admin) {
    // Update admin name
    document.getElementById("admin-name").textContent = admin.name
    document.getElementById("admin-role").textContent = admin.role

    // Update profile dropdown
    document.querySelector(".profile-btn span").textContent = admin.name

    // Update avatar if available
    if (admin.avatar) {
      document.getElementById("admin-avatar").src = admin.avatar
      document.querySelector(".profile-btn img").src = admin.avatar
    }
  }
}

// Initialize sidebar toggle
function initSidebarToggle() {
  const sidebarToggle = document.querySelector(".admin-sidebar-toggle")
  const adminLayout = document.querySelector(".admin-layout")
  const adminSidebar = document.querySelector(".admin-sidebar")

  if (sidebarToggle && adminLayout) {
    sidebarToggle.addEventListener("click", () => {
      adminLayout.classList.toggle("collapsed")
      adminSidebar.classList.toggle("active")
    })
  }

  // Close sidebar when clicking outside on mobile
  document.addEventListener("click", (event) => {
    const isClickInsideSidebar = adminSidebar.contains(event.target)
    const isClickOnToggle = sidebarToggle.contains(event.target)

    if (
      window.innerWidth <= 992 &&
      !isClickInsideSidebar &&
      !isClickOnToggle &&
      adminSidebar.classList.contains("active")
    ) {
      adminSidebar.classList.remove("active")
    }
  })
}

// Initialize section navigation
function initSectionNavigation() {
  const navLinks = document.querySelectorAll(".admin-nav a")
  const sections = document.querySelectorAll(".admin-section")
  const pageTitle = document.getElementById("page-title")
  const breadcrumbCurrent = document.getElementById("breadcrumb-current")

  if (navLinks && sections) {
    navLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault()

        const sectionId = this.getAttribute("data-section")

        // Remove active class from all links and sections
        navLinks.forEach((link) => link.classList.remove("active"))
        sections.forEach((section) => section.classList.remove("active"))

        // Add active class to clicked link and corresponding section
        this.classList.add("active")
        document.getElementById(`${sectionId}-section`).classList.add("active")

        // Update page title and breadcrumb
        const sectionTitle = this.querySelector("span").textContent
        pageTitle.textContent = sectionTitle
        breadcrumbCurrent.textContent = sectionTitle
      })
    })
  }
}

// Initialize dropdown menus
function initDropdowns() {
  // This is handled by CSS hover, but could be enhanced with JavaScript
  // for better mobile support or keyboard navigation
}

// Initialize admin logout
function initAdminLogout() {
  const logoutButtons = document.querySelectorAll("#admin-logout, #profile-logout")

  logoutButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault()

      // Show confirmation
      if (confirm("Are you sure you want to logout?")) {
        logoutAdmin()
      }
    })
  })
}

// Initialize charts
function initCharts() {
  // Customer chart
  const customerChartCanvas = document.getElementById("customerChart")

  if (customerChartCanvas) {
    const customerChart = new Chart(customerChartCanvas, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
          {
            label: "New Customers",
            data: [65, 59, 80, 81, 56, 55, 40, 45, 60, 70, 75, 80],
            backgroundColor: "rgba(78, 205, 196, 0.2)",
            borderColor: "#4ECDC4",
            borderWidth: 2,
            tension: 0.3,
          },
          {
            label: "Returning Customers",
            data: [28, 48, 40, 19, 86, 27, 90, 85, 70, 60, 65, 75],
            backgroundColor: "rgba(255, 107, 107, 0.2)",
            borderColor: "#FF6B6B",
            borderWidth: 2,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })
  }

  // Revenue chart
  const revenueChartCanvas = document.getElementById("revenueChart")

  if (revenueChartCanvas) {
    const revenueChart = new Chart(revenueChartCanvas, {
      type: "bar",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
          {
            label: "Revenue",
            data: [1200, 1900, 3000, 5000, 2000, 3000, 4500, 5500, 6000, 4000, 3500, 4200],
            backgroundColor: "#4ECDC4",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => "$" + value,
            },
          },
        },
      },
    })
  }
}

// Load bookings data
function loadBookingsData() {
  const bookingsSection = document.getElementById("bookings-section")

  if (bookingsSection) {
    const bookingsTable = bookingsSection.querySelector("tbody")

    if (bookingsTable) {
      // Get bookings from localStorage
      const appointments = JSON.parse(localStorage.getItem("appointments")) || []
      const users = JSON.parse(localStorage.getItem("users")) || []

      // Sort bookings by date (newest first)
      appointments.sort((a, b) => new Date(b.date) - new Date(a.date))

      // Generate bookings table
      let bookingsHTML = ""

      appointments.forEach((appointment) => {
        // Find user
        const user = users.find((user) => user.id === appointment.userId)
        const userName = user ? `${user.firstName} ${user.lastName}` : "Guest"
        const userAvatar = user && user.avatar ? user.avatar : "img/default-avatar.png"

        bookingsHTML += `
                    <tr>
                        <td><input type="checkbox"></td>
                        <td>#${appointment.id}</td>
                        <td>
                            <div class="user-info">
                                <img src="${userAvatar}" alt="User">
                                <span>${userName}</span>
                            </div>
                        </td>
                        <td>${getServiceName(appointment.service)}</td>
                        <td>${formatDate(appointment.date)}</td>
                        <td>${formatTime(appointment.time)}</td>
                        <td><span class="status-badge ${appointment.status}">${appointment.status}</span></td>
                        <td>${getServicePrice(appointment.service)}</td>
                        <td>
                            <div class="table-actions">
                                <button class="btn-icon" title="View"><i class="fas fa-eye"></i></button>
                                <button class="btn-icon" title="Edit"><i class="fas fa-edit"></i></button>
                                <button class="btn-icon" title="Delete"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `
      })

      bookingsTable.innerHTML = bookingsHTML
    }
  }
}

// Login admin
function loginAdmin(username, password, remember = false) {
  // In a real app, this would validate against a server
  // For demo purposes, we'll use a hardcoded admin account
  if (username === "admin" && password === "admin123") {
    const admin = {
      id: "admin_1",
      username: "admin",
      name: "Admin User",
      role: "Administrator",
      avatar: "img/default-avatar.png",
    }

    // Save admin to localStorage
    localStorage.setItem("currentAdmin", JSON.stringify(admin))

    // If remember me is checked, set a longer expiration
    if (remember) {
      localStorage.setItem("adminRememberMe", "true")
    }

    return true
  }

  return false
}

// Logout admin
function logoutAdmin() {
  // Remove admin from localStorage
  localStorage.removeItem("currentAdmin")
  localStorage.removeItem("adminRememberMe")

  // Redirect to admin login page
  window.location.href = "admin-login.html"
}

// Check if admin is logged in
function isAdminLoggedIn() {
  return !!getCurrentAdmin()
}

// Get current admin
function getCurrentAdmin() {
  const adminJson = localStorage.getItem("currentAdmin")
  return adminJson ? JSON.parse(adminJson) : null
}

// Get service name
function getServiceName(service) {
  switch (service) {
    case "wash-fold":
      return "Wash & Fold"
    case "dry-cleaning":
      return "Dry Cleaning"
    case "ironing":
      return "Ironing Service"
    case "pickup-delivery":
      return "Pickup & Delivery"
    case "premium":
      return "Premium Package"
    default:
      return "Wash & Fold"
  }
}

// Get service price
function getServicePrice(service) {
  switch (service) {
    case "wash-fold":
      return "$2.50/lb"
    case "dry-cleaning":
      return "$6.00/item"
    case "ironing":
      return "$3.00/item"
    case "pickup-delivery":
      return "$5.00 + service cost"
    case "premium":
      return "$3.50/lb"
    default:
      return "$2.50/lb"
  }
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString)
  const options = { year: "numeric", month: "short", day: "numeric" }
  return date.toLocaleDateString("en-US", options)
}

// Format time
function formatTime(timeString) {
  if (!timeString) return "N/A"

  const [hours, minutes] = timeString.split(":")
  const hour = Number.parseInt(hours)
  const period = hour >= 12 ? "PM" : "AM"
  const formattedHour = hour % 12 || 12

  return `${formattedHour}:${minutes} ${period}`
}

// Initialize admin
initAdmin()

document.addEventListener("DOMContentLoaded", () => {
  // Initialize admin functionality
  initAdmin()
  initSidebarToggle()
})

