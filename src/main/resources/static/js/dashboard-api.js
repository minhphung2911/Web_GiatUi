// Dashboard API Integration

// Fetch user's bookings with pagination
async function fetchUserBookings(page = 0, size = 10, status = null) {
    try {
        // Check if user is logged in
        if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
            return null;
        }
        
        showSpinner();
        let url = `/api/users/me/bookings?page=${page}&size=${size}`;
        if (status) {
            url += `&status=${status}`;
        }
        
        const response = await fetch(url);
        hideSpinner();
        
        if (!response.ok) {
            throw new Error('Failed to load bookings');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        hideSpinner();
        console.error('Error fetching bookings:', error);
        showNotification('Error', 'Could not load bookings: ' + error.message);
        return null;
    }
}

// Fetch booking details by ID
async function fetchBookingDetails(bookingId) {
    try {
        // Check if user is logged in
        if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
            return null;
        }
        
        showSpinner();
        const response = await fetch(`/api/bookings/${bookingId}`);
        hideSpinner();
        
        if (!response.ok) {
            throw new Error('Failed to load booking details');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        hideSpinner();
        console.error('Error fetching booking details:', error);
        showNotification('Error', 'Could not load booking details: ' + error.message);
        return null;
    }
}

// Cancel a booking
async function cancelBooking(bookingId, reason) {
    try {
        // Check if user is logged in
        if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
            return false;
        }
        
        showSpinner();
        const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason: reason || 'Cancelled by user' })
        });
        hideSpinner();
        
        if (!response.ok) {
            throw new Error('Failed to cancel booking');
        }
        
        showNotification('Success', 'Booking cancelled successfully');
        return true;
    } catch (error) {
        hideSpinner();
        console.error('Error cancelling booking:', error);
        showNotification('Error', 'Could not cancel booking: ' + error.message);
        return false;
    }
}

// Fetch user's dashboard statistics
async function fetchDashboardStats() {
    try {
        // Check if user is logged in
        if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
            return null;
        }
        
        showSpinner();
        const response = await fetch('/api/users/me/dashboard-stats');
        hideSpinner();
        
        if (!response.ok) {
            throw new Error('Failed to load dashboard statistics');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        hideSpinner();
        console.error('Error fetching dashboard stats:', error);
        showNotification('Error', 'Could not load dashboard statistics: ' + error.message);
        return null;
    }
}

// Rate and review a completed booking
async function rateBooking(bookingId, rating, review) {
    try {
        // Check if user is logged in
        if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
            return false;
        }
        
        if (!rating || rating < 1 || rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }
        
        showSpinner();
        const response = await fetch(`/api/bookings/${bookingId}/review`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                rating: rating,
                comment: review || ''
            })
        });
        hideSpinner();
        
        if (!response.ok) {
            throw new Error('Failed to submit review');
        }
        
        showNotification('Success', 'Review submitted successfully');
        return true;
    } catch (error) {
        hideSpinner();
        console.error('Error submitting review:', error);
        showNotification('Error', 'Could not submit review: ' + error.message);
        return false;
    }
}

// Format booking status for display
function formatBookingStatus(status) {
    if (!status) return 'Unknown';
    
    const statusMap = {
        'PENDING': 'Pending',
        'CONFIRMED': 'Confirmed',
        'PICKED_UP': 'Picked Up',
        'PROCESSING': 'Processing',
        'COMPLETED': 'Completed',
        'DELIVERED': 'Delivered',
        'CANCELLED': 'Cancelled'
    };
    
    return statusMap[status] || status;
}

// Get status badge class based on status
function getStatusBadgeClass(status) {
    if (!status) return 'badge-secondary';
    
    const classMap = {
        'PENDING': 'badge-warning',
        'CONFIRMED': 'badge-info',
        'PICKED_UP': 'badge-primary',
        'PROCESSING': 'badge-primary',
        'COMPLETED': 'badge-success',
        'DELIVERED': 'badge-success',
        'CANCELLED': 'badge-danger'
    };
    
    return classMap[status] || 'badge-secondary';
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return '';
    
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Format currency for display
function formatCurrency(amount) {
    if (amount === null || amount === undefined) return '';
    
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

// Render booking list table
function renderBookingTable(bookings, tableElement) {
    if (!tableElement || !bookings) return;
    
    const tableBody = tableElement.querySelector('tbody') || tableElement;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    if (bookings.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="6" class="text-center">No bookings found</td>`;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // Create a row for each booking
    bookings.forEach(booking => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${booking.id}</td>
            <td>${booking.serviceName || 'Standard Laundry'}</td>
            <td>${formatDate(booking.pickupDateTime)}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(booking.status)}">
                    ${formatBookingStatus(booking.status)}
                </span>
            </td>
            <td>${formatCurrency(booking.totalAmount)}</td>
            <td>
                <button class="btn btn-sm btn-info view-booking" data-id="${booking.id}">
                    <i class="fa fa-eye"></i> View
                </button>
                ${booking.status === 'PENDING' ? `
                <button class="btn btn-sm btn-danger cancel-booking" data-id="${booking.id}">
                    <i class="fa fa-times"></i> Cancel
                </button>
                ` : ''}
                ${booking.status === 'DELIVERED' && !booking.isReviewed ? `
                <button class="btn btn-sm btn-primary review-booking" data-id="${booking.id}">
                    <i class="fa fa-star"></i> Review
                </button>
                ` : ''}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    const viewButtons = tableBody.querySelectorAll('.view-booking');
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            const bookingId = button.getAttribute('data-id');
            showBookingDetails(bookingId);
        });
    });
    
    const cancelButtons = tableBody.querySelectorAll('.cancel-booking');
    cancelButtons.forEach(button => {
        button.addEventListener('click', () => {
            const bookingId = button.getAttribute('data-id');
            showCancelDialog(bookingId);
        });
    });
    
    const reviewButtons = tableBody.querySelectorAll('.review-booking');
    reviewButtons.forEach(button => {
        button.addEventListener('click', () => {
            const bookingId = button.getAttribute('data-id');
            showReviewDialog(bookingId);
        });
    });
}

// Show booking details in a modal
async function showBookingDetails(bookingId) {
    const bookingDetailsModal = document.getElementById('booking-details-modal');
    if (!bookingDetailsModal) {
        showNotification('Error', 'Booking details modal not found');
        return;
    }
    
    const booking = await fetchBookingDetails(bookingId);
    if (!booking) return;
    
    // Fill in modal fields
    bookingDetailsModal.querySelector('.booking-id').textContent = booking.id;
    bookingDetailsModal.querySelector('.booking-service').textContent = booking.serviceName || 'Standard Laundry';
    bookingDetailsModal.querySelector('.booking-status').textContent = formatBookingStatus(booking.status);
    bookingDetailsModal.querySelector('.booking-status').className = 
        `booking-status badge ${getStatusBadgeClass(booking.status)}`;
    
    bookingDetailsModal.querySelector('.booking-pickup').textContent = formatDate(booking.pickupDateTime);
    
    if (booking.deliveryDateTime) {
        bookingDetailsModal.querySelector('.booking-delivery').textContent = formatDate(booking.deliveryDateTime);
    } else {
        bookingDetailsModal.querySelector('.booking-delivery').textContent = 'Not scheduled yet';
    }
    
    bookingDetailsModal.querySelector('.booking-weight').textContent = booking.weight ? `${booking.weight} kg` : 'Not weighed yet';
    bookingDetailsModal.querySelector('.booking-price').textContent = formatCurrency(booking.totalAmount);
    
    const addressDisplay = bookingDetailsModal.querySelector('.booking-address');
    if (addressDisplay && booking.address) {
        addressDisplay.textContent = `${booking.address.street}, ${booking.address.district}, ${booking.address.city}`;
    }
    
    const notesDisplay = bookingDetailsModal.querySelector('.booking-notes');
    if (notesDisplay) {
        notesDisplay.textContent = booking.notes || 'No special instructions';
    }
    
    // Show tracking information if available
    const trackingSection = bookingDetailsModal.querySelector('.booking-tracking');
    if (trackingSection && booking.trackingEvents && booking.trackingEvents.length > 0) {
        let trackingHtml = '<ul class="timeline">';
        
        booking.trackingEvents.forEach(event => {
            trackingHtml += `
                <li>
                    <div class="timeline-badge ${getStatusBadgeClass(event.status)}">
                        <i class="fa fa-check"></i>
                    </div>
                    <div class="timeline-panel">
                        <div class="timeline-heading">
                            <h5 class="timeline-title">${formatBookingStatus(event.status)}</h5>
                            <p>
                                <small class="text-muted">
                                    <i class="fa fa-clock-o"></i> ${formatDate(event.timestamp)}
                                </small>
                            </p>
                        </div>
                        <div class="timeline-body">
                            <p>${event.description || ''}</p>
                        </div>
            </div>
        </li>
        `;
    });
        
        trackingHtml += '</ul>';
        trackingSection.innerHTML = trackingHtml;
        trackingSection.classList.remove('d-none');
    } else if (trackingSection) {
        trackingSection.classList.add('d-none');
    }
    
    // Show or hide review section
    const reviewSection = bookingDetailsModal.querySelector('.booking-review');
    if (reviewSection) {
        if (booking.review) {
            reviewSection.classList.remove('d-none');
            const ratingDisplay = reviewSection.querySelector('.booking-rating');
            if (ratingDisplay) {
                ratingDisplay.innerHTML = '';
                for (let i = 1; i <= 5; i++) {
                    const star = document.createElement('i');
                    star.className = i <= booking.review.rating ? 'fa fa-star text-warning' : 'fa fa-star-o';
                    ratingDisplay.appendChild(star);
                }
            }
            
            const commentDisplay = reviewSection.querySelector('.booking-comment');
            if (commentDisplay) {
                commentDisplay.textContent = booking.review.comment || 'No comment provided';
            }
        } else {
            reviewSection.classList.add('d-none');
        }
    }
    
    // Show the modal
    $(bookingDetailsModal).modal('show');
}

// Show a modal to cancel a booking
function showCancelDialog(bookingId) {
    const cancelModal = document.getElementById('cancel-booking-modal');
    if (!cancelModal) {
        showNotification('Error', 'Cancel booking modal not found');
        return;
    }
    
    // Set booking ID in modal data
    cancelModal.setAttribute('data-booking-id', bookingId);
    
    // Set up confirm button
    const confirmButton = cancelModal.querySelector('.btn-confirm-cancel');
    if (confirmButton) {
        confirmButton.onclick = async function() {
            const reasonInput = cancelModal.querySelector('#cancel-reason');
            const reason = reasonInput ? reasonInput.value : '';
            
            const success = await cancelBooking(bookingId, reason);
            if (success) {
                // Close modal
                $(cancelModal).modal('hide');
                
                // Refresh the booking list
                refreshBookings();
            }
        };
    }
    
    // Show the modal
    $(cancelModal).modal('show');
}

// Show a modal to review a booking
function showReviewDialog(bookingId) {
    const reviewModal = document.getElementById('review-booking-modal');
    if (!reviewModal) {
        showNotification('Error', 'Review booking modal not found');
        return;
    }
    
    // Set booking ID in modal data
    reviewModal.setAttribute('data-booking-id', bookingId);
    
    // Reset rating stars
    const ratingStars = reviewModal.querySelectorAll('.rating-star');
    if (ratingStars) {
        ratingStars.forEach(star => {
            star.classList.remove('selected');
            star.querySelector('i').className = 'fa fa-star-o';
        });
    }
    
    // Reset review text
    const reviewText = reviewModal.querySelector('#review-comment');
    if (reviewText) {
        reviewText.value = '';
    }
    
    // Set up confirm button
    const confirmButton = reviewModal.querySelector('.btn-submit-review');
    if (confirmButton) {
        confirmButton.onclick = async function() {
            const selectedRating = reviewModal.querySelector('.rating-star.selected');
            const rating = selectedRating ? parseInt(selectedRating.getAttribute('data-rating')) : 0;
            
            const reviewComment = reviewModal.querySelector('#review-comment');
            const comment = reviewComment ? reviewComment.value : '';
            
            if (!rating) {
                showNotification('Error', 'Please select a rating');
                return;
            }
            
            const success = await rateBooking(bookingId, rating, comment);
            if (success) {
                // Close modal
                $(reviewModal).modal('hide');
                
                // Refresh the booking list
                refreshBookings();
            }
        };
    }
    
    // Set up rating star selection
    const stars = reviewModal.querySelectorAll('.rating-star');
    if (stars) {
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = parseInt(this.getAttribute('data-rating'));
                
                // Update UI
                stars.forEach(s => {
                    const starRating = parseInt(s.getAttribute('data-rating'));
                    s.classList.toggle('selected', starRating <= rating);
                    s.querySelector('i').className = starRating <= rating ? 'fa fa-star text-warning' : 'fa fa-star-o';
                });
            });
        });
    }
    
    // Show the modal
    $(reviewModal).modal('show');
}

// Update dashboard statistics
async function updateDashboardStats() {
    const stats = await fetchDashboardStats();
    if (!stats) return;
    
    // Update statistics cards
    const elements = {
        totalBookings: document.getElementById('total-bookings'),
        activeBookings: document.getElementById('active-bookings'),
        completedBookings: document.getElementById('completed-bookings'),
        totalSpent: document.getElementById('total-spent')
    };
    
    if (elements.totalBookings) {
        elements.totalBookings.textContent = stats.totalBookings || 0;
    }
    
    if (elements.activeBookings) {
        elements.activeBookings.textContent = stats.activeBookings || 0;
    }
    
    if (elements.completedBookings) {
        elements.completedBookings.textContent = stats.completedBookings || 0;
    }
    
    if (elements.totalSpent) {
        elements.totalSpent.textContent = formatCurrency(stats.totalSpent || 0);
    }
    
    // Update recent activity if available
    const recentActivityList = document.getElementById('recent-activity');
    if (recentActivityList && stats.recentActivity && stats.recentActivity.length > 0) {
        recentActivityList.innerHTML = '';
        
        stats.recentActivity.forEach(activity => {
            const li = document.createElement('li');
            li.className = 'timeline-item';
            
            li.innerHTML = `
                <div class="timeline-badge ${getStatusBadgeClass(activity.type)}">
                    <i class="fa fa-${activity.icon || 'bell'}"></i>
                </div>
                <div class="timeline-content">
                    <h5 class="timeline-title">${activity.title}</h5>
                    <p>${activity.description}</p>
                    <p class="timeline-date">
                        <small class="text-muted">
                            <i class="fa fa-clock-o"></i> ${formatDate(activity.timestamp)}
                        </small>
                    </p>
                </div>
            `;
            
            recentActivityList.appendChild(li);
        });
    }
}

// Handle booking status filter
function setupStatusFilter() {
    const statusFilter = document.getElementById('booking-status-filter');
    if (!statusFilter) return;
    
    statusFilter.addEventListener('change', function() {
        const selectedStatus = this.value;
        refreshBookings(0, 10, selectedStatus === 'ALL' ? null : selectedStatus);
    });
}

// Handle pagination
function setupPagination(totalPages, currentPage) {
    const paginationContainer = document.getElementById('bookings-pagination');
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Create previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 0 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
        <a class="page-link" href="#" aria-label="Previous" data-page="${currentPage - 1}">
            <span aria-hidden="true">&laquo;</span>
        </a>
    `;
    paginationContainer.appendChild(prevLi);
    
    // Create page number buttons
    for (let i = 0; i < totalPages; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageLi.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i + 1}</a>`;
        paginationContainer.appendChild(pageLi);
    }
    
    // Create next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`;
    nextLi.innerHTML = `
        <a class="page-link" href="#" aria-label="Next" data-page="${currentPage + 1}">
            <span aria-hidden="true">&raquo;</span>
        </a>
    `;
    paginationContainer.appendChild(nextLi);
    
    // Add event listeners
    const pageLinks = paginationContainer.querySelectorAll('.page-link');
    pageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const statusFilter = document.getElementById('booking-status-filter');
            const selectedStatus = statusFilter ? 
                (statusFilter.value === 'ALL' ? null : statusFilter.value) : null;
                
            const pageNumber = parseInt(this.getAttribute('data-page'));
            if (!isNaN(pageNumber) && pageNumber >= 0 && pageNumber < totalPages) {
                refreshBookings(pageNumber, 10, selectedStatus);
            }
        });
    });
}

// Refresh bookings list
async function refreshBookings(page = 0, size = 10, status = null) {
    const bookingsTable = document.getElementById('bookings-table');
    if (!bookingsTable) return;
    
    const bookingsData = await fetchUserBookings(page, size, status);
    if (!bookingsData) return;
    
    renderBookingTable(bookingsData.content, bookingsTable);
    setupPagination(bookingsData.totalPages, bookingsData.pageable.pageNumber);
}

// Initialize dashboard page
async function initDashboardPage() {
    // Check if we're on the dashboard page
    const dashboardContainer = document.getElementById('dashboard-container');
    if (!dashboardContainer) return;
    
    // Update dashboard statistics
    await updateDashboardStats();
    
    // Setup status filter
    setupStatusFilter();
    
    // Load initial bookings
    await refreshBookings();
    
    // Setup refresh interval (every 2 minutes)
    setInterval(async () => {
        await updateDashboardStats();
        await refreshBookings();
    }, 120000);
}

// Show notification function (if not already defined)
function showNotification(title, message, type = 'info') {
    // Check if defined elsewhere
    if (typeof showToast === 'function') {
        showToast(message, type);
            return;
        }
        
    // Fallback notification
    alert(`${title}: ${message}`);
}

// Show spinner function (if not already defined)
function showSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.classList.remove('d-none');
    }
}

// Hide spinner function (if not already defined)
function hideSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.classList.add('d-none');
    }
}

// Initialize dashboard page on DOM load
document.addEventListener('DOMContentLoaded', function() {
    // If we're on the dashboard page
    if (document.getElementById('dashboard-container')) {
        initDashboardPage();
    }
}); 