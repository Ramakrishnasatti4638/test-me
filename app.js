(function () {
  "use strict";

  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const messageEl = document.getElementById("message");

  function setMessage(text, kind) {
    messageEl.textContent = text || "";
    messageEl.classList.remove("error", "success");
    if (kind) messageEl.classList.add(kind);
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      setMessage("Please fill in both email and password.", "error");
      return;
    }

    if (!isValidEmail(email)) {
      setMessage("Please enter a valid email address.", "error");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.", "error");
      return;
    }

    // Simulate successful sign-in (no backend in this demo).
    setMessage("Signed in. Redirecting...", "success");
    form.reset();
  });
})();