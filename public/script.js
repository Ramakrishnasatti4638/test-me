const urlInput = document.getElementById('urlInput');
const shortenBtn = document.getElementById('shortenBtn');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const resultSection = document.getElementById('resultSection');
const shortUrlDisplay = document.getElementById('shortUrlDisplay');
const originalUrlDisplay = document.getElementById('originalUrlDisplay');
const copyBtn = document.getElementById('copyBtn');
const newUrlBtn = document.getElementById('newUrlBtn');
const clickCount = document.getElementById('clickCount');
const createdAt = document.getElementById('createdAt');
const historyList = document.getElementById('historyList');

let history = JSON.parse(localStorage.getItem('urlHistory')) || [];

function hideMessages() {
  errorMessage.classList.remove('show');
  successMessage.classList.remove('show');
}

function showError(msg) {
  hideMessages();
  errorMessage.textContent = msg;
  errorMessage.classList.add('show');
}

function showSuccess(msg) {
  hideMessages();
  successMessage.textContent = msg;
  successMessage.classList.add('show');
  setTimeout(() => successMessage.classList.remove('show'), 3000);
}

function updateResultDisplay(data) {
  shortUrlDisplay.value = data.shortUrl;
  originalUrlDisplay.value = data.originalUrl;
  clickCount.textContent = data.clicks || 0;
  createdAt.textContent = data.createdAt ? new Date(data.createdAt).toLocaleDateString() : '-';
  resultSection.classList.remove('hidden');
}

function addToHistory(shortId, originalUrl, shortUrl) {
  const item = {
    shortId,
    originalUrl,
    shortUrl,
    timestamp: new Date().toISOString()
  };

  history.unshift(item);
  history = history.slice(0, 10); // Keep only last 10
  localStorage.setItem('urlHistory', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = '';
  if (history.length === 0) {
    historyList.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No URLs shortened yet</p>';
    return;
  }

  history.forEach(item => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
      <div class="history-item-short">${item.shortId}</div>
      <div class="history-item-original">${item.originalUrl}</div>
    `;
    historyItem.addEventListener('click', async () => {
      try {
        const response = await fetch(`/api/stats/${item.shortId}`);
        if (response.ok) {
          const data = await response.json();
          shortUrlDisplay.value = item.shortUrl;
          originalUrlDisplay.value = data.originalUrl;
          clickCount.textContent = data.clicks;
          createdAt.textContent = new Date(data.createdAt).toLocaleDateString();
          resultSection.classList.remove('hidden');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    });
    historyList.appendChild(historyItem);
  });
}

async function shortenUrl() {
  const url = urlInput.value.trim();

  if (!url) {
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
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      const error = await response.json();
      showError(error.error || 'Failed to shorten URL');
      return;
    }

    const data = await response.json();
    updateResultDisplay(data);
    addToHistory(data.shortId, data.originalUrl, data.shortUrl);
    showSuccess('URL shortened successfully!');
    urlInput.value = '';
  } catch (error) {
    console.error('Error:', error);
    showError('An error occurred. Please try again.');
  } finally {
    shortenBtn.disabled = false;
    shortenBtn.textContent = 'Shorten';
  }
}

function copyToClipboard() {
  shortUrlDisplay.select();
  document.execCommand('copy');
  showSuccess('Copied to clipboard!');
}

function resetForm() {
  urlInput.value = '';
  resultSection.classList.add('hidden');
  hideMessages();
  urlInput.focus();
}

shortenBtn.addEventListener('click', shortenUrl);
urlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') shortenUrl();
});

copyBtn.addEventListener('click', copyToClipboard);
newUrlBtn.addEventListener('click', resetForm);

renderHistory();
urlInput.focus();
