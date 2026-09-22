const form = document.getElementById('shortenForm');
const urlInput = document.getElementById('urlInput');
const resultContainer = document.getElementById('resultContainer');
const errorContainer = document.getElementById('errorContainer');
const errorMessage = document.getElementById('errorMessage');
const shortUrlDisplay = document.getElementById('shortUrlDisplay');
const originalUrlDisplay = document.getElementById('originalUrlDisplay');
const copyBtn = document.getElementById('copyBtn');
const urlsList = document.getElementById('urlsList');

// Form submission
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

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to shorten URL');
    }

    const data = await response.json();
    showResult(data.shortUrl, data.originalUrl);
    urlInput.value = '';
    loadUrls();
  } catch (error) {
    showError(error.message);
  }
});

// Copy to clipboard
copyBtn.addEventListener('click', async () => {
  try {
    const textToCopy = shortUrlDisplay.value;
    if (!textToCopy) {
      showError('No URL to copy');
      return;
    }
    
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(textToCopy);
    } else {
      // Fallback for non-secure contexts or older browsers
      shortUrlDisplay.select();
      document.execCommand('copy');
    }
    
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✓ Copied!';
    copyBtn.classList.add('success');
    
    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.classList.remove('success');
    }, 2000);
  } catch (error) {
    console.error('Copy error:', error);
    showError('Failed to copy to clipboard');
  }
});

function showResult(shortUrl, originalUrl) {
  shortUrlDisplay.value = shortUrl;
  originalUrlDisplay.textContent = originalUrl;
  resultContainer.classList.remove('hidden');
  errorContainer.classList.add('hidden');
}

function showError(message) {
  errorMessage.textContent = message;
  errorContainer.classList.remove('hidden');
  resultContainer.classList.add('hidden');
}

function hideError() {
  errorContainer.classList.add('hidden');
}

async function loadUrls() {
  try {
    const response = await fetch('/api/urls');
    if (!response.ok) throw new Error('Failed to load URLs');

    const urls = await response.json();

    if (urls.length === 0) {
      urlsList.innerHTML = '<p class="empty-state">No links created yet</p>';
      return;
    }

    urlsList.innerHTML = urls
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(item => {
        const createdDate = new Date(item.createdAt).toLocaleDateString();
        return `
          <div class="url-item" data-short-code="${item.shortCode}">
            <div class="url-item-header">
              <span class="short-code-badge">${item.shortCode}</span>
            </div>
            <div class="url-item-url">${escapeHtml(item.originalUrl)}</div>
            <div class="url-item-footer">
              <span class="clicks-badge">📊 ${item.clicks} ${item.clicks === 1 ? 'click' : 'clicks'}</span>
              <span>${createdDate}</span>
            </div>
          </div>
        `;
      })
      .join('');
  } catch (error) {
    console.error('Error loading URLs:', error);
  }
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Load URLs on page load
loadUrls();

// Auto-hide errors when user starts typing
urlInput.addEventListener('input', () => {
  if (errorContainer && !errorContainer.classList.contains('hidden')) {
    hideError();
  }
});

// Refresh URL list when user returns from a redirect
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    loadUrls();
  }
});

// Also refresh periodically to catch click count updates
setInterval(loadUrls, 5000);
