const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/:email', async (req, res, next) => {
  try {
    var email = req.params.email;
    
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1", 
      [email]
    );
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    res.status(500).send('Error');
  }
});

module.exports = router;
