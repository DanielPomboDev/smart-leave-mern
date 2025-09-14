const express = require('express');
const { updatePassword } = require('../controllers/SettingsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes need authentication
router.use(protect);

// Update user password
router.put('/password', updatePassword);

module.exports = router;