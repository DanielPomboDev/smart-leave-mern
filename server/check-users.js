const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// User model
const userSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true
  },
  first_name: {
    type: String,
    required: true
  },
  middle_initial: {
    type: String
  },
  last_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  department_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  position: {
    type: String
  },
  salary: {
    type: Number
  },
  start_date: {
    type: Date
  },
  password: {
    type: String,
    required: true
  },
  user_type: {
    type: String,
    enum: ['employee', 'hr', 'department_admin', 'mayor'],
    default: 'employee'
  },
  profile_image: {
    type: String
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartleave')
.then(async () => {
  console.log('Connected to MongoDB');
  
  // List all users
  const users = await User.find({});
  console.log('Total users in database:', users.length);
  
  users.forEach(user => {
    console.log(`- User ID: ${user.user_id}, Name: ${user.first_name} ${user.last_name}, Email: ${user.email}, Type: ${user.user_type}`);
  });
  
  mongoose.connection.close();
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});