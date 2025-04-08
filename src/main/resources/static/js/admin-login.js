// Admin Login JavaScript
document.addEventListener("DOMContentLoaded", () => {
  initAdminLogin()
})

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
        showError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.")
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
          showError("Tên đăng nhập hoặc mật khẩu không đúng.")

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

  function showError(message) {
    adminLoginError.textContent = message
    adminLoginError.style.display = "block"
  }

  function loginAdmin(username, password, remember = false) {
    // In a real app, this would validate against a server
    // For demo purposes, we'll use a hardcoded admin account
    if (username === "admin" && password === "admin123") {
      const admin = {
        id: "admin_1",
        username: "admin",
        name: "Quản Trị Viên",
        role: "Quản Trị Viên",
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
}

