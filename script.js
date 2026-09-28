(function () {
  "use strict";

  const form = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const toggleBtn = document.getElementById("toggle-password");
  const status = document.getElementById("form-status");
  const submitBtn = form.querySelector('button[type="submit"]');

  function setError(input, message) {
    const err = form.querySelector(`.error[data-for="${input.id}"]`);
    if (message) {
      input.classList.add("is-invalid");
      input.setAttribute("aria-invalid", "true");
      if (err) {
        err.textContent = message;
        err.hidden = false;
      }
    } else {
      input.classList.remove("is-invalid");
      input.removeAttribute("aria-invalid");
      if (err) err.hidden = true;
    }
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function clearStatus() {
    status.textContent = "";
    status.classList.remove("is-success", "is-error");
  }

  function showStatus(message, kind) {
    status.textContent = message;
    status.classList.toggle("is-success", kind === "success");
    status.classList.toggle("is-error", kind === "error");
  }

  function validate() {
    let ok = true;
    if (!validateEmail(emailInput.value.trim())) {
      setError(emailInput, "Please enter a valid email address.");
      ok = false;
    } else {
      setError(emailInput);
    }

    if (passwordInput.value.length < 6) {
      setError(passwordInput, "Password must be at least 6 characters.");
      ok = false;
    } else {
      setError(passwordInput);
    }
    return ok;
  }

  emailInput.addEventListener("input", () => {
    if (emailInput.classList.contains("is-invalid") && validateEmail(emailInput.value.trim())) {
      setError(emailInput);
    }
    clearStatus();
  });

  passwordInput.addEventListener("input", () => {
    if (passwordInput.classList.contains("is-invalid") && passwordInput.value.length >= 6) {
      setError(passwordInput);
    }
    clearStatus();
  });

  toggleBtn.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    toggleBtn.setAttribute("aria-pressed", String(isHidden));
    toggleBtn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
    toggleBtn.querySelector(".eye-open").hidden = isHidden;
    toggleBtn.querySelector(".eye-closed").hidden = !isHidden;
    passwordInput.focus();
  });

  // Demo credentials: any email + password length >= 6 is accepted as a stub.
  // Wire this up to a real backend by replacing fakeSignIn with a fetch().
  function fakeSignIn({ email, password }) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === "blocked@example.com") {
          reject(new Error("This account is currently locked."));
        } else {
          resolve({ email });
        }
      }, 700);
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearStatus();

    if (!validate()) {
      showStatus("Please fix the highlighted fields.", "error");
      return;
    }

    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Signing in…";

    try {
      const user = await fakeSignIn({
        email: emailInput.value.trim(),
        password: passwordInput.value,
      });
      showStatus(`Signed in as ${user.email}. Redirecting…`, "success");
    } catch (err) {
      showStatus(err.message || "Sign in failed. Please try again.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
})();