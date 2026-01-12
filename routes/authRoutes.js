// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validateInput = require('../middleware/validateInput');
const { registerValidation, loginValidation } = require('../validations/authValidation');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication routes
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: |
 *       Register a new employee or admin account. Only explicitly allowed fields are accepted.
 *       Admin-only fields (salary, position, mentorName, englishLevel, etc.) cannot be set during registration for security reasons.
 *       To create an admin, provide role='admin' and the correct secretWord from environment variable.
 *       Passwords are automatically hashed before storage.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Register'
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Пользователь успешно зарегистрирован
 *                 userId:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Invalid data or user already exists
 *       403:
 *         description: Invalid secret word for admin registration
 */
router.post('/register', registerValidation, validateInput, authController.register);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: Successful login
 *       400:
 *         description: Invalid credentials
 */
router.post('/login', loginValidation, validateInput, authController.login);

module.exports = router;
