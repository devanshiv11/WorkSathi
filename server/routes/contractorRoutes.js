const express = require('express');
const router = express.Router();
const Contractor = require('../models/Contractor');

// POST /api/contractors/register
router.post('/register', async (req, res) => {
  try {
    const { mobile, name, email, location, companyName, gstNumber } = req.body;

    // Check if contractor already exists
    let contractor = await Contractor.findOne({ mobile });
    if (contractor) {
      return res.status(400).json({ 
        msg: 'Contractor already registered', 
        success: false 
      });
    }

    // Create new contractor
    contractor = await Contractor.create({
      name,
      mobile,
      email,
      location,
      companyName,
      gstNumber,
      isVerified: false,
      createdAt: new Date()
    });

    console.log('Contractor Registered:', contractor);

    res.json({ 
      success: true, 
      contractor,
      msg: 'Contractor registered successfully'
    });
  } catch (err) {
    console.error('Contractor registration error:', err);
    res.status(500).json({ msg: 'Server Error', success: false });
  }
});

// GET /api/contractors/profile/:mobile
router.get('/profile/:mobile', async (req, res) => {
  try {
    const contractor = await Contractor.findOne({ mobile: req.params.mobile });

    if (!contractor) {
      return res.status(404).json({ 
        msg: 'Contractor not found', 
        success: false 
      });
    }

    res.json({ 
      success: true, 
      contractor 
    });
  } catch (err) {
    console.error('Get contractor profile error:', err);
    res.status(500).json({ msg: 'Server Error', success: false });
  }
});

// PUT /api/contractors/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const contractor = await Contractor.findByIdAndUpdate(id, updates, { new: true });

    if (!contractor) {
      return res.status(404).json({ 
        msg: 'Contractor not found', 
        success: false 
      });
    }

    console.log('Contractor Updated:', contractor);

    res.json({ 
      msg: 'Profile updated', 
      success: true, 
      contractor 
    });
  } catch (err) {
    console.error('Update contractor error:', err);
    res.status(500).json({ msg: 'Server Error', success: false });
  }
});

module.exports = router;