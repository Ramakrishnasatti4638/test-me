document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const remember = document.getElementById('remember').checked;
    const messageEl = document.getElementById('message');
    
    // Simple validation
    if (!email || !password) {
        messageEl.textContent = 'Please fill out this field.';
        messageEl.className = 'message error';
        messageEl.style.display = 'block';
        return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        messageEl.textContent = 'Please enter a valid email';
        messageEl.className = 'message error';
        messageEl.style.display = 'block';
        return;
    }
    
    // Simulate login success
    messageEl.textContent = `Welcome back! Logged in as ${email}`;
    messageEl.className = 'message success';
    messageEl.style.display = 'block';
    
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
