const form = document.getElementById('shorten-form');
const urlInput = document.getElementById('url-input');
const shortenBtn = document.getElementById('shorten-btn');
const btnText = document.getElementById('btn-text');
const btnSpinner = document.getElementById('btn-spinner');
const errorMsg = document.getElementById('error-msg');
const resultCard = document.getElementById('result-card');
const originalDisplay = document.getElementById('original-display');
const shortLink = document.getElementById('short-link');
const copyBtn = document.getElementById('copy-btn');
const copyIcon = document.getElementById('copy-icon');
const checkIcon = document.getElementById('check-icon');
const historySection = document.getElementById('history-section');
const historyList = document.getElementById('history-list');

const history = [];

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = urlInput.value.trim();

  // Reset state
  errorMsg.classList.add('hidden');
  errorMsg.textContent = '';

  // Loading state
  btnText.classList.add('hidden');
  btnSpinner.classList.remove('hidden');
  shortenBtn.disabled = true;

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
    originalDisplay.textContent = url;
    shortLink.href = data.shortUrl;
    shortLink.textContent = data.shortUrl;
    resultCard.classList.remove('hidden');

    // Add to history
    history.unshift({ original: url, short: data.shortUrl });
    renderHistory();

    urlInput.value = '';
  } catch {
    showError('Network error. Please try again.');
  } finally {
    btnText.classList.remove('hidden');
    btnSpinner.classList.add('hidden');
    shortenBtn.disabled = false;
  }
});

copyBtn.addEventListener('click', async () => {
  const url = shortLink.textContent;
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = url;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
  copyIcon.classList.add('hidden');
  checkIcon.classList.remove('hidden');
  setTimeout(() => {
    copyIcon.classList.remove('hidden');
    checkIcon.classList.add('hidden');
  }, 2000);
});

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove('hidden');
}

function renderHistory() {
  if (history.length === 0) {
    historySection.classList.add('hidden');
    return;
  }
  historySection.classList.remove('hidden');
  historyList.innerHTML = history
    .slice(0, 5)
    .map(
      (item) => `
      <li>
        <span class="history-original" title="${item.original}">${item.original}</span>
        <a class="history-short" href="${item.short}" target="_blank" rel="noopener noreferrer">${item.short}</a>
      </li>`
    )
    .join('');
}
