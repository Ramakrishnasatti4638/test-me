import { useState, useEffect } from 'react';
import './JobBoard.css';

const API_URL = 'http://localhost:3002/api/jobs';

function JobBoard() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
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
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setJobs(data);
      setFilteredJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleFilterChange = (filterType) => {
    setSelectedFilter(filterType);
    if (filterType === 'all') {
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.filter(job => job.type === filterType);
      setFilteredJobs(filtered);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        await fetchJobs();
        setShowModal(false);
        setFormData({
          title: '',
          company: '',
          location: '',
          type: 'full-time',
          salary: ''
        });
      }
    } catch (error) {
      console.error('Error posting job:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
        });
        await fetchJobs();
        if (selectedFilter !== 'all') {
          handleFilterChange(selectedFilter);
        }
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };

  return (
    <div className="job-board">
      <header className="header">
        <h1>Job Board</h1>
        <button className="post-job-btn" onClick={() => setShowModal(true)}>
          Post a Job
        </button>
      </header>

      <div className="filters">
        <button
          className={selectedFilter === 'all' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => handleFilterChange('all')}
        >
          All Jobs
        </button>
        <button
          className={selectedFilter === 'full-time' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => handleFilterChange('full-time')}
        >
          Full-Time
        </button>
        <button
          className={selectedFilter === 'part-time' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => handleFilterChange('part-time')}
        >
          Part-Time
        </button>
        <button
          className={selectedFilter === 'remote' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => handleFilterChange('remote')}
        >
          Remote
        </button>
      </div>

      <div className="jobs-grid">
        {filteredJobs.map(job => (
          <div key={job.id} className="job-card">
            <div className="job-header">
              <h2>{job.title}</h2>
              <button 
                className="delete-btn" 
                onClick={() => handleDelete(job.id)}
                title="Delete job"
              >
                ×
              </button>
            </div>
            <p className="company">{job.company}</p>
            <p className="location">📍 {job.location}</p>
            <div className="job-footer">
              <span className={`type-badge ${job.type}`}>
                {job.type.replace('-', ' ')}
              </span>
              <span className="salary">{job.salary}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <p className="no-jobs">No jobs found for this filter.</p>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Post a Job</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Job Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Company *</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="full-time">Full-Time</option>
                  <option value="part-time">Part-Time</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
              <div className="form-group">
                <label>Salary *</label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  placeholder="e.g., $80k - $120k"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Post Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobBoard;
