const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setError(input, errorEl, message) {
  errorEl.textContent = message;
  input.classList.toggle("invalid", Boolean(message));
  return !message;
}

function validateEmail() {
  const value = email.value.trim();
  if (!value) return setError(email, emailError, "Email is required.");
  if (!emailPattern.test(value))
    return setError(email, emailError, "Enter a valid email address.");
  return setError(email, emailError, "");
}

function validatePassword() {
  const value = password.value;
  if (!value) return setError(password, passwordError, "Password is required.");
  if (value.length < 6)
    return setError(
      password,
      passwordError,
      "Password must be at least 6 characters."
    );
  return setError(password, passwordError, "");
}

email.addEventListener("input", validateEmail);
password.addEventListener("input", validatePassword);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();

  if (isEmailValid && isPasswordValid) {
    // Replace with a real authentication request.
    alert(`Signed in as ${email.value.trim()}`);
    form.reset();
  }
});
