const form       = document.getElementById('shortenForm');
const urlInput   = document.getElementById('urlInput');
const shortenBtn = document.getElementById('shortenBtn');
const btnText    = shortenBtn.querySelector('.btn-text');
const btnLoader  = shortenBtn.querySelector('.btn-loader');
const errorMsg   = document.getElementById('errorMsg');
const resultBox  = document.getElementById('result');
const resultLink = document.getElementById('resultLink');
const copyBtn    = document.getElementById('copyBtn');
const copyIcon   = document.getElementById('copyIcon');
const historyBody= document.getElementById('historyBody');
const emptyRow   = document.getElementById('emptyRow');

let currentShortUrl = '';

// ── Shorten ────────────────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = urlInput.value.trim();

  setError('');
  setLoading(true);
  resultBox.classList.add('hidden');

  try {
    const res = await fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Something went wrong.');
    } else {
      currentShortUrl = data.shortUrl;
      resultLink.href = currentShortUrl;
      resultLink.textContent = currentShortUrl;
      resultBox.classList.remove('hidden');
      resetCopyBtn();
      loadHistory();
    }
  } catch {
    setError('Network error — please try again.');
  } finally {
    setLoading(false);
  }
});

// ── Copy ───────────────────────────────────────────────────
copyBtn.addEventListener('click', () => {
  if (!currentShortUrl) return;
  navigator.clipboard.writeText(currentShortUrl).then(() => {
    copyIcon.textContent = '✅';
    setTimeout(resetCopyBtn, 2000);
  });
});

function resetCopyBtn() {
  copyIcon.textContent = '📋';
}

// ── Load History ───────────────────────────────────────────
async function loadHistory() {
  try {
    const res = await fetch('/api/urls');
    const list = await res.json();

    if (list.length === 0) {
      emptyRow.classList.remove('hidden');
      // Remove all rows except empty
      [...historyBody.querySelectorAll('tr:not(#emptyRow)')].forEach(r => r.remove());
      return;
    }

    emptyRow.classList.add('hidden');

    // Re-render rows
    [...historyBody.querySelectorAll('tr:not(#emptyRow)')].forEach(r => r.remove());

    list.forEach(({ id, url, clicks, createdAt }) => {
      const shortUrl = `${location.origin}/${id}`;
      const date = new Date(createdAt).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
      });

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><a class="short-link" href="${escHtml(shortUrl)}" target="_blank" rel="noopener noreferrer">${escHtml(shortUrl)}</a></td>
        <td><span class="orig-url" title="${escHtml(url)}">${escHtml(url)}</span></td>
        <td><span class="clicks-badge">${clicks}</span></td>
        <td>${escHtml(date)}</td>
      `;
      historyBody.appendChild(tr);
    });
  } catch {
    // Silently ignore history errors
  }
}

// ── Helpers ────────────────────────────────────────────────
function setError(msg) {
  if (msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove('hidden');
  } else {
    errorMsg.classList.add('hidden');
  }
}

function setLoading(loading) {
  shortenBtn.disabled = loading;
  btnText.classList.toggle('hidden', loading);
  btnLoader.classList.toggle('hidden', !loading);
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Initial load
loadHistory();
