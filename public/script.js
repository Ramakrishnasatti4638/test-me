const longUrlInput = document.getElementById('longUrl');
const shortenBtn = document.getElementById('shortenBtn');
const resultContainer = document.getElementById('resultContainer');
const errorContainer = document.getElementById('errorContainer');
const errorMessage = document.getElementById('errorMessage');
const shortUrlInput = document.getElementById('shortUrl');
const originalUrlInput = document.getElementById('originalUrl');
const copyBtn = document.getElementById('copyBtn');
const urlList = document.getElementById('urlList');

// Initialize by loading existing URLs
loadUrls();

shortenBtn.addEventListener('click', shortenUrl);
longUrlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') shortenUrl();
});

copyBtn.addEventListener('click', copyToClipboard);

async function shortenUrl() {
  const longUrl = longUrlInput.value.trim();

  if (!longUrl) {
    showError('Please enter a URL');
    return;
  }

  try {
    const response = await fetch('/api/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ longUrl }),
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.error || 'Failed to shorten URL');
      return;
    }

    showResult(data.shortUrl, data.longUrl);
    longUrlInput.value = '';
    loadUrls();
  } catch (error) {
    showError('An error occurred. Please try again.');
  }
}

function showResult(shortUrl, longUrl) {
  shortUrlInput.value = shortUrl;
  originalUrlInput.value = longUrl;
  resultContainer.style.display = 'block';
  errorContainer.style.display = 'none';
}

function showError(message) {
  errorMessage.textContent = message;
  errorContainer.style.display = 'block';
  resultContainer.style.display = 'none';
}

function copyToClipboard() {
  shortUrlInput.select();
  document.execCommand('copy');

  copyBtn.textContent = '✓ Copied!';
  copyBtn.classList.add('copied');

  setTimeout(() => {
    copyBtn.textContent = 'Copy';
    copyBtn.classList.remove('copied');
  }, 2000);
}

async function loadUrls() {
  try {
    const response = await fetch('/api/urls');
    const urls = await response.json();

    if (urls.length === 0) {
      urlList.innerHTML = '<p class="empty-message">No URLs shortened yet</p>';
      return;
    }

    urlList.innerHTML = urls
      .reverse()
      .map(
        (url) => `
      <div class="url-item">
        <a href="${url.shortUrl}" class="url-item-short">🔗 ${url.shortUrl}</a>
        <div class="url-item-original">→ ${url.longUrl}</div>
      </div>
    `
      )
      .join('');
  } catch (error) {
    console.error('Failed to load URLs:', error);
  }
}
