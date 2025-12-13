const pool = require('../db');
const pino = require('pino');
const fs = require('fs');

if (!fs.existsSync('./logs')) {
  fs.mkdirSync('./logs');
}

const logStream = fs.createWriteStream('./logs/app.log', { flags: 'a' });

const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info'
  },
  logStream
);

async function errorHandler(err, req, res, next) {
  console.error('[ERROR]', {
    message: err.message,
    stack: err.stack,
    route: req.originalUrl,
    method: req.method
  });
  
  logger.error({
    err,
    route: req.originalUrl,
    method: req.method
  }, 'Error occurred');
  
  try {
    const statusCode = err.statusCode || 500;
    await pool.query(
      'INSERT INTO request_logs (route, method, status_code, duration_ms, error_message) VALUES ($1, $2, $3, $4, $5)',
      [req.originalUrl, req.method, statusCode, 0, err.message]
    );
  } catch (logErr) {
    console.error('Error inserting error log:', logErr);
    logger.error({ err: logErr }, 'Failed to insert error log');
  }
  
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
}

module.exports = errorHandler;
