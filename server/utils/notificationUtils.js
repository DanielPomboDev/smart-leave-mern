const { createNotification } = require('../controllers/NotificationController');

// Notification types
const NOTIFICATION_TYPES = {
  NEW_LEAVE_REQUEST: 'new_request',
  LEAVE_RECOMMENDED: 'recommended',
  LEAVE_HR_APPROVED: 'hr_approved',
  LEAVE_HR_DISAPPROVED: 'hr_disapproved',
  LEAVE_MAYOR_APPROVED: 'mayor_approved',
  LEAVE_MAYOR_DISAPPROVED: 'mayor_disapproved',
  LEAVE_DEPARTMENT_DISAPPROVED: 'department_disapproved'
};

// Send notification for new leave request to department admin
const sendNewLeaveRequestNotification = async (leaveRequest, departmentAdminId) => {
  // Safety check for user data
  if (!leaveRequest || !leaveRequest.user_id || !leaveRequest.user_id.first_name) {
    console.error('Invalid leave request data for notification:', leaveRequest);
    return;
  }
  
  const data = {
    message: `New leave request from ${leaveRequest.user_id.first_name} ${leaveRequest.user_id.last_name}`,
    status: 'new',
    employee_name: `${leaveRequest.user_id.first_name} ${leaveRequest.user_id.last_name}`,
    leave_type: leaveRequest.leave_type,
    start_date: leaveRequest.start_date,
    end_date: leaveRequest.end_date,
    number_of_days: leaveRequest.number_of_days
  };

  // Use departmentAdminId which should be the MongoDB _id
  return await createNotification('department_admin', departmentAdminId.toString(), NOTIFICATION_TYPES.NEW_LEAVE_REQUEST, data);
};

// Send notification for recommended leave request to HR
const sendRecommendedLeaveRequestNotification = async (leaveRequest, hrId) => {
  // Safety check for user data
  if (!leaveRequest || !leaveRequest.user_id || !leaveRequest.user_id.first_name) {
    console.error('Invalid leave request data for notification:', leaveRequest);
    return;
  }
  
  const data = {
    message: `Leave request from ${leaveRequest.user_id.first_name} ${leaveRequest.user_id.last_name} recommended for approval`,
    status: 'recommended',
    employee_name: `${leaveRequest.user_id.first_name} ${leaveRequest.user_id.last_name}`,
    leave_type: leaveRequest.leave_type,
    start_date: leaveRequest.start_date,
    end_date: leaveRequest.end_date,
    number_of_days: leaveRequest.number_of_days
  };

  return await createNotification('hr', hrId.toString(), NOTIFICATION_TYPES.LEAVE_RECOMMENDED, data);
};

// Send notification for HR approved leave request to Mayor
const sendHrApprovedLeaveRequestNotification = async (leaveRequest, mayorId) => {
  // Safety check for user data
  if (!leaveRequest || !leaveRequest.user_id || !leaveRequest.user_id.first_name) {
    console.error('Invalid leave request data for notification:', leaveRequest);
    return;
  }
  
  const data = {
    message: `Leave request from ${leaveRequest.user_id.first_name} ${leaveRequest.user_id.last_name} approved by HR`,
    status: 'hr_approved',
    employee_name: `${leaveRequest.user_id.first_name} ${leaveRequest.user_id.last_name}`,
    leave_type: leaveRequest.leave_type,
    start_date: leaveRequest.start_date,
    end_date: leaveRequest.end_date,
    number_of_days: leaveRequest.number_of_days
  };

  return await createNotification('mayor', mayorId.toString(), NOTIFICATION_TYPES.LEAVE_HR_APPROVED, data);
};

// Send notification to employee about leave request status
const sendLeaveStatusUpdateToEmployee = async (leaveRequest, notificationType, comments = '', userId = null, userType = null) => {
  // Safety check for user data
  if (!leaveRequest || !leaveRequest.user_id || !leaveRequest.user_id.first_name) {
    console.error('Invalid leave request data for notification:', leaveRequest);
    return;
  }
  
  let message = '';
  let status = '';

  switch (notificationType) {
    case NOTIFICATION_TYPES.LEAVE_RECOMMENDED:
      message = 'Your leave request has been recommended by your department head';
      status = 'recommended';
      break;
    case NOTIFICATION_TYPES.LEAVE_HR_APPROVED:
      message = 'Your leave request has been approved by HR';
      status = 'hr_approved';
      break;
    case NOTIFICATION_TYPES.LEAVE_HR_DISAPPROVED:
      message = 'Your leave request has been disapproved by HR';
      status = 'hr_disapproved';
      break;
    case NOTIFICATION_TYPES.LEAVE_MAYOR_APPROVED:
      message = 'Your leave request has been final approved by the Mayor';
      status = 'mayor_approved';
      break;
    case NOTIFICATION_TYPES.LEAVE_MAYOR_DISAPPROVED:
      message = 'Your leave request has been final disapproved by the Mayor';
      status = 'mayor_disapproved';
      break;
    case NOTIFICATION_TYPES.LEAVE_DEPARTMENT_DISAPPROVED:
      message = 'Your leave request has been disapproved by your department head';
      status = 'department_disapproved';
      break;
    default:
      message = 'Leave request status updated';
      status = 'updated';
  }

  const data = {
    message,
    status,
    employee_name: `${leaveRequest.user_id.first_name} ${leaveRequest.user_id.last_name}`,
    leave_type: leaveRequest.leave_type,
    start_date: leaveRequest.start_date,
    end_date: leaveRequest.end_date,
    number_of_days: leaveRequest.number_of_days,
    comments
  };

  // If userId and userType are provided, send to that specific user
  if (userId && userType) {
    return await createNotification(userType, userId.toString(), notificationType, data);
  }

  // Otherwise, send to the employee who made the request
  // The leaveRequest.user_id._id should be the MongoDB ObjectId
  const employeeId = leaveRequest.user_id._id ? leaveRequest.user_id._id.toString() : leaveRequest.user_id.user_id;
  return await createNotification('employee', employeeId, notificationType, data);
};

module.exports = {
  NOTIFICATION_TYPES,
  sendNewLeaveRequestNotification,
  sendRecommendedLeaveRequestNotification,
  sendHrApprovedLeaveRequestNotification,
  sendLeaveStatusUpdateToEmployee
};