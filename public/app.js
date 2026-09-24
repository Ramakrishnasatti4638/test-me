'use strict';

const form = document.getElementById('shorten-form');
const input = document.getElementById('url-input');
const errorEl = document.getElementById('error');
const resultEl = document.getElementById('result');
const shortLink = document.getElementById('short-link');
const copyBtn = document.getElementById('copy-btn');

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
  resultEl.hidden = true;
}

function showResult(shortUrl) {
  errorEl.hidden = true;
  shortLink.textContent = shortUrl;
  shortLink.href = shortUrl;
  resultEl.hidden = false;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const url = input.value.trim();
  if (!url) return;

  try {
    const res = await fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (!res.ok) {
      showError(data.error || 'Something went wrong.');
      return;
    }
    showResult(data.shortUrl);
  } catch {
    showError('Network error. Please try again.');
  }
});

copyBtn.addEventListener('click', async () => {
  if (!shortLink.href) return;
  try {
    await navigator.clipboard.writeText(shortLink.textContent);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = 'Copy';
    }, 1500);
  } catch {
    /* clipboard not available */
  }
});
