const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    contractorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contractor',
        required: true
    },
    contractorName: {
        type: String,
        required: true
    },
    projectName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    budget: {
        type: Number,
        default: 0
    },
    duration: {
        type: String,
        default: '1 Month'
    },
    workersNeeded: {
        type: Number,
        default: 1
    },
    skillsRequired: [{
        type: String,
        enum: ['Mistri', 'Plumber', 'Electrician', 'Painter', 'Carpenter', 'Labour', 'Driver', 'Maid', 'Other']
    }],
    status: {
        type: String,
        enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
        default: 'OPEN'
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);