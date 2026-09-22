const form = document.getElementById('shortenForm');
const urlInput = document.getElementById('urlInput');
const result = document.getElementById('result');
const error = document.getElementById('error');
const copyBtn = document.getElementById('copyBtn');
const historyList = document.getElementById('historyList');
const shortUrlElement = document.getElementById('shortUrl');

let urlHistory = [];

// Load history from localStorage
function loadHistory() {
  const saved = localStorage.getItem('urlHistory');
  if (saved) {
    urlHistory = JSON.parse(saved);
    renderHistory();
  }
}

// Save history to localStorage
function saveHistory() {
  localStorage.setItem('urlHistory', JSON.stringify(urlHistory));
}

// Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = urlInput.value.trim();

  if (!url) {
    showError('Please enter a URL');
    return;
  }

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

    displayResult(data);
    urlHistory.unshift(data);
    saveHistory();
    renderHistory();
    urlInput.value = '';
    hideError();
  } catch (err) {
    showError('An error occurred. Please try again.');
    console.error(err);
  }
});

// Display result
function displayResult(data) {
  document.getElementById('originalUrl').textContent = data.originalUrl;
  document.getElementById('shortUrl').textContent = data.shortUrl;
  document.getElementById('shortCode').textContent = data.shortCode;
  result.classList.remove('hidden');
}

// Show error message
function showError(message) {
  error.textContent = message;
  error.classList.remove('hidden');
}

// Hide error message
function hideError() {
  error.classList.add('hidden');
}

// Copy short URL to clipboard
copyBtn.addEventListener('click', () => {
  const shortUrl = document.getElementById('shortUrl').textContent;
  navigator.clipboard.writeText(shortUrl).then(() => {
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 2000);
  }).catch(() => {
    showError('Failed to copy to clipboard');
  });
});

// Render history list
function renderHistory() {
  if (urlHistory.length === 0) {
    historyList.innerHTML = '<p class="empty-message">No links created yet</p>';
    return;
  }

  historyList.innerHTML = urlHistory.map((item, index) => `
    <div class="history-item">
      <div class="history-item-content">
        <div class="history-item-original">📄 ${escapeHtml(item.originalUrl)}</div>
        <div class="history-item-short">🔗 ${item.shortUrl}</div>
      </div>
      <div class="history-item-stats">
        <span>Created: ${formatDate(new Date(item.createdAt))}</span>
      </div>
    </div>
  `).join('');
}

// Format date
function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Load history on page load
loadHistory();
