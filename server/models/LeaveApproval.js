const mongoose = require('mongoose');

const leaveApprovalSchema = new mongoose.Schema({
  hr_manager_id: {
    type: String,
    ref: 'User'
  },
  leave_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'LeaveRequest'
  },
  approval: {
    type: String,
    enum: ['approve', 'disapprove'],
    required: true
  },
  approved_for: {
    type: String
  },
  disapproved_due_to: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LeaveApproval', leaveApprovalSchema);