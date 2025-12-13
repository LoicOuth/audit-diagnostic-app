const express = require('express');
const router = express.Router();
const pool = require('../db');
const { generateToken } = require('../utils/helpers');

const connectedUsers = [];

router.post('/register', async (req, res, next) => {
  try {
    var email = req.body.email;
    var password = req.body.password;
    
    const result = await pool.query(
      "INSERT INTO users (email, password, role) VALUES ($1, $2, 'user') RETURNING id",
      [email, password]
    );
    
    res.json({ 
      message: 'User registered successfully', 
      userId: result.rows[0].id 
    });
  } catch (err) {
    res.status(400).send('Registration failed');
  }
});

router.post('/login', async (req, res, next) => {
  try {
    var email = req.body.email;
    var password = req.body.password;
    
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND password = $2",
      [email, password]
    );
    
    if (result.rows.length > 0) {
      var row = result.rows[0];
      
      var token = generateToken(email);
      
      connectedUsers.push(email);
      
      res.json({ 
        message: 'Login successful', 
        token: token,
        user: row
      });
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (err) {
    res.status(500).send('Error');
  }
});

module.exports = { router, connectedUsers };
