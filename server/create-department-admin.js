const mongoose = require('mongoose');
const User = require('./models/User');
const Department = require('./models/Department');
const bcrypt = require('bcryptjs');

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
  
  console.log('Found department:', department.name);
  
  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);
  
  // Create a new department admin user
  const newUser = new User({
    user_id: 'DA001',
    first_name: 'Department',
    middle_initial: 'A',
    last_name: 'Admin',
    email: 'da001@smartleave.com',
    password: hashedPassword,
    user_type: 'department_admin',
    department_id: department._id,
    position: 'Department Admin',
    start_date: new Date()
  });
  
  try {
    const savedUser = await newUser.save();
    console.log('Department admin user created successfully:', savedUser);
  } catch (error) {
    console.error('Error creating department admin user:', error);
  }
  
  // Close connection
  mongoose.connection.close();
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});