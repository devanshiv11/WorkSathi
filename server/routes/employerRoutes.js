const express = require('express');
const router = express.Router();
const Employer = require('../models/Employer');

// POST /api/employers/register
router.post('/register', async (req, res) => {
  try {
    const { mobile, name, email, location } = req.body;

    // Check if employer already exists
    let employer = await Employer.findOne({ mobile });
    if (employer) {
      return res.status(400).json({ 
        msg: 'Employer already registered', 
        success: false 
      });
    }

    // Create new employer
    employer = await Employer.create({
      name,
      mobile,
      email,
      location,
      createdAt: new Date()
    });

    console.log('Employer Registered:', employer);

    res.json({ 
      success: true, 
      employer,
      msg: 'Employer registered successfully'
    });
  } catch (err) {
    console.error('Employer registration error:', err);
    res.status(500).json({ msg: 'Server Error', success: false });
  }
});

// GET /api/employers/profile/:mobile - Get employer by mobile
router.get('/profile/:mobile', async (req, res) => {
  try {
    const employer = await Employer.findOne({ mobile: req.params.mobile });

    if (!employer) {
      return res.status(404).json({ 
        msg: 'Employer not found', 
        success: false 
      });
    }

    res.json({ 
      success: true, 
      employer 
    });
  } catch (err) {
    console.error('Get employer profile error:', err);
    res.status(500).json({ msg: 'Server Error', success: false });
  }
});

// PUT /api/employers/:id - Update employer profile
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const employer = await Employer.findByIdAndUpdate(id, updates, { new: true });

    if (!employer) {
      return res.status(404).json({ 
        msg: 'Employer not found', 
        success: false 
      });
    }

    console.log('Employer Updated:', employer);

    res.json({ 
      msg: 'Profile updated', 
      success: true, 
      employer 
    });
  } catch (err) {
    console.error('Update employer error:', err);
    res.status(500).json({ msg: 'Server Error', success: false });
  }
});

module.exports = router;
