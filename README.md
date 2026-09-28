# Login Page

A simple, accessible login page built with plain HTML, CSS, and JavaScript.

## Files

- `index.html` — markup and form structure
- `styles.css` — styling (mobile-friendly, modern look)
- `script.js` — client-side validation, password show/hide, mock sign-in

## Features

- Email + password fields with live validation
- Show / hide password toggle
- Remember me checkbox + forgot password link
- Mock `fakeSignIn()` function in `script.js` that simulates a network call —
  replace it with a real `fetch()` to your auth backend
- Keyboard-accessible, responsive, no external dependencies

## Demo credentials

Any email matching `name@example.com` and any password with 6+ characters is
accepted. The address `blocked@example.com` is hard-coded to fail, to
demonstrate the error state.
