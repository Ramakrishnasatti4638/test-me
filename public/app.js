'use strict';

const form = document.getElementById('shorten-form');
const input = document.getElementById('url-input');
const submitBtn = document.getElementById('submit-btn');
const errorEl = document.getElementById('error');
const linksEl = document.getElementById('links');
const emptyEl = document.getElementById('empty');

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = !message;
}

function render(links) {
  linksEl.innerHTML = '';
  emptyEl.hidden = links.length > 0;

  for (const link of links) {
    const shortUrl = `${window.location.origin}/${link.code}`;

    const li = document.createElement('li');
    li.className = 'link-item';

    const short = document.createElement('div');
    short.className = 'short';
    const anchor = document.createElement('a');
    anchor.href = shortUrl;
    anchor.textContent = shortUrl;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    short.appendChild(anchor);

    const original = document.createElement('div');
    original.className = 'original';
    original.textContent = link.url;

    const meta = document.createElement('div');
    meta.className = 'link-meta';
    const clicks = document.createElement('span');
    clicks.className = 'clicks';
    clicks.textContent = `${link.clicks} click${link.clicks === 1 ? '' : 's'}`;
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.type = 'button';
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(shortUrl);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => (copyBtn.textContent = 'Copy'), 1500);
      } catch {
        copyBtn.textContent = 'Failed';
      }
    });
    meta.appendChild(clicks);
    meta.appendChild(copyBtn);

    li.appendChild(short);
    li.appendChild(original);
    li.appendChild(meta);
    linksEl.appendChild(li);
  }
}

async function loadLinks() {
  try {
    const res = await fetch('/api/links');
    const links = await res.json();
    render(links);
  } catch {
    /* ignore load errors */
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  showError('');
  const url = input.value.trim();
  if (!url) return;

  submitBtn.disabled = true;
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
    input.value = '';
    await loadLinks();
  } catch {
    showError('Network error — please try again.');
  } finally {
    submitBtn.disabled = false;
  }
});

loadLinks();
