const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');

// ================= SEND OTP =================
router.post('/send-otp', async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile) {
      return res.status(400).json({ msg: 'Mobile number required' });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    await Otp.findOneAndUpdate(
      { mobile },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    console.log(`🔔 OTP for ${mobile}: ${otp}`);

    res.json({
      success: true,
      msg: 'OTP sent',
      otp // demo only
    });

  } catch (err) {
    console.error('SEND OTP ERROR:', err);
    res.status(500).json({ msg: 'Server error sending OTP' });
  }
});

// ================= VERIFY OTP =================
router.post('/verify-otp', async (req, res) => {
  try {
    console.log('REQ BODY:', req.body);

    const { mobile, otp, type } = req.body;

    const otpRecord = await Otp.findOne({ mobile });
    console.log('OTP RECORD:', otpRecord);

    if (!otpRecord) {
      return res.status(400).json({ msg: 'OTP expired or not found' });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ msg: 'Invalid OTP' });
    }

    // delete OTP after success
    await Otp.deleteOne({ mobile });

    let user = await User.findOne({ mobile });
    if (!user) {
      user = await User.create({ mobile, type });
    }

    const token = jwt.sign(
      { id: user._id, mobile: user.mobile, type: user.type },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      token,
      user: {
        userId: user._id,
        mobile: user.mobile,
        type: user.type
      }
    });


  } catch (err) {
    console.error('VERIFY OTP ERROR:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
