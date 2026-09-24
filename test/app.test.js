"use strict";

const request = require("supertest");
const { createApp } = require("../src/app");

describe("URL shortener API", () => {
  let app;
  let store;

  beforeEach(() => {
    store = new Map();
    app = createApp(store);
  });

  test("shortens a valid URL and returns a code + short URL", async () => {
    const res = await request(app)
      .post("/api/shorten")
      .send({ url: "https://example.com/some/long/path" });

    expect(res.status).toBe(201);
    expect(res.body.code).toBeTruthy();
    expect(res.body.url).toBe("https://example.com/some/long/path");
    expect(res.body.shortUrl).toContain(res.body.code);
  });

  test("rejects an invalid URL", async () => {
    const res = await request(app)
      .post("/api/shorten")
      .send({ url: "not-a-url" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });

  test("returns the same code when the same URL is shortened twice", async () => {
    const first = await request(app)
      .post("/api/shorten")
      .send({ url: "https://example.com/repeat" });
    const second = await request(app)
      .post("/api/shorten")
      .send({ url: "https://example.com/repeat" });

    expect(second.status).toBe(200);
    expect(second.body.code).toBe(first.body.code);
  });

  // The key case requested: clicking a short link should redirect to the target.
  test("clicking a short link redirects to the original URL", async () => {
    const original = "https://example.com/landing-page";

    // Create the short link (this is what the UI does when you submit a URL).
    const created = await request(app)
      .post("/api/shorten")
      .send({ url: original });
    expect(created.status).toBe(201);

    const { code } = created.body;

    // Clicking the short link = a GET to /:code. It must 302-redirect.
    const clicked = await request(app).get(`/${code}`);

    expect(clicked.status).toBe(302);
    expect(clicked.headers.location).toBe(original);
  });

  test("unknown short code returns 404", async () => {
    const res = await request(app).get("/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.error).toBeTruthy();
  });

  test("lists created links", async () => {
    await request(app)
      .post("/api/shorten")
      .send({ url: "https://example.com/one" });
    await request(app)
      .post("/api/shorten")
      .send({ url: "https://example.com/two" });

    const res = await request(app).get("/api/links");
    expect(res.status).toBe(200);
    expect(res.body.links).toHaveLength(2);
  });
});
