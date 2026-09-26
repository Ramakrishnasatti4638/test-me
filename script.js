document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');

    // Clear previous messages
    messageDiv.className = 'message';

    // Basic validation
    if (!email || !password) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Please fill in all fields';
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Please enter a valid email address';
        return;
    }

    // Password validation (at least 6 characters)
    if (password.length < 6) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Password must be at least 6 characters';
        return;
    }

    // Simulate login (in a real app, this would send to a server)
    messageDiv.className = 'message success';
    messageDiv.textContent = `Login successful! Welcome, ${email}`;

    // Optionally clear form
    setTimeout(() => {
        document.getElementById('loginForm').reset();
        messageDiv.className = 'message';
    }, 2000);
});
