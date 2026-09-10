import { useState, useEffect, useCallback } from "react";
import "./App.css";

const EMOJIS = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐸", "🐙", "🦋", "🦄", "🐬"];

function createDeck(size = 8) {
  const selected = EMOJIS.slice(0, size);
  const paired = [...selected, ...selected];
  return paired
    .sort(() => Math.random() - 0.5)
    .map((emoji, index) => ({ id: index, emoji, flipped: false, matched: false }));
}

function Card({ card, onClick, disabled }) {
  const handleClick = () => {
    if (!disabled && !card.flipped && !card.matched) onClick(card);
  };

  return (
    <div
      className={`card ${card.flipped || card.matched ? "flipped" : ""} ${card.matched ? "matched" : ""}`}
      onClick={handleClick}
      role="button"
      aria-label={card.flipped || card.matched ? `Card showing ${card.emoji}` : "Hidden card"}
    >
      <div className="card-inner">
        <div className="card-front">?</div>
        <div className="card-back">{card.emoji}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [cards, setCards] = useState(() => createDeck(8));
  const [selected, setSelected] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [locked, setLocked] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [won, setWon] = useState(false);
  const [difficulty, setDifficulty] = useState(8); // pairs

  const totalPairs = difficulty;

  // Timer
  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  // Win check
  useEffect(() => {
    if (matches > 0 && matches === totalPairs) {
      setTimerActive(false);
      setWon(true);
    }
  }, [matches, totalPairs]);

  const handleCardClick = useCallback(
    (card) => {
      if (locked || selected.length === 2) return;

      if (!timerActive) setTimerActive(true);

      const newSelected = [...selected, card];

      setCards((prev) =>
        prev.map((c) => (c.id === card.id ? { ...c, flipped: true } : c))
      );

      if (newSelected.length === 2) {
        setMoves((m) => m + 1);
        setLocked(true);
        const [first, second] = newSelected;

        if (first.emoji === second.emoji) {
          setCards((prev) =>
            prev.map((c) =>
              c.id === first.id || c.id === second.id
                ? { ...c, matched: true, flipped: true }
                : c
            )
          );
          setMatches((m) => m + 1);
          setSelected([]);
          setLocked(false);
        } else {
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === first.id || c.id === second.id
                  ? { ...c, flipped: false }
                  : c
              )
            );
            setSelected([]);
            setLocked(false);
          }, 900);
        }
        setSelected(newSelected);
      } else {
        setSelected(newSelected);
      }
    },
    [selected, locked, timerActive]
  );

  const restart = (newDifficulty = difficulty) => {
    setCards(createDeck(newDifficulty));
    setSelected([]);
    setMoves(0);
    setMatches(0);
    setLocked(false);
    setSeconds(0);
    setTimerActive(false);
    setWon(false);
    setDifficulty(newDifficulty);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const cols = difficulty <= 6 ? 3 : difficulty <= 8 ? 4 : 4;

  return (
    <div className="app">
      <header className="header">
        <h1>🧠 Memory Game</h1>
        <div className="difficulty-bar">
          {[
            { label: "Easy", pairs: 6 },
            { label: "Medium", pairs: 8 },
            { label: "Hard", pairs: 16 },
          ].map(({ label, pairs }) => (
            <button
              key={pairs}
              className={`diff-btn ${difficulty === pairs ? "active" : ""}`}
              onClick={() => restart(pairs)}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="stats">
        <div className="stat">
          <span className="stat-label">Moves</span>
          <span className="stat-value">{moves}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Matches</span>
          <span className="stat-value">
            {matches}/{totalPairs}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Time</span>
          <span className="stat-value">{formatTime(seconds)}</span>
        </div>
      </div>

      <div
        className="grid"
        style={{ "--cols": cols }}
      >
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            onClick={handleCardClick}
            disabled={locked}
          />
        ))}
      </div>

      <button className="restart-btn" onClick={() => restart()}>
        🔄 New Game
      </button>

      {won && (
        <div className="overlay" onClick={() => restart()}>
          <div className="win-modal" onClick={(e) => e.stopPropagation()}>
            <div className="win-emoji">🎉</div>
            <h2>You Won!</h2>
            <p>
              {moves} moves · {formatTime(seconds)}
            </p>
            <p className="win-rating">
              {moves <= totalPairs + 2
                ? "⭐⭐⭐ Perfect!"
                : moves <= totalPairs * 2
                ? "⭐⭐ Great job!"
                : "⭐ Nice try!"}
            </p>
            <button className="restart-btn" onClick={() => restart()}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
