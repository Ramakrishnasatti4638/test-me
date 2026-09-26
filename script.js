document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Reset messages
        errorMessage.textContent = '';
        successMessage.textContent = '';
        
        // Simple validation
        if(username === '' || password === '') {
            errorMessage.textContent = 'Please fill in all fields';
            return;
        }
        
        // Simulate login process (in a real app, this would be an API call)
        if(username === 'admin' && password === 'password123') {
            successMessage.textContent = 'Login successful! Redirecting...';
            // In a real app, you would redirect to another page
            // window.location.href = 'dashboard.html';
            
            // Reset form
            loginForm.reset();
        } else {
            errorMessage.textContent = 'Invalid username or password';
        }
    });
});