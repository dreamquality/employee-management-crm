// validations/userValidation.js
const { body, query, param, validationResult } = require('express-validator');

exports.userIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
];

exports.userUpdateValidation = [
  body('firstName')
    .optional()
    .isLength({ min: 2, max: 40 }).withMessage('Имя должно быть от 2 до 40 символов')
    .notEmpty().withMessage('Имя не может быть пустым'),
  
  body('lastName')
    .optional()
    .isLength({ min: 2, max: 40 }).withMessage('Фамилия должна быть от 2 до 40 символов')
    .notEmpty().withMessage('Фамилия не может быть пустой'),

  body('middleName')
    .optional()
    .isLength({ min: 2, max: 40 }).withMessage('Отчество должно быть от 2 до 40 символов')
    .notEmpty().withMessage('Отчество не может быть пустым'),

  body('birthDate')
    .optional()
    .isDate().withMessage('Некорректная дата рождения'),

  body('phone')
    .optional()
    .isLength({ max: 50 }).withMessage('Телефон не должен быть длиннее 50 символов')
    .notEmpty().withMessage('Телефон не может быть пустым'),

  body('email')
    .optional()
    .isEmail().withMessage('Некорректный email')
    .isLength({ min: 5, max: 80 }).withMessage('Email должен быть от 5 до 80 символов'),

  body('programmingLanguage')
    .optional()
    .isLength({ max: 100 }).withMessage('Язык программирования не должен быть длиннее 100 символов')
    .notEmpty().withMessage('Язык программирования не может быть пустым'),

  body('country')
    .optional()
    .notEmpty().withMessage('Страна не может быть пустой'),

  body('bankCard')
    .optional()
    .notEmpty().withMessage('Банковская карта не может быть пустой'),

  body('workingHoursPerWeek')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage('Параметр "workingHoursPerWeek" должен быть положительным целым числом'),

  // Новые поля
  body('linkedinLink')
    .optional()
    .isURL().withMessage('Некорректная ссылка на LinkedIn'),

  body('githubLink')
    .optional()
    .isURL().withMessage('Некорректная ссылка на GitHub'),

  body('hireDate')
    .optional()
    .isDate().withMessage('Некорректная дата приёма на работу'),

  body('adminNote')
    .optional()
    .isString().withMessage('Заметка администратора должна быть строкой'),

  body('englishLevel')
    .optional()
    .isString().withMessage('Уровень английского должен быть строкой'),

  body('vacationDates')
    .optional()
    .custom((value) => { return Array.isArray(value) || typeof value === 'string'; }).withMessage('Даты отпусков должны быть массивом дат или одной датой'),

  body('mentorName')
    .optional()
    .isString().withMessage('Имя ментора должно быть строкой'),

  body('position')
    .optional()
    .isString().withMessage('Позиция должна быть строкой'),

  body('salary')
    .optional()
    .isFloat({ min: 0 }).withMessage('Зарплата должна быть положительным числом'),

  body('role')
    .optional()
    .isIn(['employee', 'admin']).withMessage('Роль должна быть employee или admin'),
];

exports.userCreateValidation = [
  body('email')
    .isEmail().withMessage('Некорректный email')
    .isLength({ min: 5, max: 80 }).withMessage('Email должен быть от 5 до 80 символов'),

  body('password')
    .isLength({ min: 6, max: 20 }).withMessage('Пароль должен быть от 6 до 20 символов'),

  body('firstName')
    .isLength({ min: 2, max: 40 }).withMessage('Имя должно быть от 2 до 40 символов')
    .notEmpty().withMessage('Имя обязательно'),

  body('lastName')
    .isLength({ min: 2, max: 40 }).withMessage('Фамилия должна быть от 2 до 40 символов')
    .notEmpty().withMessage('Фамилия обязательна'),

  body('middleName')
    .optional()
    .isLength({ min: 2, max: 40 }).withMessage('Отчество должно быть от 2 до 40 символов'),

  body('phone')
    .optional()
    .isLength({ max: 50 }).withMessage('Телефон не должен быть длиннее 50 символов'),

  body('programmingLanguage')
    .optional()
    .isLength({ max: 100 }).withMessage('Язык программирования не должен быть длиннее 100 символов'),

  body('workingHoursPerWeek')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage('Параметр "workingHoursPerWeek" должен быть положительным целым числом'),

  // Новые поля
  body('birthDate')
    .optional()
    .isDate().withMessage('Некорректная дата рождения'),

  body('country')
    .optional()
    .isString().withMessage('Страна должна быть строкой'),

  body('bankCard')
    .optional()
    .isString().withMessage('Банковская карта должна быть строкой'),

  body('linkedinLink')
    .optional()
    .isURL().withMessage('Некорректная ссылка на LinkedIn'),

  body('githubLink')
    .optional()
    .isURL().withMessage('Некорректная ссылка на GitHub'),

  body('hireDate')
    .optional()
    .isDate().withMessage('Некорректная дата приёма на работу'),

  body('adminNote')
    .optional()
    .isString().withMessage('Заметка администратора должна быть строкой'),

  body('englishLevel')
    .optional()
    .isString().withMessage('Уровень английского должен быть строкой'),

  body('vacationDates')
    .optional()
    .custom((value) => { return Array.isArray(value) || typeof value === 'string'; }).withMessage('Даты отпусков должны быть массивом дат или одной датой'),

  body('mentorName')
    .optional()
    .isString().withMessage('Имя ментора должно быть строкой'),

  body('position')
    .optional()
    .isString().withMessage('Позиция должна быть строкой'),

  body('salary')
    .optional()
    .isFloat({ min: 0 }).withMessage('Зарплата должна быть положительным числом'),

  body('role')
    .optional()
    .isIn(['employee', 'admin']).withMessage('Роль должна быть employee или admin'),
];



exports.userListValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Параметр "page" должен быть положительным целым числом'),
  query('limit').optional().isInt({ min: 1 }).withMessage('Параметр "limit" должен быть положительным целым числом'),
  query('firstName').optional().isString(),
  query('lastName').optional().isString(),
  query('sortBy').optional().isIn(['registrationDate', 'programmingLanguage', 'country', 'mentorName', 'englishLevel', 'position']),
  query('order').optional().isIn(['ASC', 'DESC']),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];