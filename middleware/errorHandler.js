// middleware/errorHandler.js
const logger = require('../utils/logger');

module.exports = function errorHandler(err, req, res, next) {
  logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
  );
  res.status(err.status || 500).json({ error: err.message || 'Внутренняя ошибка сервера' });
};
