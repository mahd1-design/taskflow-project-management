import React, { useState, useEffect } from 'react';

// Import components from separate files
import AuthPages from './Pages/AuthPages';
import Dashboard from './Pages/Dashboard';
import TasksPage from './Pages/Tasks';
import ProjectsPage from './Pages/Projects';
import TeamPage from './Pages/Team';

// Main App Component with Routing
const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for authenticated user on app load
    const storedUser = localStorage.getItem('taskflow_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.isAuthenticated) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('taskflow_user');
      }
    }
  }, []);

  // Navigation function
  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('taskflow_user');
    setUser(null);
    setCurrentPage('dashboard');
  };

  // Authentication success handler
  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  // If user is not authenticated, show auth pages
  if (!user) {
    return <AuthPages onAuthSuccess={handleAuthSuccess} />;
  }

  // Render the appropriate page based on currentPage state
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            onNavigate={handleNavigation} 
            onLogout={handleLogout} 
            user={user} 
          />
        );
      case 'tasks':
        return (
          <TasksPage 
            onNavigate={handleNavigation} 
            onLogout={handleLogout} 
            user={user} 
          />
        );
      case 'projects':
        return (
          <ProjectsPage 
            onNavigate={handleNavigation} 
            onLogout={handleLogout} 
            user={user} 
          />
        );
      case 'team':
        return (
          <TeamPage 
            onNavigate={handleNavigation} 
            onLogout={handleLogout} 
            user={user} 
          />
        );
      default:
        return (
          <Dashboard 
            onNavigate={handleNavigation} 
            onLogout={handleLogout} 
            user={user} 
          />
        );
    }
  };

  return (
    <div className="App">
      {renderCurrentPage()}
    </div>
  );
};

export default App;