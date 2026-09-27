(function () {
  "use strict";

  const form = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const emailError = document.getElementById("email-error");
  const passwordError = document.getElementById("password-error");
  const formStatus = document.getElementById("form-status");
  const submitBtn = form.querySelector("button[type='submit']");

  function setError(input, errorEl, message) {
    if (message) {
      errorEl.textContent = message;
      input.classList.add("invalid");
      input.setAttribute("aria-invalid", "true");
    } else {
      errorEl.textContent = "";
      input.classList.remove("invalid");
      input.removeAttribute("aria-invalid");
    }
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validate() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    let ok = true;

    if (!email) {
      setError(emailInput, emailError, "Email is required.");
      ok = false;
    } else if (!isValidEmail(email)) {
      setError(emailInput, emailError, "Please enter a valid email address.");
      ok = false;
    } else {
      setError(emailInput, emailError, "");
    }

    if (!password) {
      setError(passwordInput, passwordError, "Password is required.");
      ok = false;
    } else if (password.length < 6) {
      setError(passwordInput, passwordError, "Password must be at least 6 characters.");
      ok = false;
    } else {
      setError(passwordInput, passwordError, "");
    }

    return ok;
  }

  emailInput.addEventListener("input", () => {
    if (emailInput.classList.contains("invalid")) validate();
  });

  passwordInput.addEventListener("input", () => {
    if (passwordInput.classList.contains("invalid")) validate();
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    formStatus.textContent = "";
    formStatus.classList.remove("success", "error");

    if (!validate()) {
      formStatus.textContent = "Please fix the errors above.";
      formStatus.classList.add("error");
      return;
    }

    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Signing in...";

    // Simulated auth — replace with real call.
    await new Promise((resolve) => setTimeout(resolve, 700));

    submitBtn.disabled = false;
    submitBtn.textContent = originalText;

    formStatus.textContent = "Signed in successfully. Redirecting...";
    formStatus.classList.add("success");
    form.reset();
  });
})();