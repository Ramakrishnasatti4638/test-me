export default function Stats({ tasks, onClearCompleted }) {
  const total = tasks.length
  const done = tasks.filter((t) => t.done).length
  const active = total - done
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <footer className="stats">
      <div className="stats-bar">
        <div className="stats-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="stats-row">
        <span>{active} left</span>
        <span>{pct}% complete</span>
        {done > 0 && (
          <button className="clear-btn" onClick={onClearCompleted}>
            Clear completed ({done})
          </button>
        )}
      </div>
    </footer>
  )
}
