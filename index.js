// Vercel's Express framework entrypoint.
// The browser-side script remains in public/index.js and is served with index.html.
// Keep the Express app in server.js so local `npm start` continues to work.
const express = require('express');
const app = require('./server');

if (typeof app !== 'function' || typeof express !== 'function') {
  throw new Error('PAN-CIVIL Express application failed to initialize.');
}

module.exports = app;
