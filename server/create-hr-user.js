const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Department = require('./models/Department');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/smartleave')
.then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Create Human Resource Office department
    console.log('Creating Human Resource Office department...');
    const hrDepartment = new Department({
      name: 'Human Resource Office',
      description: 'Human Resource Management Department'
    });
    
    const savedDepartment = await hrDepartment.save();
    console.log('Department created:', savedDepartment);
    
    // Create HR user
    console.log('Creating HR user...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const hrUser = new User({
      user_id: 'hr001',
      first_name: 'HR',
      last_name: 'Manager',
      email: 'hr.manager@smartleave.local',
      department_id: savedDepartment._id,
      position: 'HR Manager',
      user_type: 'hr',
      password: hashedPassword,
      start_date: new Date()
    });
    
    const savedUser = await hrUser.save();
    console.log('HR user created:', savedUser);
    
    console.log('Successfully created HR department and user!');
  } catch (error) {
    console.error('Error creating HR department and user:', error);
  } finally {
    mongoose.connection.close();
  }
})
.catch(error => {
  console.error('Connection error:', error);
});