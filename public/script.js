const urlInput = document.getElementById('urlInput');
const shortenBtn = document.getElementById('shortenBtn');
const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error');
const shortUrlLink = document.getElementById('shortUrlLink');
const copyBtn = document.getElementById('copyBtn');
const testRedirectBtn = document.getElementById('testRedirectBtn');
const originalUrlSpan = document.getElementById('originalUrl');

// Shorten URL on button click
shortenBtn.addEventListener('click', handleShorten);

// Shorten URL on Enter key
urlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleShorten();
  }
});

// Copy to clipboard
copyBtn.addEventListener('click', () => {
  const shortUrl = shortUrlLink.textContent;
  navigator.clipboard.writeText(shortUrl).then(() => {
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 2000);
  });
});

// Test redirect button
testRedirectBtn.addEventListener('click', () => {
  // Navigate to the short URL which will trigger the redirect
  window.location.href = shortUrlLink.href;
});

async function handleShorten() {
  const url = urlInput.value.trim();

  // Clear previous errors
  errorDiv.style.display = 'none';
  resultDiv.style.display = 'none';

  if (!url) {
    showError('Please enter a URL');
    return;
  }

  // Disable button during request
  shortenBtn.disabled = true;
  shortenBtn.textContent = 'Shortening...';

  try {
    const response = await fetch('/api/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.error || 'Failed to shorten URL');
      return;
    }

    // Display result
    shortUrlLink.href = data.shortUrl;
    shortUrlLink.textContent = data.shortUrl;
    originalUrlSpan.textContent = data.originalUrl;
    resultDiv.style.display = 'block';
    urlInput.value = '';
  } catch (err) {
    showError('Network error: ' + err.message);
  } finally {
    shortenBtn.disabled = false;
    shortenBtn.textContent = 'Shorten URL';
  }
}

function showError(message) {
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}
