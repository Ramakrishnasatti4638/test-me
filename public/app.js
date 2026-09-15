/* ── SnipURL — frontend logic ─────────────────────── */

const form       = document.getElementById('shorten-form');
const urlInput   = document.getElementById('url-input');
const shortenBtn = document.getElementById('shorten-btn');
const btnText    = shortenBtn.querySelector('.btn-text');
const btnLoader  = shortenBtn.querySelector('.btn-loader');
const formError  = document.getElementById('form-error');

const resultCard    = document.getElementById('result-card');
const resultLink    = document.getElementById('result-link');
const resultOriginal = document.getElementById('result-original');
const copyBtn       = document.getElementById('copy-btn');
const copyIcon      = document.getElementById('copy-icon');
const checkIcon     = document.getElementById('check-icon');

const linksTable  = document.getElementById('links-table');
const linksTbody  = document.getElementById('links-tbody');
const linksEmpty  = document.getElementById('links-empty');
const refreshBtn  = document.getElementById('refresh-btn');

// ── Shorten form submit ────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  const url = urlInput.value.trim();

  try {
    const res  = await fetch('/api/shorten', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ url }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Something went wrong.');
      return;
    }

    // Show result card
    resultLink.href        = data.shortUrl;
    resultLink.textContent = data.shortUrl;
    resultOriginal.textContent = url;
    resultCard.classList.remove('hidden');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Reset copy button state
    resetCopyBtn();

    // Refresh table
    loadLinks();
  } catch {
    setError('Network error — please try again.');
  } finally {
    setLoading(false);
  }
});

// ── Copy button ────────────────────────────────────
copyBtn.addEventListener('click', async () => {
  const url = resultLink.textContent;
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = url;
    ta.style.position = 'fixed';
    ta.style.opacity  = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }

  copyBtn.classList.add('copied');
  copyIcon.classList.add('hidden');
  checkIcon.classList.remove('hidden');

  setTimeout(resetCopyBtn, 2000);
});

function resetCopyBtn() {
  copyBtn.classList.remove('copied');
  copyIcon.classList.remove('hidden');
  checkIcon.classList.add('hidden');
}

// ── Load & render links table ──────────────────────
refreshBtn.addEventListener('click', loadLinks);

async function loadLinks() {
  try {
    const res   = await fetch('/api/links');
    const links = await res.json();

    linksTbody.innerHTML = '';

    if (!links.length) {
      linksTable.classList.add('hidden');
      linksEmpty.classList.remove('hidden');
      return;
    }

    linksEmpty.classList.add('hidden');
    linksTable.classList.remove('hidden');

    links.forEach((link) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="td-short"><a href="${esc(link.shortUrl)}" target="_blank" rel="noopener noreferrer">${esc(link.shortUrl)}</a></td>
        <td class="td-original" title="${esc(link.url)}">${esc(link.url)}</td>
        <td class="td-clicks"><span class="badge">${link.clicks}</span></td>
        <td class="td-date">${formatDate(link.createdAt)}</td>
        <td>
          <button class="delete-btn" data-code="${esc(link.shortCode)}" title="Delete">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </td>`;
      linksTbody.appendChild(tr);
    });

    // Delete handlers
    linksTbody.querySelectorAll('.delete-btn').forEach((btn) => {
      btn.addEventListener('click', () => deleteLink(btn.dataset.code));
    });
  } catch {
    console.error('Failed to load links.');
  }
}

async function deleteLink(code) {
  if (!confirm('Delete this short link?')) return;
  try {
    await fetch(`/api/links/${code}`, { method: 'DELETE' });

    // If the deleted link is the currently shown result, hide it
    if (resultLink.href.endsWith('/' + code)) {
      resultCard.classList.add('hidden');
    }

    loadLinks();
  } catch {
    alert('Could not delete the link. Please try again.');
  }
}

// ── Helpers ────────────────────────────────────────
function setLoading(on) {
  shortenBtn.disabled = on;
  btnText.classList.toggle('hidden', on);
  btnLoader.classList.toggle('hidden', !on);
}

function setError(msg) {
  formError.textContent = msg;
  formError.classList.toggle('hidden', !msg);
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Init ───────────────────────────────────────────
loadLinks();
