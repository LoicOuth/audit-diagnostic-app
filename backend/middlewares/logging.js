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

function loggingMiddleware(req, res, next) {
  const start = process.hrtime.bigint();
  
  res.on('finish', async () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1000000;
    
    const logData = {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs)
    };
    
    console.log('[PERF]', logData);
    
    logger.info(logData, 'Request completed');
    
    try {
      await pool.query(
        'INSERT INTO request_logs (route, method, status_code, duration_ms, error_message) VALUES ($1, $2, $3, $4, $5)',
        [req.originalUrl, req.method, res.statusCode, Math.round(durationMs), null]
      );
    } catch (err) {
      console.error('Error inserting request_log:', err);
      logger.error({ err }, 'Failed to insert request_log');
    }
  });
  
  next();
}

module.exports = loggingMiddleware;
