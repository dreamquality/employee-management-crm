// validations/notificationValidation.js
const { query, param } = require('express-validator');

exports.notificationListValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('type')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Type must be between 1 and 50 characters'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'type'])
    .withMessage('sortBy must be either createdAt or type'),
  query('order')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('order must be either ASC or DESC'),
];

exports.notificationIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Notification ID must be a positive integer'),
];
