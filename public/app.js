// DOM Elements
const urlInput = document.getElementById('urlInput');
const shortenBtn = document.getElementById('shortenBtn');
const errorMessage = document.getElementById('errorMessage');
const resultsSection = document.getElementById('resultsSection');
const originalUrlDisplay = document.getElementById('originalUrl');
const shortUrlInput = document.getElementById('shortUrlInput');
const copyBtn = document.getElementById('copyBtn');
const newUrlBtn = document.getElementById('newUrlBtn');
const urlHistory = document.getElementById('urlHistory');
const emptyState = document.getElementById('emptyState');
const createdAtDisplay = document.getElementById('createdAt');
const clicksCountDisplay = document.getElementById('clicksCount');

// State
let allUrls = [];

// Event Listeners
shortenBtn.addEventListener('click', shortenUrl);
urlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') shortenUrl();
});
copyBtn.addEventListener('click', copyToClipboard);
newUrlBtn.addEventListener('click', resetForm);

// Initialize
loadUrls();

// Functions
async function shortenUrl() {
  clearError();
  const url = urlInput.value.trim();

  if (!url) {
    showError('Please enter a URL');
    return;
  }

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
      throw new Error(data.error || 'Failed to shorten URL');
    }

    displayResult(data);
    loadUrls();
  } catch (error) {
    showError(error.message);
  } finally {
    shortenBtn.disabled = false;
    shortenBtn.textContent = 'Shorten URL';
  }
}

function displayResult(data) {
  originalUrlDisplay.textContent = data.originalUrl;
  shortUrlInput.value = data.shortUrl;
  resultsSection.style.display = 'block';
  urlInput.value = '';

  // Scroll to results
  setTimeout(() => {
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);

  // Fetch and display stats
  updateStats(data.shortId);
}

async function updateStats(shortId) {
  try {
    const response = await fetch(`/api/stats/${shortId}`);
    const data = await response.json();

    if (response.ok) {
      createdAtDisplay.textContent = new Date(data.createdAt).toLocaleString();
      clicksCountDisplay.textContent = data.clicks;
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error);
  }
}

function copyToClipboard() {
  shortUrlInput.select();
  document.execCommand('copy');

  // Show notification
  showNotification('Copied to clipboard!');

  // Provide visual feedback
  const originalText = copyBtn.textContent;
  copyBtn.textContent = '✓ Copied';
  copyBtn.style.borderColor = '#10b981';
  copyBtn.style.color = '#10b981';

  setTimeout(() => {
    copyBtn.textContent = originalText;
    copyBtn.style.borderColor = '';
    copyBtn.style.color = '';
  }, 2000);
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'copy-notification';
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function resetForm() {
  urlInput.value = '';
  resultsSection.style.display = 'none';
  clearError();
  urlInput.focus();
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.color = '#ef4444';
}

function clearError() {
  errorMessage.textContent = '';
}

async function loadUrls() {
  try {
    const response = await fetch('/api/urls');
    allUrls = await response.json();
    renderHistory();
  } catch (error) {
    console.error('Failed to load URLs:', error);
  }
}

function renderHistory() {
  if (allUrls.length === 0) {
    urlHistory.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  urlHistory.style.display = 'flex';
  emptyState.style.display = 'none';
  urlHistory.innerHTML = '';

  allUrls.forEach((item) => {
    const urlItem = document.createElement('div');
    urlItem.className = 'url-item';
    urlItem.innerHTML = `
      <div class="url-item-content">
        <div class="url-item-short">${item.shortId}</div>
        <div class="url-item-original">${item.originalUrl}</div>
      </div>
      <div class="url-item-actions">
        <button class="btn btn-secondary" onclick="copyUrlToClipboard('${item.shortUrl}')">Copy Link</button>
        <button class="btn btn-secondary" onclick="openStats('${item.shortId}')">Stats</button>
      </div>
    `;
    urlHistory.appendChild(urlItem);
  });
}

function copyUrlToClipboard(url) {
  navigator.clipboard.writeText(url).then(() => {
    showNotification('Link copied to clipboard!');
  });
}

function openStats(shortId) {
  const item = allUrls.find(u => u.shortId === shortId);
  if (item) {
    urlInput.value = item.originalUrl;
    resultsSection.style.display = 'block';
    originalUrlDisplay.textContent = item.originalUrl;
    shortUrlInput.value = item.shortUrl;
    updateStats(shortId);
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// Auto-refresh stats periodically
setInterval(() => {
  if (shortUrlInput.value && resultsSection.style.display !== 'none') {
    const shortId = shortUrlInput.value.split('/s/')[1];
    if (shortId) {
      updateStats(shortId);
    }
  }
}, 5000);
