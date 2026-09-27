document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const remember = document.querySelector('input[name="remember"]').checked;
    const messageDiv = document.getElementById('message');
    
    // Clear previous messages
    messageDiv.classList.remove('success', 'error');
    
    // Basic validation
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
    }
    
    // Simulate login
    showMessage('Login successful! Welcome, ' + email, 'success');
    
    // Store credentials if remember me is checked (in real app, use secure methods)
    if (remember) {
        localStorage.setItem('rememberEmail', email);
        localStorage.setItem('showSuccessMessage', 'true');
    } else {
        localStorage.removeItem('rememberEmail');
        localStorage.removeItem('showSuccessMessage');
    }
    
    // Reset form
    setTimeout(() => {
        this.reset();
        messageDiv.classList.remove('success', 'error');
    }, 2000);
});

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.classList.remove('success', 'error');
    messageDiv.classList.add(type);
}

// Load remembered email on page load
window.addEventListener('load', function() {
    const rememberedEmail = localStorage.getItem('rememberEmail');
    const showSuccessMessage = localStorage.getItem('showSuccessMessage');
    
    if (rememberedEmail) {
        document.getElementById('email').value = rememberedEmail;
        document.querySelector('input[name="remember"]').checked = true;
    }
    
    // Show success message if credentials were just saved
    if (showSuccessMessage) {
        showMessage('Login successful! Welcome, ' + rememberedEmail, 'success');
        localStorage.removeItem('showSuccessMessage');
        
        // Clear message after 2 seconds
        setTimeout(() => {
            document.getElementById('message').classList.remove('success', 'error');
        }, 2000);
    }
});
