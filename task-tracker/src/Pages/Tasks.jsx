import React, { useState, useEffect } from 'react';
import {
  Plus, Check, Search, Filter, Star, Edit3, Trash2, Calendar,
  CheckSquare, Menu, Bell, User, Home, Target, Users, X, AlertCircle, Loader,
  Clock, TrendingUp, ArrowUp, MoreHorizontal, Save, FileText
} from 'lucide-react';

const TasksPage = ({ onNavigate, onLogout, user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    starred: 0,
    overdue: 0
  });

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'Business',
    dueDate: '',
    assignee: '',      // This will now store the user ID
    assigneeName: ''   // This will store the display name
  });

  const [editTask, setEditTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'Business',
    dueDate: '',
    assignee: '',      // This will now store the user ID
    assigneeName: ''   // This will store the display name
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
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');

      // Build query parameters
      const params = new URLSearchParams();
      if (filter === 'active') params.append('completed', 'false');
      if (filter === 'completed') params.append('completed', 'true');
      if (filter === 'starred') params.append('starred', 'true');
      if (filter === 'overdue') {
        params.append('completed', 'false');
        params.append('overdue', 'true');
      }
      if (searchTerm) params.append('search', searchTerm);
      params.append('sort', sortBy);
      params.append('order', sortOrder);

      const queryString = params.toString();
      const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';

      const response = await apiCall(endpoint);
      setTasks(response.data.tasks || []);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };
  const getAssigneeName = (assignedToId) => {
    if (!assignedToId) return null;
    const assignedUser = teamMembers.find(member => member.id === assignedToId);
    return assignedUser ? assignedUser.name : 'Unknown User';
  };
  const fetchStats = async () => {
    try {
      const response = await apiCall('/tasks/stats');
      setStats(response.data.stats || {
        total: 0,
        completed: 0,
        pending: 0,
        starred: 0,
        overdue: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Task operations
  const addTask = async () => {
    if (!newTask.title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      setActionLoading({ add: true });

      const taskData = {
        title: newTask.title.trim(),
        description: newTask.description.trim() || '',
        priority: newTask.priority,
        category: newTask.category,
        dueDate: newTask.dueDate || undefined,
        assignedTo: newTask.assignee || undefined  // Send user ID instead of name
      };

      await apiCall('/tasks', 'POST', taskData);

      // Reset form and refresh data
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        category: 'Business',
        dueDate: '',
        assignee: '',
        assigneeName: ''
      });
      setShowAddForm(false);
      setError('');

      // Refresh tasks and stats
      await Promise.all([fetchTasks(), fetchStats()]);
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading({ add: false });
    }
  };

  const toggleTask = async (id) => {
    try {
      setActionLoading({ [id]: 'toggle' });
      await apiCall(`/tasks/${id}/toggle`, 'PATCH');
      await Promise.all([fetchTasks(), fetchStats()]);
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading({ [id]: false });
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) return;

    try {
      setActionLoading({ [id]: 'delete' });
      await apiCall(`/tasks/${id}`, 'DELETE');
      await Promise.all([fetchTasks(), fetchStats()]);
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading({ [id]: false });
    }
  };

  const toggleStar = async (id) => {
    try {
      setActionLoading({ [id]: 'star' });
      await apiCall(`/tasks/${id}/star`, 'PATCH');
      await Promise.all([fetchTasks(), fetchStats()]);
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading({ [id]: false });
    }
  };

  const updateTask = async (id, updates) => {
    if (!updates.title?.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      setActionLoading({ [id]: 'update' });

      const updateData = {
        title: updates.title.trim(),
        description: updates.description?.trim() || '',
        priority: updates.priority,
        category: updates.category,
        dueDate: updates.dueDate || undefined,
        assignedTo: updates.assignee || undefined  // Send user ID instead of name
      };

      await apiCall(`/tasks/${id}`, 'PUT', updateData);
      await fetchTasks();
      setEditingId(null);
      setError('');
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading({ [id]: false });
    }
  };


  const startEditing = (task) => {
    setEditingId(task._id);

    // Find the assignee name from teamMembers
    const assignedUser = teamMembers.find(member => member.id === task.assignedTo);

    setEditTask({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      category: task.category,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assignee: task.assignedTo || '',  // Store the user ID
      assigneeName: assignedUser ? assignedUser.name : (task.assignee || '')  // Store display name
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTask({
      title: '',
      description: '',
      priority: 'medium',
      category: 'Business',
      dueDate: '',
      assignee: ''
    });
  };

  const saveEdit = () => {
    updateTask(editingId, editTask);
  };

  // Bulk operations
  const bulkDelete = async () => {
    const completedTasks = tasks.filter(task => task.completed);
    if (completedTasks.length === 0) {
      setError('No completed tasks to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${completedTasks.length} completed tasks?`)) return;

    try {
      setActionLoading({ bulkDelete: true });

      // Delete all completed tasks
      await Promise.all(
        completedTasks.map(task => apiCall(`/tasks/${task._id}`, 'DELETE'))
      );

      await Promise.all([fetchTasks(), fetchStats()]);
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading({ bulkDelete: false });
    }
  };

  const markAllComplete = async () => {
    const incompleteTasks = tasks.filter(task => !task.completed);
    if (incompleteTasks.length === 0) {
      setError('No incomplete tasks to mark as complete');
      return;
    }

    if (!window.confirm(`Mark ${incompleteTasks.length} tasks as complete?`)) return;

    try {
      setActionLoading({ markAll: true });

      // Toggle all incomplete tasks
      await Promise.all(
        incompleteTasks.map(task => apiCall(`/tasks/${task._id}/toggle`, 'PATCH'))
      );

      await Promise.all([fetchTasks(), fetchStats()]);
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading({ markAll: false });
    }
  };

  // Effects
  useEffect(() => {
    fetchTasks();
    fetchStats();
    fetchTeamMembers(); // Fetch team members on component mount
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTasks();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filter, sortBy, sortOrder]);

  // State for team members
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(false);

  // Helper functions
  const categories = ['Business', 'Development', 'Design', 'Finance', 'Security', 'Marketing', 'Personal'];
  const priorities = ['low', 'medium', 'high', 'critical'];

  const fetchTeamMembers = async () => {
    try {
      setLoadingTeamMembers(true);

      // Use your new users endpoint
      const response = await apiCall('/users?limit=100');

      if (response && response.data && response.data.users) {
        // Store complete user objects with id, name, and email
        const members = response.data.users
          .map(user => ({
            id: user._id,
            name: user.name || user.email,
            email: user.email
          }))
          .filter(member => member.name)
          .sort((a, b) => a.name.localeCompare(b.name));

        setTeamMembers(members);
      } else {
        // Fallback: include current user at least
        if (user && user._id && user.name) {
          setTeamMembers([{
            id: user._id,
            name: user.name,
            email: user.email
          }]);
        } else {
          setTeamMembers([]);
        }
      }
    } catch (error) {
      console.error('Error fetching team members:', error);

      // Fallback: try to get assignees from existing tasks
      try {
        const tasksResponse = await apiCall('/tasks?limit=1000');
        if (tasksResponse.data && tasksResponse.data.tasks) {
          const assignees = new Set();
          tasksResponse.data.tasks.forEach(task => {
            if (task.assignee && task.assignedTo) {
              assignees.add(JSON.stringify({
                id: task.assignedTo,
                name: task.assignee,
                email: ''
              }));
            }
          });

          // Add current user
          if (user && user._id && user.name) {
            assignees.add(JSON.stringify({
              id: user._id,
              name: user.name,
              email: user.email || ''
            }));
          }

          setTeamMembers(
            Array.from(assignees)
              .map(item => JSON.parse(item))
              .sort((a, b) => a.name.localeCompare(b.name))
          );
        } else {
          // Last resort: just current user
          setTeamMembers(user && user._id && user.name ? [{
            id: user._id,
            name: user.name,
            email: user.email || ''
          }] : []);
        }
      } catch (fallbackError) {
        console.error('Fallback team member fetch failed:', fallbackError);
        setTeamMembers(user && user._id && user.name ? [{
          id: user._id,
          name: user.name,
          email: user.email || ''
        }] : []);
      }
    } finally {
      setLoadingTeamMembers(false);
    }
  };

  // Add user search functionality for autocomplete
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  const searchUsers = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setUserSearchResults([]);
      return;
    }

    try {
      setSearchingUsers(true);
      const response = await apiCall(`/users/search?q=${encodeURIComponent(searchTerm)}`);

      if (response && response.data && response.data.users) {
        setUserSearchResults(response.data.users);
      } else {
        setUserSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setUserSearchResults([]);
    } finally {
      setSearchingUsers(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-600 text-white border-red-600';
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'low': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical': return <AlertCircle className="w-3 h-3" />;
      case 'high': return <TrendingUp className="w-3 h-3" />;
      case 'medium': return <Clock className="w-3 h-3" />;
      case 'low': return <ArrowUp className="w-3 h-3 rotate-180" />;
      default: return null;
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getTimeUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-400' };
    if (diffDays === 0) return { text: 'Due today', color: 'text-amber-400' };
    if (diffDays === 1) return { text: 'Due tomorrow', color: 'text-amber-400' };
    if (diffDays <= 7) return { text: `Due in ${diffDays} days`, color: 'text-yellow-400' };
    return { text: `Due in ${diffDays} days`, color: 'text-slate-400' };
  };

  const filteredAndSortedTasks = tasks;

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
    <div className={`bg-slate-900 border-r border-slate-800 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'
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
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-600 text-white"
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
            <h2 className="text-xl font-semibold text-white">Tasks</h2>
            {tasks.length > 0 && (
              <span className="text-slate-400 text-sm">
                ({filteredAndSortedTasks.length} of {stats.total})
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all relative">
              <Bell className="w-5 h-5" />
              {stats.overdue > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              )}
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

  if (loading && tasks.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading tasks...</p>
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

          {/* Team Members Loading Indicator */}
          {loadingTeamMembers && (
            <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg flex items-center gap-2">
              <Loader className="w-4 h-4 text-blue-400 animate-spin" />
              <span className="text-blue-400 text-sm">Loading team members from database...</span>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                  <CheckSquare className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-slate-400 text-sm">Total Tasks</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-emerald-600/20 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-emerald-400" />
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
              <div className="text-2xl font-bold text-amber-400">{stats.pending}</div>
              <div className="text-slate-400 text-sm">Pending</div>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-yellow-400">{stats.starred}</div>
              <div className="text-slate-400 text-sm">Starred</div>
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

          {/* Task Controls */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-2">
                {['all', 'active', 'completed', 'starred', 'overdue'].map(filterType => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-4 py-2 rounded-lg capitalize transition-all text-sm font-medium ${filter === filterType
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                  >
                    {filterType}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="bg-slate-700 text-slate-300 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="title-asc">Title A-Z</option>
                  <option value="title-desc">Title Z-A</option>
                  <option value="priority-desc">High Priority</option>
                  <option value="priority-asc">Low Priority</option>
                  <option value="dueDate-asc">Due Date</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add New Task
              </button>

              {stats.pending > 0 && (
                <button
                  onClick={markAllComplete}
                  disabled={actionLoading.markAll}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center gap-2"
                >
                  {actionLoading.markAll ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Complete All
                </button>
              )}

              {stats.completed > 0 && (
                <button
                  onClick={bulkDelete}
                  disabled={actionLoading.bulkDelete}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center gap-2"
                >
                  {actionLoading.bulkDelete ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Clear Completed
                </button>
              )}
            </div>

            {showAddForm && (
              <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Task title..."
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="col-span-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <textarea
                    placeholder="Task description (optional)..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="col-span-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20 resize-none"
                  />

                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {priorities.map(priority => (
                      <option key={priority} value={priority} className="bg-slate-800">
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </option>
                    ))}
                  </select>

                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category} className="bg-slate-800">
                        {category}
                      </option>
                    ))}
                  </select>

                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <select
                    value={newTask.assignee}
                    onChange={(e) => {
                      const selectedUserId = e.target.value;
                      const selectedUser = teamMembers.find(member => member.id === selectedUserId);
                      setNewTask({
                        ...newTask,
                        assignee: selectedUserId,
                        assigneeName: selectedUser ? selectedUser.name : ''
                      });
                    }}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={loadingTeamMembers}
                  >
                    <option value="">
                      {loadingTeamMembers ? 'Loading team members...' : 'Select assignee'}
                    </option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id} className="bg-slate-800">
                        {member.name} {member.email && `(${member.email})`}
                      </option>
                    ))}
                    {teamMembers.length === 0 && !loadingTeamMembers && (
                      <option value="" disabled className="bg-slate-800 text-slate-400">
                        No team members found
                      </option>
                    )}
                  </select>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={addTask}
                    disabled={actionLoading.add}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    {actionLoading.add ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Task'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewTask({ title: '', description: '', priority: 'medium', category: 'Business', dueDate: '', assignee: '' });
                    }}
                    className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Task List */}
          <div className="space-y-3">
            {filteredAndSortedTasks.map(task => (
              <div key={task._id} className={`bg-slate-800 rounded-xl p-4 border transition-all ${isOverdue(task.dueDate) && !task.completed
                  ? 'border-red-500/50 hover:border-red-500/70'
                  : 'border-slate-700 hover:border-slate-600'
                }`}>
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleTask(task._id)}
                    disabled={actionLoading[task._id] === 'toggle'}
                    className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${task.completed
                        ? 'bg-emerald-600 border-emerald-600'
                        : 'border-slate-500 hover:border-indigo-500'
                      }`}
                  >
                    {actionLoading[task._id] === 'toggle' ? (
                      <Loader className="w-3 h-3 animate-spin text-white" />
                    ) : (
                      task.completed && <Check className="w-3 h-3 text-white" />
                    )}
                  </button>

                  <div className="flex-1">
                    {editingId === task._id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editTask.title}
                          onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Task title..."
                        />

                        <textarea
                          value={editTask.description}
                          onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20 resize-none"
                          placeholder="Task description..."
                        />

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <select
                            value={editTask.assignee}
                            onChange={(e) => {
                              const selectedUserId = e.target.value;
                              const selectedUser = teamMembers.find(member => member.id === selectedUserId);
                              setEditTask({
                                ...editTask,
                                assignee: selectedUserId,
                                assigneeName: selectedUser ? selectedUser.name : ''
                              });
                            }}
                            className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            disabled={loadingTeamMembers}
                          >
                            <option value="">
                              {loadingTeamMembers ? 'Loading...' : 'Unassigned'}
                            </option>
                            {teamMembers.map(member => (
                              <option key={member.id} value={member.id}>
                                {member.name} {member.email && `(${member.email})`}
                              </option>
                            ))}
                          </select>


                          <select
                            value={editTask.category}
                            onChange={(e) => setEditTask({ ...editTask, category: e.target.value })}
                            className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            {categories.map(category => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>

                          <input
                            type="date"
                            value={editTask.dueDate}
                            onChange={(e) => setEditTask({ ...editTask, dueDate: e.target.value })}
                            className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />

                          <select
                            value={editTask.assignee}
                            onChange={(e) => setEditTask({ ...editTask, assignee: e.target.value })}
                            className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            disabled={loadingTeamMembers}
                          >
                            <option value="">
                              {loadingTeamMembers ? 'Loading...' : 'Unassigned'}
                            </option>
                            {teamMembers.map(member => (
                              <option key={member} value={member}>
                                {member}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            disabled={actionLoading[task._id] === 'update'}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                          >
                            {actionLoading[task._id] === 'update' ? (
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
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`font-medium ${task.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                            {task.title}
                          </h3>

                          <div className="flex items-center gap-2">
                            {task.starred && <Star className="w-4 h-4 text-amber-400 fill-current" />}

                            <span className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs ${getPriorityColor(task.priority)}`}>
                              {getPriorityIcon(task.priority)}
                              {task.priority}
                            </span>

                            {isOverdue(task.dueDate) && !task.completed && (
                              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Overdue
                              </span>
                            )}

                            {getTimeUntilDue(task.dueDate) && !task.completed && (
                              <span className={`text-xs px-2 py-1 rounded ${getTimeUntilDue(task.dueDate).color}`}>
                                {getTimeUntilDue(task.dueDate).text}
                              </span>
                            )}
                          </div>
                        </div>

                        {task.description && (
                          <p className="text-sm text-slate-400 mb-3 leading-relaxed">{task.description}</p>
                        )}

                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-slate-400 bg-slate-700 px-2 py-1 rounded text-xs">
                            {task.category}
                          </span>

                          {task.assignee && (
                            <span className="text-slate-400 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {task.assignee}
                            </span>
                          )}

                          {task.dueDate && (
                            <span className="text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}

                          <span className="text-slate-500 text-xs">
                            Created {new Date(task.createdAt).toLocaleDateString()}
                          </span>

                          {task.updatedAt && task.updatedAt !== task.createdAt && (
                            <span className="text-slate-500 text-xs">
                              Updated {new Date(task.updatedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleStar(task._id)}
                      disabled={actionLoading[task._id] === 'star'}
                      className={`p-2 rounded-lg transition-all ${task.starred ? 'text-amber-400 hover:text-amber-300' : 'text-slate-400 hover:text-amber-400'
                        }`}
                    >
                      {actionLoading[task._id] === 'star' ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Star className={`w-4 h-4 ${task.starred ? 'fill-current' : ''}`} />
                      )}
                    </button>

                    <button
                      onClick={() => editingId === task._id ? cancelEditing() : startEditing(task)}
                      className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => deleteTask(task._id)}
                      disabled={actionLoading[task._id] === 'delete'}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-400 transition-all"
                    >
                      {actionLoading[task._id] === 'delete' ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>

                    <button className="p-2 rounded-lg text-slate-400 hover:text-white transition-all">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredAndSortedTasks.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-800 rounded-full flex items-center justify-center">
                  <CheckSquare className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-400 text-lg mb-2">No tasks found</p>
                <p className="text-slate-500 text-sm">
                  {searchTerm || filter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Create your first task to get started'
                  }
                </p>
                {!searchTerm && filter === 'all' && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-all flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Add Your First Task
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Task Summary */}
          {tasks.length > 0 && (
            <div className="mt-8 bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-6">
                  <span className="text-slate-400">
                    Showing <span className="text-white font-medium">{filteredAndSortedTasks.length}</span> of <span className="text-white font-medium">{stats.total}</span> tasks
                  </span>

                  {stats.total > 0 && (
                    <span className="text-slate-400">
                      <span className="text-emerald-400 font-medium">{Math.round((stats.completed / stats.total) * 100)}%</span> completed
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    fetchTasks();
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
        </main>
      </div>
    </div>
  );
};

export default TasksPage;