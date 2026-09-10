const stats = [
  { label: 'Projects', value: '12', change: '+2 this week', icon: '📁', color: '#6366f1' },
  { label: 'Tasks Done', value: '84', change: '+11 today', icon: '✅', color: '#10b981' },
  { label: 'In Progress', value: '7', change: '3 due soon', icon: '🔄', color: '#f59e0b' },
  { label: 'Team Members', value: '5', change: '1 away', icon: '👥', color: '#3b82f6' },
]

export default function StatsGrid() {
  return (
    <div className="stats-grid">
      {stats.map(stat => (
        <div className="stat-card" key={stat.label} style={{ '--accent': stat.color }}>
          <div className="stat-icon">{stat.icon}</div>
          <div className="stat-body">
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-change">{stat.change}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
