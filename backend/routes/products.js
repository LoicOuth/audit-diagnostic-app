const express = require('express');
const router = express.Router();
const pool = require('../db');
const { wasteTime } = require('../utils/helpers');
const pino = require('pino');
const fs = require('fs');

if (!fs.existsSync('./logs')) {
  fs.mkdirSync('./logs');
}
const logStream = fs.createWriteStream('./logs/app.log', { flags: 'a' });
const logger = pino({ level: process.env.LOG_LEVEL || 'info' }, logStream);

let requestCount = 0;

router.get('/', async (req, res, next) => {
  try {
    requestCount++;
    logger.info({ route: 'GET /products' }, 'Handling /products request');
    
    var waste = wasteTime();
    
    const result = await pool.query('SELECT * FROM products');
    
    setTimeout(() => {
      console.log('Returning ' + result.rows.length + ' products');
      logger.info({
        route: 'GET /products',
        products: result.rows.length
      }, 'Products fetched successfully');
      
      res.json(result.rows);
    }, 500);
    
  } catch (err) {
    console.log('[ERROR] GET /products - Database error:', err);
    logger.error({
      route: 'GET /products',
      error: err.message
    }, 'GET /products failed');
    
    next(err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    var id = req.params.id;
    
    var query = "SELECT * FROM products WHERE id = " + id;
    
    const result = await pool.query(query);
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send('Product not found');
    }
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

module.exports = router;
