'use strict';

const {
  getUserStore,
  resetStore,
  validUser,
} = require('../helpers');

beforeEach(() => { resetStore(); });

describe('user model', () => {
  test('create() persists a sanitized user (no passwordHash leaked)', async () => {
    const store = getUserStore();
    const u = await store.create(validUser());
    expect(u.id).toBeDefined();
    expect(u.email).toBe('alice@example.com');
    expect(u.name).toBe('Alice');
    expect(u).not.toHaveProperty('passwordHash');
  });

  test('create() normalizes email to lowercase + trim', async () => {
    const store = getUserStore();
    const u = await store.create(validUser({ email: '  Bob@Example.com ' }));
    expect(u.email).toBe('bob@example.com');
  });

  test('create() throws EMAIL_TAKEN on duplicate', async () => {
    const store = getUserStore();
    await store.create(validUser());
    await expect(store.create(validUser())).rejects.toMatchObject({
      statusCode: 409,
      code: 'EMAIL_TAKEN',
    });
  });

  test('verifyPassword returns true for correct password', async () => {
    const store = getUserStore();
    await store.create(validUser({ password: 'sup3rsecret!' }));
    const found = await store.findByEmail('alice@example.com');
    expect(await store.verifyPassword(found, 'sup3rsecret!')).toBe(true);
  });

  test('verifyPassword returns false for wrong password', async () => {
    const store = getUserStore();
    await store.create(validUser({ password: 'sup3rsecret!' }));
    const found = await store.findByEmail('alice@example.com');
    expect(await store.verifyPassword(found, 'nope')).toBe(false);
  });

  test('findByEmail is case-insensitive', async () => {
    const store = getUserStore();
    await store.create(validUser());
    const found = await store.findByEmail('ALICE@EXAMPLE.COM');
    expect(found).not.toBeNull();
    expect(found.email).toBe('alice@example.com');
  });

  test('findById returns null for unknown id', async () => {
    const store = getUserStore();
    expect(await store.findById('nope')).toBeNull();
  });

  test('sanitize strips passwordHash even on full records', async () => {
    const store = getUserStore();
    const u = await store.create(validUser());
    const raw = await store.findById(u.id);
    const safe = store.sanitize(raw);
    expect(safe).not.toHaveProperty('passwordHash');
  });
});