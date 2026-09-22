const API_URL = 'http://localhost:5000/api';

const form = document.getElementById('shortenForm');
const urlInput = document.getElementById('urlInput');
const errorDiv = document.getElementById('error');
const successDiv = document.getElementById('success');
const linksList = document.getElementById('linksList');

// Clear messages
function clearMessages() {
  errorDiv.classList.remove('show');
  successDiv.classList.remove('show');
  errorDiv.textContent = '';
  successDiv.textContent = '';
}

// Show error
function showError(message) {
  clearMessages();
  errorDiv.textContent = message;
  errorDiv.classList.add('show');
}

// Show success
function showSuccess(message) {
  clearMessages();
  successDiv.textContent = message;
  successDiv.classList.add('show');
  setTimeout(() => {
    successDiv.classList.remove('show');
  }, 3000);
}

// Format link item HTML
function createLinkHTML(link) {
  return `
    <div class="link-item">
      <div class="link-item-header">
        <span class="short-code">${link.shortCode}</span>
        <button class="copy-btn" data-short-url="${link.shortUrl}">Copy</button>
      </div>
      <div class="original-url"><strong>Original:</strong> ${link.originalUrl}</div>
      <div class="url-preview">${link.shortUrl}</div>
    </div>
  `;
}

// Load all links
async function loadLinks() {
  try {
    const response = await fetch(`${API_URL}/links`);
    const links = await response.json();

    if (links.length === 0) {
      linksList.innerHTML = '<p class="empty-state">No URLs shortened yet</p>';
      return;
    }

    linksList.innerHTML = links.map(createLinkHTML).join('');

    // Add copy button listeners
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const shortUrl = btn.dataset.shortUrl;
        try {
          await navigator.clipboard.writeText(shortUrl);
          const originalText = btn.textContent;
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('copied');
          }, 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
      });
    });
  } catch (error) {
    console.error('Error loading links:', error);
  }
}

// Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessages();

  const url = urlInput.value.trim();

  if (!url) {
    showError('Please enter a URL');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/shorten`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to shorten URL');
    }

    const result = await response.json();
    showSuccess(`URL shortened successfully!`);
    urlInput.value = '';

    // Reload links
    await loadLinks();
  } catch (error) {
    showError(error.message || 'An error occurred. Please try again.');
  }
});

// Load links on page load
loadLinks();
