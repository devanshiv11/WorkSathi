import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { User, Smartphone, MapPin, Lock, Mail, Building2, FileText } from 'lucide-react';

const ContractorRegister = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    location: '',
    companyName: '',
    gstNumber: ''
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

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/send-otp', { mobile: formData.mobile });
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

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        mobile: formData.mobile,
        otp,
        type: 'contractor'
      });

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

  const handleSubmitDetails = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/contractors/register', formData);

      if (res.data.success) {
        const contractor = res.data.contractor;
        
        const userData = {
          userId: tempUserId,
          contractorId: contractor._id,
          name: contractor.name,
          mobile: contractor.mobile,
          email: contractor.email,
          location: contractor.location,
          companyName: contractor.companyName,
          isVerified: contractor.isVerified,
          type: 'contractor',
          token: tempToken
        };

        login(userData);
        navigate('/contractor-dashboard');
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
          Contractor Registration
        </h2>

        <p className="text-center text-gray-500 mb-8 text-sm">
          {step === 1 && 'Start posting construction projects'}
          {step === 2 && 'Verify your number'}
          {step === 3 && 'Complete your profile'}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-center text-sm">
            {error}
          </div>
        )}

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

        {step === 3 && (
          <form onSubmit={handleSubmitDetails} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="input-field pl-10"
                required
              />
            </div>

            <div className="relative">
              <Building2 className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                name="companyName"
                placeholder="Company Name"
                value={formData.companyName}
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
                placeholder="Email Address"
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

            <div className="relative">
              <FileText className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                name="gstNumber"
                placeholder="GST Number (Optional)"
                value={formData.gstNumber}
                onChange={handleChange}
                className="input-field pl-10"
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

export default ContractorRegister;