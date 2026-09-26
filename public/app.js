// Client-side interactions
const shortenForm = document.getElementById('shortenForm');
const urlInput = document.getElementById('urlInput');
const titleInput = document.getElementById('titleInput');
const customCodeInput = document.getElementById('customCodeInput');
const submitBtn = document.getElementById('submitBtn');
const alertBox = document.getElementById('alertBox');
const resultBox = document.getElementById('resultBox');
const shortUrlDisplay = document.getElementById('shortUrlDisplay');
const copyBtn = document.getElementById('copyBtn');
const visitBtn = document.getElementById('visitBtn');
const qrCodeImg = document.getElementById('qrCodeImg');
const downloadQrBtn = document.getElementById('downloadQrBtn');
const resultOriginalUrl = document.getElementById('resultOriginalUrl');
const urlTableBody = document.getElementById('urlTableBody');
const refreshBtn = document.getElementById('refreshBtn');
const totalLinksCount = document.getElementById('totalLinksCount');
const totalClicksCount = document.getElementById('totalClicksCount');

// Modal elements
const statsModal = document.getElementById('statsModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalTitle = document.getElementById('modalTitle');
const modalShortUrl = document.getElementById('modalShortUrl');
const modalDestUrl = document.getElementById('modalDestUrl');
const modalClickCount = document.getElementById('modalClickCount');
const modalLogsBody = document.getElementById('modalLogsBody');

function showAlert(message, type = 'error') {
  alertBox.className = `alert alert-${type}`;
  alertBox.textContent = message;
  alertBox.classList.remove('hidden');
}

function hideAlert() {
  alertBox.classList.add('hidden');
  alertBox.textContent = '';
}

// Format relative date or ISO
function formatDate(dateStr) {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr + (dateStr.endsWith('Z') ? '' : 'Z'));
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Load URLs list & overview metrics
async function loadUrls() {
  try {
    const res = await fetch('/api/urls');
    if (!res.ok) throw new Error('Failed to fetch URLs');
    const data = await res.json();
    renderUrls(data.urls || []);
  } catch (err) {
    console.error(err);
    urlTableBody.innerHTML = `<tr><td colspan="5" class="empty-state">Error loading links. Please refresh.</td></tr>`;
  }
}

function renderUrls(urls) {
  totalLinksCount.textContent = urls.length;
  const totalClicks = urls.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  totalClicksCount.textContent = totalClicks;

  if (urls.length === 0) {
    urlTableBody.innerHTML = `<tr><td colspan="5" class="empty-state">No links shortened yet. Create your first link above!</td></tr>`;
    return;
  }

  urlTableBody.innerHTML = urls.map(u => `
    <tr>
      <td>
        <div class="link-title">${escapeHtml(u.title || 'Untitled Link')}</div>
        <a href="${u.shortUrl}" target="_blank" class="short-link-badge">${escapeHtml(u.shortUrl)}</a>
      </td>
      <td>
        <div class="text-truncate" title="${escapeHtml(u.original_url)}">
          ${escapeHtml(u.original_url)}
        </div>
      </td>
      <td>
        <span class="clicks-badge">${u.clicks || 0}</span>
      </td>
      <td style="color: var(--text-dim); font-size: 13px;">
        ${formatDate(u.created_at)}
      </td>
      <td>
        <div class="action-btns">
          <button class="icon-btn" onclick="copyLink('${escapeHtml(u.shortUrl)}')" title="Copy link">📋</button>
          <button class="icon-btn" onclick="openStats('${escapeHtml(u.code)}')" title="View click stats">📊</button>
          <button class="icon-btn danger" onclick="deleteUrl('${escapeHtml(u.code)}')" title="Delete link">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Copy to clipboard helper
window.copyLink = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Copied link to clipboard: ' + text);
  }).catch(() => {
    prompt('Copy to clipboard: Ctrl+C, Enter', text);
  });
};

// Open stats modal
window.openStats = async function(code) {
  try {
    const res = await fetch(`/api/stats/${code}`);
    if (!res.ok) throw new Error('Failed to fetch link stats');
    const data = await res.json();

    modalTitle.textContent = data.title ? `Analytics: ${data.title}` : `Analytics: /${data.code}`;
    modalShortUrl.textContent = data.shortUrl;
    modalDestUrl.textContent = data.original_url;
    modalDestUrl.title = data.original_url;
    modalClickCount.textContent = data.clicks;

    if (data.recentClicks && data.recentClicks.length > 0) {
      modalLogsBody.innerHTML = data.recentClicks.map(c => `
        <tr>
          <td>${formatDate(c.accessed_at)}</td>
          <td class="text-truncate" title="${escapeHtml(c.referer || 'Direct')}">${escapeHtml(c.referer || 'Direct')}</td>
          <td class="text-truncate" title="${escapeHtml(c.user_agent || 'Unknown')}">${escapeHtml(c.user_agent || 'Unknown')}</td>
        </tr>
      `).join('');
    } else {
      modalLogsBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color: var(--text-dim);">No clicks recorded yet.</td></tr>`;
    }

    statsModal.classList.remove('hidden');
  } catch (err) {
    alert('Could not load statistics for this link.');
  }
};

// Delete URL
window.deleteUrl = async function(code) {
  if (!confirm(`Are you sure you want to delete short URL /${code}?`)) return;

  try {
    const res = await fetch(`/api/urls/${code}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    loadUrls();
  } catch (err) {
    alert('Failed to delete URL.');
  }
};

// Form submit: Create short URL
shortenForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlert();
  resultBox.classList.add('hidden');

  const url = urlInput.value.trim();
  const title = titleInput.value.trim();
  const customCode = customCodeInput.value.trim();

  if (!url) {
    showAlert('Please enter a destination URL.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.querySelector('.btn-text').textContent = 'Shortening...';

  try {
    const res = await fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, title, customCode })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to shorten link');
    }

    // Display result
    shortUrlDisplay.value = data.data.shortUrl;
    visitBtn.href = data.data.shortUrl;
    resultOriginalUrl.textContent = `Points to: ${data.data.original_url}`;
    qrCodeImg.src = data.data.qrCodeUrl;
    downloadQrBtn.href = data.data.qrCodeUrl;
    downloadQrBtn.download = `qr-${data.data.code}.png`;

    resultBox.classList.remove('hidden');
    showAlert('Link shortened successfully!', 'success');

    // Reset inputs
    urlInput.value = '';
    titleInput.value = '';
    customCodeInput.value = '';

    // Reload table
    loadUrls();
  } catch (err) {
    showAlert(err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.querySelector('.btn-text').textContent = 'Shorten URL';
  }
});

// Copy button in result box
copyBtn.addEventListener('click', () => {
  if (!shortUrlDisplay.value) return;
  navigator.clipboard.writeText(shortUrlDisplay.value).then(() => {
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '✅ Copied!';
    setTimeout(() => {
      copyBtn.innerHTML = originalText;
    }, 2000);
  });
});

// Modal close events
closeModalBtn.addEventListener('click', () => {
  statsModal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
  if (e.target === statsModal) {
    statsModal.classList.add('hidden');
  }
});

refreshBtn.addEventListener('click', loadUrls);

// Initialize
loadUrls();
