const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    employerId: {
      type: String,
      ref: 'Employer',
      required: true
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true
    },
    employerName: {
      type: String,
      default: 'Employer'
    },
    jobDetails: {
      type: String,
      required: true
    },
    wage: {
      type: Number,
      default: 0
    },
    duration: {
      type: String,
      default: '1 Day'
    },
    status: {
      type: String,
      enum: ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'REQUESTED'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', JobSchema);
