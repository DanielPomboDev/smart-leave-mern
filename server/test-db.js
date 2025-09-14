const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/smartleave', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Try to find the test user
  const user = await User.findOne({ user_id: 'emp001' });
  console.log('User found:', user);
  
  // Close connection
  mongoose.connection.close();
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});