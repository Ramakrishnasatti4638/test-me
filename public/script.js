const form = document.getElementById('shorten-form');
const input = document.getElementById('url-input');
const submitBtn = document.getElementById('submit-btn');
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
  if (!url) {
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Shortening…';

  try {
    const response = await fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong.');
    }
    showResult(data.shortUrl);
  } catch (err) {
    showError(err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Shorten';
  }
});

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(shortLink.textContent);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = 'Copy';
    }, 1500);
  } catch (err) {
    // Clipboard API unavailable; select the link instead.
    window.getSelection().selectAllChildren(shortLink);
  }
});
