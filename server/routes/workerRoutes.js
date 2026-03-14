const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');

// POST /api/workers/register
router.post('/register', async (req, res) => {
  console.log("Worker register request body:", req.body);

  try {
    const { name, mobile, skill, experience, location, dailyWage } = req.body;

    // Validate required fields
    if (!name || !mobile || !skill || !location) {
      return res.status(400).json({ 
        msg: 'Name, mobile, skill, and location are required', 
        success: false 
      });
    }

    // Check if worker already exists
    const existing = await Worker.findOne({ mobile });
    if (existing) {
      return res.status(400).json({ 
        msg: 'Worker profile already exists', 
        success: false 
      });
    }

    // Create worker
    const newWorker = await Worker.create({
      name,
      mobile,
      skill,
      experience: experience || '0 years',
      location,
      isAvailable: true,
      isVerified: false,
      dailyWage: dailyWage || 0
    });

    console.log('Worker Registered:', newWorker);

    res.json({
      success: true,
      worker: newWorker,
      msg: 'Worker registered successfully'
    });

  } catch (err) {
    console.error('Worker Registration Error:', err);
    res.status(500).json({ msg: 'Server Error', success: false });
  }
});

// GET /api/workers/profile/:mobile - Get worker by mobile
router.get('/profile/:mobile', async (req, res) => {
  try {
    const worker = await Worker.findOne({ mobile: req.params.mobile });

    if (!worker) {
      return res.status(404).json({ 
        msg: 'Worker not found', 
        success: false 
      });
    }

    res.json({ 
      success: true, 
      worker 
    });
  } catch (err) {
    console.error('Get worker profile error:', err);
    res.status(500).json({ msg: 'Server Error', success: false });
  }
});

// GET /api/workers/search?skill=Plumber&location=Delhi
router.get('/search', async (req, res) => {
  try {
    const { skill, location } = req.query;

    let query = { isAvailable: true };

    if (skill && skill !== 'All') query.skill = skill;
    if (location) query.location = { $regex: location, $options: 'i' };

    const results = await Worker.find(query);

    res.json({ workers: results, success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error', success: false });
  }
});

// PUT /api/workers/:id - Update worker profile
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const worker = await Worker.findByIdAndUpdate(id, updates, { new: true });

    if (!worker) {
      return res.status(404).json({ msg: 'Worker not found', success: false });
    }

    console.log('Worker Updated:', worker);

    res.json({ msg: 'Profile updated', success: true, worker });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error', success: false });
  }
});

module.exports = router;
