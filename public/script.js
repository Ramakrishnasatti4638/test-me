const form = document.getElementById('shortenForm');
const urlInput = document.getElementById('urlInput');
const errorDiv = document.getElementById('error');
const resultDiv = document.getElementById('result');
const loadingDiv = document.getElementById('loading');
const originalUrlDiv = document.getElementById('originalUrl');
const shortUrlDiv = document.getElementById('shortUrl');
const copyBtn = document.getElementById('copyBtn');
const newUrlBtn = document.getElementById('newUrlBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  await shortenUrl();
});

copyBtn.addEventListener('click', () => {
  const shortUrl = shortUrlDiv.textContent;
  navigator.clipboard.writeText(shortUrl).then(() => {
    const originalText = copyBtn.querySelector('.copy-text').textContent;
    copyBtn.querySelector('.copy-text').textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.querySelector('.copy-text').textContent = originalText;
    }, 2000);
  });
});

newUrlBtn.addEventListener('click', () => {
  resetForm();
});

async function shortenUrl() {
  const url = urlInput.value.trim();
  
  // Clear previous errors
  clearError();
  
  if (!url) {
    showError('Please enter a URL');
    return;
  }

  try {
    // Show loading state
    loadingDiv.classList.remove('hidden');
    resultDiv.classList.add('hidden');

    const response = await fetch('/api/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to shorten URL');
    }

    // Display result
    originalUrlDiv.textContent = data.originalUrl;
    shortUrlDiv.textContent = data.shortUrl;
    
    loadingDiv.classList.add('hidden');
    resultDiv.classList.remove('hidden');
    
  } catch (error) {
    loadingDiv.classList.add('hidden');
    showError(error.message);
  }
}

function showError(message) {
  errorDiv.textContent = message;
  errorDiv.classList.add('show');
}

function clearError() {
  errorDiv.textContent = '';
  errorDiv.classList.remove('show');
}

function resetForm() {
  urlInput.value = '';
  urlInput.focus();
  resultDiv.classList.add('hidden');
  loadingDiv.classList.add('hidden');
  clearError();
}
