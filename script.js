document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const alertMessage = document.getElementById('alertMessage');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const submitBtn = document.getElementById('submitBtn');

  // Toggle password visibility
  togglePasswordBtn.addEventListener('click', () => {
    const isPassword = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
    togglePasswordBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    togglePasswordBtn.setAttribute('title', isPassword ? 'Hide password' : 'Show password');
    togglePasswordBtn.textContent = isPassword ? '🙈' : '👁️';
  });

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const showAlert = (message, type = 'error') => {
    alertMessage.textContent = message;
    alertMessage.className = `alert alert-${type}`;
  };

  const clearAlert = () => {
    alertMessage.textContent = '';
    alertMessage.className = 'alert hidden';
  };

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAlert();

    let isValid = true;

    // Email validation
    const emailValue = emailInput.value.trim();
    if (!emailValue) {
      emailError.textContent = 'Email is required';
      emailInput.style.borderColor = 'var(--error-color)';
      isValid = false;
    } else if (!validateEmail(emailValue)) {
      emailError.textContent = 'Please enter a valid email address';
      emailInput.style.borderColor = 'var(--error-color)';
      isValid = false;
    } else {
      emailError.textContent = '';
      emailInput.style.borderColor = 'var(--border-color)';
    }

    // Password validation
    const passwordValue = passwordInput.value;
    if (!passwordValue) {
      passwordError.textContent = 'Password is required';
      passwordInput.style.borderColor = 'var(--error-color)';
      isValid = false;
    } else if (passwordValue.length < 6) {
      passwordError.textContent = 'Password must be at least 6 characters';
      passwordInput.style.borderColor = 'var(--error-color)';
      isValid = false;
    } else {
      passwordError.textContent = '';
      passwordInput.style.borderColor = 'var(--border-color)';
    }

    if (!isValid) return;

    // Simulate login request
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';

      // Example success demonstration
      showAlert('Signed in successfully!', 'success');
    }, 800);
  });

  // Clear errors on input
  emailInput.addEventListener('input', () => {
    emailError.textContent = '';
    emailInput.style.borderColor = 'var(--border-color)';
  });

  passwordInput.addEventListener('input', () => {
    passwordError.textContent = '';
    passwordInput.style.borderColor = 'var(--border-color)';
  });
});
