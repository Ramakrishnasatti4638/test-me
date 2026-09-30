document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const alertBox = document.getElementById('alertBox');
  const submitBtn = document.getElementById('submitBtn');

  // Toggle password visibility
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      togglePasswordBtn.textContent = isPassword ? 'Hide' : 'Show';
      togglePasswordBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    });
  }

  // Clear errors on input
  emailInput.addEventListener('input', () => {
    clearFieldError(emailInput, emailError);
    hideAlert();
  });

  passwordInput.addEventListener('input', () => {
    clearFieldError(passwordInput, passwordError);
    hideAlert();
  });

  // Handle submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    let isValid = true;

    // Validate email
    if (!email) {
      showFieldError(emailInput, emailError, 'Email is required.');
      isValid = false;
    } else if (!validateEmail(email)) {
      showFieldError(emailInput, emailError, 'Please enter a valid email address.');
      isValid = false;
    } else {
      clearFieldError(emailInput, emailError);
    }

    // Validate password
    if (!password) {
      showFieldError(passwordInput, passwordError, 'Password is required.');
      isValid = false;
    } else if (password.length < 6) {
      showFieldError(passwordInput, passwordError, 'Password must be at least 6 characters.');
      isValid = false;
    } else {
      clearFieldError(passwordInput, passwordError);
    }

    if (!isValid) return;

    // Simulate login submission
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
      showAlert('Signed in successfully!', 'success');
      form.reset();
    }, 800);
  });

  function validateEmail(val) {
    // Simple standard email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  function showFieldError(input, errorElement, message) {
    input.classList.add('input-error');
    errorElement.textContent = message;
  }

  function clearFieldError(input, errorElement) {
    input.classList.remove('input-error');
    errorElement.textContent = '';
  }

  function showAlert(message, type) {
    alertBox.textContent = message;
    alertBox.className = `alert-box ${type}`;
    alertBox.removeAttribute('hidden');
  }

  function hideAlert() {
    alertBox.setAttribute('hidden', '');
    alertBox.textContent = '';
  }
});
