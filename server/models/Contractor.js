const mongoose = require('mongoose');

const contractorSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    mobile: { 
        type: String, 
        required: true, 
        unique: true 
    },
    email: {
        type: String
    },
    companyName: {
        type: String
    },
    location: { 
        type: String 
    },
    gstNumber: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Contractor', contractorSchema);