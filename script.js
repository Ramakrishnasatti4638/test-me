document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;

    // Remove any existing messages
    const existingMessage = document.querySelector('.error-message, .success-message');
    if (existingMessage) {
        existingMessage.remove();
    }

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

    // Simulate login (in a real app, this would send to a server)
    simulateLogin(email, password, remember);
});

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    const form = document.getElementById('loginForm');
    form.insertBefore(errorDiv, form.firstChild);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    const form = document.getElementById('loginForm');
    form.insertBefore(successDiv, form.firstChild);
}

function simulateLogin(email, password, remember) {
    // Simulate API call delay
    const loginBtn = document.querySelector('.btn-login');
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';

    setTimeout(() => {
        // Simulate successful login
        if (remember) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        showSuccess('Login successful! Redirecting...');
        
        setTimeout(() => {
            alert(`Welcome ${email}!`);
            document.getElementById('loginForm').reset();
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
        }, 1500);
    }, 800);
}

// Load remembered email if available
window.addEventListener('DOMContentLoaded', function() {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        document.getElementById('email').value = rememberedEmail;
        document.getElementById('remember').checked = true;
    }
});
