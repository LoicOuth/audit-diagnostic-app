const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken } = require('../utils/helpers');

const userCarts = {};

router.post('/add', async (req, res, next) => {
  try {
    var token = req.headers.authorization;
    var productId = req.body.productId;
    var quantity = req.body.quantity;
    
    var email = verifyToken(token);
    if (!email) {
      res.status(401).send('Unauthorized');
      return;
    }
    
    const result = await pool.query(
      "SELECT * FROM products WHERE id = " + productId
    );
    
    if (result.rows.length === 0) {
      res.status(404).send('Product not found');
      return;
    }
    
    var product = result.rows[0];
    
    if (!userCarts[email]) {
      userCarts[email] = [];
    }
    
    userCarts[email].push({
      productId: productId,
      quantity: quantity,
      price: product.price,
      title: product.title
    });
    
    res.json({ 
      message: 'Product added to cart', 
      cart: userCarts[email] 
    });
    
  } catch (err) {
    res.status(500).send('Error');
  }
});

router.get('/', async (req, res, next) => {
  try {
    var token = req.headers.authorization;
    var email = verifyToken(token);
    
    if (!email) {
      res.status(401).send('Unauthorized');
      return;
    }
    
    var cart = userCarts[email] || [];
    
    if (cart.length === 0) {
      res.json({ cart: [] });
      return;
    }
    
    var detailedCart = [];
    
    for (const item of cart) {
      const result = await pool.query(
        "SELECT * FROM products WHERE id = " + item.productId
      );
      
      if (result && result.rows.length > 0) {
        var product = result.rows[0];
        detailedCart.push({
          ...item,
          currentStock: product.stock
        });
      }
    }
    
    var total = 0;
    detailedCart.forEach(function(item) {
      total += parseFloat(item.price) * item.quantity;
    });
    
    res.json({ cart: detailedCart, total: total });
    
  } catch (err) {
    res.status(500).send('Error');
  }
});

module.exports = { router, userCarts };
