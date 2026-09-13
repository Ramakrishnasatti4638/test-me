import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ShortenForm from './components/ShortenForm';
import ShortURLCard from './components/ShortURLCard';

function App() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const response = await axios.get('/api/urls/all');
      setUrls(response.data || []);
    } catch (error) {
      console.error('Error fetching URLs:', error);
    }
  };

  const handleShorten = async (url) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/shorten', { url });
      setUrls([response.data, ...urls]);
      return response.data;
    } catch (error) {
      console.error('Error shortening URL:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">URL Shortener</h1>
          <p className="text-lg text-gray-600">
            Create short, shareable links in seconds
          </p>
        </div>

        {/* Form Section */}
        <div className="mb-12">
          <ShortenForm onShorten={handleShorten} loading={loading} />
        </div>

        {/* URLs List Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Recent Links {urls.length > 0 && `(${urls.length})`}
          </h2>
          {urls.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No shortened URLs yet. Create one above to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {urls.map((urlData) => (
                <ShortURLCard key={urlData.id} data={urlData} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
