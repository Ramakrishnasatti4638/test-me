document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const remember = document.getElementById('remember').checked;
    
    // Simple validation
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Simulate login (in real app, this would send to backend)
    console.log('Login attempt:', {
        email: email,
        password: password,
        remember: remember
    });
    
    // Show success message
    alert(`Login successful!\nEmail: ${email}`);
    
    // Reset form
    this.reset();
    document.getElementById('remember').checked = false;
});
