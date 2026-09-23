const form = document.getElementById('shorten-form');
const urlInput = document.getElementById('url-input');
const submitBtn = document.getElementById('submit-btn');
const btnText = submitBtn.querySelector('.btn-text');
const btnSpinner = submitBtn.querySelector('.btn-spinner');
const formError = document.getElementById('form-error');

const resultCard = document.getElementById('result-card');
const resultLink = document.getElementById('result-link');
const resultOriginalUrl = document.getElementById('result-original-url');
const copyBtn = document.getElementById('copy-btn');
const copyIcon = document.getElementById('copy-icon');
const checkIcon = document.getElementById('check-icon');

const urlList = document.getElementById('url-list');
const emptyState = document.getElementById('empty-state');
const urlCount = document.getElementById('url-count');

// ── Helpers ──────────────────────────────────────────

function setLoading(loading) {
  submitBtn.disabled = loading;
  btnText.hidden = loading;
  btnSpinner.hidden = !loading;
}

function showError(msg) {
  formError.textContent = msg;
  formError.hidden = false;
}

function clearError() {
  formError.hidden = true;
  formError.textContent = '';
}

function shortUrl(code) {
  return `${location.origin}/${code}`;
}

function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Copy to clipboard ─────────────────────────────────

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}

function flashCopied(btn, iconOff, iconOn) {
  iconOff.hidden = true;
  iconOn.hidden = false;
  btn.style.background = '#dcfce7';
  btn.style.color = '#16a34a';
  setTimeout(() => {
    iconOff.hidden = false;
    iconOn.hidden = true;
    btn.style.background = '';
    btn.style.color = '';
  }, 2000);
}

// ── Render URL list ───────────────────────────────────

function renderList(urls) {
  urlCount.textContent = urls.length;

  // Remove existing url-item rows (keep empty-state in DOM)
  urlList.querySelectorAll('.url-item').forEach(el => el.remove());

  if (urls.length === 0) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  urls.forEach(item => {
    const short = shortUrl(item.shortCode);
    const div = document.createElement('div');
    div.className = 'url-item';
    div.dataset.code = item.shortCode;
    div.innerHTML = `
      <div class="url-item-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      </div>
      <div class="url-item-body">
        <a class="url-item-short" href="${short}" target="_blank" rel="noopener noreferrer">${short}</a>
        <div class="url-item-original" title="${escapeHtml(item.originalUrl)}">${escapeHtml(item.originalUrl)}</div>
        <div class="url-item-meta">
          <span class="meta-clicks">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            ${item.clicks} click${item.clicks !== 1 ? 's' : ''}
          </span>
          <span>${timeAgo(item.createdAt)}</span>
        </div>
      </div>
      <div class="url-item-actions">
        <button class="action-btn copy-item-btn" title="Copy short URL" data-url="${short}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
        <button class="action-btn delete delete-btn" title="Delete" data-code="${item.shortCode}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>
    `;
    urlList.appendChild(div);
  });

  // Copy buttons in list
  urlList.querySelectorAll('.copy-item-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await copyToClipboard(btn.dataset.url);
      const origContent = btn.innerHTML;
      btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
      btn.style.background = '#dcfce7';
      setTimeout(() => {
        btn.innerHTML = origContent;
        btn.style.background = '';
      }, 2000);
    });
  });

  // Delete buttons
  urlList.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteUrl(btn.dataset.code));
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── API calls ─────────────────────────────────────────

async function loadUrls() {
  try {
    const res = await fetch('/api/urls');
    const data = await res.json();
    renderList(data);
  } catch {
    // silent fail
  }
}

async function deleteUrl(code) {
  try {
    await fetch(`/api/urls/${code}`, { method: 'DELETE' });
    // Remove result card if it's showing the deleted URL
    if (resultLink.href.includes(code)) {
      resultCard.hidden = true;
    }
    loadUrls();
  } catch {
    // silent fail
  }
}

// ── Form submit ───────────────────────────────────────

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError();

  const url = urlInput.value.trim();
  if (!url) return;

  setLoading(true);

  try {
    const res = await fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'Something went wrong.');
      return;
    }

    const short = shortUrl(data.shortCode);

    // Show result
    resultLink.href = short;
    resultLink.textContent = short;
    resultOriginalUrl.textContent = data.originalUrl;
    resultCard.hidden = false;

    urlInput.value = '';
    loadUrls();
  } catch {
    showError('Network error. Please try again.');
  } finally {
    setLoading(false);
  }
});

// ── Copy result URL ───────────────────────────────────

copyBtn.addEventListener('click', async () => {
  await copyToClipboard(resultLink.href);
  flashCopied(copyBtn, copyIcon, checkIcon);
});

// ── Init ──────────────────────────────────────────────
loadUrls();
