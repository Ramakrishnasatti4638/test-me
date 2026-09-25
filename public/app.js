const urlInput = document.getElementById('urlInput');
const shortenBtn = document.getElementById('shortenBtn');
const resultDiv = document.getElementById('result');
const errorMsg = document.getElementById('errorMsg');
const originalUrlDiv = document.getElementById('originalUrl');
const shortenedUrlDiv = document.getElementById('shortenedUrl');
const copyBtn = document.getElementById('copyBtn');
const urlList = document.getElementById('urlList');

let allUrls = [];

// Load URLs on page load
document.addEventListener('DOMContentLoaded', () => {
  loadAllUrls();
  urlInput.focus();
});

// Shorten URL on button click
shortenBtn.addEventListener('click', shortenUrl);

// Shorten URL on Enter key
urlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    shortenUrl();
  }
});

// Copy to clipboard
copyBtn.addEventListener('click', () => {
  const shortUrl = shortenedUrlDiv.textContent;
  navigator.clipboard.writeText(shortUrl).then(() => {
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✓ Copied!';
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 2000);
  });
});

// Click on shortened URL to open it
shortenedUrlDiv.addEventListener('click', () => {
  const shortUrl = shortenedUrlDiv.textContent;
  window.open(shortUrl, '_blank');
});

async function shortenUrl() {
  const longUrl = urlInput.value.trim();

  // Clear previous messages
  hideError();
  resultDiv.classList.add('hidden');

  if (!longUrl) {
    showError('Please enter a URL');
    return;
  }

  try {
    shortenBtn.disabled = true;
    shortenBtn.textContent = 'Shortening...';

    const response = await fetch('/api/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ longUrl })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to shorten URL');
    }

    const data = await response.json();

    // Display result
    originalUrlDiv.textContent = data.longUrl;
    shortenedUrlDiv.textContent = data.shortUrl;
    resultDiv.classList.remove('hidden');

    // Clear input
    urlInput.value = '';

    // Reload URLs list
    await loadAllUrls();
  } catch (error) {
    showError(error.message);
  } finally {
    shortenBtn.disabled = false;
    shortenBtn.textContent = 'Shorten URL';
  }
}

async function loadAllUrls() {
  try {
    const response = await fetch('/api/all');
    if (!response.ok) throw new Error('Failed to load URLs');

    allUrls = await response.json();
    displayUrls();
  } catch (error) {
    console.error('Error loading URLs:', error);
  }
}

function displayUrls() {
  if (allUrls.length === 0) {
    urlList.innerHTML = '<p class="placeholder">No URLs shortened yet</p>';
    return;
  }

  urlList.innerHTML = allUrls
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(
      (url) => `
    <div class="url-item">
      <div class="url-item-row">
        <span class="url-item-short">${url.shortUrl}</span>
      </div>
      <div class="url-item-long">🔗 ${url.longUrl}</div>
      <div class="url-item-meta">
        <span>Clicks: ${url.clicks}</span>
        <span>Created: ${new Date(url.createdAt).toLocaleString()}</span>
      </div>
    </div>
  `
    )
    .join('');
}

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.remove('hidden');
}

function hideError() {
  errorMsg.classList.add('hidden');
}
