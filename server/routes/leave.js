const express = require('express');
const { createLeaveRequest, getLeaveRequests, getLeaveRequest, cancelLeaveRequest } = require('../controllers/LeaveController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes need authentication
router.use(protect);

// Create a new leave request
router.post('/', createLeaveRequest);

// Get all leave requests for the authenticated user
router.get('/', getLeaveRequests);

// Get a specific leave request
router.get('/:id', getLeaveRequest);

// Cancel a leave request
router.delete('/:id', cancelLeaveRequest);

module.exports = router;