const mongoose = require('mongoose');
const User = require('./models/User');
const Department = require('./models/Department');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/smartleave')
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Find all users and populate their departments
  const users = await User.find({}).populate('department_id');
  
  console.log('Users in the database:');
  users.forEach(user => {
    console.log(`- User ID: ${user.user_id}`);
    console.log(`  Name: ${user.first_name} ${user.last_name}`);
    console.log(`  Department: ${user.department_id ? user.department_id.name : 'None'}`);
    console.log(`  Position: ${user.position || 'None'}`);
    console.log('-------------------');
  });
  
  // Close connection
  mongoose.connection.close();
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});