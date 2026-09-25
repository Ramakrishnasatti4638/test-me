(function () {
  'use strict';

  const form = document.getElementById('shorten-form');
  const urlInput = document.getElementById('url');
  const slugInput = document.getElementById('slug');
  const errorEl = document.getElementById('error');

  const resultEl = document.getElementById('result');
  const resultLink = document.getElementById('result-link');
  const resultOriginal = document.getElementById('result-original');
  const copyBtn = document.getElementById('copy-btn');
  const visitBtn = document.getElementById('visit-btn');

  const refreshBtn = document.getElementById('refresh-btn');
  const tableEl = document.getElementById('links-table');
  const tbody = document.getElementById('links-body');
  const emptyEl = document.getElementById('links-empty');

  // --- Helpers ----------------------------------------------------------------
  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = !msg;
  }

  function fmtDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso || '';
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[c]));
  }

  // --- Shorten ----------------------------------------------------------------
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showError('');

    const url = urlInput.value.trim();
    const slug = slugInput.value.trim();

    if (!url) {
      showError('Please enter a URL.');
      return;
    }

    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, slug: slug || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        showError(data.error || 'Something went wrong.');
        return;
      }
      showResult(data);
      loadLinks();
    } catch (err) {
      showError('Network error. Please try again.');
    }
  });

  function showResult(data) {
    resultLink.href = data.shortUrl;
    resultLink.textContent = data.shortUrl;
    resultOriginal.textContent = data.url;
    resultOriginal.title = data.url;
    resultEl.hidden = false;
    visitBtn.dataset.url = data.shortUrl;
  }

  copyBtn.addEventListener('click', async () => {
    const text = resultLink.href;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      const original = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = original), 1500);
    } catch {
      // Fallback: select the text
      const range = document.createRange();
      range.selectNode(resultLink);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  });

  visitBtn.addEventListener('click', () => {
    if (visitBtn.dataset.url) window.open(visitBtn.dataset.url, '_blank', 'noopener');
  });

  // --- List -------------------------------------------------------------------
  refreshBtn.addEventListener('click', loadLinks);

  async function loadLinks() {
    try {
      const res = await fetch('/api/links');
      const data = await res.json();
      renderLinks(data.links || []);
    } catch {
      // Show empty state on failure
      renderLinks([]);
    }
  }

  function renderLinks(list) {
    tbody.innerHTML = '';
    if (!list.length) {
      tableEl.hidden = true;
      emptyEl.hidden = false;
      return;
    }
    tableEl.hidden = false;
    emptyEl.hidden = true;

    for (const item of list) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <a href="${escapeHtml(item.shortUrl)}" target="_blank" rel="noopener">/${escapeHtml(item.code)}</a>
        </td>
        <td><span class="col-dest" title="${escapeHtml(item.url)}">${escapeHtml(item.url)}</span></td>
        <td>${escapeHtml(fmtDate(item.createdAt))}</td>
        <td><span class="clicks">${item.clicks}</span></td>
        <td style="text-align:right">
          <button class="btn ghost copy-row" data-url="${escapeHtml(item.shortUrl)}">Copy</button>
          <button class="btn danger delete-row" data-code="${escapeHtml(item.code)}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    }

    tbody.querySelectorAll('.copy-row').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(btn.dataset.url);
          const orig = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(() => (btn.textContent = orig), 1200);
        } catch {
          /* ignore */
        }
      });
    });

    tbody.querySelectorAll('.delete-row').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm(`Delete /${btn.dataset.code}?`)) return;
        await fetch(`/api/links/${encodeURIComponent(btn.dataset.code)}`, { method: 'DELETE' });
        loadLinks();
      });
    });
  }

  // initial load
  loadLinks();
})();
