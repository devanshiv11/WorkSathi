const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

console.log('JOB MODEL:', Job.modelName); // ✅ TEMP DEBUG


// ===============================
// CREATE JOB (Employer hires worker)
// ===============================
router.post('/create', async (req, res) => {
  try {
    const { employerId, workerId, employerName, jobDetails, wage, duration } = req.body;

    if (!employerId || !workerId) {
      return res.status(400).json({
        success: false,
        msg: 'Employer ID and Worker ID are required'
      });
    }

    const newJob = await Job.create({
      employerId,
      workerId,
      employerName,
      jobDetails,
      wage,
      duration
    });

    res.json({ success: true, job: newJob });
  } catch (err) {
    console.error('Job create error:', err);
    res.status(500).json({ success: false, msg: 'Server Error' });
  }
});

// ===============================
// GET JOBS FOR EMPLOYER
// ===============================
router.get('/employer/:employerId', async (req, res) => {
  try {
    const jobs = await Job.find({ employerId: req.params.employerId })
      .sort({ createdAt: -1 });

    res.json({ success: true, jobs });
  } catch (err) {
    console.error('Employer jobs error:', err);
    res.status(500).json({ success: false, msg: 'Server Error' });
  }
});

// ===============================
// GET JOBS FOR WORKER
// ===============================
router.get('/worker/:workerId', async (req, res) => {
  try {
    const jobs = await Job.find({ workerId: req.params.workerId })
      .sort({ createdAt: -1 });


    res.json({ success: true, jobs });
  } catch (err) {
    console.error('Worker jobs error:', err);
    res.status(500).json({ success: false, msg: 'Server Error' });
  }
});

// ===============================
// UPDATE JOB STATUS
// ===============================
router.put('/:jobId/status', async (req, res) => {
  try {
    const { status } = req.body;

    const job = await Job.findByIdAndUpdate(
      req.params.jobId,
      { status },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ success: false, msg: 'Job not found' });
    }

    res.json({ success: true, job });
  } catch (err) {
    console.error('Update job status error:', err);
    res.status(500).json({ success: false, msg: 'Server Error' });
  }
});

module.exports = router;
