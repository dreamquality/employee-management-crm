// routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authenticateToken = require('../middleware/authenticateToken');
const validateInput = require('../middleware/validateInput');
const { 
  projectValidation, 
  projectUpdateValidation, 
  projectIdValidation, 
  employeeIdValidation,
  projectListValidation,
  assignEmployeesValidation,
  addEmployeeValidation
} = require('../validations/projectValidation');

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management routes
 */

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get all projects
 *     description: Returns a list of all projects. Non-admin users cannot see wage field. Can filter by active status and search by name.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by project name
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
 *           default: 100
 *         description: Number of projects per page
 *     responses:
 *       200:
 *         description: List of projects
 *       401:
 *         description: Authorization required
 */
router.get('/projects', authenticateToken, projectListValidation, validateInput, projectController.getProjects);

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Get a project by ID
 *     description: Returns details of a specific project including assigned employees. Non-admin users cannot see wage field.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project details
 *       404:
 *         description: Project not found
 *       401:
 *         description: Authorization required
 */
router.get('/projects/:id', authenticateToken, projectIdValidation, validateInput, projectController.getProject);

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project (admin only)
 *     description: Admin-only endpoint to create new projects.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               wage:
 *                 type: number
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Project successfully created
 *       400:
 *         description: Invalid data or project already exists
 *       403:
 *         description: Access denied (not admin)
 */
router.post('/projects', authenticateToken, projectValidation, validateInput, projectController.createProject);

/**
 * @swagger
 * /projects/{id}:
 *   put:
 *     summary: Update a project (admin only)
 *     description: Admin-only endpoint to update project details.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               wage:
 *                 type: number
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Invalid data
 *       403:
 *         description: Access denied (not admin)
 *       404:
 *         description: Project not found
 */
router.put('/projects/:id', authenticateToken, projectIdValidation, projectUpdateValidation, validateInput, projectController.updateProject);

/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     summary: Delete a project (admin only)
 *     description: Admin-only endpoint to delete a project.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project successfully deleted
 *       403:
 *         description: Access denied (not admin)
 *       404:
 *         description: Project not found
 */
router.delete('/projects/:id', authenticateToken, projectIdValidation, validateInput, projectController.deleteProject);

/**
 * @swagger
 * /projects/{id}/employees:
 *   post:
 *     summary: Assign employees to a project (admin only)
 *     description: Admin-only endpoint to assign multiple employees to a project (replaces existing assignments).
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeIds
 *             properties:
 *               employeeIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Employees assigned successfully
 *       400:
 *         description: Invalid data
 *       403:
 *         description: Access denied (not admin)
 *       404:
 *         description: Project not found
 */
router.post('/projects/:id/employees', authenticateToken, projectIdValidation, assignEmployeesValidation, validateInput, projectController.assignEmployees);

/**
 * @swagger
 * /projects/{id}/employee:
 *   post:
 *     summary: Add a single employee to a project (admin only)
 *     description: Admin-only endpoint to add one employee to a project.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *             properties:
 *               employeeId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Employee added successfully
 *       403:
 *         description: Access denied (not admin)
 *       404:
 *         description: Project or employee not found
 */
router.post('/projects/:id/employee', authenticateToken, projectIdValidation, addEmployeeValidation, validateInput, projectController.addEmployee);

/**
 * @swagger
 * /projects/{id}/employees/{employeeId}:
 *   delete:
 *     summary: Remove an employee from a project (admin only)
 *     description: Admin-only endpoint to remove an employee from a project.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee removed successfully
 *       403:
 *         description: Access denied (not admin)
 *       404:
 *         description: Project or employee not found
 */
router.delete('/projects/:id/employees/:employeeId', authenticateToken, projectIdValidation, employeeIdValidation, validateInput, projectController.removeEmployee);

/**
 * @swagger
 * /projects/{id}/employees:
 *   get:
 *     summary: Get all employees assigned to a project
 *     description: Returns the list of employees assigned to a specific project. Non-admin users cannot see salary field.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: List of employees
 *       400:
 *         description: Invalid project ID
 *       404:
 *         description: Project not found
 */
router.get('/projects/:id/employees', authenticateToken, projectIdValidation, validateInput, projectController.getProjectEmployees);

module.exports = router;
