const mongoose = require('mongoose');
const User = require('./models/User');
const Department = require('./models/Department');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/smartleave')
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Create Accounting Office department
  let department = await Department.findOne({ name: 'Accounting Office' });
  
  if (!department) {
    department = new Department({
      name: 'Accounting Office',
      description: 'Responsible for financial management and accounting operations'
    });
    await department.save();
    console.log('Created Accounting Office department');
  } else {
    console.log('Accounting Office department already exists');
  }
  
  // Update EMP001 user with department
  const user = await User.findOne({ user_id: 'EMP001' });
  
  if (user) {
    user.department_id = department._id;
    user.position = 'Software Engineer';
    await user.save();
    console.log('Updated user EMP001 with department and position');
  } else {
    console.log('User EMP001 not found');
  }
  
  // Close connection
  mongoose.connection.close();
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});