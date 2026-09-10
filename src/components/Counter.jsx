import { useState } from 'react'
import './Counter.css'

export default function Counter() {
  const [count, setCount] = useState(0)

  const level = count < 0 ? 'negative' : count === 0 ? 'zero' : count < 10 ? 'low' : count < 25 ? 'mid' : 'high'

  return (
    <section className="counter-section" id="counter">
      <div className="counter-inner">
        <h2>Interactive Demo</h2>
        <p className="counter-desc">
          A live example of <code>useState</code> — click the buttons and watch the state update instantly.
        </p>
        <div className="counter-card">
          <div className={`counter-display level-${level}`}>
            {count}
          </div>
          <div className="counter-controls">
            <button className="ctrl-btn ctrl-btn--minus" onClick={() => setCount(c => c - 1)}>−</button>
            <button className="ctrl-btn ctrl-btn--reset" onClick={() => setCount(0)}>Reset</button>
            <button className="ctrl-btn ctrl-btn--plus" onClick={() => setCount(c => c + 1)}>+</button>
          </div>
          <p className="counter-hint">
            {count === 0 && 'Click + to start counting!'}
            {count > 0 && count < 10 && `Keep going… ${10 - count} more to level up!`}
            {count >= 10 && count < 25 && '🔥 On fire! Push to 25!'}
            {count >= 25 && '🏆 Legend status achieved!'}
            {count < 0 && '📉 Going negative... interesting choice.'}
          </p>
        </div>
      </div>
    </section>
  )
}
