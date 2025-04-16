// Profile Management API Integration

// Fetch user profile information
async function fetchUserProfile() {
    try {
        // Check if user is logged in
        if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
            return null;
        }
        
        showSpinner();
        const response = await fetch('/api/users/me');
        hideSpinner();
        
        if (!response.ok) {
            throw new Error('Failed to load profile information');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        hideSpinner();
        console.error('Error fetching user profile:', error);
        showNotification('Error', 'Could not load profile: ' + error.message);
        return null;
    }
}

// Update user profile information
async function updateUserProfile(profileData) {
    try {
        // Check if user is logged in
        if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
            return false;
        }
        
        showSpinner();
        const response = await fetch('/api/users/me', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        });
        hideSpinner();
        
        if (!response.ok) {
            throw new Error('Failed to update profile information');
        }
        
        showNotification('Success', 'Profile updated successfully');
        return true;
    } catch (error) {
        hideSpinner();
        console.error('Error updating user profile:', error);
        showNotification('Error', 'Could not update profile: ' + error.message);
        return false;
    }
}

// Fetch user addresses
async function fetchUserAddresses() {
    try {
        // Check if user is logged in
        if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
            return null;
        }
        
        showSpinner();
        const response = await fetch('/api/users/me/addresses');
        hideSpinner();
        
        if (!response.ok) {
            throw new Error('Failed to load addresses');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        hideSpinner();
        console.error('Error fetching user addresses:', error);
        showNotification('Error', 'Could not load addresses: ' + error.message);
        return null;
    }
}

// Add a new address
async function addUserAddress(addressData) {
    try {
        // Check if user is logged in
        if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
            return false;
        }
        
        showSpinner();
        const response = await fetch('/api/users/me/addresses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(addressData)
        });
        hideSpinner();
        
        if (!response.ok) {
            throw new Error('Failed to add address');
        }
        
        showNotification('Success', 'Address added successfully');
        return true;
    } catch (error) {
        hideSpinner();
        console.error('Error adding address:', error);
        showNotification('Error', 'Could not add address: ' + error.message);
        return false;
    }
}

// Update an existing address
async function updateUserAddress(addressId, addressData) {
    try {
        // Check if user is logged in
        if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
            return false;
        }
        
        showSpinner();
        const response = await fetch(`/api/users/me/addresses/${addressId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(addressData)
        });
        hideSpinner();
        
        if (!response.ok) {
            throw new Error('Failed to update address');
        }
        
        showNotification('Success', 'Address updated successfully');
        return true;
    } catch (error) {
        hideSpinner();
        console.error('Error updating address:', error);
        showNotification('Error', 'Could not update address: ' + error.message);
        return false;
    }
}

// Delete an address
async function deleteUserAddress(addressId) {
    try {
        // Check if user is logged in
        if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
            return false;
        }
        
        showSpinner();
        const response = await fetch(`/api/users/me/addresses/${addressId}`, {
            method: 'DELETE'
        });
        hideSpinner();
        
        if (!response.ok) {
            throw new Error('Failed to delete address');
        }
        
        showNotification('Success', 'Address deleted successfully');
        return true;
    } catch (error) {
        hideSpinner();
        console.error('Error deleting address:', error);
        showNotification('Error', 'Could not delete address: ' + error.message);
        return false;
    }
}

// Change user password
async function changePassword(currentPassword, newPassword, confirmPassword) {
    try {
    // Check if user is logged in
    if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
            return false;
        }
        
        // Validate passwords
        if (newPassword !== confirmPassword) {
            throw new Error('New passwords do not match');
        }
        
        if (newPassword.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }
        
        showSpinner();
        const response = await fetch('/api/users/me/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currentPassword: currentPassword,
                newPassword: newPassword
            })
        });
        hideSpinner();
        
        if (!response.ok) {
            // Handle specific errors
            if (response.status === 401) {
                throw new Error('Current password is incorrect');
            }
            throw new Error('Failed to change password');
        }
        
        showNotification('Success', 'Password changed successfully');
        return true;
    } catch (error) {
        hideSpinner();
        console.error('Error changing password:', error);
        showNotification('Error', 'Could not change password: ' + error.message);
        return false;
    }
}

// Fetch user payment methods
async function fetchUserPaymentMethods() {
    try {
        // Check if user is logged in
        if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
            return null;
        }
        
        showSpinner();
        const response = await fetch('/api/users/me/payment-methods');
        hideSpinner();
        
        if (!response.ok) {
            throw new Error('Failed to load payment methods');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        hideSpinner();
        console.error('Error fetching payment methods:', error);
        showNotification('Error', 'Could not load payment methods: ' + error.message);
        return null;
    }
}

// Add a new payment method
async function addPaymentMethod(paymentData) {
    try {
        // Check if user is logged in
        if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
            return false;
        }
        
        showSpinner();
        const response = await fetch('/api/users/me/payment-methods', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });
        hideSpinner();
        
        if (!response.ok) {
            throw new Error('Failed to add payment method');
        }
        
        showNotification('Success', 'Payment method added successfully');
        return true;
    } catch (error) {
        hideSpinner();
        console.error('Error adding payment method:', error);
        showNotification('Error', 'Could not add payment method: ' + error.message);
        return false;
    }
}

// Delete a payment method
async function deletePaymentMethod(paymentMethodId) {
    try {
        // Check if user is logged in
        if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
            return false;
        }
        
        showSpinner();
        const response = await fetch(`/api/users/me/payment-methods/${paymentMethodId}`, {
            method: 'DELETE'
        });
        hideSpinner();
        
        if (!response.ok) {
            throw new Error('Failed to delete payment method');
        }
        
        showNotification('Success', 'Payment method deleted successfully');
        return true;
    } catch (error) {
        hideSpinner();
        console.error('Error deleting payment method:', error);
        showNotification('Error', 'Could not delete payment method: ' + error.message);
        return false;
    }
}

// Update user notification preferences
async function updateNotificationPreferences(preferences) {
    try {
        // Check if user is logged in
        if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
            return false;
        }
        
        showSpinner();
        const response = await fetch('/api/users/me/notification-preferences', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(preferences)
        });
        hideSpinner();
        
        if (!response.ok) {
            throw new Error('Failed to update notification preferences');
        }
        
        showNotification('Success', 'Notification preferences updated successfully');
        return true;
    } catch (error) {
        hideSpinner();
        console.error('Error updating notification preferences:', error);
        showNotification('Error', 'Could not update notification preferences: ' + error.message);
        return false;
    }
}

// Populate profile form with user data
function populateProfileForm(userData) {
    if (!userData) return;
    
    const fields = {
        firstName: document.getElementById('profile-first-name'),
        lastName: document.getElementById('profile-last-name'),
        email: document.getElementById('profile-email'),
        phone: document.getElementById('profile-phone')
    };
    
    if (fields.firstName) fields.firstName.value = userData.firstName || '';
    if (fields.lastName) fields.lastName.value = userData.lastName || '';
    if (fields.email) {
        fields.email.value = userData.email || '';
        // Email might be read-only in some cases
        if (fields.email.readOnly === undefined) {
            fields.email.readOnly = true;
        }
    }
    if (fields.phone) fields.phone.value = userData.phone || '';
}

// Render addresses list
function renderAddressesList(addresses, containerElement) {
    if (!containerElement || !addresses) return;
    
    containerElement.innerHTML = '';
    
    if (addresses.length === 0) {
        containerElement.innerHTML = '<div class="alert alert-info">No saved addresses found. Add a new address below.</div>';
        return;
    }
    
    addresses.forEach((address, index) => {
        const addressCard = document.createElement('div');
        addressCard.className = 'address-card card mb-3';
        
        const isDefault = address.isDefault ? 
            '<span class="badge badge-primary ml-2">Default</span>' : '';
        
        addressCard.innerHTML = `
            <div class="card-body">
                <h5 class="card-title d-flex justify-content-between">
                    <span>${address.label || `Address ${index + 1}`} ${isDefault}</span>
                    <div class="address-actions">
                        <button class="btn btn-sm btn-info edit-address" data-id="${address.id}">
                            <i class="fa fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger delete-address" data-id="${address.id}">
                            <i class="fa fa-trash"></i> Delete
                        </button>
                        ${!address.isDefault ? `
                        <button class="btn btn-sm btn-primary set-default-address" data-id="${address.id}">
                            <i class="fa fa-check"></i> Set Default
                        </button>
                        ` : ''}
                    </div>
                </h5>
                <p class="card-text">
                    ${address.street}<br>
                    ${address.district}, ${address.city}
                </p>
            </div>
        `;
        
        containerElement.appendChild(addressCard);
        
        // Add event listeners to buttons
        const editBtn = addressCard.querySelector('.edit-address');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                showAddressForm(address);
            });
        }
        
        const deleteBtn = addressCard.querySelector('.delete-address');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                if (confirm('Are you sure you want to delete this address?')) {
                    const success = await deleteUserAddress(address.id);
                    if (success) {
                        refreshAddresses();
                    }
                }
            });
        }
        
        const setDefaultBtn = addressCard.querySelector('.set-default-address');
        if (setDefaultBtn) {
            setDefaultBtn.addEventListener('click', async () => {
                const success = await updateUserAddress(address.id, {
                    ...address,
                    isDefault: true
                });
                if (success) {
                    refreshAddresses();
                }
            });
        }
    });
}

// Show address form for adding/editing
function showAddressForm(addressData = null) {
    const addressFormModal = document.getElementById('address-form-modal');
    if (!addressFormModal) {
        showNotification('Error', 'Address form modal not found');
        return;
    }
    
    // Get form elements
    const addressForm = addressFormModal.querySelector('#address-form');
    const addressIdInput = addressForm.querySelector('#address-id');
    const labelInput = addressForm.querySelector('#address-label');
    const streetInput = addressForm.querySelector('#address-street');
    const districtInput = addressForm.querySelector('#address-district');
    const cityInput = addressForm.querySelector('#address-city');
    const isDefaultInput = addressForm.querySelector('#address-is-default');
    const modalTitle = addressFormModal.querySelector('.modal-title');
    
    // Reset form
    addressForm.reset();
    
    // Set form values if editing
    if (addressData) {
        if (modalTitle) modalTitle.textContent = 'Edit Address';
        if (addressIdInput) addressIdInput.value = addressData.id;
        if (labelInput) labelInput.value = addressData.label || '';
        if (streetInput) streetInput.value = addressData.street || '';
        if (districtInput) districtInput.value = addressData.district || '';
        if (cityInput) cityInput.value = addressData.city || '';
        if (isDefaultInput) isDefaultInput.checked = addressData.isDefault || false;
    } else {
        if (modalTitle) modalTitle.textContent = 'Add New Address';
        if (addressIdInput) addressIdInput.value = '';
        if (isDefaultInput) isDefaultInput.checked = false;
    }
    
    // Show modal
    $(addressFormModal).modal('show');
}

// Render payment methods list
function renderPaymentMethodsList(paymentMethods, containerElement) {
    if (!containerElement || !paymentMethods) return;
    
    containerElement.innerHTML = '';
    
    if (paymentMethods.length === 0) {
        containerElement.innerHTML = '<div class="alert alert-info">No saved payment methods found. Add a new payment method below.</div>';
        return;
    }
    
    paymentMethods.forEach((method, index) => {
        const methodCard = document.createElement('div');
        methodCard.className = 'payment-method-card card mb-3';
        
        const isDefault = method.isDefault ? 
            '<span class="badge badge-primary ml-2">Default</span>' : '';
        
        let cardInfo = '';
        if (method.type === 'CREDIT_CARD') {
            cardInfo = `
                <div class="d-flex align-items-center">
                    <img src="/img/card-${method.cardType.toLowerCase()}.png" alt="${method.cardType}" class="mr-2" height="24">
                    <span>**** **** **** ${method.lastFourDigits}</span>
                    <span class="ml-2 text-muted">Expires: ${method.expiryMonth}/${method.expiryYear}</span>
                </div>
            `;
        } else if (method.type === 'BANK_ACCOUNT') {
            cardInfo = `
                <div>
                    <span class="text-muted">Bank:</span> ${method.bankName}<br>
                    <span class="text-muted">Account:</span> *****${method.lastFourDigits}
                </div>
            `;
        } else {
            cardInfo = `<div>${method.description || 'Payment method'}</div>`;
        }
        
        methodCard.innerHTML = `
            <div class="card-body">
                <h5 class="card-title d-flex justify-content-between">
                    <span>${method.label || `Payment Method ${index + 1}`} ${isDefault}</span>
                    <div class="payment-method-actions">
                        <button class="btn btn-sm btn-danger delete-payment-method" data-id="${method.id}">
                            <i class="fa fa-trash"></i> Delete
                        </button>
                        ${!method.isDefault ? `
                        <button class="btn btn-sm btn-primary set-default-payment" data-id="${method.id}">
                            <i class="fa fa-check"></i> Set Default
                        </button>
                        ` : ''}
                    </div>
                </h5>
                <div class="card-text">
                    ${cardInfo}
                </div>
            </div>
        `;
        
        containerElement.appendChild(methodCard);
        
        // Add event listeners to buttons
        const deleteBtn = methodCard.querySelector('.delete-payment-method');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                if (confirm('Are you sure you want to delete this payment method?')) {
                    const success = await deletePaymentMethod(method.id);
                    if (success) {
                        refreshPaymentMethods();
                    }
                }
            });
        }
        
        const setDefaultBtn = methodCard.querySelector('.set-default-payment');
        if (setDefaultBtn) {
            setDefaultBtn.addEventListener('click', async () => {
                const updatedMethod = {
                    ...method,
                    isDefault: true
                };
                
                const success = await updatePaymentMethod(method.id, updatedMethod);
                if (success) {
                    refreshPaymentMethods();
                }
            });
        }
    });
}

// Setup profile form submission
function setupProfileForm() {
    const profileForm = document.getElementById('profile-form');
    if (!profileForm) return;
    
    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const profileData = {
            firstName: profileForm.querySelector('#profile-first-name').value,
            lastName: profileForm.querySelector('#profile-last-name').value,
            phone: profileForm.querySelector('#profile-phone').value
        };
        
        // Validate form
        if (!profileData.firstName) {
            showNotification('Error', 'First name is required');
            return;
        }
        
        if (!profileData.lastName) {
            showNotification('Error', 'Last name is required');
            return;
        }
        
        if (!profileData.phone) {
            showNotification('Error', 'Phone number is required');
            return;
        }
        
        const success = await updateUserProfile(profileData);
        if (success) {
            showNotification('Success', 'Profile updated successfully');
        }
    });
}

// Setup address form submission
function setupAddressForm() {
    const addressForm = document.getElementById('address-form');
    if (!addressForm) return;
    
    addressForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const addressId = addressForm.querySelector('#address-id').value;
        const addressData = {
            label: addressForm.querySelector('#address-label').value,
            street: addressForm.querySelector('#address-street').value,
            district: addressForm.querySelector('#address-district').value,
            city: addressForm.querySelector('#address-city').value,
            isDefault: addressForm.querySelector('#address-is-default').checked
        };
        
        // Validate form
        if (!addressData.street) {
            showNotification('Error', 'Street address is required');
            return;
        }
        
        if (!addressData.district) {
            showNotification('Error', 'District is required');
            return;
        }
        
        if (!addressData.city) {
            showNotification('Error', 'City is required');
            return;
        }
        
        let success;
        if (addressId) {
            // Update existing address
            success = await updateUserAddress(addressId, addressData);
        } else {
            // Add new address
            success = await addUserAddress(addressData);
        }
        
        if (success) {
            // Hide modal
            $('#address-form-modal').modal('hide');
            
            // Refresh addresses list
            refreshAddresses();
        }
    });
}

// Setup password change form
function setupPasswordForm() {
    const passwordForm = document.getElementById('password-change-form');
    if (!passwordForm) return;
    
    passwordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const currentPassword = passwordForm.querySelector('#current-password').value;
        const newPassword = passwordForm.querySelector('#new-password').value;
        const confirmPassword = passwordForm.querySelector('#confirm-password').value;
        
        // Validate form
        if (!currentPassword) {
            showNotification('Error', 'Current password is required');
            return;
        }
        
        if (!newPassword) {
            showNotification('Error', 'New password is required');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showNotification('Error', 'Passwords do not match');
            return;
        }
        
        if (newPassword.length < 8) {
            showNotification('Error', 'Password must be at least 8 characters long');
            return;
        }
        
        const success = await changePassword(currentPassword, newPassword, confirmPassword);
        if (success) {
            // Reset form
            passwordForm.reset();
            showNotification('Success', 'Password changed successfully');
        }
    });
}

// Setup notification preferences form
function setupNotificationPreferencesForm() {
    const preferencesForm = document.getElementById('notification-preferences-form');
    if (!preferencesForm) return;
    
    preferencesForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const preferences = {
            emailNotifications: preferencesForm.querySelector('#email-notifications').checked,
            smsNotifications: preferencesForm.querySelector('#sms-notifications').checked,
            pushNotifications: preferencesForm.querySelector('#push-notifications').checked,
            marketingEmails: preferencesForm.querySelector('#marketing-emails').checked
        };
        
        const success = await updateNotificationPreferences(preferences);
        if (success) {
            showNotification('Success', 'Notification preferences updated successfully');
        }
    });
}

// Refresh addresses list
async function refreshAddresses() {
    const addressesContainer = document.getElementById('addresses-container');
    if (!addressesContainer) return;
    
    const addresses = await fetchUserAddresses();
    if (addresses) {
        renderAddressesList(addresses, addressesContainer);
    }
}

// Refresh payment methods list
async function refreshPaymentMethods() {
    const paymentMethodsContainer = document.getElementById('payment-methods-container');
    if (!paymentMethodsContainer) return;
    
    const paymentMethods = await fetchUserPaymentMethods();
    if (paymentMethods) {
        renderPaymentMethodsList(paymentMethods, paymentMethodsContainer);
    }
}

// Setup add address button
function setupAddAddressButton() {
    const addAddressBtn = document.getElementById('add-address-btn');
    if (!addAddressBtn) return;
    
    addAddressBtn.addEventListener('click', () => {
        showAddressForm();
    });
}

// Setup tabs navigation
function setupProfileTabs() {
    const tabLinks = document.querySelectorAll('.profile-tab-link');
    if (!tabLinks.length) return;
    
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs
            tabLinks.forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all tab contents
            const tabContents = document.querySelectorAll('.profile-tab-content');
            tabContents.forEach(content => content.classList.add('d-none'));
            
            // Show selected tab content
            const targetId = this.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.remove('d-none');
            }
            
            // Update URL hash
            window.location.hash = targetId;
        });
    });
    
    // Check if there's a hash in the URL to activate the correct tab
    const hash = window.location.hash.substring(1);
    if (hash) {
        const tabToActivate = document.querySelector(`.profile-tab-link[data-target="${hash}"]`);
        if (tabToActivate) {
            tabToActivate.click();
        }
    } else {
        // Activate first tab by default
        tabLinks[0].click();
    }
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

// Initialize profile page
async function initProfilePage() {
    // Setup forms
    setupProfileForm();
    setupAddressForm();
    setupPasswordForm();
    setupNotificationPreferencesForm();
    
    // Setup buttons
    setupAddAddressButton();
    
    // Setup tabs
    setupProfileTabs();
    
    // Load user profile data
    const userData = await fetchUserProfile();
    if (userData) {
        populateProfileForm(userData);
    }
    
    // Load addresses
    await refreshAddresses();
    
    // Load payment methods
    await refreshPaymentMethods();
}

// Initialize profile page on DOM load
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the profile page
    if (document.getElementById('profile-container')) {
        initProfilePage();
    }
}); 