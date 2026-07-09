const express = require('express');
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory store
const polls = new Map();

function isPollExpired(poll) {
  return Date.now() > poll.expiresAt;
}

function getPollView(poll) {
  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
  return {
    id: poll.id,
    question: poll.question,
    options: poll.options.map((o, i) => ({
      index: i,
      text: o.text,
      votes: o.votes,
      percentage: totalVotes > 0 ? Math.round((o.votes / totalVotes) * 100) : 0,
    })),
    totalVotes,
    expiresAt: poll.expiresAt,
    isExpired: isPollExpired(poll),
  };
}

// POST /api/polls — create a poll
app.post('/api/polls', (req, res) => {
  const { question, options, expiresInMinutes } = req.body;

  if (!question || typeof question !== 'string' || question.trim() === '') {
    return res.status(400).json({ error: 'question is required' });
  }
  if (!Array.isArray(options) || options.length < 2 || options.length > 6) {
    return res.status(400).json({ error: 'options must be an array of 2–6 strings' });
  }
  if (options.some(o => typeof o !== 'string' || o.trim() === '')) {
    return res.status(400).json({ error: 'each option must be a non-empty string' });
  }
  const expiry = Number(expiresInMinutes);
  if (!expiry || expiry <= 0) {
    return res.status(400).json({ error: 'expiresInMinutes must be a positive number' });
  }

  const id = uuidv4();
  const poll = {
    id,
    question: question.trim(),
    options: options.map(o => ({ text: o.trim(), votes: 0 })),
    expiresAt: Date.now() + expiry * 60 * 1000,
    voters: new Set(),
  };
  polls.set(id, poll);

  // Issue a voterId cookie if not already set
  let voterId = req.cookies.voterId;
  if (!voterId) {
    voterId = uuidv4();
    res.cookie('voterId', voterId, { httpOnly: true, maxAge: 365 * 24 * 60 * 60 * 1000 });
  }

  return res.status(201).json({ id, voterId });
});

// GET /api/polls — list all polls
app.get('/api/polls', (req, res) => {
  const list = Array.from(polls.values()).map(poll => ({
    id: poll.id,
    question: poll.question,
    totalVotes: poll.options.reduce((sum, o) => sum + o.votes, 0),
    isExpired: isPollExpired(poll),
    expiresAt: poll.expiresAt,
  }));
  res.json(list);
});

// GET /api/polls/:id — get poll details
app.get('/api/polls/:id', (req, res) => {
  const poll = polls.get(req.params.id);
  if (!poll) return res.status(404).json({ error: 'Poll not found' });
  res.json(getPollView(poll));
});

// POST /api/polls/:id/vote — submit a vote
app.post('/api/polls/:id/vote', (req, res) => {
  const poll = polls.get(req.params.id);
  if (!poll) return res.status(404).json({ error: 'Poll not found' });

  if (isPollExpired(poll)) {
    return res.status(410).json({ error: 'Poll has expired' });
  }

  let voterId = req.cookies.voterId;
  if (!voterId) {
    voterId = uuidv4();
    res.cookie('voterId', voterId, { httpOnly: true, maxAge: 365 * 24 * 60 * 60 * 1000 });
  }

  if (poll.voters.has(voterId)) {
    return res.status(409).json({ error: 'You have already voted on this poll' });
  }

  const { optionIndex } = req.body;
  if (typeof optionIndex !== 'number' || optionIndex < 0 || optionIndex >= poll.options.length) {
    return res.status(400).json({ error: 'Invalid optionIndex' });
  }

  poll.options[optionIndex].votes += 1;
  poll.voters.add(voterId);

  return res.json(getPollView(poll));
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Polling server running on http://localhost:${PORT}`));
}

module.exports = app;
