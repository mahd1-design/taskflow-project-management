import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Check, Clock, AlertCircle, TrendingUp, Calendar, 
  Users, Target, ArrowUp, ArrowDown, MoreHorizontal, Star,
  Bell, User, Menu, Home, Settings, Loader, X, Briefcase
} from 'lucide-react';

const Dashboard = ({ onNavigate, onLogout, user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    starred: 0,
    overdue: 0
  });

  const [projectStats, setProjectStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    planning: 0,
    overdue: 0
  });

  const [recentTasks, setRecentTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);

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
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all dashboard data in parallel
      const [
        taskStatsRes,
        projectStatsRes,
        recentTasksRes,
        upcomingTasksRes,
        upcomingDeadlinesRes
      ] = await Promise.all([
        apiCall('/tasks/stats'),
        apiCall('/projects/stats'),
        apiCall('/tasks?limit=5'),
        apiCall('/tasks/upcoming?days=7'),
        apiCall('/projects/deadlines?days=30')
      ]);

      setStats(taskStatsRes.data.stats || {
        total: 0,
        completed: 0,
        pending: 0,
        starred: 0,
        overdue: 0
      });

      setProjectStats(projectStatsRes.data.stats || {
        total: 0,
        active: 0,
        completed: 0,
        planning: 0,
        overdue: 0
      });

      setRecentTasks(recentTasksRes.data.tasks || []);
      setUpcomingTasks(upcomingTasksRes.data.tasks || []);
      setUpcomingDeadlines(upcomingDeadlinesRes.data.projects || []);

    } catch (error) {
      setError(error.message);
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': 
      case 'critical': 
        return 'bg-red-500';
      case 'medium': 
        return 'bg-amber-500';
      case 'low': 
        return 'bg-emerald-500';
      default: 
        return 'bg-slate-500';
    }
  };

  const getTimeUntilDeadline = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
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
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-indigo-600 text-white"
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
            <h2 className="text-xl font-semibold text-white">Dashboard</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all relative">
              <Bell className="w-5 h-5" />
              {(stats.overdue > 0 || projectStats.overdue > 0) && (
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <ErrorMessage message={error} />
          
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              {greeting}, {user?.name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-slate-400">Here's what's happening with your projects today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                  <CheckSquare className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="flex items-center gap-1 text-indigo-400 text-sm">
                  <span className="text-xs">{stats.starred} starred</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stats.total}</div>
              <div className="text-sm text-slate-400">Total Tasks</div>
            </div>
            
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-600/20 rounded-lg flex items-center justify-center">
                  <Check className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex items-center gap-1 text-emerald-400 text-sm">
                  <ArrowUp className="w-4 h-4" />
                  <span>{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stats.completed}</div>
              <div className="text-sm text-slate-400">Completed</div>
            </div>
            
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-amber-600/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-400" />
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-sm">
                  <span className="text-xs">In progress</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stats.pending}</div>
              <div className="text-sm text-slate-400">Pending</div>
            </div>
            
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex items-center gap-1 text-red-400 text-sm">
                  {stats.overdue > 0 ? (
                    <>
                      <ArrowUp className="w-4 h-4" />
                      <span>Urgent</span>
                    </>
                  ) : (
                    <span className="text-emerald-400">Good!</span>
                  )}
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stats.overdue}</div>
              <div className="text-sm text-slate-400">Overdue</div>
            </div>
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{projectStats.total}</div>
              <div className="text-sm text-slate-400">Total Projects</div>
            </div>
            
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{projectStats.active}</div>
              <div className="text-sm text-slate-400">Active Projects</div>
            </div>
            
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-600/20 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{projectStats.completed}</div>
              <div className="text-sm text-slate-400">Completed Projects</div>
            </div>
            
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-amber-600/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{projectStats.planning}</div>
              <div className="text-sm text-slate-400">In Planning</div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Recent Tasks */}
            <div className="xl:col-span-2">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Recent Tasks</h3>
                  <button 
                    onClick={() => onNavigate('tasks')}
                    className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                
                {recentTasks.length > 0 ? (
                  <div className="space-y-4">
                    {recentTasks.map(task => (
                      <div key={task._id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg hover:bg-slate-900 transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${task.completed ? 'bg-emerald-500' : getPriorityColor(task.priority)}`}></div>
                          <div>
                            <div className={`font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-white'}`}>
                              {task.title}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-slate-400">{task.category}</span>
                              {task.assignee && (
                                <span className="text-xs text-slate-400">{task.assignee}</span>
                              )}
                              {task.dueDate && (
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {task.starred && <Star className="w-4 h-4 text-amber-400 fill-current" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-400">No recent tasks</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Content */}
            <div className="space-y-6">
              {/* Upcoming Tasks */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Upcoming Tasks</h3>
                {upcomingTasks.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingTasks.slice(0, 4).map((task) => (
                      <div key={task._id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                        <div>
                          <div className="text-sm font-medium text-white">{task.title}</div>
                          <div className="text-xs text-slate-400">
                            {task.dueDate ? getTimeUntilDeadline(task.dueDate) : 'No deadline'}
                          </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">No upcoming tasks</p>
                )}
              </div>

              {/* Project Deadlines */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Project Deadlines</h3>
                {upcomingDeadlines.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingDeadlines.slice(0, 4).map((project) => (
                      <div key={project._id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                        <div>
                          <div className="text-sm font-medium text-white">{project.name}</div>
                          <div className="text-xs text-slate-400">
                            {project.deadline ? getTimeUntilDeadline(project.deadline) : 'No deadline'}
                          </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(project.priority)}`}></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">No upcoming deadlines</p>
                )}
              </div>

              {/* Quick Stats */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Overview</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Task Completion Rate</span>
                    <span className="text-sm font-medium text-white">
                      {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Active Projects</span>
                    <span className="text-sm font-medium text-white">{projectStats.active}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Overdue Items</span>
                    <div className="flex items-center gap-1">
                      <span className={`text-sm font-medium ${(stats.overdue + projectStats.overdue) > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {stats.overdue + projectStats.overdue}
                      </span>
                      {(stats.overdue + projectStats.overdue) === 0 && (
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;