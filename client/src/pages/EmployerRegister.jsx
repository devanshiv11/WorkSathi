import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

import {
  User,
  Smartphone,
  MapPin,
  Briefcase,
  Lock,
  Mail
} from 'lucide-react';

const EmployerRegister = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Mobile, 2: OTP, 3: Details
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    location: ''
  });

  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [tempUserId, setTempUserId] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // SEND OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/send-otp',
        { mobile: formData.mobile }
      );

      if (res.data.success) {
        if (res.data.otp) setDemoOtp(res.data.otp);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // VERIFY OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/verify-otp',
        {
          mobile: formData.mobile,
          otp,
          type: 'employer'
        }
      );

      if (res.data.success) {
        setTempToken(res.data.token);
        setTempUserId(res.data.user.userId);
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // REGISTER EMPLOYER
  const handleSubmitDetails = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(
        'http://localhost:5000/api/employers/register',
        formData
      );

      if (res.data.success) {
        const employer = res.data.employer;
        
        const userData = {
          userId: tempUserId,
          employerId: employer._id,
          name: employer.name,
          mobile: employer.mobile,
          email: employer.email,
          location: employer.location,
          type: 'employer',
          token: tempToken
        };

        login(userData);
        navigate('/employer-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 bg-brand-light min-h-[80vh]">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border p-6 md:p-8">

        <h2 className="text-2xl font-bold text-center text-brand-dark mb-1">
          Employer Registration
        </h2>

        <p className="text-center text-gray-500 mb-8 text-sm">
          {step === 1 && 'Start hiring skilled workers'}
          {step === 2 && 'Verify your number'}
          {step === 3 && 'Complete your profile'}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-center text-sm">
            {error}
          </div>
        )}

        {/* STEP 1: MOBILE */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="relative">
              <Smartphone className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type="tel"
                name="mobile"
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
                className="input-field pl-10"
                maxLength="10"
                required
              />
            </div>

            <button disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending OTP...' : 'Get OTP'}
            </button>
          </form>
        )}

        {/* STEP 2: OTP */}
        {step === 2 && (
          <>
            {demoOtp && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6 text-center animate-pulse">
                <p className="text-sm font-semibold mb-1">🔔 DEMO OTP</p>
                <p className="text-3xl font-bold">{demoOtp}</p>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Enter 4-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="input-field pl-10"
                  maxLength="4"
                  required
                />
              </div>

              <button disabled={loading} className="btn-primary w-full">
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          </>
        )}

        {/* STEP 3: DETAILS */}
        {step === 3 && (
          <form onSubmit={handleSubmitDetails} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                name="name"
                placeholder="Full Name / Company Name"
                value={formData.name}
                onChange={handleChange}
                className="input-field pl-10"
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type="email"
                name="email"
                placeholder="Email Address (optional)"
                value={formData.email}
                onChange={handleChange}
                className="input-field pl-10"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleChange}
                className="input-field pl-10"
                required
              />
            </div>

            <button disabled={loading} className="btn-primary w-full">
              {loading ? 'Registering...' : 'Complete Registration'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default EmployerRegister;
