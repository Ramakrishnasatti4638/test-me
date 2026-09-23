(() => {
  const form       = document.getElementById('shorten-form');
  const urlInput   = document.getElementById('url-input');
  const submitBtn  = document.getElementById('submit-btn');
  const btnText    = submitBtn.querySelector('.btn-text');
  const btnSpinner = submitBtn.querySelector('.btn-spinner');

  const errorBanner   = document.getElementById('error-banner');
  const successBanner = document.getElementById('success-banner');

  const resultBox      = document.getElementById('result-box');
  const resultLink     = document.getElementById('result-link');
  const resultOriginal = document.getElementById('result-original');
  const copyBtn        = document.getElementById('copy-btn');
  const copyIcon       = document.getElementById('copy-icon');
  const checkIcon      = document.getElementById('check-icon');
  const copyText       = document.getElementById('copy-text');

  const historyCard   = document.getElementById('history-card');
  const urlTableBody  = document.getElementById('url-table-body');
  const clearBtn      = document.getElementById('clear-btn');

  // ── Helpers ──────────────────────────────────────────────
  function showError(msg) {
    errorBanner.textContent = msg;
    errorBanner.hidden = false;
    successBanner.hidden = true;
  }

  function clearBanners() {
    errorBanner.hidden = true;
    successBanner.hidden = true;
  }

  function setLoading(on) {
    submitBtn.disabled = on;
    btnText.textContent = on ? 'Shortening…' : 'Shorten URL';
    btnSpinner.hidden = !on;
  }

  function timeAgo(isoString) {
    const diff = Date.now() - new Date(isoString).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  // ── Render history table ──────────────────────────────────
  function renderTable(urls) {
    if (!urls.length) {
      historyCard.hidden = true;
      return;
    }
    historyCard.hidden = false;
    urlTableBody.innerHTML = urls.map(u => `
      <tr>
        <td class="cell-short"><a href="${u.shortUrl}" target="_blank" rel="noopener noreferrer">${u.shortUrl}</a></td>
        <td class="cell-original" title="${u.originalUrl}">${u.originalUrl}</td>
        <td class="cell-clicks">${u.clicks}</td>
        <td>${timeAgo(u.createdAt)}</td>
        <td class="cell-delete">
          <button data-code="${u.shortCode}" title="Delete">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </td>
      </tr>
    `).join('');
  }

  // ── Load URLs ─────────────────────────────────────────────
  async function loadUrls() {
    try {
      const res = await fetch('/api/urls');
      const data = await res.json();
      renderTable(data);
    } catch { /* silent */ }
  }

  // ── Submit form ───────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearBanners();
    resultBox.hidden = true;

    const url = urlInput.value.trim();
    if (!url) { showError('Please enter a URL.'); return; }

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

      // Show result
      resultLink.textContent = data.shortUrl;
      resultLink.href = data.shortUrl;
      resultOriginal.textContent = data.originalUrl;
      resultBox.hidden = false;

      // Reset copy button state
      copyIcon.hidden = false;
      checkIcon.hidden = true;
      copyText.textContent = 'Copy';

      urlInput.value = '';
      await loadUrls();

    } catch {
      showError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  });

  // ── Copy button ───────────────────────────────────────────
  copyBtn.addEventListener('click', async () => {
    const text = resultLink.textContent;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for non-secure contexts
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    copyIcon.hidden = true;
    checkIcon.hidden = false;
    copyText.textContent = 'Copied!';
    setTimeout(() => {
      copyIcon.hidden = false;
      checkIcon.hidden = true;
      copyText.textContent = 'Copy';
    }, 2000);
  });

  // ── Delete button (delegated) ─────────────────────────────
  urlTableBody.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-code]');
    if (!btn) return;
    const code = btn.dataset.code;
    try {
      await fetch(`/api/urls/${code}`, { method: 'DELETE' });
      await loadUrls();
      // If we just deleted the currently shown result, hide it
      if (resultLink.href.includes(`/${code}`)) {
        resultBox.hidden = true;
      }
    } catch { /* silent */ }
  });

  // ── Clear all ─────────────────────────────────────────────
  clearBtn.addEventListener('click', async () => {
    if (!confirm('Delete all shortened URLs?')) return;
    const res = await fetch('/api/urls');
    const urls = await res.json();
    await Promise.all(urls.map(u => fetch(`/api/urls/${u.shortCode}`, { method: 'DELETE' })));
    resultBox.hidden = true;
    await loadUrls();
  });

  // ── Handle ?error=not_found ───────────────────────────────
  const params = new URLSearchParams(window.location.search);
  if (params.get('error') === 'not_found') {
    showError('That short URL does not exist or has been deleted.');
    window.history.replaceState({}, '', '/');
  }

  // ── Init ──────────────────────────────────────────────────
  loadUrls();
})();
