// validations/projectValidation.js
const { body, param, query } = require('express-validator');

exports.projectValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Project name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Project description is required')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Project description must be between 10 and 5000 characters'),
  body('wage')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Wage must be a non-negative number'),
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean value'),
];

exports.projectUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Project name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Project description cannot be empty')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Project description must be between 10 and 5000 characters'),
  body('wage')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Wage must be a non-negative number'),
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean value'),
];

exports.projectIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Project ID must be a positive integer'),
];

exports.employeeIdValidation = [
  param('employeeId')
    .isInt({ min: 1 })
    .withMessage('Employee ID must be a positive integer'),
];

exports.projectListValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('active')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Active must be true or false'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term must not exceed 100 characters'),
];

exports.assignEmployeesValidation = [
  body('employeeIds')
    .isArray({ min: 0 })
    .withMessage('employeeIds must be an array'),
  body('employeeIds.*')
    .isInt({ min: 1 })
    .withMessage('Each employee ID must be a positive integer'),
];

exports.addEmployeeValidation = [
  body('employeeId')
    .isInt({ min: 1 })
    .withMessage('employeeId must be a positive integer'),
];
