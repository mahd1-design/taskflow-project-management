import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Mail, Phone, MapPin, Calendar, Users, Target, 
  CheckSquare, Menu, Bell, User, Home, MoreHorizontal, Edit3,
  Trash2, UserPlus, Star, Award, Clock, TrendingUp, Activity,
  Loader, X, AlertCircle, Save, Filter, BarChart3
} from 'lucide-react';

const TeamPage = ({ onNavigate, onLogout, user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [editingId, setEditingId] = useState(null);
  
  const [teamMembers, setTeamMembers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    departments: 0,
    avgProductivity: 0,
    teamLeads: 0
  });

  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: '',
    department: 'Engineering',
    phone: '',
    location: '',
    manager: '',
    salary: '',
    status: 'active'
  });

  const [editMember, setEditMember] = useState({
    name: '',
    email: '',
    role: '',
    department: 'Engineering',
    phone: '',
    location: '',
    manager: '',
    salary: '',
    status: 'active'
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
  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filter === 'active') params.append('status', 'active');
      if (filter === 'inactive') params.append('status', 'inactive');
      if (filter === 'engineering') params.append('department', 'Engineering');
      if (filter === 'design') params.append('department', 'Design');
      if (searchTerm) params.append('search', searchTerm);
      params.append('limit', '100');
      
      const queryString = params.toString();
      const endpoint = queryString ? `/users?${queryString}` : '/users';
      
      const response = await apiCall(endpoint);
      setTeamMembers(response.data.users || []);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiCall('/users/stats');
      setStats(response.data.stats || {
        total: 0,
        active: 0,
        departments: 0,
        avgProductivity: 0,
        teamLeads: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Team member operations
  const addMember = async () => {
    if (!newMember.name.trim() || !newMember.email.trim()) {
      setError('Name and email are required');
      return;
    }
    
    try {
      setActionLoading({ add: true });
      
      const memberData = {
        name: newMember.name.trim(),
        email: newMember.email.trim(),
        role: newMember.role.trim(),
        department: newMember.department,
        phone: newMember.phone.trim(),
        location: newMember.location.trim(),
        manager: newMember.manager.trim(),
        salary: newMember.salary.trim(),
        status: newMember.status
      };

      // If you have a POST /users endpoint, use it here:
      // await apiCall('/users', 'POST', memberData);
      
      // For now, we'll just refresh the list
      setNewMember({
        name: '',
        email: '',
        role: '',
        department: 'Engineering',
        phone: '',
        location: '',
        manager: '',
        salary: '',
        status: 'active'
      });
      setShowAddForm(false);
      setError('');
      
      // Refresh data
      await Promise.all([fetchTeamMembers(), fetchStats()]);
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading({ add: false });
    }
  };

  const updateMember = async (id) => {
    if (!editMember.name.trim() || !editMember.email.trim()) {
      setError('Name and email are required');
      return;
    }
    
    try {
      setActionLoading({ [id]: 'update' });
      
      const updateData = {
        name: editMember.name.trim(),
        email: editMember.email.trim(),
        role: editMember.role.trim(),
        department: editMember.department,
        phone: editMember.phone.trim(),
        location: editMember.location.trim(),
        manager: editMember.manager.trim(),
        salary: editMember.salary.trim(),
        status: editMember.status
      };

      await apiCall(`/users/${id}`, 'PUT', updateData);
      
      setEditingId(null);
      setError('');
      await fetchTeamMembers();
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading({ [id]: false });
    }
  };

  const deleteMember = async (id) => {
    const member = teamMembers.find(m => m._id === id);
    if (!window.confirm(`Are you sure you want to delete ${member?.name}? This action cannot be undone.`)) return;
    
    try {
      setActionLoading({ [id]: 'delete' });
      await apiCall(`/users/${id}`, 'DELETE');
      await Promise.all([fetchTeamMembers(), fetchStats()]);
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading({ [id]: false });
    }
  };

  const updateMetrics = async (id, metrics) => {
    try {
      setActionLoading({ [id]: 'metrics' });
      await apiCall(`/users/${id}/metrics`, 'PUT', metrics);
      await fetchTeamMembers();
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading({ [id]: false });
    }
  };

  const startEditing = (member) => {
    setEditingId(member._id);
    setEditMember({
      name: member.name || '',
      email: member.email || '',
      role: member.role || '',
      department: member.department || 'Engineering',
      phone: member.phone || '',
      location: member.location || '',
      manager: member.manager || '',
      salary: member.salary || '',
      status: member.status || 'active'
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditMember({
      name: '',
      email: '',
      role: '',
      department: 'Engineering',
      phone: '',
      location: '',
      manager: '',
      salary: '',
      status: 'active'
    });
  };

  // Effects
  useEffect(() => {
    fetchTeamMembers();
    fetchStats();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTeamMembers();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, filter]);

  const departments = ['Engineering', 'Design', 'Product', 'Marketing', 'Security', 'Sales', 'HR'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-400';
      case 'inactive': return 'bg-red-500/20 text-red-400';
      case 'away': return 'bg-amber-500/20 text-amber-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getProductivityColor = (productivity) => {
    if (productivity >= 90) return 'text-emerald-400';
    if (productivity >= 75) return 'text-amber-400';
    return 'text-red-400';
  };

  const filteredMembers = teamMembers;

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
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <Target className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium">Projects</span>}
          </button>
          <button 
            onClick={() => onNavigate('team')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-600 text-white"
          >
            <Users className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium">Team</span>}
          </button>
        </nav>
      </div>
    </div>
  );

  const Header = () => (
    <div className="bg-slate-900 border-b border-slate-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold text-white">Team</h2>
          {teamMembers.length > 0 && (
            <span className="text-slate-400 text-sm">
              ({filteredMembers.length} of {stats.total} members)
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="text-white text-sm">{user?.name || 'User'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <ErrorMessage message={error} />
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-indigo-400" />
              <span className="ml-3 text-slate-400">Loading team members...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Search and Filter Controls */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search team members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div className="flex gap-2">
                  {['all', 'active', 'inactive', 'engineering', 'design'].map(filterType => (
                    <button
                      key={filterType}
                      onClick={() => setFilter(filterType)}
                      className={`px-4 py-2 rounded-lg capitalize transition-all text-sm font-medium ${
                        filter === filterType
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {filterType}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Member Button */}
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Add Team Member
              </button>

              {/* Add Member Form */}
              {showAddForm && (
                <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Full name..."
                      value={newMember.name}
                      onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    
                    <input
                      type="email"
                      placeholder="Email address..."
                      value={newMember.email}
                      onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <input
                      type="text"
                      placeholder="Job title..."
                      value={newMember.role}
                      onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <select
                      value={newMember.department}
                      onChange={(e) => setNewMember({...newMember, department: e.target.value})}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept} className="bg-slate-800">
                          {dept}
                        </option>
                      ))}
                    </select>

                    <input
                      type="tel"
                      placeholder="Phone number..."
                      value={newMember.phone}
                      onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <input
                      type="text"
                      placeholder="Location..."
                      value={newMember.location}
                      onChange={(e) => setNewMember({...newMember, location: e.target.value})}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <input
                      type="text"
                      placeholder="Manager..."
                      value={newMember.manager}
                      onChange={(e) => setNewMember({...newMember, manager: e.target.value})}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <input
                      type="text"
                      placeholder="Salary (e.g., $75,000)..."
                      value={newMember.salary}
                      onChange={(e) => setNewMember({...newMember, salary: e.target.value})}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={addMember}
                      disabled={actionLoading.add}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      {actionLoading.add ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add Member'
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setNewMember({
                          name: '',
                          email: '',
                          role: '',
                          department: 'Engineering',
                          phone: '',
                          location: '',
                          manager: '',
                          salary: '',
                          status: 'active'
                        });
                      }}
                      className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Team Members Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMembers.map(member => (
                  <div key={member._id} className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all">
                    {editingId === member._id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                          <input
                            type="text"
                            value={editMember.name}
                            onChange={(e) => setEditMember({...editMember, name: e.target.value})}
                            className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Full name..."
                          />
                          
                          <input
                            type="email"
                            value={editMember.email}
                            onChange={(e) => setEditMember({...editMember, email: e.target.value})}
                            className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Email..."
                          />
                          
                          <input
                            type="text"
                            value={editMember.role}
                            onChange={(e) => setEditMember({...editMember, role: e.target.value})}
                            className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Job title..."
                          />
                          
                          <select
                            value={editMember.department}
                            onChange={(e) => setEditMember({...editMember, department: e.target.value})}
                            className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            {departments.map(dept => (
                              <option key={dept} value={dept}>
                                {dept}
                              </option>
                            ))}
                          </select>
                          
                          <select
                            value={editMember.status}
                            onChange={(e) => setEditMember({...editMember, status: e.target.value})}
                            className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="away">Away</option>
                          </select>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateMember(member._id)}
                            disabled={actionLoading[member._id] === 'update'}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                          >
                            {actionLoading[member._id] === 'update' ? (
                              <Loader className="w-3 h-3 animate-spin" />
                            ) : (
                              <Save className="w-3 h-3" />
                            )}
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                              {member.name ? member.name.split(' ').map(n => n[0]).join('') : member.email?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">{member.name || member.email}</h3>
                              <p className="text-sm text-slate-400">{member.role || 'No role specified'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => startEditing(member)}
                              className="p-1 text-slate-400 hover:text-indigo-400 transition-all"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deleteMember(member._id)}
                              disabled={actionLoading[member._id] === 'delete'}
                              className="p-1 text-slate-400 hover:text-red-400 transition-all"
                            >
                              {actionLoading[member._id] === 'delete' ? (
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

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(member.status || 'active')}`}>
                              {member.status || 'active'}
                            </span>
                            <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded-full">
                              {member.department || 'No department'}
                            </span>
                          </div>

                          {member.metrics && (
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div>
                                <div className="text-lg font-semibold text-white">{member.metrics.tasksCompleted || 0}</div>
                                <div className="text-xs text-slate-400">Completed</div>
                              </div>
                              <div>
                                <div className="text-lg font-semibold text-amber-400">{member.metrics.tasksActive || 0}</div>
                                <div className="text-xs text-slate-400">Active</div>
                              </div>
                              <div>
                                <div className="text-lg font-semibold text-indigo-400">{member.metrics.projectsActive || 0}</div>
                                <div className="text-xs text-slate-400">Projects</div>
                              </div>
                            </div>
                          )}

                          {member.productivity && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-400">Productivity</span>
                              <span className={`text-sm font-medium ${getProductivityColor(member.productivity)}`}>
                                {member.productivity}%
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{member.email}</span>
                          </div>
                          {member.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <Phone className="w-4 h-4" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                          {member.location && (
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <MapPin className="w-4 h-4" />
                              <span>{member.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Calendar className="w-4 h-4" />
                            <span>Joined {new Date(member.createdAt || member.joinDate || Date.now()).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {(member.manager || member.salary) && (
                          <div className="mb-4">
                            {member.manager && (
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-400">Manager:</span>
                                <span className="text-sm text-white">{member.manager}</span>
                              </div>
                            )}
                            {member.salary && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">Salary:</span>
                                <span className="text-sm text-white">{member.salary}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {member.lastActivity && (
                          <div className="pt-3 border-t border-slate-700">
                            <div className="text-xs text-slate-500 mb-1">Last Activity</div>
                            <div className="text-sm text-slate-300">
                              {new Date(member.lastActivity).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {filteredMembers.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-800 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-400">No team members found</p>
                  <p className="text-slate-500 text-sm mt-1">
                    {searchTerm || filter !== 'all' 
                      ? 'Try adjusting your search or filters' 
                      : 'Add team members to get started'
                    }
                  </p>
                </div>
              )}

              {/* Team Summary */}
              {teamMembers.length > 0 && (
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-6">
                      <span className="text-slate-400">
                        Showing <span className="text-white font-medium">{filteredMembers.length}</span> of <span className="text-white font-medium">{stats.total}</span> members
                      </span>
                      
                      <span className="text-slate-400">
                        <span className="text-emerald-400 font-medium">{stats.active}</span> active members
                      </span>
                    </div>
                    
                    <button
                      onClick={() => {
                        fetchTeamMembers();
                        fetchStats();
                      }}
                      disabled={loading}
                      className="text-slate-400 hover:text-white transition-all flex items-center gap-1"
                    >
                      {loading ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <TrendingUp className="w-4 h-4" />
                      )}
                      Refresh
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TeamPage;