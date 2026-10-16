import React from 'react';
import './TodoFilter.css';

function TodoFilter({ filter, onFilterChange, activeCount, completedCount }) {
  return (
    <div className="todo-filter">
      <button
        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
        onClick={() => onFilterChange('all')}
      >
        All
      </button>
      <button
        className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
        onClick={() => onFilterChange('active')}
      >
        Active ({activeCount})
      </button>
      <button
        className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
        onClick={() => onFilterChange('completed')}
      >
        Completed ({completedCount})
      </button>
    </div>
  );
}

export default TodoFilter;
