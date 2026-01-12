// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authenticateToken');
const validateInput = require('../middleware/validateInput');
const { userUpdateValidation, userCreateValidation, userListValidation, userIdValidation } = require('../validations/userValidation');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User routes
 */

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get current user's profile
 *     description: Returns the profile data of the currently authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user's profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Authorization required
 *       404:
 *         description: User not found
 */
router.get('/profile', authenticateToken, userController.getCurrentUserProfile);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new employee (admin only)
 *     description: |
 *       Admin-only endpoint to create new employee accounts with all fields.
 *       Role defaults to 'employee' if not specified.
 *       Passwords are automatically hashed before storage.
 *       A notification is created for audit trail.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *     responses:
 *       201:
 *         description: Employee successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Сотрудник успешно создан
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid data or user already exists
 *       403:
 *         description: Access denied (not admin)
 */
router.post('/users', authenticateToken, userCreateValidation, validateInput, userController.createEmployee);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete an employee (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee successfully deleted
 *       400:
 *         description: Bad request (e.g., admin trying to delete themselves)
 *       403:
 *         description: Access denied (not admin)
 *       404:
 *         description: Employee not found
 */
router.delete('/users/:id', authenticateToken, userIdValidation, validateInput, userController.deleteEmployee);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get a list of users with pagination, search, and sorting
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page
 *       - in: query
 *         name: firstName
 *         schema:
 *           type: string
 *         description: Search by first name
 *       - in: query
 *         name: lastName
 *         schema:
 *           type: string
 *         description: Search by last name
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [registrationDate, programmingLanguage, country, mentorName, englishLevel, position]
 *           default: registrationDate
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of users with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 total:
 *                   type: integer
 *                   description: Total number of users
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       401:
 *         description: Authorization required
 *       403:
 *         description: Access denied
 */
router.get('/users', authenticateToken, userListValidation, userController.getEmployees);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user's profile
 *     description: |
 *       Update user profile. Employees can update their own basic profile fields (firstName, lastName, middleName, birthDate, phone, email, programmingLanguage, country, bankCard, linkedinLink, githubLink).
 *       Admins can update all fields including admin-only fields (hireDate, adminNote, projectIds, englishLevel, vacationDates, mentorName, position, salary, role, password, workingHoursPerWeek).
 *       Passwords are automatically hashed when updated.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid data (e.g., validation errors, duplicate email)
 *       403:
 *         description: Access denied (e.g., employee trying to update admin-only fields or another user's profile)
 *       404:
 *         description: User not found
 */
router.put('/users/:id', authenticateToken, userIdValidation, userUpdateValidation, validateInput, userController.updateProfile);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get an employee by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Employee not found
 */
router.get('/users/:id', authenticateToken, userIdValidation, validateInput, userController.getEmploye);

module.exports = router;
