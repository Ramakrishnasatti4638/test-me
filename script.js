document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    // Basic validation
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }
    
    // Simulate login process
    console.log('Login attempt:', { email, password, remember });
    showSuccess('Login successful! Welcome back.');
    
    // Clear form after successful login
    setTimeout(() => {
        this.reset();
    }, 1500);
});

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(message) {
    const form = document.getElementById('loginForm');
    const errorDiv = document.querySelector('.error-message') || createMessageDiv('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    form.insertBefore(errorDiv, form.firstChild);
    
    // Hide error after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    const form = document.getElementById('loginForm');
    const successDiv = document.querySelector('.success-message') || createMessageDiv('success-message');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    form.insertBefore(successDiv, form.firstChild);
    
    // Hide success after 3 seconds
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 3000);
}

function createMessageDiv(className) {
    const div = document.createElement('div');
    div.className = className;
    return div;
}
