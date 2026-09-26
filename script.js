const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validate email format
function validateEmail(email) {
    return emailRegex.test(email);
}

// Validate password length
function validatePassword(password) {
    return password.length >= 6;
}

// Clear error message
function clearError(errorElement) {
    errorElement.textContent = '';
}

// Show error message
function showError(errorElement, message) {
    errorElement.textContent = message;
}

// Real-time email validation
emailInput.addEventListener('blur', function() {
    if (this.value && !validateEmail(this.value)) {
        showError(emailError, 'Please enter a valid email address');
    } else {
        clearError(emailError);
    }
});

// Real-time password validation
passwordInput.addEventListener('blur', function() {
    if (this.value && !validatePassword(this.value)) {
        showError(passwordError, 'Password must be at least 6 characters');
    } else {
        clearError(passwordError);
    }
});

// Clear errors on input
emailInput.addEventListener('input', function() {
    clearError(emailError);
});

passwordInput.addEventListener('input', function() {
    clearError(passwordError);
});

// Form submission
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const remember = document.getElementById('remember').checked;

    // Reset errors
    clearError(emailError);
    clearError(passwordError);

    // Validate all fields
    let isValid = true;

    if (!email) {
        showError(emailError, 'Email is required');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError(emailError, 'Please enter a valid email address');
        isValid = false;
    }

    if (!password) {
        showError(passwordError, 'Password is required');
        isValid = false;
    } else if (!validatePassword(password)) {
        showError(passwordError, 'Password must be at least 6 characters');
        isValid = false;
    }

    if (isValid) {
        // Simulate login success
        console.log('Login attempt:', {
            email: email,
            remember: remember,
            timestamp: new Date().toISOString()
        });

        alert(`Welcome back, ${email}!`);
        
        // Reset form
        loginForm.reset();
    }
});
