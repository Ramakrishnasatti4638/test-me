document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const alertMessage = document.getElementById('alertMessage');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnSpinner = submitBtn.querySelector('.btn-spinner');

  // Toggle password visibility
  togglePasswordBtn.addEventListener('click', () => {
    const isPassword = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
  });

  // Basic validation helpers
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  function clearErrors() {
    emailError.textContent = '';
    passwordError.textContent = '';
    alertMessage.className = 'alert hidden';
    alertMessage.textContent = '';
  }

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    let isValid = true;
    const emailVal = emailInput.value.trim();
    const passwordVal = passwordInput.value;

    if (!emailVal) {
      emailError.textContent = 'Email is required';
      isValid = false;
    } else if (!validateEmail(emailVal)) {
      emailError.textContent = 'Please enter a valid email address';
      isValid = false;
    }

    if (!passwordVal) {
      passwordError.textContent = 'Password is required';
      isValid = false;
    } else if (passwordVal.length < 6) {
      passwordError.textContent = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (!isValid) return;

    // Simulate submission / loading state
    submitBtn.disabled = true;
    btnText.classList.add('hidden');
    btnSpinner.classList.remove('hidden');

    setTimeout(() => {
      submitBtn.disabled = false;
      btnText.classList.remove('hidden');
      btnSpinner.classList.add('hidden');

      alertMessage.textContent = 'Login successful! Redirecting...';
      alertMessage.className = 'alert success';
      form.reset();
    }, 800);
  });
});
