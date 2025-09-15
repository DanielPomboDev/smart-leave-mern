const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  notifiableType: {
    type: String,
    required: true
  },
  notifiableId: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  readAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient querying
notificationSchema.index({ notifiableType: 1, notifiableId: 1 });
notificationSchema.index({ readAt: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;