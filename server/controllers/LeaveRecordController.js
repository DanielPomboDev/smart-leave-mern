const LeaveRecord = require('../models/LeaveRecord');
const User = require('../models/User');
const { createLeaveRecordValidation, updateLeaveRecordValidation, addUndertimeValidation } = require('../middleware/leaveRecordValidation');

// Get all leave records with optional filtering
exports.index = async (req, res) => {
  try {
    const { department, user_type, search, page = 1, limit = 10 } = req.query;
    
    // Build query
    let query = User.find();
    
    // Apply department filter
    if (department && department !== 'all') {
      query = query.where('department_id', department);
    }
    
    // Apply user type filter
    if (user_type && user_type !== 'all') {
      query = query.where('user_type', user_type);
    }
    
    // Apply search filter
    if (search) {
      query = query.or([
        { first_name: { $regex: search, $options: 'i' } },
        { last_name: { $regex: search, $options: 'i' } },
        { user_id: { $regex: search, $options: 'i' } }
      ]);
    }
    
    // Populate department and paginate
    const users = await query
      .populate('department_id')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    // Get total count for pagination
    const total = await User.countDocuments(query.getQuery());
    
    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leave records', error: error.message });
  }
};

// Get leave records for a specific employee
exports.show = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find the employee by user_id field (not MongoDB _id)
    const employee = await User.findOne({ user_id: userId }).populate('department_id');
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Get leave records for this employee, ordered by year/month descending
    const allLeaveRecords = await LeaveRecord.find({ user_id: employee.user_id })
      .sort({ year: -1, month: -1 })
      .exec();
    
    // Group by year
    const leaveRecords = {};
    allLeaveRecords.forEach(record => {
      if (!leaveRecords[record.year]) {
        leaveRecords[record.year] = [];
      }
      leaveRecords[record.year].push(record);
    });
    
    // Calculate summary totals
    const vacationSummary = {
      earned: allLeaveRecords.reduce((sum, record) => sum + record.vacation_earned, 0),
      used: allLeaveRecords.reduce((sum, record) => sum + record.vacation_used, 0),
      balance: allLeaveRecords.length > 0 ? allLeaveRecords[0].vacation_balance : 0
    };
    
    const sickSummary = {
      earned: allLeaveRecords.reduce((sum, record) => sum + record.sick_earned, 0),
      used: allLeaveRecords.reduce((sum, record) => sum + record.sick_used, 0),
      balance: allLeaveRecords.length > 0 ? allLeaveRecords[0].sick_balance : 0
    };
    
    res.json({
      employee,
      leaveRecords,
      vacationSummary,
      sickSummary
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leave records', error: error.message });
  }
};

// Get leave record for a specific month/year for an employee
exports.getMonthlyRecord = async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year } = req.query;
    
    const record = await LeaveRecord.findOne({ user_id: userId, month, year });
    
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leave record', error: error.message });
  }
};

// Create a new leave record
exports.store = async (req, res) => {
  try {
    const {
      user_id,
      month,
      year,
      vacation_earned,
      vacation_used,
      sick_earned,
      sick_used,
      undertime_hours,
      vacation_entries,
      sick_entries
    } = req.body;
    
    // Validate required fields
    if (!user_id || !month || !year) {
      return res.status(400).json({ message: 'User ID, month, and year are required' });
    }
    
    // Check if user exists
    const user = await User.findOne({ user_id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create leave record
    const leaveRecord = new LeaveRecord({
      user_id,
      month,
      year,
      vacation_earned: vacation_earned || 1.25,
      vacation_used: vacation_used || 0,
      sick_earned: sick_earned || 1.25,
      sick_used: sick_used || 0,
      undertime_hours: undertime_hours || 0,
      vacation_entries: vacation_entries || [],
      sick_entries: sick_entries || [],
      // Calculate balances
      vacation_balance: (vacation_earned || 1.25) - (vacation_used || 0),
      sick_balance: (sick_earned || 1.25) - (sick_used || 0)
    });
    
    const savedRecord = await leaveRecord.save();
    
    res.status(201).json(savedRecord);
  } catch (error) {
    res.status(500).json({ message: 'Error creating leave record', error: error.message });
  }
};

// Update a leave record
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      vacation_earned,
      vacation_used,
      sick_earned,
      sick_used,
      undertime_hours,
      vacation_entries,
      sick_entries
    } = req.body;
    
    // Find the leave record
    const leaveRecord = await LeaveRecord.findById(id);
    
    if (!leaveRecord) {
      return res.status(404).json({ message: 'Leave record not found' });
    }
    
    // Update fields if provided
    if (vacation_earned !== undefined) leaveRecord.vacation_earned = vacation_earned;
    if (vacation_used !== undefined) leaveRecord.vacation_used = vacation_used;
    if (sick_earned !== undefined) leaveRecord.sick_earned = sick_earned;
    if (sick_used !== undefined) leaveRecord.sick_used = sick_used;
    if (undertime_hours !== undefined) leaveRecord.undertime_hours = undertime_hours;
    if (vacation_entries !== undefined) leaveRecord.vacation_entries = vacation_entries;
    if (sick_entries !== undefined) leaveRecord.sick_entries = sick_entries;
    
    // Recalculate balances
    leaveRecord.vacation_balance = leaveRecord.vacation_earned - leaveRecord.vacation_used;
    leaveRecord.sick_balance = leaveRecord.sick_earned - leaveRecord.sick_used;
    
    const updatedRecord = await leaveRecord.save();
    
    res.json(updatedRecord);
  } catch (error) {
    res.status(500).json({ message: 'Error updating leave record', error: error.message });
  }
};

// Add undertime to a leave record
exports.addUndertime = async (req, res) => {
  try {
    const { user_id, month, year, undertime_hours } = req.body;
    
    // Validate required fields
    if (!user_id || !month || !year || undertime_hours === undefined) {
      return res.status(400).json({ message: 'User ID, month, year, and undertime hours are required' });
    }
    
    // Round the undertime to 3 decimal places
    const undertimeToAdd = Math.round(undertime_hours * 1000) / 1000;
    
    // Check if a leave record already exists for this user/month/year
    let leaveRecord = await LeaveRecord.findOne({ user_id, month, year });
    
    if (leaveRecord) {
      // Update existing record by ADDING to the current undertime
      const newUndertime = Math.round((leaveRecord.undertime_hours + undertimeToAdd) * 1000) / 1000;
      leaveRecord.undertime_hours = newUndertime;
      
      // Deduct undertime from vacation leave balance
      const newVacationUsed = Math.round((leaveRecord.vacation_used + undertimeToAdd) * 1000) / 1000;
      leaveRecord.vacation_used = newVacationUsed;
      leaveRecord.vacation_balance = Math.round((leaveRecord.vacation_earned - leaveRecord.vacation_used) * 1000) / 1000;
      
      await leaveRecord.save();
    } else {
      // Create new record with default values
      // Deduct undertime from vacation leave balance
      const vacationUsed = Math.round(undertimeToAdd * 1000) / 1000;
      const vacationBalance = Math.round((1.25 - vacationUsed) * 1000) / 1000;
      
      leaveRecord = new LeaveRecord({
        user_id,
        month,
        year,
        vacation_earned: 1.25,
        vacation_used: vacationUsed,
        vacation_balance: vacationBalance,
        sick_earned: 1.25,
        sick_used: 0,
        sick_balance: 1.25,
        undertime_hours: undertimeToAdd
      });
      
      await leaveRecord.save();
    }
    
    res.json({
      success: true,
      message: 'Undertime added successfully',
      record: leaveRecord,
      added_undertime: undertimeToAdd
    });
  } catch (error) {
    console.error('Error in addUndertime:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding undertime: ' + error.message
    });
  }
};