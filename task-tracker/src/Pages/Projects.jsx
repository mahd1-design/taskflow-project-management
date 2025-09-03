import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Calendar, Users, Target, ChevronRight, MoreHorizontal,
  CheckSquare, Menu, Bell, User, Home, Clock, TrendingUp, AlertCircle,
  Briefcase, Star, Edit3, Trash2, Loader, X
} from 'lucide-react';

const ProjectsPage = ({ onNavigate, onLogout, user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    planning: 0,
    overdue: 0
  });

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    priority: 'medium',
    category: 'Development',
    budget: '',
    startDate: '',
    deadline: '',
    projectManager: '',
    client: '',
    team: []
  });

  // API Configuration
  const API_BASE_URL = 'http://localhost:5000/api';
  
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const apiCall = async (endpoint, method = 'GET', data = null) => {
    try {
      const config = {
        method,
        headers: getAuthHeaders(),
      };

      if (data) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong');
      }

      return result;
    } catch (error) {
      throw new Error(error.message || 'Network error occurred');
    }
  };

  // Data fetching functions
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filter === 'active') params.append('status', 'active');
      if (filter === 'completed') params.append('status', 'completed');
      if (filter === 'planning') params.append('status', 'planning');
      if (filter === 'high-priority') params.append('priority', 'high,critical');
      if (searchTerm) params.append('search', searchTerm);
      
      const queryString = params.toString();
      const endpoint = queryString ? `/projects?${queryString}` : '/projects';
      
      const response = await apiCall(endpoint);
      setProjects(response.data.projects || []);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiCall('/projects/stats');
      setStats(response.data.stats || {
        total: 0,
        active: 0,
        completed: 0,
        planning: 0,
        overdue: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Project operations
  const addProject = async () => {
    if (!newProject.name.trim()) return;
    
    try {
      setActionLoading({ add: true });
      
      const projectData = {
        name: newProject.name,
        description: newProject.description || '',
        priority: newProject.priority,
        category: newProject.category,
        budget: newProject.budget || undefined,
        startDate: newProject.startDate || undefined,
        deadline: newProject.deadline || undefined,
        projectManager: newProject.projectManager || undefined,
        client: newProject.client || undefined,
        team: newProject.team || []
      };

      await apiCall('/projects/create', 'POST', projectData);
      
      // Reset form and refresh data
      setNewProject({ 
        name: '', 
        description: '', 
        priority: 'medium', 
        category: 'Development', 
        budget: '', 
        startDate: '', 
        deadline: '', 
        projectManager: '', 
        client: '', 
        team: [] 
      });
      setShowAddForm(false);
      
      // Refresh projects and stats
      await Promise.all([fetchProjects(), fetchStats()]);
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading({ add: false });
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    
    try {
      setActionLoading({ [id]: 'delete' });
      await apiCall(`/projects/${id}`, 'DELETE');
      await Promise.all([fetchProjects(), fetchStats()]);
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading({ [id]: false });
    }
  };

  const addTeamMember = async (projectId, memberName) => {
    try {
      setActionLoading({ [projectId]: 'addMember' });
      await apiCall(`/projects/${projectId}/team/add`, 'POST', { memberName });
      await fetchProjects();
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading({ [projectId]: false });
    }
  };

  const removeTeamMember = async (projectId, memberName) => {
    try {
      setActionLoading({ [projectId]: 'removeMember' });
      await apiCall(`/projects/${projectId}/team/remove`, 'POST', { memberName });
      await fetchProjects();
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading({ [projectId]: false });
    }
  };

  // Effects
  useEffect(() => {
    fetchProjects();
    fetchStats();
    fetchTeamMembers(); // Fetch team members on component mount
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProjects();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, filter]);

  // State for team members
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(false);

  // Helper functions
  const categories = ['Development', 'Design', 'Security', 'Analytics', 'Mobile', 'Marketing'];
  const priorities = ['low', 'medium', 'high', 'critical'];

  // Fetch team members from new users API
  const fetchTeamMembers = async () => {
    try {
      setLoadingTeamMembers(true);
      
      // Use your new users endpoint
      const response = await apiCall('/users?limit=100');
      
      if (response && response.data && response.data.users) {
        // Extract user names from the response
        const members = response.data.users
          .map(user => user.name || user.email || user.username)
          .filter(Boolean)
          .sort();
        
        setTeamMembers(members);
      } else {
        // Fallback: include current user at least
        if (user && user.name) {
          setTeamMembers([user.name]);
        } else {
          setTeamMembers([]);
        }
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      // Fallback: include current user
      setTeamMembers(user && user.name ? [user.name] : []);
    } finally {
      setLoadingTeamMembers(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'low': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/20 text-emerald-400';
      case 'active': return 'bg-indigo-500/20 text-indigo-400';
      case 'planning': return 'bg-amber-500/20 text-amber-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const ErrorMessage = ({ message }) => (
    message ? (
      <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-red-400" />
        <span className="text-red-400 text-sm">{message}</span>
        <button 
          onClick={() => setError('')}
          className="ml-auto text-red-400 hover:text-red-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    ) : null
  );

  const Sidebar = () => (
    <div className={`bg-slate-900 border-r border-slate-800 transition-all duration-300 ${
      sidebarOpen ? 'w-64' : 'w-16'
    }`}>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && <h1 className="text-xl font-bold text-white">TaskFlow</h1>}
        </div>
        
        <nav className="space-y-2">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <Home className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium">Dashboard</span>}
          </button>
          <button 
            onClick={() => onNavigate('tasks')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <CheckSquare className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium">Tasks</span>}
          </button>
          <button 
            onClick={() => onNavigate('projects')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-600 text-white"
          >
            <Target className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium">Projects</span>}
          </button>
          <button 
            onClick={() => onNavigate('team')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <Users className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium">Team</span>}
          </button>
        </nav>
      </div>
    </div>
  );

  const Header = () => {
    return (
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-white">Projects</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <span className="text-white text-sm font-semibold">{user.avatar}</span>
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
              <span className="text-sm text-slate-300">{user?.name || 'User'}</span>
              <button
                onClick={onLogout}
                className="text-sm text-slate-400 hover:text-red-400 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <ErrorMessage message={error} />
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-slate-400 text-sm">Total Projects</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-indigo-400">{stats.active}</div>
              <div className="text-slate-400 text-sm">Active</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-emerald-600/20 rounded-lg flex items-center justify-center">
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-emerald-400">{stats.completed}</div>
              <div className="text-slate-400 text-sm">Completed</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-amber-600/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-amber-400">{stats.planning}</div>
              <div className="text-slate-400 text-sm">Planning</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-red-400">{stats.overdue}</div>
              <div className="text-slate-400 text-sm">Overdue</div>
            </div>
          </div>

          {/* Project Controls */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="flex gap-2">
                {['all', 'active', 'completed', 'planning', 'high-priority'].map(filterType => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-4 py-2 rounded-lg capitalize transition-all text-sm font-medium ${
                      filter === filterType
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {filterType.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New Project
            </button>

            {showAddForm && (
              <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Project name..."
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    className="col-span-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  
                  <textarea
                    placeholder="Project description..."
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    className="col-span-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20 resize-none"
                  />
                  
                  <select
                    value={newProject.priority}
                    onChange={(e) => setNewProject({...newProject, priority: e.target.value})}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {priorities.map(priority => (
                      <option key={priority} value={priority} className="bg-slate-800">
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </option>
                    ))}
                  </select>

                  <select
                    value={newProject.category}
                    onChange={(e) => setNewProject({...newProject, category: e.target.value})}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category} className="bg-slate-800">
                        {category}
                      </option>
                    ))}
                  </select>

                  <select
                    value={newProject.projectManager}
                    onChange={(e) => setNewProject({...newProject, projectManager: e.target.value})}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={loadingTeamMembers}
                  >
                    <option value="">
                      {loadingTeamMembers ? 'Loading team members...' : 'Select Project Manager'}
                    </option>
                    {teamMembers.map(member => (
                      <option key={member} value={member} className="bg-slate-800">
                        {member}
                      </option>
                    ))}
                    {teamMembers.length === 0 && !loadingTeamMembers && (
                      <option value="" disabled className="bg-slate-800 text-slate-400">
                        No team members found
                      </option>
                    )}
                  </select>

                  <input
                    type="text"
                    placeholder="Client name..."
                    value={newProject.client}
                    onChange={(e) => setNewProject({...newProject, client: e.target.value})}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <input
                    type="date"
                    placeholder="Start date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <input
                    type="date"
                    placeholder="Deadline"
                    value={newProject.deadline}
                    onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <input
                    type="text"
                    placeholder="Budget (e.g., $50,000)"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={addProject}
                    disabled={actionLoading.add}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    {actionLoading.add ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Project'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewProject({
                        name: '',
                        description: '',
                        priority: 'medium',
                        category: 'Development',
                        budget: '',
                        startDate: '',
                        deadline: '',
                        projectManager: '',
                        client: '',
                        team: []
                      });
                    }}
                    className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map(project => (
              <div key={project._id} className={`bg-slate-800 rounded-xl p-6 border transition-all ${
                isOverdue(project.deadline) && project.status === 'active'
                  ? 'border-red-500/50 hover:border-red-500/70'
                  : 'border-slate-700 hover:border-slate-600'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                      {isOverdue(project.deadline) && project.status === 'active' && (
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                          Overdue
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mb-3 line-clamp-2">{project.description}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1 text-slate-400 hover:text-indigo-400 transition-all">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteProject(project._id)}
                      disabled={actionLoading[project._id] === 'delete'}
                      className="p-1 text-slate-400 hover:text-red-400 transition-all"
                    >
                      {actionLoading[project._id] === 'delete' ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                    <button className="p-1 text-slate-400 hover:text-white transition-all">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Category:</span>
                      <span className="text-white ml-2">{project.category}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Budget:</span>
                      <span className="text-white ml-2">{project.budget || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Manager:</span>
                      <span className="text-white ml-2">{project.projectManager || 'Unassigned'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Client:</span>
                      <span className="text-white ml-2">{project.client || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-400">
                        {project.deadline ? `Due: ${new Date(project.deadline).toLocaleDateString()}` : 'No deadline'}
                      </span>
                    </div>
                    <div className="flex -space-x-2">
                      {project.team?.slice(0, 3).map((member, index) => (
                        <div 
                          key={index}
                          className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-xs text-white font-medium border-2 border-slate-800"
                          title={member}
                        >
                          {member.split(' ').map(n => n[0]).join('')}
                        </div>
                      ))}
                      {(project.team?.length || 0) > 3 && (
                        <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center text-xs text-white font-medium border-2 border-slate-800">
                          +{(project.team?.length || 0) - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {projects.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-800 rounded-full flex items-center justify-center">
                <Target className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-400">No projects found</p>
              <p className="text-slate-500 text-sm mt-1">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Create your first project to get started'
                }
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProjectsPage;