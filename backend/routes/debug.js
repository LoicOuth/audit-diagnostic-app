const express = require('express');
const router = express.Router();

const authModule = require('./auth');
const cartModule = require('./cart');

let requestCount = 0;

router.get('/', (req, res) => {
  requestCount++;
  
  res.json({
    connectedUsers: authModule.connectedUsers,
    carts: cartModule.userCarts,
    requestCount: requestCount,
    environment: process.env,
    nodeVersion: process.version
  });
});

module.exports = { router, incrementRequestCount: () => requestCount++ };
