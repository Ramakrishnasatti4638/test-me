const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  togglePassword.textContent = isPassword ? "Hide" : "Show";
  togglePassword.setAttribute(
    "aria-label",
    isPassword ? "Hide password" : "Show password"
  );
});

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  let valid = true;

  emailError.textContent = "";
  passwordError.textContent = "";

  if (!emailInput.value.trim()) {
    emailError.textContent = "Email is required.";
    valid = false;
  } else if (!validateEmail(emailInput.value.trim())) {
    emailError.textContent = "Please enter a valid email address.";
    valid = false;
  }

  if (!passwordInput.value) {
    passwordError.textContent = "Password is required.";
    valid = false;
  } else if (passwordInput.value.length < 6) {
    passwordError.textContent = "Password must be at least 6 characters.";
    valid = false;
  }

  if (valid) {
    // Placeholder: replace with a real authentication request.
    form.querySelector(".submit-btn").textContent = "Signing in...";
    setTimeout(() => {
      alert("Login successful (demo)!");
      form.querySelector(".submit-btn").textContent = "Sign in";
    }, 600);
  }
});
