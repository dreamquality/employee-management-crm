const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authenticateToken = require('../middleware/authenticateToken');
const validateInput = require('../middleware/validateInput');
const { notificationListValidation, notificationIdValidation } = require('../validations/notificationValidation');

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification routes
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get the current user's list of notifications with pagination
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Notification type for filtering
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, type]
 *         description: Field to sort notifications by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sort order (ASC for ascending, DESC for descending)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of notifications per page
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       401:
 *         description: Authorization required
 *       403:
 *         description: Access denied
 */
router.get('/notifications', authenticateToken, notificationListValidation, validateInput, notificationController.getNotifications);

/**
 * @swagger
 * /notifications/{id}/mark-as-read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Authorization required
 *       403:
 *         description: Access denied
 *       404:
 *         description: Notification not found
 */
router.patch('/notifications/:id/mark-as-read', authenticateToken, notificationIdValidation, validateInput, notificationController.markAsRead);

module.exports = router;
