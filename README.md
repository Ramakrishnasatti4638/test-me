# Sample App

A small Node.js product catalog API built with Express. It exposes a single search endpoint, `GET /api/products/search?q=<text>`, that filters the in-memory product list by name (case-insensitive on the product side) and returns matching products as JSON.

## Install

```
npm install
```

## Start

```
npm start
```

The server listens on port 3000.

## Test

```
npm test
```

Runs the test suite with the built-in Node.js test runner.