const express = require('express');
const { 
  getDashboardStats, 
  getDepartmentLeaveRequests, 
  getDepartmentLeaveRequest, 
  recommendLeaveRequest 
} = require('../controllers/DepartmentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes need authentication
router.use(protect);

// Get department dashboard statistics
router.get('/dashboard', getDashboardStats);

// Get all leave requests for the department
router.get('/leave-requests', getDepartmentLeaveRequests);

// Get a specific leave request for the department
router.get('/leave-requests/:id', getDepartmentLeaveRequest);

// Recommend/approve a leave request
router.post('/leave-requests/:id/recommend', recommendLeaveRequest);

module.exports = router;