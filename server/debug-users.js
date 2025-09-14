const mongoose = require('mongoose');
const User = require('./models/User');
const LeaveRequest = require('./models/LeaveRequest');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/smartleave')
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Check a few leave requests
  console.log('=== Sample Leave Requests ===');
  const leaveRequests = await LeaveRequest.find({}).limit(5);
  leaveRequests.forEach(request => {
    console.log(`Request ID: ${request._id}, User ID: "${request.user_id}", Type: ${request.leave_type}, Status: ${request.status}`);
  });
  
  // Check users with those user_ids
  console.log('\n=== Checking Users ===');
  for (const request of leaveRequests) {
    const user = await User.findOne({ user_id: request.user_id });
    if (user) {
      console.log(`Found user for request ${request._id}: ${user.first_name} ${user.last_name}, Department: ${user.department_id}`);
    } else {
      console.log(`NO USER FOUND for request ${request._id} with user_id: "${request.user_id}"`);
    }
  }
  
  mongoose.connection.close();
})
.catch(error => {
  console.error('Connection error:', error);
});