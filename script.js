document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;

    // Basic validation
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }

    // Simulate login (in a real app, this would send to a server)
    console.log('Login attempt:', {
        email: email,
        remember: remember
    });

    alert(`Welcome back! You logged in as ${email}`);
    
    // Clear form
    this.reset();
});
