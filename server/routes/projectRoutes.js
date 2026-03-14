const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// CREATE PROJECT
router.post('/create', async (req, res) => {
  try {
    const { 
      contractorId, 
      contractorName, 
      projectName, 
      description, 
      location, 
      budget, 
      duration, 
      workersNeeded, 
      skillsRequired,
      startDate,
      endDate
    } = req.body;

    if (!contractorId || !projectName || !description) {
      return res.status(400).json({
        success: false,
        msg: 'Contractor ID, Project Name and Description are required'
      });
    }

    const newProject = await Project.create({
      contractorId,
      contractorName,
      projectName,
      description,
      location,
      budget,
      duration,
      workersNeeded,
      skillsRequired,
      startDate,
      endDate,
      status: 'OPEN'
    });

    res.json({ success: true, project: newProject });
  } catch (err) {
    console.error('Project create error:', err);
    res.status(500).json({ success: false, msg: 'Server Error' });
  }
});

// GET PROJECTS FOR CONTRACTOR
router.get('/contractor/:contractorId', async (req, res) => {
  try {
    const projects = await Project.find({ contractorId: req.params.contractorId })
      .sort({ createdAt: -1 });

    res.json({ success: true, projects });
  } catch (err) {
    console.error('Contractor projects error:', err);
    res.status(500).json({ success: false, msg: 'Server Error' });
  }
});

// GET ALL OPEN PROJECTS
router.get('/open', async (req, res) => {
  try {
    const { skill, location } = req.query;
    
    let query = { status: 'OPEN' };
    
    if (skill && skill !== 'All') {
      query.skillsRequired = skill;
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const projects = await Project.find(query)
      .sort({ createdAt: -1 });

    res.json({ success: true, projects });
  } catch (err) {
    console.error('Open projects error:', err);
    res.status(500).json({ success: false, msg: 'Server Error' });
  }
});

// UPDATE PROJECT STATUS
router.put('/:projectId/status', async (req, res) => {
  try {
    const { status } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      { status },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, msg: 'Project not found' });
    }

    res.json({ success: true, project });
  } catch (err) {
    console.error('Update project status error:', err);
    res.status(500).json({ success: false, msg: 'Server Error' });
  }
});

// UPDATE PROJECT
router.put('/:projectId', async (req, res) => {
  try {
    const updates = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      updates,
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, msg: 'Project not found' });
    }

    res.json({ success: true, project });
  } catch (err) {
    console.error('Update project error:', err);
    res.status(500).json({ success: false, msg: 'Server Error' });
  }
});

// DELETE PROJECT
router.delete('/:projectId', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.projectId);

    if (!project) {
      return res.status(404).json({ success: false, msg: 'Project not found' });
    }

    res.json({ success: true, msg: 'Project deleted' });
  } catch (err) {
    console.error('Delete project error:', err);
    res.status(500).json({ success: false, msg: 'Server Error' });
  }
});

module.exports = router;