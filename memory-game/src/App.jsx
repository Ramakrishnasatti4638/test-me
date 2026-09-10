import { useState, useEffect, useCallback } from 'react'
import './App.css'

const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮']

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5)
}

function createCards() {
  const pairs = EMOJIS.map((emoji, i) => [
    { id: i * 2,     emoji, matched: false },
    { id: i * 2 + 1, emoji, matched: false },
  ]).flat()
  return shuffle(pairs)
}

export default function App() {
  const [cards, setCards]           = useState(createCards)
  const [flipped, setFlipped]       = useState([])
  const [moves, setMoves]           = useState(0)
  const [locked, setLocked]         = useState(false)
  const [won, setWon]               = useState(false)
  const [bestScore, setBestScore]   = useState(() => {
    const s = localStorage.getItem('memory-best')
    return s ? parseInt(s, 10) : null
  })
  const [startTime, setStartTime]   = useState(null)
  const [elapsed, setElapsed]       = useState(0)

  // Timer
  useEffect(() => {
    if (!startTime || won) return
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 500)
    return () => clearInterval(id)
  }, [startTime, won])

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const handleCardClick = useCallback((card) => {
    if (locked || card.matched || flipped.includes(card.id) || flipped.length === 2) return

    if (!startTime) setStartTime(Date.now())

    const next = [...flipped, card.id]
    setFlipped(next)

    if (next.length === 2) {
      setMoves(m => m + 1)
      setLocked(true)

      const [a, b] = next.map(id => cards.find(c => c.id === id))
      if (a.emoji === b.emoji) {
        // Match!
        setCards(prev =>
          prev.map(c => c.id === a.id || c.id === b.id ? { ...c, matched: true } : c)
        )
        setFlipped([])
        setLocked(false)
      } else {
        setTimeout(() => {
          setFlipped([])
          setLocked(false)
        }, 900)
      }
    }
  }, [locked, flipped, cards, startTime])

  // Win check
  useEffect(() => {
    if (cards.every(c => c.matched)) {
      setWon(true)
      const finalMoves = moves
      setBestScore(prev => {
        const best = prev === null || finalMoves < prev ? finalMoves : prev
        localStorage.setItem('memory-best', String(best))
        return best
      })
    }
  }, [cards, moves])

  const restart = () => {
    setCards(createCards())
    setFlipped([])
    setMoves(0)
    setLocked(false)
    setWon(false)
    setStartTime(null)
    setElapsed(0)
  }

  const isFlipped  = (card) => flipped.includes(card.id) || card.matched
  const isMatched  = (card) => card.matched

  return (
    <div className="app">
      <header className="header">
        <h1>🧠 Memory Game</h1>
        <div className="stats">
          <div className="stat"><span className="stat-label">Moves</span><span className="stat-value">{moves}</span></div>
          <div className="stat"><span className="stat-label">Time</span><span className="stat-value">{formatTime(elapsed)}</span></div>
          {bestScore !== null && (
            <div className="stat"><span className="stat-label">Best</span><span className="stat-value">{bestScore}</span></div>
          )}
        </div>
        <button className="btn-restart" onClick={restart}>New Game</button>
      </header>

      {won && (
        <div className="win-banner">
          <div className="win-inner">
            <div className="win-emoji">🎉</div>
            <h2>You won!</h2>
            <p>{moves} moves · {formatTime(elapsed)}</p>
            {bestScore === moves && <p className="new-best">🏆 New best score!</p>}
            <button className="btn-restart" onClick={restart}>Play Again</button>
          </div>
        </div>
      )}

      <div className="grid">
        {cards.map(card => (
          <div
            key={card.id}
            className={`card ${isFlipped(card) ? 'flipped' : ''} ${isMatched(card) ? 'matched' : ''}`}
            onClick={() => handleCardClick(card)}
            role="button"
            aria-label={isFlipped(card) ? card.emoji : 'Hidden card'}
          >
            <div className="card-inner">
              <div className="card-back">❓</div>
              <div className="card-front">{card.emoji}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
