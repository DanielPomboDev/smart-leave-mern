const mongoose = require('mongoose');
const User = require('./models/User');
const LeaveRequest = require('./models/LeaveRequest');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/smartleave')
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Check users
  console.log('=== Users ===');
  const users = await User.find({}).limit(5);
  users.forEach(user => {
    console.log(`User ID: ${user.user_id}, Name: ${user.first_name} ${user.last_name}, Department: ${user.department_id}, Type: ${user.user_type}`);
  });
  
  // Check leave requests
  console.log('\n=== Leave Requests ===');
  const leaveRequests = await LeaveRequest.find({}).limit(5);
  leaveRequests.forEach(request => {
    console.log(`Request ID: ${request._id}, User ID: ${request.user_id}, Type: ${request.leave_type}, Status: ${request.status}`);
  });
  
  // Check department admins
  console.log('\n=== Department Admins ===');
  const deptAdmins = await User.find({ user_type: 'department_admin' }).limit(5);
  deptAdmins.forEach(admin => {
    console.log(`Admin ID: ${admin.user_id}, Name: ${admin.first_name} ${admin.last_name}, Department: ${admin.department_id}`);
  });
  
  mongoose.connection.close();
})
.catch(error => {
  console.error('Connection error:', error);
});