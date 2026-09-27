const form = document.getElementById('loginForm');
const email = document.getElementById('email');
const password = document.getElementById('password');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const successMessage = document.getElementById('successMessage');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  clearErrors();

  let valid = true;

  if (!email.value.trim()) {
    showError(emailError, 'Email is required');
    valid = false;
  } else if (!isValidEmail(email.value.trim())) {
    showError(emailError, 'Please enter a valid email');
    valid = false;
  }

  if (!password.value) {
    showError(passwordError, 'Password is required');
    valid = false;
  } else if (password.value.length < 6) {
    showError(passwordError, 'Password must be at least 6 characters');
    valid = false;
  }

  if (valid) {
    successMessage.style.display = 'block';
    successMessage.textContent = 'Login successful! (demo)';
  }
});

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function showError(el, msg) {
  el.textContent = msg;
}

function clearErrors() {
  emailError.textContent = '';
  passwordError.textContent = '';
  successMessage.style.display = 'none';
}