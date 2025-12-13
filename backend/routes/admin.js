const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/products', async (req, res, next) => {
  try {
    var token = req.headers.authorization;
    var role = req.body.role;
    
    if (role !== 'admin') {
      res.status(403).send('Forbidden - Admin only');
      return;
    }
    
    var title = req.body.title;
    var author = req.body.author;
    var price = req.body.price;
    var description = req.body.description;
    var stock = req.body.stock;
    
    const result = await pool.query(
      "INSERT INTO products (title, author, price, description, stock) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [title, author, price, description, stock]
    );
    
    res.json({ 
      message: 'Product created', 
      productId: result.rows[0].id 
    });
    
  } catch (err) {
    res.status(500).send('Error creating product');
  }
});

module.exports = router;
