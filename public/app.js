'use strict';

const form = document.getElementById('shorten-form');
const input = document.getElementById('url-input');
const submitBtn = document.getElementById('submit-btn');
const errorEl = document.getElementById('error');
const linksEl = document.getElementById('links');
const emptyEl = document.getElementById('empty');

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function clearError() {
  errorEl.textContent = '';
  errorEl.hidden = true;
}

function renderLinks(links) {
  linksEl.innerHTML = '';
  emptyEl.hidden = links.length > 0;

  for (const link of links) {
    const li = document.createElement('li');
    li.className = 'link-item';

    const info = document.createElement('div');

    const short = document.createElement('div');
    short.className = 'short';
    const anchor = document.createElement('a');
    // Clicking this link hits GET /:code on the server, which redirects (302)
    // to the original long URL.
    anchor.href = link.shortUrl;
    anchor.textContent = link.shortUrl;
    anchor.target = '_blank';
    anchor.rel = 'noopener';
    short.appendChild(anchor);

    const long = document.createElement('div');
    long.className = 'long';
    long.textContent = link.longUrl;

    info.appendChild(short);
    info.appendChild(long);

    const meta = document.createElement('div');
    meta.className = 'link-meta';

    const clicks = document.createElement('div');
    clicks.textContent = `${link.clicks} click${link.clicks === 1 ? '' : 's'}`;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.type = 'button';
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(link.shortUrl);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
        }, 1500);
      } catch (err) {
        showError('Could not copy to clipboard.');
      }
    });

    meta.appendChild(clicks);
    meta.appendChild(copyBtn);

    li.appendChild(info);
    li.appendChild(meta);
    linksEl.appendChild(li);
  }
}

async function loadLinks() {
  try {
    const res = await fetch('/api/links');
    const links = await res.json();
    renderLinks(links);
  } catch (err) {
    showError('Could not load your links.');
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearError();
  submitBtn.disabled = true;

  try {
    const res = await fetch('/api/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: input.value.trim() }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'Something went wrong.');
      return;
    }

    input.value = '';
    await loadLinks();
  } catch (err) {
    showError('Network error — please try again.');
  } finally {
    submitBtn.disabled = false;
  }
});

loadLinks();
