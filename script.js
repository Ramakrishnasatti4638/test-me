const form = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");
const formStatus = document.getElementById("form-status");
const toggleBtn = document.getElementById("toggle-password");
const submitBtn = form.querySelector(".submit-btn");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setError(input, errorEl, message) {
  errorEl.textContent = message;
  input.setAttribute("aria-invalid", "true");
}

function clearError(input, errorEl) {
  errorEl.textContent = "";
  input.removeAttribute("aria-invalid");
}

function validateEmail() {
  const value = emailInput.value.trim();
  if (!value) {
    setError(emailInput, emailError, "Email is required.");
    return false;
  }
  if (!EMAIL_RE.test(value)) {
    setError(emailInput, emailError, "Enter a valid email address.");
    return false;
  }
  clearError(emailInput, emailError);
  return true;
}

function validatePassword() {
  const value = passwordInput.value;
  if (!value) {
    setError(passwordInput, passwordError, "Password is required.");
    return false;
  }
  if (value.length < 8) {
    setError(passwordInput, passwordError, "Password must be at least 8 characters.");
    return false;
  }
  clearError(passwordInput, passwordError);
  return true;
}

emailInput.addEventListener("blur", validateEmail);
passwordInput.addEventListener("blur", validatePassword);
emailInput.addEventListener("input", () => clearError(emailInput, emailError));
passwordInput.addEventListener("input", () =>
  clearError(passwordInput, passwordError)
);

toggleBtn.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  toggleBtn.textContent = isHidden ? "Hide" : "Show";
  toggleBtn.setAttribute(
    "aria-label",
    isHidden ? "Hide password" : "Show password"
  );
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  formStatus.textContent = "";
  formStatus.className = "form-status";

  const emailValid = validateEmail();
  const passwordValid = validatePassword();

  if (!emailValid || !passwordValid) {
    formStatus.textContent = "Please fix the errors above.";
    formStatus.classList.add("error");
    return;
  }

  // No real backend — simulate a submission.
  submitBtn.disabled = true;
  submitBtn.textContent = "Signing in...";

  setTimeout(() => {
    submitBtn.disabled = false;
    submitBtn.textContent = "Sign in";
    formStatus.textContent = "Signed in successfully.";
    formStatus.classList.add("success");
    form.reset();
  }, 900);
});
