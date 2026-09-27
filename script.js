document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    // Basic validation
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    // Password length check
    if (password.length < 6) {
        showError('Password must be at least 6 characters long');
        return;
    }
    
    // If validation passes, show success message
    showSuccess(`Login successful! Welcome ${email}`);
    
    // Store remember me preference
    if (remember) {
        localStorage.setItem('rememberedEmail', email);
    } else {
        localStorage.removeItem('rememberedEmail');
    }
    
    // Clear form
    setTimeout(() => {
        this.reset();
    }, 2000);
});

function showError(message) {
    const form = document.getElementById('loginForm');
    let errorDiv = document.querySelector('.error-message');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        form.parentElement.insertBefore(errorDiv, form);
    }
    
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
    
    setTimeout(() => {
        errorDiv.classList.remove('show');
    }, 4000);
}

function showSuccess(message) {
    const form = document.getElementById('loginForm');
    let successDiv = document.querySelector('.success-message');
    
    if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        form.parentElement.insertBefore(successDiv, form);
    }
    
    successDiv.textContent = message;
    successDiv.classList.add('show');
    
    setTimeout(() => {
        successDiv.classList.remove('show');
    }, 4000);
}

// Load remembered email on page load
window.addEventListener('DOMContentLoaded', function() {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        document.getElementById('email').value = rememberedEmail;
        document.getElementById('remember').checked = true;
    }
});
