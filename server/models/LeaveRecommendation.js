const mongoose = require('mongoose');

const leaveRecommendationSchema = new mongoose.Schema({
  recommendation_id: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString(),
    unique: true,
    required: true
  },
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

// Remove any existing indexes that might be causing conflicts
leaveRecommendationSchema.index({ leave_id: 1, department_admin_id: 1 }, { unique: true });

module.exports = mongoose.model('LeaveRecommendation', leaveRecommendationSchema);