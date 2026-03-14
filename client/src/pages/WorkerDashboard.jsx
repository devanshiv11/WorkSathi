import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/useAuth';

import {
  User,
  Briefcase,
  Phone,
  ShieldCheck,
  IndianRupee,
  Clock,
  Check,
  X,
  MessageCircle,
  Send,
  Edit
} from 'lucide-react';

const WorkerDashboard = () => {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('requests');
  // const [chatOpen, setChatOpen] = useState(null);
  // const [messageText, setMessageText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    skill: '',
    location: '',
    experience: '',
    dailyWage: ''
  });
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(false);

  const skills = ['Mistri', 'Plumber', 'Electrician', 'Painter', 'Carpenter', 'Labour', 'Driver', 'Maid', 'Other'];

  // Initialize availability from user data
  useEffect(() => {
    if (user?.isAvailable !== undefined) {
      setIsAvailable(user.isAvailable);
    }
  }, [user?.isAvailable]);

  // Wait for auth to load
  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.type !== 'worker') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">Unauthorized Access</p>
          <a href="/worker-login" className="text-brand-orange hover:underline">
            Please login as worker
          </a>
        </div>
      </div>
    );
  }

  // Worker profile with fallback values
  const workerProfile = {
    name: user?.name || `Worker ${user.mobile?.slice(-4) || ''}`,
    skill: user?.skill || 'General',
    location: user?.location || 'Location not set',
    mobile: user?.mobile || '',
    experience: user?.experience || '0 years',
    verified: user?.isVerified || false,
    earningsCombined: user?.earnings || 0,
    jobsDone: user?.jobsDone || 0,
    dailyWage: user?.dailyWage || 0
  };

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      if (!user?.workerId) {
        console.log('No workerId found in user:', user);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching jobs for workerId:', user.workerId);
        
        const res = await axios.get(
          `http://localhost:5000/api/jobs/worker/${user.workerId}`
        );

        if (res.data.success) {
          console.log('Jobs fetched:', res.data.jobs);
          setJobs(res.data.jobs);
        }
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user?.workerId]);

  // Toggle availability
  const toggleAvailability = async () => {
    if (!user?.workerId) return;
    
    const newStatus = !isAvailable;
    setIsAvailable(newStatus);
    
    try {
      await axios.put(
        `http://localhost:5000/api/workers/${user.workerId}`, 
        { isAvailable: newStatus }
      );
    } catch (err) {
      console.error('Failed to update availability', err);
      setIsAvailable(!newStatus); // Revert on error
    }
  };

  // Handle edit profile
  const handleEditClick = () => {
    setEditForm({
      name: user?.name || '',
      skill: user?.skill || 'Labour',
      location: user?.location || '',
      experience: user?.experience || '0 years',
      dailyWage: user?.dailyWage || ''
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!user?.workerId) return;

    try {
      const res = await axios.put(
        `http://localhost:5000/api/workers/${user.workerId}`, 
        editForm
      );
      
      if (res.data.success) {
        alert('Profile Updated Successfully!');
        setIsEditing(false);
        window.location.reload(); // Refresh to load updated data
      }
    } catch (err) {
      console.error('Failed to update profile', err);
      alert('Failed to update profile. Please try again.');
    }
  };

  // Handle job actions
  const handleAcceptJob = async (jobId) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/jobs/${jobId}/status`,
        { status: 'ACCEPTED' }
      );

      if (res.data.success) {
        setJobs(jobs.map(j => j._id === jobId ? res.data.job : j));
        alert('Job accepted successfully!');
      }
    } catch (err) {
      console.error('Failed to accept job:', err);
      alert('Failed to accept job');
    }
  };

  const handleDeclineJob = async (jobId) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/jobs/${jobId}/status`,
        { status: 'CANCELLED' }
      );

      if (res.data.success) {
        setJobs(jobs.map(j => j._id === jobId ? res.data.job : j));
        alert('Job declined');
      }
    } catch (err) {
      console.error('Failed to decline job:', err);
      alert('Failed to decline job');
    }
  };

  // Filter jobs by tab
  const newRequests = jobs.filter(j => j.status === 'REQUESTED');
  const activeJobs = jobs.filter(j => ['ACCEPTED', 'IN_PROGRESS'].includes(j.status));
  const pastJobs = jobs.filter(j => ['COMPLETED', 'CANCELLED'].includes(j.status));

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-brand-dark text-white p-6 rounded-b-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <User size={100} />
        </div>

        {/* Availability Toggle */}
        <div className="absolute top-6 right-6 z-20 flex flex-col items-end">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={isAvailable} 
                onChange={toggleAvailability} 
              />
              <div className={`block w-14 h-8 rounded-full transition-colors ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isAvailable ? 'transform translate-x-6' : ''}`}></div>
            </div>
          </label>
          <span className="text-xs font-bold mt-1">{isAvailable ? 'Available' : 'Busy'}</span>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-brand-dark font-bold text-2xl border-4 border-brand-orange">
            {workerProfile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold">{workerProfile.name}</h1>
            <p className="text-orange-200 text-sm flex items-center gap-1">
              {workerProfile.skill} • {workerProfile.location}
            </p>
            <p className="text-orange-300 text-xs mt-1">{workerProfile.experience} experience</p>
          </div>
        </div>

        {/* Edit Profile Button */}
        <button
          onClick={handleEditClick}
          className="absolute top-16 right-6 z-20 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 hover:bg-white/20 transition-all"
        >
          <Edit size={14} /> Edit Profile
        </button>

        {/* Stats Cards */}
        <div className="flex gap-4 mt-6">
          <div className="flex-1 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20">
            <p className="text-xs text-orange-200 mb-1">Total Earnings</p>
            <p className="text-xl font-bold">₹{workerProfile.earningsCombined}</p>
          </div>
          <div className="flex-1 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20">
            <p className="text-xs text-orange-200 mb-1">Jobs Done</p>
            <p className="text-xl font-bold">{workerProfile.jobsDone}</p>
          </div>
          <div className="flex-1 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20">
            <p className="text-xs text-orange-200 mb-1">Daily Wage</p>
            <p className="text-xl font-bold">₹{workerProfile.dailyWage}</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 mt-6">
        {workerProfile.verified && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-center gap-3 mb-6">
            <div className="bg-green-100 p-2 rounded-full text-green-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-green-800 text-sm">Skill Verified</h3>
              <p className="text-xs text-green-600">Documents & Skill approved by Admin</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 mb-4">
          <button
            className={`pb-2 px-1 font-bold ${activeTab === 'requests' ? 'text-brand-orange border-b-2 border-brand-orange' : 'text-gray-400'}`}
            onClick={() => setActiveTab('requests')}
          >
            Requests ({newRequests.length})
          </button>
          <button
            className={`pb-2 px-1 font-bold ${activeTab === 'active' ? 'text-brand-orange border-b-2 border-brand-orange' : 'text-gray-400'}`}
            onClick={() => setActiveTab('active')}
          >
            Active ({activeJobs.length})
          </button>
          <button
            className={`pb-2 px-1 font-bold ${activeTab === 'history' ? 'text-brand-orange border-b-2 border-brand-orange' : 'text-gray-400'}`}
            onClick={() => setActiveTab('history')}
          >
            History ({pastJobs.length})
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-10">
            <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading jobs...</p>
          </div>
        )}

        {/* Job list */}
        {!loading && (
          <div className="space-y-4">
            {/* New Requests Tab */}
            {activeTab === 'requests' && newRequests.map(job => (
              <div key={job._id} className="bg-white p-4 rounded-xl shadow-md border-l-4 border-yellow-400">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-gray-800">{job.jobDetails || 'Job Request'}</h4>
                    <p className="text-sm text-gray-500 mt-1">From: {job.employerName || 'Employer'}</p>
                  </div>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                    NEW
                  </span>
                </div>
                
                <div className="flex gap-4 text-xs text-gray-600 mb-4">
                  <span className="flex items-center gap-1">
                    <IndianRupee size={14} /> ₹{job.wage || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {job.duration || '1 Day'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAcceptJob(job._id)}
                    className="flex-1 bg-brand-dark text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-800"
                  >
                    <Check size={16} /> Accept
                  </button>
                  <button 
                    onClick={() => handleDeclineJob(job._id)}
                    className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-200"
                  >
                    <X size={16} /> Decline
                  </button>
                </div>
              </div>
            ))}

            {/* Active Jobs Tab */}
            {activeTab === 'active' && activeJobs.map(job => (
              <div key={job._id} className="bg-white p-4 rounded-xl shadow-md border-l-4 border-green-400">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-gray-800">{job.jobDetails || 'Active Job'}</h4>
                    <p className="text-sm text-gray-500 mt-1">Employer: {job.employerName || 'N/A'}</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                    {job.status}
                  </span>
                </div>
                
                <div className="flex gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <IndianRupee size={14} /> ₹{job.wage || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {job.duration || '1 Day'}
                  </span>
                </div>
              </div>
            ))}

            {/* History Tab */}
            {activeTab === 'history' && pastJobs.map(job => (
              <div key={job._id} className="bg-white p-4 rounded-xl shadow-md border-l-4 border-gray-400">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-gray-800">{job.jobDetails || 'Past Job'}</h4>
                    <p className="text-sm text-gray-500 mt-1">Employer: {job.employerName || 'N/A'}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    job.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {job.status}
                  </span>
                </div>
                
                <div className="flex gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <IndianRupee size={14} /> ₹{job.wage || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {job.duration || '1 Day'}
                  </span>
                </div>
              </div>
            ))}

            {/* Empty state */}
            {((activeTab === 'requests' && newRequests.length === 0) ||
              (activeTab === 'active' && activeJobs.length === 0) ||
              (activeTab === 'history' && pastJobs.length === 0)) && (
              <div className="text-center py-10 text-gray-400 italic">
                <p>No jobs found in this category.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Edit Profile</h3>
              <button onClick={() => setIsEditing(false)} className="text-gray-400">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200"
                placeholder="Name"
              />
              <select
                value={editForm.skill}
                onChange={e => setEditForm({ ...editForm, skill: e.target.value })}
                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                {skills.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input
                type="text"
                value={editForm.location}
                onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200"
                placeholder="Location"
              />
              <input
                type="text"
                value={editForm.experience}
                onChange={e => setEditForm({ ...editForm, experience: e.target.value })}
                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200"
                placeholder="Experience (e.g., 5 years)"
              />
              <input
                type="number"
                value={editForm.dailyWage}
                onChange={e => setEditForm({ ...editForm, dailyWage: e.target.value })}
                className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200"
                placeholder="Daily Wage"
              />
              <button onClick={handleSaveProfile} className="w-full bg-brand-dark text-white py-3 rounded-lg font-bold mt-4">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
