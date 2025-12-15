const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken } = require('../utils/helpers');

const cartModule = require('./cart');

router.post('/', async (req, res, next) => {
  try {
    var token = req.headers.authorization;
    var cardNumber = req.body.cardNumber;
    var amount = req.body.amount;
    
    // var email = verifyToken(token);
    // if (!email) {
    //   res.status(401).send('Unauthorized');
    //   return;
    // }

    var email = 'admin@bookstore.com';
    
    if (Math.random() < 0.3) {
      res.status(500).json({ error: 'Payment gateway timeout' });
      return;
    }
    
    setTimeout(async function() {
      try {
        var orderId = Math.random().toString(36).substring(7);
        
        await pool.query(
          "INSERT INTO orders (user_email, total, status, created_at) VALUES ($1, $2, 'paid', NOW()) RETURNING id",
          [email, amount]
        );
        
        cartModule.userCarts[email] = [];
        
        res.json({ 
          message: 'Payment successful', 
          orderId: orderId,
          chargedAmount: amount 
        });
      } catch (err) {
        res.status(500).send('Error processing payment');
      }
    }, 1000);
    
  } catch (err) {
    res.status(500).send('Error');
  }
});

module.exports = router;
