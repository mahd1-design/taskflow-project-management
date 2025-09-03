import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckSquare, AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message }) => (
  message ? (
    <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-lg flex items-center gap-2">
      <AlertCircle className="w-4 h-4 text-red-400" />
      <span className="text-red-400 text-sm">{message}</span>
    </div>
  ) : null
);

const SuccessMessage = ({ message }) => (
  message ? (
    <div className="mb-4 p-3 bg-green-900/20 border border-green-700 rounded-lg flex items-center gap-2">
      <CheckSquare className="w-4 h-4 text-green-400" />
      <span className="text-green-400 text-sm">{message}</span>
    </div>
  ) : null
);

const LoginPage = ({ 
  loginData, 
  setLoginData, 
  showPassword, 
  setShowPassword, 
  loading, 
  error, 
  success, 
  handleLogin, 
  setCurrentPage 
}) => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
            <CheckSquare className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">TaskFlow</h1>
        </div>
        <p className="text-slate-400">Sign in to your account</p>
      </div>

      {/* Login Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <div className="space-y-6">
          <ErrorMessage message={error} />
          <SuccessMessage message={success} />

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({...prev, email: e.target.value}))}
                className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={loginData.password}
                onChange={(e) => setLoginData(prev => ({...prev, password: e.target.value}))}
                className="w-full pl-11 pr-11 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-600 rounded focus:ring-indigo-500"
                disabled={loading}
              />
              <span className="ml-2 text-sm text-slate-300">Remember me</span>
            </label>
            <button
              type="button"
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              disabled={loading}
            >
              Forgot password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing In...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-slate-700"></div>
          <span className="px-4 text-sm text-slate-400">or</span>
          <div className="flex-1 border-t border-slate-700"></div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <span className="text-slate-400">Don't have an account? </span>
          <button
            onClick={() => setCurrentPage('signup')}
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            disabled={loading}
          >
            Sign up
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8">
        <p className="text-slate-500 text-sm">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  </div>
);

const SignupPage = ({ 
  signupData, 
  setSignupData, 
  showPassword, 
  setShowPassword, 
  showConfirmPassword, 
  setShowConfirmPassword, 
  loading, 
  error, 
  success, 
  handleSignup, 
  setCurrentPage 
}) => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
            <CheckSquare className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">TaskFlow</h1>
        </div>
        <p className="text-slate-400">Create your account</p>
      </div>

      {/* Signup Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <div className="space-y-6">
          <ErrorMessage message={error} />
          <SuccessMessage message={success} />

          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={signupData.name}
                onChange={(e) => setSignupData(prev => ({...prev, name: e.target.value}))}
                className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="email"
                value={signupData.email}
                onChange={(e) => setSignupData(prev => ({...prev, email: e.target.value}))}
                className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={signupData.password}
                onChange={(e) => setSignupData(prev => ({...prev, password: e.target.value}))}
                className="w-full pl-11 pr-11 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Create a password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={signupData.confirmPassword}
                onChange={(e) => setSignupData(prev => ({...prev, confirmPassword: e.target.value}))}
                className="w-full pl-11 pr-11 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Confirm your password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-start">
            <input
              type="checkbox"
              className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-600 rounded focus:ring-indigo-500 mt-1"
              disabled={loading}
            />
            <span className="ml-2 text-sm text-slate-300">
              I agree to the{' '}
              <button type="button" className="text-indigo-400 hover:text-indigo-300" disabled={loading}>
                Terms of Service
              </button>{' '}
              and{' '}
              <button type="button" className="text-indigo-400 hover:text-indigo-300" disabled={loading}>
                Privacy Policy
              </button>
            </span>
          </div>

          {/* Signup Button */}
          <button
            type="button"
            onClick={handleSignup}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-slate-700"></div>
          <span className="px-4 text-sm text-slate-400">or</span>
          <div className="flex-1 border-t border-slate-700"></div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <span className="text-slate-400">Already have an account? </span>
          <button
            onClick={() => setCurrentPage('login')}
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            disabled={loading}
          >
            Sign in
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8">
        <p className="text-slate-500 text-sm">
          Secure account creation with enterprise-grade encryption
        </p>
      </div>
    </div>
  </div>
);

const AuthPages = ({ onAuthSuccess }) => {
  const [currentPage, setCurrentPage] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // API Base URL
  const API_BASE_URL = 'http://localhost:5000/api';

  // API Call Functions
  const apiCall = async (endpoint, method = 'GET', data = null) => {
    try {
      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
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

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate input
      if (!loginData.email || !loginData.password) {
        throw new Error('Please fill in all fields');
      }

      // Call login API
      const response = await apiCall('/auth/login', 'POST', {
        email: loginData.email,
        password: loginData.password
      });

      // Handle successful login
      if (response.success) {
        const { user, token } = response.data;
        
        // Create user data object
        const userData = {
          ...user,
          token,
          isAuthenticated: true
        };
        
        // Store token and user data (uncomment for real app)
        // localStorage.setItem('token', token);
        // localStorage.setItem('taskflow_user', JSON.stringify(userData));
        
        setSuccess('Login successful! Redirecting...');
        
        // Call the onAuthSuccess callback to notify parent
        if (onAuthSuccess) {
          setTimeout(() => {
            onAuthSuccess(userData);
          }, 1000);
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate input
      if (!signupData.name || !signupData.email || !signupData.password || !signupData.confirmPassword) {
        throw new Error('Please fill in all fields');
      }

      if (signupData.password !== signupData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (signupData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Call register API
      const response = await apiCall('/auth/register', 'POST', {
        name: signupData.name,
        email: signupData.email,
        password: signupData.password
      });

      // Handle successful registration
      if (response.success) {
        const { user, token } = response.data;
        
        // Create user data object
        const userData = {
          ...user,
          token,
          isAuthenticated: true
        };
        
        // Store token and user data (uncomment for real app)
        // localStorage.setItem('token', token);
        // localStorage.setItem('taskflow_user', JSON.stringify(userData));
        
        setSuccess('Account created successfully! Redirecting...');
        
        // Call the onAuthSuccess callback to notify parent
        if (onAuthSuccess) {
          setTimeout(() => {
            onAuthSuccess(userData);
          }, 1000);
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return currentPage === 'login' ? (
    <LoginPage 
      loginData={loginData}
      setLoginData={setLoginData}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      loading={loading}
      error={error}
      success={success}
      handleLogin={handleLogin}
      setCurrentPage={setCurrentPage}
    />
  ) : (
    <SignupPage 
      signupData={signupData}
      setSignupData={setSignupData}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      showConfirmPassword={showConfirmPassword}
      setShowConfirmPassword={setShowConfirmPassword}
      loading={loading}
      error={error}
      success={success}
      handleSignup={handleSignup}
      setCurrentPage={setCurrentPage}
    />
  );
};

export default AuthPages;