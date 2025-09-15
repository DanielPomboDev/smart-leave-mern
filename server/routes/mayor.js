const express = require('express');
const router = express.Router();
const MayorController = require('../controllers/MayorController');
const { protect } = require('../middleware/auth');
const { authorizeMayor } = require('../middleware/mayorAuth');

// Apply authentication middleware to all routes
router.use(protect);

// Apply mayor authorization middleware to all routes
router.use(authorizeMayor);

// Dashboard routes
router.get('/dashboard/stats', MayorController.getDashboardStats);
router.get('/dashboard/recent-requests', MayorController.getRecentLeaveRequests);

// Leave requests routes
router.get('/leave-requests', MayorController.getLeaveRequests);
router.get('/leave-requests/:id', MayorController.getLeaveRequestDetails);
router.post('/leave-requests/:id/process', MayorController.processLeaveRequest);

module.exports = router;