const urlInput = document.getElementById('urlInput');
const shortenBtn = document.getElementById('shortenBtn');
const errorDiv = document.getElementById('error');
const resultSection = document.getElementById('resultSection');
const shortUrlOutput = document.getElementById('shortUrlOutput');
const originalUrlOutput = document.getElementById('originalUrlOutput');
const clicksOutput = document.getElementById('clicksOutput');
const copyBtn = document.getElementById('copyBtn');
const urlsList = document.getElementById('urlsList');

// Shorten URL
shortenBtn.addEventListener('click', async () => {
  const url = urlInput.value.trim();
  errorDiv.classList.remove('show');
  errorDiv.textContent = '';

  if (!url) {
    showError('Please enter a URL');
    return;
  }

  try {
    const response = await fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.error || 'Failed to shorten URL');
      return;
    }

    shortUrlOutput.value = data.short_url;
    originalUrlOutput.value = data.original_url;
    clicksOutput.value = '0';
    resultSection.classList.remove('hidden');
    urlInput.value = '';
    loadUrls();
  } catch (err) {
    showError('Error: ' + err.message);
  }
});

// Copy button
copyBtn.addEventListener('click', () => {
  shortUrlOutput.select();
  document.execCommand('copy');
  copyBtn.textContent = '✓ Copied!';
  copyBtn.classList.add('copied');
  setTimeout(() => {
    copyBtn.textContent = 'Copy';
    copyBtn.classList.remove('copied');
  }, 2000);
});

// Load all URLs
async function loadUrls() {
  try {
    const response = await fetch('/api/urls/list');
    const urls = await response.json();

    if (urls.length === 0) {
      urlsList.innerHTML = '<p class="empty-state">No URLs yet. Create one to get started!</p>';
      return;
    }

    urlsList.innerHTML = urls
      .map(
        (item) => `
      <div class="url-item">
        <div class="url-info">
          <div class="url-short">${item.short_code}</div>
          <div class="url-original" title="${item.original_url}">${item.original_url}</div>
          <div class="url-meta">
            Clicks: <strong>${item.clicks}</strong> | Created: <strong>${new Date(item.created_at).toLocaleDateString()}</strong>
          </div>
        </div>
        <div class="url-actions">
          <button class="copy-link-btn" onclick="copyToClipboard('${item.short_code}', this)">Copy Link</button>
        </div>
      </div>
    `
      )
      .join('');
  } catch (err) {
    console.error('Error loading URLs:', err);
  }
}

function showError(message) {
  errorDiv.textContent = message;
  errorDiv.classList.add('show');
}

function copyToClipboard(shortCode, btn) {
  const shortUrl = `http://localhost:3000/${shortCode}`;
  navigator.clipboard.writeText(shortUrl).then(() => {
    btn.textContent = '✓ Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Copy Link';
      btn.classList.remove('copied');
    }, 2000);
  });
}

// Allow Enter key to shorten
urlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    shortenBtn.click();
  }
});

// Load URLs on page load
loadUrls();
