const express = require('express');
const { 
  getHREmployees,
  createHREmployee,
  getHREmployee,
  updateHREmployee,
  deleteHREmployee
} = require('../controllers/HREmployeesController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes need authentication
router.use(protect);

// Get all employees with filtering and search
router.get('/', getHREmployees);

// Create a new employee
router.post('/', createHREmployee);

// Get a specific employee
router.get('/:id', getHREmployee);

// Update an employee
router.put('/:id', updateHREmployee);

// Delete an employee
router.delete('/:id', deleteHREmployee);

module.exports = router;