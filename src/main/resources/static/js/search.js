// Search Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize search functionality
    initSearch();
});

// Initialize search
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchInput && searchResults) {
        // Search data
        const searchData = [
            {
                title: 'Wash & Fold',
                description: 'Our standard wash and fold service for all your regular clothes.',
                url: 'booking.html?service=wash-fold'
            },
            {
                title: 'Dry Cleaning',
                description: 'Professional dry cleaning for your delicate garments, suits, dresses, and other special items.',
                url: 'booking.html?service=dry-cleaning'
            },
            {
                title: 'Ironing Service',
                description: 'Get your clothes perfectly pressed and ready to wear with our professional ironing service.',
                url: 'booking.html?service=ironing'
            },
            {
                title: 'Pickup & Delivery',
                description: 'Convenient pickup and delivery service right to your doorstep.',
                url: 'booking.html?service=pickup-delivery'
            },
            {
                title: 'Basic Wash',
                description: 'Regular clothes, wash & fold, standard detergent, 48-hour turnaround.',
                url: 'booking.html?plan=basic'
            },
            {
                title: 'Premium Wash',
                description: 'All types of clothes, wash, fold & iron, premium detergent, 24-hour turnaround, free delivery.',
                url: 'booking.html?plan=premium'
            },
            {
                title: 'Dry Cleaning Service',
                description: 'Suits & dresses, delicate items, professional cleaning, 48-hour turnaround.',
                url: 'booking.html?plan=dry-cleaning'
            },
            {
                title: 'Book Appointment',
                description: 'Schedule a pickup for your laundry service.',
                url: 'booking.html'
            },
            {
                title: 'Login',
                description: 'Access your account to manage bookings and preferences.',
                url: 'login.html'
            },
            {
                title: 'Register',
                description: 'Create an account to enjoy benefits and manage your orders.',
                url: 'register.html'
            },
            {
                title: 'Dashboard',
                description: 'View your appointments, order history, and preferences.',
                url: 'dashboard.html'
            },
            {
                title: 'Contact Us',
                description: 'Get in touch with our team for any questions or concerns.',
                url: 'index.html#contact'
            }
        ];
        
        // Search function
        function performSearch(query) {
            if (!query) {
                searchResults.style.display = 'none';
                return;
            }
            
            query = query.toLowerCase();
            
            // Filter results
            const filteredResults = searchData.filter(item => {
                return item.title.toLowerCase().includes(query) || 
                       item.description.toLowerCase().includes(query);
            });
            
            // Display results
            if (filteredResults.length > 0) {
                searchResults.innerHTML = '';
                
                filteredResults.forEach(result => {
                    const resultItem = document.createElement('div');
                    resultItem.className = 'search-result-item';
                    resultItem.innerHTML = `
                        <div class="search-result-title">${result.title}</div>
                        <div class="search-result-description">${result.description}</div>
                    `;
                    
                    resultItem.addEventListener('click', function() {
                        window.location.href = result.url;
                    });
                    
                    searchResults.appendChild(resultItem);
                });
                
                searchResults.style.display = 'block';
            } else {
                searchResults.innerHTML = `
                    <div class="search-result-item">
                        <div class="search-result-title">No results found</div>
                        <div class="search-result-description">Try a different search term</div>
                    </div>
                `;
                searchResults.style.display = 'block';
            }
        }
        
        // Event listeners
        searchInput.addEventListener('input', function() {
            performSearch(this.value);
        });
        
        searchInput.addEventListener('focus', function() {
            if (this.value) {
                performSearch(this.value);
            }
        });
        
        searchBtn.addEventListener('click', function() {
            performSearch(searchInput.value);
        });
        
        // Close search results when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.search-container')) {
                searchResults.style.display = 'none';
            }
        });
        
        // Dashboard search
        const dashboardSearch = document.getElementById('dashboard-search');
        
        if (dashboardSearch) {
            dashboardSearch.addEventListener('input', function() {
                const query = this.value.toLowerCase();
                
                // Search appointments
                const appointments = document.querySelectorAll('.appointment-item');
                
                if (appointments.length > 0) {
                    appointments.forEach(appointment => {
                        const text = appointment.textContent.toLowerCase();
                        
                        if (text.includes(query)) {
                            appointment.style.display = 'flex';
                        } else {
                            appointment.style.display = 'none';
                        }
                    });
                }
                
                // Search orders
                const orders = document.querySelectorAll('.order-item');
                
                if (orders.length > 0) {
                    orders.forEach(order => {
                        const text = order.textContent.toLowerCase();
                        
                        if (text.includes(query)) {
                            order.style.display = 'block';
                        } else {
                            order.style.display = 'none';
                        }
                    });
                }
            });
        }
    }
}
