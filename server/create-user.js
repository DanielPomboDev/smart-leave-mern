const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/smartleave')
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);
  
  // Create a new user with the credentials we want to use
  const newUser = new User({
    user_id: 'emp001',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    password: hashedPassword,
    user_type: 'employee',
    position: 'Software Engineer',
    salary: 75000,
    start_date: new Date('2020-01-15')
  });
  
  try {
    const savedUser = await newUser.save();
    console.log('User created successfully:', savedUser);
  } catch (error) {
    console.error('Error creating user:', error);
  }
  
  // Close connection
  mongoose.connection.close();
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});