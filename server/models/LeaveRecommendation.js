const mongoose = require('mongoose');

const leaveRecommendationSchema = new mongoose.Schema({
  department_admin_id: {
    type: String,
    required: true,
    ref: 'User'
  },
  leave_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'LeaveRequest'
  },
  recommendation: {
    type: String,
    enum: ['approve', 'disapprove'],
    required: true
  },
  remarks: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LeaveRecommendation', leaveRecommendationSchema);