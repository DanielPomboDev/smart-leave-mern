const mongoose = require('mongoose');
const User = require('./models/User');
const Department = require('./models/Department');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/smartleave')
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Find the Accounting Office department
  const department = await Department.findOne({ name: 'Accounting Office' });
  
  if (!department) {
    console.log('Accounting Office department not found');
    mongoose.connection.close();
    return;
  }
  
  console.log('Found Accounting Office department:', department.name);
  
  // Update emp001 user with department
  const user = await User.findOne({ user_id: 'emp001' });
  
  if (user) {
    user.department_id = department._id;
    user.position = 'Accountant';
    await user.save();
    console.log('Updated user emp001 with Accounting Office department and position');
  } else {
    console.log('User emp001 not found');
  }
  
  // Close connection
  mongoose.connection.close();
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});