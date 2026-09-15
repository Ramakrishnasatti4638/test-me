import React, { useState } from 'react';
import './UrlForm.css';

function UrlForm({ onAddUrl, loading }) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!inputValue.trim()) {
      setError('Please enter a URL');
      return;
    }

    onAddUrl(inputValue);
    setInputValue('');
  };

  return (
    <form className="url-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          type="text"
          className="form-input"
          placeholder="Paste your long URL here... https://example.com/very/long/url"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError('');
          }}
          disabled={loading}
        />
        <button
          type="submit"
          className="form-button"
          disabled={loading}
        >
          {loading ? 'Shortening...' : 'Shorten URL'}
        </button>
      </div>
      {error && <div className="form-error">{error}</div>}
    </form>
  );
}

export default UrlForm;
