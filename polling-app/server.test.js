const request = require('supertest');
const app = require('./server');

// Helper to create a poll
async function createPoll(overrides = {}) {
  const body = {
    question: 'What is your favourite colour?',
    options: ['Red', 'Blue', 'Green'],
    expiresInMinutes: 60,
    ...overrides,
  };
  return request(app).post('/api/polls').send(body);
}

describe('Poll Creation — POST /api/polls', () => {
  test('creates a poll with valid data and returns id + 201', async () => {
    const res = await createPoll();
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(typeof res.body.id).toBe('string');
  });

  test('sets a voterId cookie on creation', async () => {
    const res = await createPoll();
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    expect(setCookie.some(c => c.startsWith('voterId='))).toBe(true);
  });

  test('returns 400 if question is missing', async () => {
    const res = await createPoll({ question: '' });
    expect(res.status).toBe(400);
  });

  test('returns 400 if fewer than 2 options', async () => {
    const res = await createPoll({ options: ['OnlyOne'] });
    expect(res.status).toBe(400);
  });

  test('returns 400 if more than 6 options', async () => {
    const res = await createPoll({ options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] });
    expect(res.status).toBe(400);
  });

  test('returns 400 if expiresInMinutes is missing', async () => {
    const res = await request(app)
      .post('/api/polls')
      .send({ question: 'Q?', options: ['A', 'B'] });
    expect(res.status).toBe(400);
  });
});

describe('Get Poll — GET /api/polls/:id', () => {
  test('returns poll details with zero votes initially', async () => {
    const create = await createPoll();
    const { id } = create.body;
    const res = await request(app).get(`/api/polls/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.question).toBe('What is your favourite colour?');
    expect(res.body.totalVotes).toBe(0);
    expect(res.body.isExpired).toBe(false);
    expect(res.body.options).toHaveLength(3);
    expect(res.body).not.toHaveProperty('voters');
  });

  test('returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/polls/nonexistent-id');
    expect(res.status).toBe(404);
  });
});

describe('List Polls — GET /api/polls', () => {
  test('returns an array including newly created polls', async () => {
    await createPoll({ question: 'List test poll?' });
    const res = await request(app).get('/api/polls');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(p => p.question === 'List test poll?')).toBe(true);
  });

  test('each entry has id, question, totalVotes, isExpired', async () => {
    const res = await request(app).get('/api/polls');
    for (const poll of res.body) {
      expect(poll).toHaveProperty('id');
      expect(poll).toHaveProperty('question');
      expect(poll).toHaveProperty('totalVotes');
      expect(poll).toHaveProperty('isExpired');
    }
  });

  test('does not expose voter identities in listing', async () => {
    const res = await request(app).get('/api/polls');
    for (const poll of res.body) {
      expect(poll).not.toHaveProperty('voters');
    }
  });
});

describe('Voting — POST /api/polls/:id/vote', () => {
  test('casts a vote and increments the option count', async () => {
    const create = await createPoll();
    const { id } = create.body;
    const cookie = create.headers['set-cookie'];

    const res = await request(app)
      .post(`/api/polls/${id}/vote`)
      .set('Cookie', cookie)
      .send({ optionIndex: 0 });

    expect(res.status).toBe(200);
    expect(res.body.options[0].votes).toBe(1);
    expect(res.body.totalVotes).toBe(1);
  });

  test('updates percentage correctly after vote', async () => {
    const create = await createPoll();
    const { id } = create.body;
    const cookie = create.headers['set-cookie'];

    const res = await request(app)
      .post(`/api/polls/${id}/vote`)
      .set('Cookie', cookie)
      .send({ optionIndex: 0 });

    expect(res.body.options[0].percentage).toBe(100);
  });

  test('returns 400 for invalid optionIndex', async () => {
    const create = await createPoll();
    const { id } = create.body;
    const cookie = create.headers['set-cookie'];

    const res = await request(app)
      .post(`/api/polls/${id}/vote`)
      .set('Cookie', cookie)
      .send({ optionIndex: 99 });

    expect(res.status).toBe(400);
  });

  test('returns 404 for unknown poll', async () => {
    const res = await request(app)
      .post('/api/polls/ghost/vote')
      .send({ optionIndex: 0 });
    expect(res.status).toBe(404);
  });
});

describe('Duplicate Vote Prevention', () => {
  test('returns 409 when same voterId tries to vote twice', async () => {
    const create = await createPoll();
    const { id } = create.body;
    const cookie = create.headers['set-cookie'];

    // First vote
    await request(app)
      .post(`/api/polls/${id}/vote`)
      .set('Cookie', cookie)
      .send({ optionIndex: 0 });

    // Second vote with same cookie
    const res = await request(app)
      .post(`/api/polls/${id}/vote`)
      .set('Cookie', cookie)
      .send({ optionIndex: 1 });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already voted/i);
  });

  test('allows a second voter to vote on the same poll', async () => {
    const create = await createPoll();
    const { id } = create.body;
    const cookie1 = create.headers['set-cookie'];

    await request(app)
      .post(`/api/polls/${id}/vote`)
      .set('Cookie', cookie1)
      .send({ optionIndex: 0 });

    // Second voter — fresh request, no cookie
    const res = await request(app)
      .post(`/api/polls/${id}/vote`)
      .send({ optionIndex: 1 });

    expect(res.status).toBe(200);
    expect(res.body.totalVotes).toBe(2);
  });
});

describe('Poll Expiry', () => {
  test('isExpired is false for a fresh poll', async () => {
    const create = await createPoll({ expiresInMinutes: 60 });
    const { id } = create.body;
    const res = await request(app).get(`/api/polls/${id}`);
    expect(res.body.isExpired).toBe(false);
  });

  test('returns 410 when voting on an expired poll', async () => {
    // Create a poll that has already expired (negative minutes trick via direct manipulation)
    const create = await createPoll({ expiresInMinutes: 60 });
    const { id } = create.body;

    // Manually expire the poll by reaching into the server's in-memory store
    // We do this via a short-lived expiry on a fresh poll
    const create2 = await request(app)
      .post('/api/polls')
      .send({ question: 'Expiry test?', options: ['Yes', 'No'], expiresInMinutes: 0.0001 });
    const expiredId = create2.body.id;

    // Wait 10ms for expiry (0.0001 min ≈ 6ms)
    await new Promise(r => setTimeout(r, 50));

    const res = await request(app)
      .post(`/api/polls/${expiredId}/vote`)
      .send({ optionIndex: 0 });

    expect(res.status).toBe(410);
    expect(res.body.error).toMatch(/expired/i);
  });

  test('GET /api/polls/:id marks expired poll correctly', async () => {
    const create = await request(app)
      .post('/api/polls')
      .send({ question: 'Expiry check?', options: ['A', 'B'], expiresInMinutes: 0.0001 });
    const { id } = create.body;

    await new Promise(r => setTimeout(r, 50));

    const res = await request(app).get(`/api/polls/${id}`);
    expect(res.body.isExpired).toBe(true);
  });
});
