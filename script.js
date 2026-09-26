(function () {
  "use strict";

  const form = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const messageEl = document.getElementById("form-message");
  const submitButton = form.querySelector('button[type="submit"]');

  function setMessage(text, type) {
    messageEl.textContent = text;
    messageEl.classList.remove("success", "error");
    if (type) {
      messageEl.classList.add(type);
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email) {
      setMessage("Please enter your email.", "error");
      emailInput.focus();
      return;
    }

    if (!isValidEmail(email)) {
      setMessage("Please enter a valid email address.", "error");
      emailInput.focus();
      return;
    }

    if (!password) {
      setMessage("Please enter your password.", "error");
      passwordInput.focus();
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.", "error");
      passwordInput.focus();
      return;
    }

    submitButton.disabled = true;
    const originalText = submitButton.textContent;
    submitButton.textContent = "Signing in...";

    // Simulated request — replace with a real API call in production.
    setTimeout(function () {
      submitButton.disabled = false;
      submitButton.textContent = originalText;
      setMessage("Signed in as " + email + ".", "success");
      form.reset();
    }, 900);
  });
})();
