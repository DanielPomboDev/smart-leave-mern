const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Load all models to ensure proper registration
require('./models');

// Create Express app
const app = express();

// Middleware
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartleave')
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'SmartLeave API is running' });
});

// Auth routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Leave routes
const leaveRoutes = require('./routes/leave');
app.use('/api/leave-requests', leaveRoutes);

// Settings routes
const settingsRoutes = require('./routes/settings');
app.use('/api/settings', settingsRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});