import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/useAuth';

import { Smartphone, Lock, Briefcase } from 'lucide-react';

const EmployerLogin = () => {
  const [step, setStep] = useState(1); // 1: Mobile, 2: OTP
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/send-otp', { mobile });
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

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        mobile,
        otp,
        type: 'employer'
      });

      if (res.data.success) {
        // Fetch full employer profile
        const employerRes = await axios.get(`http://localhost:5000/api/employers/profile/${mobile}`);
        
        if (employerRes.data.success && employerRes.data.employer) {
          const employer = employerRes.data.employer;
          
          const userData = {
            userId: res.data.user.userId,
            employerId: employer._id,
            name: employer.name,
            mobile: employer.mobile,
            location: employer.location,
            email: employer.email,
            type: 'employer',
            token: res.data.token
          };

          login(userData);
          navigate('/employer-dashboard');
        } else {
          setError('Employer profile not found. Please register first.');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.msg || 'Invalid OTP or employer not registered');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="text-blue-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-brand-dark">Employer Login</h2>
          <p className="text-gray-500 text-sm">Hire skilled workers for your projects</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-center text-sm">
            {error}
          </div>
        )}

        {/* Demo OTP */}
        {demoOtp && step === 2 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-6 text-center animate-pulse">
            <p className="text-sm font-semibold mb-1">🔔 DEMO MODE OTP</p>
            <p className="text-3xl font-bold tracking-widest text-brand-dark">{demoOtp}</p>
            <p className="text-xs mt-1 text-yellow-600">Use this OTP to login</p>
          </div>
        )}

        {/* Step 1: Enter Mobile */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="relative">
              <Smartphone className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type="tel"
                placeholder="Mobile Number"
                className="input-field pl-10"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                required
                maxLength="10"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending OTP...' : 'Get OTP'}
            </button>

            <div className="text-center mt-4">
              <Link to="/employer-register" className="text-brand-orange text-sm font-medium hover:underline">
                New here? Register as Employer
              </Link>
            </div>
          </form>
        )}

        {/* Step 2: Enter OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="mb-4 text-center">
              <p className="text-sm text-gray-600">OTP sent to +91 {mobile}</p>
              <button type="button" onClick={() => setStep(1)} className="text-brand-orange text-xs underline">
                Change Number
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Enter 4-digit OTP"
                className="input-field pl-10"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength="4"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Verifying...' : 'Login'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default EmployerLogin;
