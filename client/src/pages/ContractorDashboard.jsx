import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/useAuth';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  MapPin, 
  IndianRupee, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Briefcase
} from 'lucide-react';

const ContractorDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    projectName: '',
    description: '',
    location: '',
    budget: '',
    duration: '1 Month',
    workersNeeded: '',
    skillsRequired: [],
    startDate: '',
    endDate: ''
  });

  const skills = ['Mistri', 'Plumber', 'Electrician', 'Painter', 'Carpenter', 'Labour', 'Driver', 'Maid', 'Other'];
  const durations = ['1 Week', '2 Weeks', '1 Month', '2 Months', '3 Months', '6 Months', '1 Year'];

  useEffect(() => {
    if (user?.contractorId) {
      fetchProjects();
    }
  }, [user?.contractorId]);

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

  if (!user || user.type !== 'contractor') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">Unauthorized Access</p>
          <a href="/contractor-login" className="text-brand-orange hover:underline">
            Please login as contractor
          </a>
        </div>
      </div>
    );
  }

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/projects/contractor/${user.contractorId}`);
      if (res.data.success) {
        setProjects(res.data.projects);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectForm({ ...projectForm, [name]: value });
  };

  const handleSkillToggle = (skill) => {
    if (projectForm.skillsRequired.includes(skill)) {
      setProjectForm({
        ...projectForm,
        skillsRequired: projectForm.skillsRequired.filter(s => s !== skill)
      });
    } else {
      setProjectForm({
        ...projectForm,
        skillsRequired: [...projectForm.skillsRequired, skill]
      });
    }
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setProjectForm({
      projectName: '',
      description: '',
      location: '',
      budget: '',
      duration: '1 Month',
      workersNeeded: '',
      skillsRequired: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    });
    setShowModal(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setProjectForm({
      projectName: project.projectName,
      description: project.description,
      location: project.location,
      budget: project.budget,
      duration: project.duration,
      workersNeeded: project.workersNeeded,
      skillsRequired: project.skillsRequired || [],
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingProject) {
        // Update existing project
        const res = await axios.put(`http://localhost:5000/api/projects/${editingProject._id}`, projectForm);
        if (res.data.success) {
          alert('Project updated successfully!');
          fetchProjects();
          setShowModal(false);
        }
      } else {
        // Create new project
        const res = await axios.post('http://localhost:5000/api/projects/create', {
          ...projectForm,
          contractorId: user.contractorId,
          contractorName: user.companyName || user.name
        });
        
        if (res.data.success) {
          alert('Project created successfully!');
          fetchProjects();
          setShowModal(false);
        }
      }
    } catch (err) {
      console.error('Error saving project:', err);
      alert(err.response?.data?.msg || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const res = await axios.delete(`http://localhost:5000/api/projects/${projectId}`);
      if (res.data.success) {
        alert('Project deleted successfully!');
        fetchProjects();
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project');
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/projects/${projectId}/status`, { status: newStatus });
      if (res.data.success) {
        fetchProjects();
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brand-dark flex items-center gap-2">
              <Building2 className="text-purple-600" />
              Contractor Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Welcome, {user.companyName || user.name}</p>
          </div>
          <button
            onClick={openCreateModal}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Post New Project
          </button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Briefcase className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-800">{projects.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Open Projects</p>
                <p className="text-2xl font-bold text-gray-800">
                  {projects.filter(p => p.status === 'OPEN').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-800">
                  {projects.filter(p => p.status === 'IN_PROGRESS').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-800">
                  {projects.filter(p => p.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">My Projects</h2>

          {loading ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No projects yet. Create your first project!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map(project => (
                <div key={project._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800">{project.projectName}</h3>
                      <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={project.status}
                        onChange={(e) => handleStatusChange(project._id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border-0 cursor-pointer ${
                          project.status === 'OPEN' ? 'bg-yellow-100 text-yellow-700' :
                          project.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-700' :
                          project.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 mt-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span>{project.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IndianRupee size={16} className="text-gray-400" />
                      <span>₹{project.budget?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-400" />
                      <span>{project.workersNeeded} Workers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      <span>{project.duration}</span>
                    </div>
                  </div>

                  {project.skillsRequired && project.skillsRequired.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {project.skillsRequired.map(skill => (
                        <span key={skill} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => openEditModal(project)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm font-medium"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project._id)}
                      className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Project Form Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingProject ? 'Edit Project' : 'Create New Project'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500">
                  <XCircle size={28} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Project Name</label>
                  <input
                    type="text"
                    name="projectName"
                    value={projectForm.projectName}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Description</label>
                  <textarea
                    name="description"
                    value={projectForm.description}
                    onChange={handleChange}
                    className="input-field"
                    rows="3"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={projectForm.location}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Budget (₹)</label>
                    <input
                      type="number"
                      name="budget"
                      value={projectForm.budget}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Duration</label>
                    <select name="duration" value={projectForm.duration} onChange={handleChange} className="input-field">
                      {durations.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Workers Needed</label>
                    <input
                      type="number"
                      name="workersNeeded"
                      value={projectForm.workersNeeded}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      value={projectForm.startDate}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={projectForm.endDate}
                      onChange={handleChange}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Skills Required</label>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(skill => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleSkillToggle(skill)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          projectForm.skillsRequired.includes(skill)
                            ? 'bg-brand-orange text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-orange text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractorDashboard;