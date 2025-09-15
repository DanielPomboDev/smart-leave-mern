const express = require('express');
const router = express.Router();
const { 
  getUserNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} = require('../controllers/NotificationController');
const { protect } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(protect);

// Get user notifications
router.get('/', getUserNotifications);

// Mark a notification as read
router.patch('/:id/read', markAsRead);

// Mark all notifications as read
router.patch('/read-all', markAllAsRead);

// Delete a notification
router.delete('/:id', deleteNotification);

module.exports = router;