import { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:3001/api/jobs';

function App() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'full-time',
    salary: ''
  });

  useEffect(() => {
    fetchJobs();
  }, [filter]);

  const fetchJobs = async () => {
    try {
      const url = filter === 'all' ? API_URL : `${API_URL}?type=${filter}`;
      const response = await fetch(url);
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setShowModal(false);
        setFormData({
          title: '',
          company: '',
          location: '',
          type: 'full-time',
          salary: ''
        });
        fetchJobs();
      }
    } catch (error) {
      console.error('Error posting job:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchJobs();
      }
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Job Board</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          Post a Job
        </button>
      </header>

      <div className="filters">
        <button 
          className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('all')}
        >
          All Jobs
        </button>
        <button 
          className={filter === 'full-time' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('full-time')}
        >
          Full-Time
        </button>
        <button 
          className={filter === 'part-time' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('part-time')}
        >
          Part-Time
        </button>
        <button 
          className={filter === 'remote' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('remote')}
        >
          Remote
        </button>
      </div>

      <div className="jobs-grid">
        {jobs.map(job => (
          <div key={job.id} className="job-card">
            <div className="job-header">
              <h2>{job.title}</h2>
              <button 
                className="delete-btn" 
                onClick={() => handleDelete(job.id)}
                aria-label="Delete job"
              >
                ×
              </button>
            </div>
            <p className="company">{job.company}</p>
            <div className="job-details">
              <span className="location">📍 {job.location}</span>
              <span className={`type type-${job.type}`}>
                {job.type}
              </span>
            </div>
            <p className="salary">💰 {job.salary}</p>
            <p className="posted">Posted {new Date(job.posted_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Post a New Job</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Job Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Job Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="full-time">Full-Time</option>
                  <option value="part-time">Part-Time</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
              <div className="form-group">
                <label>Salary</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., $100k - $140k"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                />
              </div>
              <button type="submit" className="btn-primary btn-submit">
                Post Job
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
