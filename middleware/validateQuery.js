// middleware/validateQuery.js
const { query, validationResult } = require('express-validator');

exports.userListValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
  query('firstName').optional().isString(),
  query('lastName').optional().isString(),
  query('sortBy').optional().isIn(['registrationDate', 'programmingLanguage', 'country', 'mentorName', 'englishLevel']),
  query('order').optional().isIn(['ASC', 'DESC']),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
