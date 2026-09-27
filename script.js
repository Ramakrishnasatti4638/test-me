const form = document.getElementById('loginForm');
const message = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  message.textContent = '';
  message.className = 'message';

  if (!email || !password) {
    message.textContent = 'Please fill in all fields.';
    message.classList.add('error');
    return;
  }

  // Simulate a login request
  message.textContent = 'Signing in…';
  message.className = 'message';

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Invalid credentials');
    }

    message.textContent = 'Login successful! Redirecting…';
    message.classList.add('success');
  } catch (err) {
    message.textContent = err.message || 'Something went wrong. Please try again.';
    message.classList.add('error');
  }
});