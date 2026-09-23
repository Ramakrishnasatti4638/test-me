const form = document.getElementById('shortenForm');
const urlInput = document.getElementById('urlInput');
const slugInput = document.getElementById('slugInput');
const submitBtn = document.getElementById('submitBtn');
const resultBox = document.getElementById('resultBox');
const resultLink = document.getElementById('resultLink');
const resultOriginal = document.getElementById('resultOriginal');
const copyBtn = document.getElementById('copyBtn');
const errorBox = document.getElementById('errorBox');
const errorMsg = document.getElementById('errorMsg');
const statsBody = document.getElementById('statsBody');
const refreshBtn = document.getElementById('refreshBtn');
const slugPrefix = document.getElementById('slugPrefix');

// Set slug prefix to current host
slugPrefix.textContent = window.location.host + '/';

// ===== Shorten Form =====
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAll();
  submitBtn.disabled = true;
  submitBtn.textContent = 'Shortening…';

  const url = urlInput.value.trim();
  const customSlug = slugInput.value.trim();

  try {
    const res = await fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, customSlug: customSlug || undefined })
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'Something went wrong.');
    } else {
      showResult(data);
      form.reset();
      loadStats();
    }
  } catch {
    showError('Could not connect to the server. Please try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
      Shorten URL`;
  }
});

function showResult({ shortUrl, originalUrl }) {
  resultLink.href = shortUrl;
  resultLink.textContent = shortUrl;
  resultOriginal.textContent = originalUrl.length > 80 ? originalUrl.slice(0, 80) + '…' : originalUrl;
  resultBox.classList.remove('hidden');
  copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy`;
  copyBtn.classList.remove('copied');
}

function showError(msg) {
  errorMsg.textContent = msg;
  errorBox.classList.remove('hidden');
}

function hideAll() {
  resultBox.classList.add('hidden');
  errorBox.classList.add('hidden');
}

// ===== Copy Button =====
copyBtn.addEventListener('click', () => {
  const text = resultLink.textContent;
  navigator.clipboard.writeText(text).then(() => {
    copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
    copyBtn.classList.add('copied');
    setTimeout(() => {
      copyBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy`;
      copyBtn.classList.remove('copied');
    }, 2000);
  });
});

// ===== Stats Table =====
async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    const urls = await res.json();
    renderStats(urls);
  } catch {
    // silently fail
  }
}

function renderStats(urls) {
  if (!urls.length) {
    statsBody.innerHTML = '<tr class="empty-row"><td colspan="5">No links yet. Create your first short URL above!</td></tr>';
    return;
  }

  statsBody.innerHTML = urls.map(({ slug, originalUrl, clicks, createdAt }) => {
    const shortUrl = `${window.location.origin}/${slug}`;
    const displayUrl = originalUrl.length > 45 ? originalUrl.slice(0, 45) + '…' : originalUrl;
    const date = new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    return `
      <tr>
        <td><a href="${shortUrl}" target="_blank" rel="noopener noreferrer">${shortUrl}</a></td>
        <td title="${escapeHtml(originalUrl)}">${escapeHtml(displayUrl)}</td>
        <td><span class="clicks-badge">↗ ${clicks}</span></td>
        <td>${date}</td>
        <td>
          <button class="btn-delete" data-slug="${escapeHtml(slug)}" title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </td>
      </tr>`;
  }).join('');

  // Attach delete handlers
  statsBody.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const slug = btn.dataset.slug;
      if (!confirm(`Delete short link "/${slug}"?`)) return;
      try {
        await fetch(`/api/${slug}`, { method: 'DELETE' });
        loadStats();
      } catch {
        alert('Failed to delete. Please try again.');
      }
    });
  });
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

refreshBtn.addEventListener('click', loadStats);

// Load stats on page load
loadStats();
