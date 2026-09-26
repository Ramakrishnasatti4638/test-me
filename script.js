document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');

    let isValid = true;

    emailError.textContent = '';
    passwordError.textContent = '';
    emailInput.classList.remove('error-border');
    passwordInput.classList.remove('error-border');

    const email = emailInput.value.trim();
    if (!email) {
        emailError.textContent = 'Email is required.';
        emailInput.classList.add('error-border');
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailError.textContent = 'Please enter a valid email address.';
        emailInput.classList.add('error-border');
        isValid = false;
    }

    const password = passwordInput.value;
    if (!password) {
        passwordError.textContent = 'Password is required.';
        passwordInput.classList.add('error-border');
        isValid = false;
    } else if (password.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters.';
        passwordInput.classList.add('error-border');
        isValid = false;
    }

    if (isValid) {
        alert('Login submitted for ' + email);
    }
});
