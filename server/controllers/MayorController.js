const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');
const LeaveRecommendation = require('../models/LeaveRecommendation');
const LeaveApproval = require('../models/LeaveApproval');

class MayorController {
  // Get dashboard statistics
  static async getDashboardStats(req, res) {
    try {
      console.log('Fetching dashboard stats for user:', req.user);
      const stats = {
        pending: await LeaveRequest.countDocuments({ status: 'pending' }),
        approved_this_month: await LeaveRequest.countDocuments({
          status: 'approved',
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
          }
        }),
        rejected_this_month: await LeaveRequest.countDocuments({
          status: 'disapproved',
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
          }
        }),
        total_employees: await User.countDocuments()
      };

      console.log('Dashboard stats:', stats);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get recent leave requests for dashboard
  static async getRecentLeaveRequests(req, res) {
    try {
      console.log('Fetching recent leave requests for user:', req.user);
      const leaveRequests = await LeaveRequest.find({
        status: { $in: ['hr_approved', 'approved', 'cancelled'] }
      })
        .populate({
          path: 'user_id',
          select: 'first_name last_name middle_initial department_id position user_id',
          populate: {
            path: 'department_id',
            select: 'name'
          }
        })
        .sort({ createdAt: -1 })
        .limit(5);

      console.log('Recent leave requests count:', leaveRequests.length);
      res.json(leaveRequests);
    } catch (error) {
      console.error('Error fetching recent leave requests:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get leave requests with filtering and pagination
  static async getLeaveRequests(req, res) {
    try {
      console.log('Fetching leave requests');
      console.log('User:', req.user);

      // Build filter query
      const filter = {
        status: { $in: ['hr_approved', 'approved', 'disapproved', 'cancelled'] }
      };

      console.log('Final filter:', JSON.stringify(filter, null, 2));

      // Get leave requests
      const leaveRequests = await LeaveRequest.find(filter)
        .populate({
          path: 'user_id',
          select: 'first_name last_name middle_initial department_id position user_id',
          populate: {
            path: 'department_id',
            select: 'name'
          }
        })
        .sort({ createdAt: -1 });

      console.log('Found leave requests:', leaveRequests.length);

      res.json({
        leaveRequests
      });
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get details of a specific leave request
  static async getLeaveRequestDetails(req, res) {
    try {
      console.log('Fetching leave request details for ID:', req.params.id);
      console.log('User:', req.user);
      const leaveRequest = await LeaveRequest.findById(req.params.id)
        .populate({
          path: 'user_id',
          select: 'first_name last_name middle_initial department_id position user_id',
          populate: {
            path: 'department_id',
            select: 'name'
          }
        });

      if (!leaveRequest) {
        console.log('Leave request not found for ID:', req.params.id);
        return res.status(404).json({ message: 'Leave request not found' });
      }

      // Check if the leave request is eligible for mayor action
      if (!['hr_approved', 'approved', 'disapproved', 'cancelled'].includes(leaveRequest.status)) {
        console.log('Leave request not eligible for mayor action, status:', leaveRequest.status);
        return res.status(403).json({ message: 'This request is not eligible for mayor approval.' });
      }

      // Get recommendations for this leave request
      const recommendations = await LeaveRecommendation.find({ leave_id: leaveRequest._id })
        .populate({
          path: 'department_admin_id',
          select: 'first_name last_name user_id',
          foreignField: 'user_id',  // Match User's user_id field instead of _id
          localField: 'department_admin_id'  // Use LeaveRecommendation's department_admin_id field
        });

      // Get approvals for this leave request
      const approvals = await LeaveApproval.find({ leave_id: leaveRequest._id })
        .populate({
          path: 'hr_manager_id',
          select: 'first_name last_name user_id',
          foreignField: 'user_id',  // Match User's user_id field instead of _id
          localField: 'hr_manager_id'  // Use LeaveApproval's hr_manager_id field
        });

      // Attach recommendations and approvals to the leave request object
      const leaveRequestWithDetails = leaveRequest.toObject();
      leaveRequestWithDetails.recommendations = recommendations;
      leaveRequestWithDetails.approvals = approvals;

      res.json(leaveRequestWithDetails);
    } catch (error) {
      console.error('Error fetching leave request details:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Process mayor's decision on a leave request
  static async processLeaveRequest(req, res) {
    try {
      console.log('Processing leave request:', req.params.id);
      console.log('User:', req.user);
      const { decision } = req.body;

      // Validate decision
      if (!['approve', 'disapprove'].includes(decision)) {
        console.log('Invalid decision value:', decision);
        return res.status(400).json({ message: 'Invalid decision value' });
      }

      // Find the leave request
      const leaveRequest = await LeaveRequest.findById(req.params.id)
        .populate({
          path: 'user_id',
          select: 'first_name last_name email user_id',
          foreignField: 'user_id',
          localField: 'user_id'
        });

      if (!leaveRequest) {
        console.log('Leave request not found for ID:', req.params.id);
        return res.status(404).json({ message: 'Leave request not found' });
      }

      // Check if the leave request is eligible for mayor action
      if (leaveRequest.status !== 'hr_approved') {
        console.log('Leave request not HR-approved yet, status:', leaveRequest.status);
        return res.status(400).json({ message: 'Request not HR-approved yet.' });
      }

      // Update status based on mayor's decision
      leaveRequest.status = decision === 'approve' ? 'approved' : 'disapproved';
      await leaveRequest.save();

      // TODO: Implement notification system to inform the employee and other involved parties

      res.json({ message: 'Final decision recorded successfully', leaveRequest });
    } catch (error) {
      console.error('Error processing leave request:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

module.exports = MayorController;