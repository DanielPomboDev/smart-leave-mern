const mongoose = require('mongoose');
const User = require('./models/User');
const LeaveRequest = require('./models/LeaveRequest');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/smartleave')
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Find user emp001
  const user = await User.findOne({ user_id: 'emp001' });
  
  if (!user) {
    console.log('User emp001 not found');
    mongoose.connection.close();
    return;
  }
  
  console.log('User emp001 found:');
  console.log(`- Name: ${user.first_name} ${user.last_name}`);
  console.log(`- Department: ${user.department_id}`);
  console.log(`- Position: ${user.position}`);
  
  // Find leave requests for this user
  const leaveRequests = await LeaveRequest.find({ user_id: 'emp001' });
  
  console.log(`

Leave requests for emp001:`);
  console.log(`Found ${leaveRequests.length} leave requests`);
  
  leaveRequests.forEach((request, index) => {
    console.log(`

Request ${index + 1}:`);
    console.log(`- ID: ${request._id}`);
    console.log(`- Type: ${request.leave_type}`);
    console.log(`- Start Date: ${request.start_date}`);
    console.log(`- End Date: ${request.end_date}`);
    console.log(`- Status: ${request.status}`);
  });
  
  // Close connection
  mongoose.connection.close();
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});