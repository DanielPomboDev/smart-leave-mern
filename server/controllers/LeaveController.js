const LeaveRequest = require('../models/LeaveRequest');

// @desc    Create a new leave request
// @route   POST /api/leave-requests
// @access  Private
const createLeaveRequest = async (req, res) => {
  try {
    const {
      leave_type,
      subtype,
      start_date,
      end_date,
      number_of_days,
      where_spent,
      commutation,
      location_specify
    } = req.body;

    // Validate required fields
    if (!leave_type || !subtype || !start_date || !end_date || !number_of_days || !where_spent) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Format where_spent based on location type
    let formattedWhereSpent = where_spent;
    if (where_spent === 'abroad' && location_specify) {
      formattedWhereSpent = location_specify;
    } else if (where_spent === 'outpatient' && location_specify) {
      formattedWhereSpent = `Outpatient: ${location_specify}`;
    }

    // Create leave request
    const leaveRequest = new LeaveRequest({
      user_id: req.user.user_id, // Use user_id from authenticated user
      leave_type,
      subtype,
      start_date,
      end_date,
      number_of_days: parseInt(number_of_days),
      where_spent: formattedWhereSpent,
      commutation: commutation === '1' || commutation === true,
      status: 'pending'
    });

    const savedLeaveRequest = await leaveRequest.save();

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: savedLeaveRequest
    });
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing leave request'
    });
  }
};

// @desc    Get all leave requests for a user
// @route   GET /api/leave-requests
// @access  Private
const getLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({ user_id: req.user.user_id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: leaveRequests
    });
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leave requests'
    });
  }
};

// @desc    Get a specific leave request
// @route   GET /api/leave-requests/:id
// @access  Private
const getLeaveRequest = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Check if user owns this leave request
    // After population, leaveRequest.user_id is an object with a user_id field
    const requestUserId = leaveRequest.user_id && typeof leaveRequest.user_id === 'object' 
      ? leaveRequest.user_id.user_id 
      : leaveRequest.user_id;
      
    if (requestUserId !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this leave request'
      });
    }

    res.json({
      success: true,
      data: leaveRequest
    });
  } catch (error) {
    console.error('Error fetching leave request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leave request'
    });
  }
};

// @desc    Cancel a leave request
// @route   DELETE /api/leave-requests/:id
// @access  Private
const cancelLeaveRequest = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id);

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Check if user owns this leave request
    // After population, leaveRequest.user_id is an object with a user_id field
    const requestUserId = leaveRequest.user_id && typeof leaveRequest.user_id === 'object' 
      ? leaveRequest.user_id.user_id 
      : leaveRequest.user_id;
      
    if (requestUserId !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this leave request'
      });
    }

    // Check if the leave request can be cancelled
    const cancellableStatuses = ['pending', 'recommended', 'hr_approved'];
    if (!cancellableStatuses.includes(leaveRequest.status)) {
      return res.status(400).json({
        success: false,
        message: 'This leave request cannot be cancelled at this stage'
      });
    }

    // Update status to cancelled
    leaveRequest.status = 'cancelled';
    const updatedLeaveRequest = await leaveRequest.save();

    res.json({
      success: true,
      message: 'Leave request has been successfully cancelled',
      data: updatedLeaveRequest
    });
  } catch (error) {
    console.error('Error cancelling leave request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling leave request'
    });
  }
};

module.exports = {
  createLeaveRequest,
  getLeaveRequests,
  getLeaveRequest,
  cancelLeaveRequest
};