const shortenForm   = document.getElementById('shortenForm');
const urlInput      = document.getElementById('urlInput');
const submitBtn     = document.getElementById('submitBtn');
const btnText       = submitBtn.querySelector('.btn-text');
const btnSpinner    = submitBtn.querySelector('.btn-spinner');
const formError     = document.getElementById('formError');
const resultBox     = document.getElementById('resultBox');
const shortLinkAnchor = document.getElementById('shortLinkAnchor');
const copyBtn       = document.getElementById('copyBtn');
const copyLabel     = document.getElementById('copyLabel');
const refreshBtn    = document.getElementById('refreshBtn');
const emptyState    = document.getElementById('emptyState');
const linksTableWrapper = document.getElementById('linksTableWrapper');
const linksTableBody = document.getElementById('linksTableBody');
const toast         = document.getElementById('toast');

let toastTimer;

// ── Toast ─────────────────────────────────────────────────
function showToast(msg, color = '#22c55e') {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.style.background = color;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ── Form submit ───────────────────────────────────────────
shortenForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = urlInput.value.trim();

  formError.hidden = true;
  setLoading(true);

  try {
    const res = await fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();

    if (!res.ok) {
      showFormError(data.error || 'Something went wrong.');
      return;
    }

    // Show result
    shortLinkAnchor.href = data.shortUrl;
    shortLinkAnchor.textContent = data.shortUrl;
    resultBox.hidden = false;
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Reset copy button
    copyLabel.textContent = 'Copy';
    copyBtn.classList.remove('copied');

    // Refresh links list
    loadLinks();
  } catch {
    showFormError('Network error. Please try again.');
  } finally {
    setLoading(false);
  }
});

// ── Copy button ───────────────────────────────────────────
copyBtn.addEventListener('click', async () => {
  const url = shortLinkAnchor.href;
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = url;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  copyLabel.textContent = 'Copied!';
  copyBtn.classList.add('copied');
  showToast('Link copied to clipboard!');
  setTimeout(() => {
    copyLabel.textContent = 'Copy';
    copyBtn.classList.remove('copied');
  }, 2000);
});

// ── Refresh ───────────────────────────────────────────────
refreshBtn.addEventListener('click', loadLinks);

// ── Load links ────────────────────────────────────────────
async function loadLinks() {
  try {
    const res = await fetch('/api/links');
    const links = await res.json();
    renderLinks(links);
  } catch {
    // silently fail on refresh
  }
}

function renderLinks(links) {
  if (!links.length) {
    emptyState.hidden = false;
    linksTableWrapper.hidden = true;
    return;
  }

  emptyState.hidden = true;
  linksTableWrapper.hidden = false;
  linksTableBody.innerHTML = '';

  links.forEach(({ code, originalUrl, clicks, createdAt }) => {
    const shortUrl = `${location.origin}/${code}`;
    const date = new Date(createdAt).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
    });

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="short-cell"><a href="${shortUrl}" target="_blank">${shortUrl}</a></td>
      <td class="orig-cell" title="${escHtml(originalUrl)}">${escHtml(originalUrl)}</td>
      <td><span class="badge">${clicks}</span></td>
      <td class="date-cell">${date}</td>
      <td>
        <button class="del-btn" data-code="${escHtml(code)}" title="Delete">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </td>
    `;
    linksTableBody.appendChild(tr);
  });

  // Delete handlers
  linksTableBody.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteLink(btn.dataset.code));
  });
}

async function deleteLink(code) {
  try {
    const res = await fetch(`/api/links/${code}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Link deleted.', '#ff5f5f');
      loadLinks();
      // Hide result box if it showed the deleted link
      if (shortLinkAnchor.href.includes(code)) {
        resultBox.hidden = true;
      }
    }
  } catch {
    showToast('Failed to delete.', '#ff5f5f');
  }
}

// ── Helpers ───────────────────────────────────────────────
function setLoading(on) {
  submitBtn.disabled = on;
  btnText.hidden = on;
  btnSpinner.hidden = !on;
}

function showFormError(msg) {
  formError.textContent = msg;
  formError.hidden = false;
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Init ──────────────────────────────────────────────────
loadLinks();
