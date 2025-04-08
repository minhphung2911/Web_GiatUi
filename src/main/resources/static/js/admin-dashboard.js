import { Chart } from "@/components/ui/chart"
// Admin Dashboard JavaScript
document.addEventListener("DOMContentLoaded", () => {
  // Check if admin is logged in
  if (!isAdminLoggedIn()) {
    window.location.href = "admin-login.html"
    return
  }

  // Initialize dashboard
  initDashboard()
})

function initDashboard() {
  // Load admin data
  loadAdminData()

  // Initialize sidebar toggle
  initSidebarToggle()

  // Initialize section navigation
  initSectionNavigation()

  // Initialize charts
  initCharts()

  // Load bookings data
  loadBookingsData()

  // Initialize logout
  initLogout()
}

function loadAdminData() {
  const admin = getCurrentAdmin()

  if (admin) {
    // Update admin name and role
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

function initSidebarToggle() {
  const menuToggle = document.getElementById("menu-toggle")
  const sidebar = document.getElementById("sidebar")
  const sidebarClose = document.getElementById("sidebar-close")

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.add("active")
    })
  }

  if (sidebarClose && sidebar) {
    sidebarClose.addEventListener("click", () => {
      sidebar.classList.remove("active")
    })
  }

  // Close sidebar when clicking outside on mobile
  document.addEventListener("click", (event) => {
    if (
      window.innerWidth <= 992 &&
      sidebar.classList.contains("active") &&
      !sidebar.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      sidebar.classList.remove("active")
    }
  })
}

function initSectionNavigation() {
  const navLinks = document.querySelectorAll(".sidebar-nav a")
  const sections = document.querySelectorAll(".section")
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

        // Close sidebar on mobile after navigation
        if (window.innerWidth <= 992) {
          document.getElementById("sidebar").classList.remove("active")
        }
      })
    })
  }
}

function initCharts() {
  // Customer chart
  const customerChartCanvas = document.getElementById("customerChart")

  if (customerChartCanvas) {
    const customerChart = new Chart(customerChartCanvas, {
      type: "line",
      data: {
        labels: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"],
        datasets: [
          {
            label: "Khách Hàng Mới",
            data: [65, 59, 80, 81, 56, 55, 40, 45, 60, 70, 75, 80],
            backgroundColor: "rgba(78, 205, 196, 0.2)",
            borderColor: "#4ECDC4",
            borderWidth: 2,
            tension: 0.3,
          },
          {
            label: "Khách Hàng Quay Lại",
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
        labels: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"],
        datasets: [
          {
            label: "Doanh Thu",
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
              callback: (value) => value.toLocaleString() + "đ",
            },
          },
        },
      },
    })
  }
}

function loadBookingsData() {
  const bookingsTableBody = document.getElementById("bookings-table-body")

  if (bookingsTableBody) {
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
      const userName = user ? `${user.firstName} ${user.lastName}` : "Khách"
      const userAvatar = user && user.avatar ? user.avatar : "img/default-avatar.png"

      bookingsHTML += `
                <tr>
                    <td><input type="checkbox"></td>
                    <td>#${appointment.id}</td>
                    <td>
                        <div class="user-info">
                            <img src="${userAvatar}" alt="Người dùng">
                            <span>${userName}</span>
                        </div>
                    </td>
                    <td>${getServiceName(appointment.service)}</td>
                    <td>${formatDate(appointment.date)}</td>
                    <td>${formatTime(appointment.time)}</td>
                    <td><span class="badge ${appointment.status}">${getStatusName(appointment.status)}</span></td>
                    <td>${getServicePrice(appointment.service)}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-icon" title="Xem"><i class="fas fa-eye"></i></button>
                            <button class="btn-icon" title="Sửa"><i class="fas fa-edit"></i></button>
                            <button class="btn-icon" title="Xóa"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `
    })

    bookingsTableBody.innerHTML =
      bookingsHTML || '<tr><td colspan="9" class="text-center">Không tìm thấy đặt lịch nào</td></tr>'
  }
}

function initLogout() {
  const logoutButtons = document.querySelectorAll("#admin-logout, #profile-logout")

  logoutButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault()

      // Show confirmation
      if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        logoutAdmin()
      }
    })
  })
}

function isAdminLoggedIn() {
  return !!getCurrentAdmin()
}

function getCurrentAdmin() {
  const adminJson = localStorage.getItem("currentAdmin")
  return adminJson ? JSON.parse(adminJson) : null
}

function logoutAdmin() {
  // Remove admin from localStorage
  localStorage.removeItem("currentAdmin")
  localStorage.removeItem("adminRememberMe")

  // Redirect to admin login page
  window.location.href = "admin-login.html"
}

function getServiceName(service) {
  switch (service) {
    case "wash-fold":
      return "Giặt & Gấp"
    case "dry-cleaning":
      return "Giặt Khô"
    case "ironing":
      return "Ủi Đồ"
    case "pickup-delivery":
      return "Đón & Giao Hàng"
    case "premium":
      return "Gói Cao Cấp"
    default:
      return "Giặt & Gấp"
  }
}

function getServicePrice(service) {
  switch (service) {
    case "wash-fold":
      return "50,000đ/kg"
    case "dry-cleaning":
      return "120,000đ/món"
    case "ironing":
      return "60,000đ/món"
    case "pickup-delivery":
      return "100,000đ + phí dịch vụ"
    case "premium":
      return "70,000đ/kg"
    default:
      return "50,000đ/kg"
  }
}

function getStatusName(status) {
  switch (status) {
    case "pending":
      return "Đang chờ"
    case "processing":
      return "Đang xử lý"
    case "completed":
      return "Hoàn thành"
    case "cancelled":
      return "Đã hủy"
    default:
      return "Đang chờ"
  }
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

function formatTime(timeString) {
  if (!timeString) return "N/A"

  const [hours, minutes] = timeString.split(":")
  const hour = Number.parseInt(hours)
  const period = hour >= 12 ? "PM" : "AM"
  const formattedHour = hour % 12 || 12

  return `${formattedHour}:${minutes} ${period}`
}

