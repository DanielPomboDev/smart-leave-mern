const express = require('express');
const { showLogin, login, getProfile, logout } = require('../controllers/AuthController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Show login form
router.get('/login', showLogin);

// Login user
router.post('/login', login);

// Get user profile (protected route)
router.get('/profile', protect, getProfile);

// Logout user
router.post('/logout', logout);

module.exports = router;