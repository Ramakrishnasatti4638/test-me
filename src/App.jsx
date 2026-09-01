import { useState, useEffect } from 'react';
import './App.css';

const STORAGE_KEY = 'url-shortener-links';

function loadLinks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function generateCode() {
  const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function App() {
  const [links, setLinks] = useState(loadLinks);
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  }, [links]);

  // Redirect if visiting #/abc123 style hash
  useEffect(() => {
    const code = window.location.hash.replace(/^#\//, '');
    if (code) {
      const match = loadLinks().find(l => l.code === code);
      if (match) {
        window.location.replace(match.url);
      }
    }
  }, []);

  const shorten = (e) => {
    e.preventDefault();
    setError('');

    const trimmed = url.trim();
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    if (!isValidUrl(normalized)) {
      setError('Please enter a valid URL.');
      return;
    }

    let code = customCode.trim();
    if (code) {
      if (!/^[a-zA-Z0-9_-]{3,20}$/.test(code)) {
        setError('Custom code must be 3-20 characters (letters, numbers, -, _).');
        return;
      }
      if (links.some(l => l.code === code)) {
        setError('That code is already taken.');
        return;
      }
    } else {
      do {
        code = generateCode();
      } while (links.some(l => l.code === code));
    }

    setLinks([{ url: normalized, code, createdAt: Date.now() }, ...links]);
    setUrl('');
    setCustomCode('');
  };

  const shortUrl = (code) =>
    `${window.location.origin}${window.location.pathname}#/${code}`;

  const copy = async (code) => {
    try {
      await navigator.clipboard.writeText(shortUrl(code));
      setCopied(code);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setError('Could not copy to clipboard.');
    }
  };

  const remove = (code) => {
    setLinks(links.filter(l => l.code !== code));
  };

  return (
    <div className="shortener">
      <header className="shortener-header">
        <h1>🔗 URL Shortener</h1>
        <p>Paste a long URL, get a short one. Optionally pick your own code.</p>
      </header>

      <form className="shortener-form" onSubmit={shorten}>
        <input
          type="text"
          placeholder="https://example.com/very/long/url..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="url-input"
        />
        <input
          type="text"
          placeholder="Custom code (optional)"
          value={customCode}
          onChange={(e) => setCustomCode(e.target.value)}
          className="code-input"
        />
        <button type="submit" className="shorten-btn">Shorten</button>
      </form>

      {error && <p className="error">{error}</p>}

      {links.length === 0 ? (
        <p className="empty">No links yet. Shorten your first URL above!</p>
      ) : (
        <ul className="links-list">
          {links.map(({ code, url: original, createdAt }) => (
            <li key={code} className="link-item">
              <div className="link-details">
                <a href={`#/${code}`} className="short-link" onClick={(e) => { e.preventDefault(); copy(code); }}>
                  {copied === code ? '✓ Copied!' : shortUrl(code)}
                </a>
                <span className="original-url">{original}</span>
                <span className="link-date">{new Date(createdAt).toLocaleString()}</span>
              </div>
              <div className="link-actions">
                <button onClick={() => copy(code)} className="copy-btn">Copy</button>
                <a href={original} target="_blank" rel="noopener noreferrer" className="open-btn">Open</a>
                <button onClick={() => remove(code)} className="delete-btn">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
