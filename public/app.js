'use strict';

(function () {
  const form = document.getElementById('shorten-form');
  const urlInput = document.getElementById('url');
  const codeInput = document.getElementById('code');
  const errorEl = document.getElementById('form-error');
  const resultSection = document.getElementById('result-section');
  const resultLink = document.getElementById('result-link');
  const resultTarget = document.getElementById('result-target');
  const copyBtn = document.getElementById('copy-btn');
  const copyLabel = document.getElementById('copy-label');
  const refreshBtn = document.getElementById('refresh-btn');
  const listEl = document.getElementById('links-list');
  const emptyEl = document.getElementById('empty-state');
  const prefixEl = document.getElementById('host-prefix');

  prefixEl.textContent = `${window.location.host}/`;

  function setError(msg) {
    errorEl.textContent = msg || '';
  }

  function buildShortUrl(code) {
    return `${window.location.origin}/${code}`;
  }

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso.replace(' ', 'T') + 'Z');
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
  }

  function showResult(link) {
    const shortUrl = buildShortUrl(link.code);
    resultLink.href = shortUrl;
    resultLink.textContent = shortUrl;
    resultTarget.textContent = link.url;
    resultSection.classList.remove('hidden');
    copyLabel.textContent = 'Copy';
  }

  async function copyShortUrl() {
    const url = resultLink.href;
    try {
      await navigator.clipboard.writeText(url);
      copyLabel.textContent = 'Copied ✓';
      setTimeout(() => (copyLabel.textContent = 'Copy'), 1500);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); copyLabel.textContent = 'Copied ✓'; }
      catch (_) { copyLabel.textContent = 'Copy failed'; }
      document.body.removeChild(ta);
      setTimeout(() => (copyLabel.textContent = 'Copy'), 1500);
    }
  }

  function renderLinks(links) {
    listEl.innerHTML = '';
    if (!links.length) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.id = 'empty-state';
      empty.textContent = 'No links yet. Shorten one above to get started.';
      listEl.appendChild(empty);
      return;
    }

    for (const link of links) {
      const item = document.createElement('div');
      item.className = 'link-item';

      const main = document.createElement('div');
      main.className = 'link-main';

      const short = document.createElement('a');
      short.className = 'link-short';
      short.href = buildShortUrl(link.code);
      short.target = '_blank';
      short.rel = 'noopener';
      short.textContent = buildShortUrl(link.code);
      main.appendChild(short);

      const target = document.createElement('div');
      target.className = 'link-target';
      target.textContent = link.url;
      target.title = link.url;
      main.appendChild(target);

      const meta = document.createElement('div');
      meta.className = 'link-meta';
      const clicks = document.createElement('span');
      clicks.className = 'clicks-badge';
      clicks.textContent = `${link.clicks} ${link.clicks === 1 ? 'click' : 'clicks'}`;
      meta.appendChild(clicks);
      const date = document.createElement('span');
      date.className = 'link-date';
      date.textContent = formatDate(link.created_at);
      meta.appendChild(date);

      const actions = document.createElement('div');
      actions.className = 'link-actions';
      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'btn danger';
      del.textContent = 'Delete';
      del.addEventListener('click', () => deleteLink(link.code, item));
      actions.appendChild(del);

      item.appendChild(main);
      item.appendChild(meta);
      item.appendChild(actions);
      listEl.appendChild(item);
    }
  }

  async function loadLinks() {
    try {
      const res = await fetch('/api/links');
      if (!res.ok) throw new Error('Failed to load');
      const links = await res.json();
      renderLinks(links);
    } catch (e) {
      listEl.innerHTML = '';
      const err = document.createElement('div');
      err.className = 'empty';
      err.textContent = 'Could not load links. Is the server running?';
      listEl.appendChild(err);
    }
  }

  async function deleteLink(code, rowEl) {
    if (!confirm(`Delete the short link "/${code}"?`)) return;
    try {
      const res = await fetch(`/api/links/${encodeURIComponent(code)}`, {
        method: 'DELETE',
      });
      if (!res.ok && res.status !== 204) throw new Error('Delete failed');
      rowEl.remove();
      const remaining = listEl.querySelectorAll('.link-item').length;
      if (remaining === 0) {
        listEl.innerHTML = '';
        const empty = document.createElement('div');
        empty.className = 'empty';
        empty.textContent = 'No links yet. Shorten one above to get started.';
        listEl.appendChild(empty);
      }
    } catch (e) {
      alert('Could not delete link.');
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setError('');

    const url = urlInput.value.trim();
    const code = codeInput.value.trim();
    if (!url) {
      setError('Please paste a URL to shorten.');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    const originalLabel = submitBtn.querySelector('.btn-label').textContent;
    submitBtn.querySelector('.btn-label').textContent = 'Shortening…';

    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, code: code || undefined }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error || 'Something went wrong');
        return;
      }
      showResult(body);
      urlInput.value = '';
      codeInput.value = '';
      await loadLinks();
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) {
      setError('Network error. Could not reach the server.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.querySelector('.btn-label').textContent = originalLabel;
    }
  });

  copyBtn.addEventListener('click', copyShortUrl);
  refreshBtn.addEventListener('click', loadLinks);

  loadLinks();
})();
