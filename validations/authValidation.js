// validations/authValidation.js
const { body } = require('express-validator');

exports.registerValidation = [
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
    .isLength({ min: 2, max: 40 }).withMessage('Отчество должно быть от 2 до 40 символов')
    .notEmpty().withMessage('Отчество обязательно'),

  body('birthDate')
    .isDate().withMessage('Некорректная дата рождения'),

  body('phone')
    .isLength({ max: 50 }).withMessage('Телефон не должен быть длиннее 50 символов')
    .notEmpty().withMessage('Телефон обязателен'),

  body('programmingLanguage')
    .isLength({ max: 100 }).withMessage('Язык программирования не должен быть длиннее 100 символов')
    .notEmpty().withMessage('Язык программирования обязателен'),
];

exports.loginValidation = [
  body('email').isEmail().withMessage('Некорректный email'),
  body('password').notEmpty().withMessage('Пароль обязателен'),
];

// Note: adminRegisterValidation is a shallow copy of registerValidation at the time of definition.
// Subsequent changes to exports.registerValidation will NOT be reflected in exports.adminRegisterValidation.
exports.adminRegisterValidation = [
  ...exports.registerValidation,
  body('secretWord')
    .custom((value) => value === process.env.SECRET_WORD)
    .withMessage('Неверное секретное слово'),
];
