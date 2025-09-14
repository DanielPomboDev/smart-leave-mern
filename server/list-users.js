const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/smartleave')
.then(async () => {
  console.log('Connected to MongoDB');
  
  // List all users
  const users = await User.find({});
  console.log('All users:', users);
  
  // Close connection
  mongoose.connection.close();
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});