document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    const messageEl = document.getElementById('message');
    
    // Simple validation
    if (!email || !password) {
        messageEl.textContent = 'Please fill in all fields';
        messageEl.className = 'message error';
        return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        messageEl.textContent = 'Please enter a valid email';
        messageEl.className = 'message error';
        return;
    }
    
    // Simulate login success
    messageEl.textContent = `Welcome back! Logged in as ${email}`;
    messageEl.className = 'message success';
    
    // Store remember me preference
    if (remember) {
        localStorage.setItem('rememberedEmail', email);
    } else {
        localStorage.removeItem('rememberedEmail');
    }
    
    // Clear form
    this.reset();
});

// Load remembered email on page load
window.addEventListener('load', function() {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        document.getElementById('email').value = rememberedEmail;
        document.getElementById('remember').checked = true;
    }
});
