import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Briefcase, Clock, CheckCircle, XCircle } from 'lucide-react';
import WorkerCard from '../components/WorkerCard';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/useAuth';

const EmployerDashboard = () => {
    const { t } = useLanguage();
    const { user, loading: authLoading } = useAuth();
    const [searchParams] = useSearchParams();
    const initialSkill = searchParams.get('skill') || '';

    const [workers, setWorkers] = useState([]);
    const [myJobs, setMyJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hiringWorker, setHiringWorker] = useState(null);
    const [jobForm, setJobForm] = useState({
        duration: '1 Day',
        wage: '',
        startDate: ''
    });
    const [filters, setFilters] = useState({
        skill: initialSkill,
        location: ''
    });

    const skills = ['All', 'Mistri', 'Plumber', 'Electrician', 'Painter', 'Carpenter', 'Labour', 'Driver', 'Maid', 'Other'];

    // Debug: Check user data
    useEffect(() => {
        console.log('EMPLOYER USER DATA:', user);
        console.log('employerId:', user?.employerId);
        console.log('userId:', user?.userId);
        console.log('_id:', user?._id);
    }, [user]);

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

    // Check authorization
    if (!user || user.type !== 'employer') {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 text-lg mb-4">Unauthorized Access</p>
                    <a href="/employer-login" className="text-brand-orange hover:underline">
                        Please login as employer
                    </a>
                </div>
            </div>
        );
    }

    const fetchWorkers = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.skill && filters.skill !== 'All') params.skill = filters.skill;
            if (filters.location) params.location = filters.location;

            const res = await axios.get('http://localhost:5000/api/workers/search', { params });
            if (res.data.success) {
                setWorkers(res.data.workers);
            }
        } catch (err) {
            console.error('Error fetching workers', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyJobs = async () => {
        // Use employerId specifically for job queries
        const employerId = user?.employerId || user?._id;
        
        if (!employerId) {
            console.error('No employerId found in user object:', user);
            return;
        }

        try {
            console.log('Fetching jobs for employerId:', employerId);
            const res = await axios.get(`http://localhost:5000/api/jobs/employer/${employerId}`);
            
            if (res.data.success) {
                console.log('Jobs fetched:', res.data.jobs);
                setMyJobs(res.data.jobs.reverse());
            }
        } catch (err) {
            console.error('Error fetching my jobs', err);
        }
    };

    useEffect(() => {
        fetchWorkers();
    }, [filters.skill]);

    useEffect(() => {
        if (user?.employerId || user?._id) {
            fetchMyJobs();
        }
    }, [user?.employerId, user?._id]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchWorkers();
    };

    const openHireModal = (worker) => {
        if (!user) {
            window.location.href = '/employer-login';
            return;
        }
        setHiringWorker(worker);
        setJobForm({ 
            duration: '1 Day', 
            wage: worker.dailyWage || '', 
            startDate: new Date().toISOString().split('T')[0] 
        });
    };

    const confirmHire = async () => {
        if (!hiringWorker || !user) {
            alert('Please login to hire workers');
            return;
        }

        // Get employerId - this is the critical fix
        const employerId = user.employerId || user._id;
        
        if (!employerId) {
            alert('Employer ID not found. Please login again.');
            console.error('Missing employerId in user object:', user);
            return;
        }

        if (!jobForm.wage || jobForm.wage <= 0) {
            alert('Please enter a valid wage');
            return;
        }

        try {
            console.log('Creating job with data:', {
                employerId: employerId,
                workerId: hiringWorker._id,
                employerName: user.name || 'Employer',
                jobDetails: `Hiring for ${hiringWorker.skill} (${jobForm.duration})`,
                wage: Number(jobForm.wage),
                duration: jobForm.duration
            });

            const res = await axios.post('http://localhost:5000/api/jobs/create', {
                employerId: employerId,           // ✅ FIX: Use correct employerId
                workerId: hiringWorker._id,
                employerName: user.name || 'Employer',
                jobDetails: `Hiring for ${hiringWorker.skill} (${jobForm.duration})`,
                wage: Number(jobForm.wage),
                duration: jobForm.duration
            });

            if (res.data.success) {
                alert(`✅ Request Sent to ${hiringWorker.name}! Check 'My Requests' below.`);
                
                // Show SMS simulation toast
                const toast = document.createElement('div');
                toast.innerText = `📲 SMS Sent to ${hiringWorker.name}: "New Job Offer: Rs.${jobForm.wage}"`;
                toast.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: #333;
                    color: white;
                    padding: 12px 24px;
                    border-radius: 8px;
                    z-index: 9999;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                `;
                document.body.appendChild(toast);
                setTimeout(() => document.body.removeChild(toast), 4000);

                // Refresh jobs list and close modal
                fetchMyJobs();
                setHiringWorker(null);
                setJobForm({ duration: '1 Day', wage: '', startDate: '' });
            }
        } catch (err) {
            console.error('Hire error:', err.response?.data || err);
            alert(err.response?.data?.msg || 'Failed to send request. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-brand-light p-4 md:p-8">
            <div className="container mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-brand-dark flex items-center gap-2">
                        <Briefcase className="text-brand-orange" />
                        {t('dashboard')}
                    </h2>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">Welcome,</p>
                        <p className="font-bold text-brand-dark">{user?.name || 'Employer'}</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-10">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Filter className="absolute left-3 top-3.5 text-gray-400" size={20} />
                            <select
                                value={filters.skill}
                                onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
                                className="input-field pl-10 appearance-none bg-white cursor-pointer"
                            >
                                <option value="" disabled>Select Skill</option>
                                {skills.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder={t('searchPlaceholder')}
                                value={filters.location}
                                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                className="input-field pl-10"
                            />
                        </div>
                        <button type="submit" className="btn-primary md:w-48 shadow-lg shadow-orange-500/30">
                            {t('searchBtn')}
                        </button>
                    </form>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500 text-lg">Loading workers...</p>
                    </div>
                ) : (
                    <>
                        {workers.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                                <p className="text-gray-500 text-lg">No workers found matching your criteria.</p>
                                <p className="text-gray-400 text-sm mt-2">Try adjusting your search filters</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {workers.map(worker => {
                                    const isHired = myJobs.some(
                                        job =>
                                            job.workerId?.toString() === worker._id.toString() &&
                                            ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(job.status)
                                    );

                                    return (
                                        <WorkerCard
                                            key={worker._id}
                                            worker={{ ...worker, isVerified: worker.isVerified || false }} 
                                            onHire={openHireModal}
                                            isHired={isHired}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* My Job Requests Section */}
                <div className="mt-16 border-t border-gray-200 pt-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Clock className="text-brand-orange" />
                        My Job Requests
                    </h3>

                    <div className="space-y-4">
                        {myJobs.length === 0 ? (
                            <div className="bg-white p-8 rounded-xl border border-gray-100 text-center">
                                <p className="text-gray-500">No active job requests yet.</p>
                                <p className="text-gray-400 text-sm mt-2">Start hiring workers to see your requests here</p>
                            </div>
                        ) : (
                            myJobs.map(job => (
                                <div key={job._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow">
                                    <div>
                                        <p className="font-bold text-gray-800">{job.jobDetails}</p>
                                        <div className="flex gap-4 mt-1 text-xs text-gray-500">
                                            <span>₹{job.wage}</span>
                                            <span>•</span>
                                            <span>{job.duration}</span>
                                            <span>•</span>
                                            <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold 
                                            ${job.status === 'REQUESTED' ? 'bg-yellow-100 text-yellow-700' : ''}
                                            ${job.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-700' : ''}
                                            ${job.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-700' : ''}
                                            ${job.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : ''}
                                            ${job.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : ''}
                                        `}>
                                            {job.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Hiring Modal */}
                {hiringWorker && (
                    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in">
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up shadow-2xl">
                            <div className="flex justify-between items-center mb-6 border-b pb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-brand-dark">Hire {hiringWorker.name}</h3>
                                    <p className="text-sm text-gray-500">{hiringWorker.skill} • {hiringWorker.location}</p>
                                </div>
                                <button onClick={() => setHiringWorker(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <XCircle size={28} />
                                </button>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Job Duration</label>
                                    <select
                                        className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-brand-orange transition-colors"
                                        value={jobForm.duration}
                                        onChange={(e) => setJobForm({ ...jobForm, duration: e.target.value })}
                                    >
                                        <option>1 Day</option>
                                        <option>2 Days</option>
                                        <option>3 Days</option>
                                        <option>1 Week</option>
                                        <option>2 Weeks</option>
                                        <option>1 Month</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Start Date</label>
                                        <input
                                            type="date"
                                            className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-brand-orange transition-colors"
                                            value={jobForm.startDate}
                                            onChange={(e) => setJobForm({ ...jobForm, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Offered Wage (₹)</label>
                                        <input
                                            type="number"
                                            placeholder="e.g. 500"
                                            className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-brand-orange transition-colors"
                                            value={jobForm.wage}
                                            onChange={(e) => setJobForm({ ...jobForm, wage: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                {hiringWorker.dailyWage > 0 && (
                                    <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700">
                                        <p className="font-semibold">Suggested Daily Wage: ₹{hiringWorker.dailyWage}</p>
                                    </div>
                                )}

                                <div className="bg-yellow-50 p-3 rounded-lg text-xs text-yellow-700 flex gap-2">
                                    <CheckCircle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                                    <p>Worker's contact details will be visible after they accept your request.</p>
                                </div>

                                <button
                                    onClick={confirmHire}
                                    disabled={!jobForm.wage || jobForm.wage <= 0}
                                    className="w-full bg-brand-orange text-white py-4 rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Send Hiring Request
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployerDashboard;
