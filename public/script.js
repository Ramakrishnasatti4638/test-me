const urlInput = document.getElementById('urlInput');
const shortenBtn = document.getElementById('shortenBtn');
const resultDiv = document.getElementById('result');
const shortUrlInput = document.getElementById('shortUrl');
const originalUrlP = document.getElementById('originalUrl');
const copyBtn = document.getElementById('copyBtn');
const urlList = document.getElementById('urlList');

// Load existing URLs on page load
window.addEventListener('load', loadUrls);

shortenBtn.addEventListener('click', shortenUrl);
urlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    shortenUrl();
  }
});

copyBtn.addEventListener('click', copyToClipboard);

async function shortenUrl() {
  const url = urlInput.value.trim();

  if (!url) {
    alert('Please enter a URL');
    return;
  }

  shortenBtn.disabled = true;
  shortenBtn.textContent = 'Shortening...';

  try {
    const response = await fetch('/api/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || 'Failed to shorten URL');
      return;
    }

    shortUrlInput.value = data.short_url;
    originalUrlP.textContent = data.original_url;
    resultDiv.classList.remove('hidden');

    urlInput.value = '';
    loadUrls();
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to shorten URL');
  } finally {
    shortenBtn.disabled = false;
    shortenBtn.textContent = 'Shorten URL';
  }
}

async function loadUrls() {
  try {
    const response = await fetch('/api/all');
    const urls = await response.json();

    if (!Array.isArray(urls) || urls.length === 0) {
      urlList.innerHTML = '<p class="empty-state">No URLs shortened yet</p>';
      return;
    }

    urlList.innerHTML = urls
      .map(
        (item) => `
      <div class="url-item">
        <div class="url-item-info">
          <div class="url-item-short">/${item.short_code}</div>
          <div class="url-item-original" title="${item.original_url}">
            ${item.original_url}
          </div>
          <div class="url-item-stats">
            ${item.clicks} ${item.clicks === 1 ? 'click' : 'clicks'} • ${new Date(item.created_at).toLocaleDateString()}
          </div>
        </div>
        <div class="url-item-action">
          <button class="btn-small" onclick="copyShortUrl('${item.short_code}')">
            📋 Copy
          </button>
        </div>
      </div>
    `
      )
      .join('');
  } catch (error) {
    console.error('Error loading URLs:', error);
  }
}

function copyToClipboard() {
  shortUrlInput.select();
  document.execCommand('copy');
  const originalText = copyBtn.textContent;
  copyBtn.textContent = '✓ Copied!';
  setTimeout(() => {
    copyBtn.textContent = originalText;
  }, 2000);
}

function copyShortUrl(shortCode) {
  const shortUrl = `${window.location.origin}/${shortCode}`;
  const input = document.createElement('input');
  input.value = shortUrl;
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);

  alert('Copied: ' + shortUrl);
}
