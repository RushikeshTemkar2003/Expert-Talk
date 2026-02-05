import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import Header from '../components/Header';
import ConfirmModal from '../components/ConfirmModal';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [sessionForm, setSessionForm] = useState({
    endTime: '', status: '', durationMinutes: '', totalAmount: ''
  });
  const [editingUser, setEditingUser] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '', email: '', password: '', phone: '', userType: 1, categoryId: '', hourlyRate: '', bio: '', isApproved: true
  });
  const [categoryForm, setCategoryForm] = useState({
    name: '', description: '', icon: ''
  });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    fetchData();
    setupWebSocket();
    return () => {
      if (window.stompClient) {
        window.stompClient.disconnect();
      }
    };
  }, [activeTab]);
  
  const setupWebSocket = () => {
    try {
      const socket = new SockJS('http://localhost:5045/ws');
      const stompClient = Stomp.over(socket);
      
      stompClient.connect({}, () => {
        console.log('[DEBUG] WebSocket connected');
        stompClient.subscribe('/topic/admin/users', (message) => {
          const data = JSON.parse(message.body);
          handleRealtimeUpdate('users', data);
        });
        
        stompClient.subscribe('/topic/admin/categories', (message) => {
          const data = JSON.parse(message.body);
          handleRealtimeUpdate('categories', data);
        });
        
        stompClient.subscribe('/topic/admin/sessions', (message) => {
          const data = JSON.parse(message.body);
          handleRealtimeUpdate('sessions', data);
        });
      }, (error) => {
        console.error('[ERROR] WebSocket connection failed:', error);
      });
      
      window.stompClient = stompClient;
    } catch (error) {
      console.error('[ERROR] Failed to setup WebSocket:', error);
    }
  };
  
  const handleRealtimeUpdate = (type, data) => {
    switch (type) {
      case 'users':
        if (data.action === 'create') {
          setUsers(prev => [data.data, ...prev]);
        } else if (data.action === 'update') {
          setUsers(prev => prev.map(u => u.id === data.data.id ? data.data : u));
        } else if (data.action === 'delete') {
          setUsers(prev => prev.filter(u => u.id !== data.id));
        }
        break;
      case 'categories':
        if (data.action === 'create') {
          setCategories(prev => [data.data, ...prev]);
        } else if (data.action === 'update') {
          setCategories(prev => prev.map(c => c.id === data.data.id ? data.data : c));
        } else if (data.action === 'delete') {
          setCategories(prev => prev.filter(c => c.id !== data.id));
        }
        break;
      case 'sessions':
        if (data.action === 'create') {
          setSessions(prev => [data.data, ...prev]);
        } else if (data.action === 'update') {
          setSessions(prev => prev.map(s => s.id === data.data.id ? data.data : s));
        } else if (data.action === 'delete') {
          setSessions(prev => prev.filter(s => s.id !== data.id));
        }
        break;
    }
    fetchData();
  };

  const fetchData = async () => {
    try {
      console.log('[DEBUG] Fetching admin data...');
      setLoading(true);
      
      const [statsData, usersData, categoriesData, sessionsData, inquiriesData] = await Promise.all([
        adminAPI.getStats().catch(err => {
          console.error('Failed to fetch stats:', err);
          return { totalUsers: 0, totalExperts: 0, totalSessions: 0, activeSessions: 0, totalRevenue: 0, totalCategories: 0, completedSessions: 0, pendingExperts: 0 };
        }),
        adminAPI.getUsers().catch(err => {
          console.error('Failed to fetch users:', err);
          return [];
        }),
        adminAPI.getCategories().catch(err => {
          console.error('Failed to fetch categories:', err);
          return [];
        }),
        adminAPI.getSessions().catch(err => {
          console.error('Failed to fetch sessions:', err);
          return [];
        }),
        adminAPI.getInquiries().catch(err => {
          console.error('Failed to fetch inquiries:', err);
          return [];
        })
      ]);
      
      console.log('[DEBUG] Stats data:', statsData);
      console.log('[DEBUG] Users data:', usersData.length, 'users');
      console.log('[DEBUG] Categories data:', categoriesData.length, 'categories');
      console.log('[DEBUG] Sessions data:', sessionsData.length, 'sessions');
      console.log('[DEBUG] Inquiries data:', inquiriesData.length, 'inquiries');
      
      setStats(statsData || {});
      setUsers(usersData || []);
      setCategories(categoriesData || []);
      setSessions(sessionsData || []);
      setInquiries(inquiriesData || []);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      setStats({ totalUsers: 0, totalExperts: 0, totalSessions: 0, activeSessions: 0, totalRevenue: 0, totalCategories: 0, completedSessions: 0, pendingExperts: 0 });
      setUsers([]);
      setCategories([]);
      setSessions([]);
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await adminAPI.markInquiryRead(id);
      setInquiries(prev => prev.map(inq => 
        inq.id === id ? { ...inq, isRead: true } : inq
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };
  
  const deleteUser = async (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete User',
      message: 'Are you sure you want to delete this user?',
      onConfirm: async () => {
        try {
          await adminAPI.deleteUser(id);
          await fetchData();
          setConfirmModal({ isOpen: false });
        } catch (error) {
          console.error('Failed to delete user:', error);
          setAlertMessage('Failed to delete user: ' + (error.response?.data?.message || error.message));
          setConfirmModal({ isOpen: false });
        }
      }
    });
  };
  
  const deleteCategory = async (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category?',
      onConfirm: async () => {
        try {
          await adminAPI.deleteCategory(id);
          await fetchData();
          setConfirmModal({ isOpen: false });
        } catch (error) {
          console.error('Failed to delete category:', error);
          setAlertMessage('Failed to delete category: ' + (error.response?.data?.message || error.message));
          setConfirmModal({ isOpen: false });
        }
      }
    });
  };
  
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...userForm,
        categoryId: userForm.categoryId ? parseInt(userForm.categoryId) : null,
        hourlyRate: userForm.hourlyRate ? parseFloat(userForm.hourlyRate) : null,
        isAvailable: true
      };
      
      console.log('Submitting user data:', submitData);
      
      if (editingUser) {
        await adminAPI.updateUser(editingUser.id, submitData);
      } else {
        await adminAPI.createUser(submitData);
      }
      
      await fetchData();
      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({ name: '', email: '', password: '', phone: '', userType: 1, categoryId: '', hourlyRate: '', bio: '', isApproved: true });
    } catch (error) {
      console.error('Failed to save user:', error);
      setAlertMessage('Failed to save user: ' + (error.response?.data?.message || error.message));
    }
  };
  
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await adminAPI.updateCategory(editingCategory.id, categoryForm);
      } else {
        await adminAPI.createCategory(categoryForm);
      }
      
      await fetchData();
      setShowCategoryModal(false);
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '', icon: '' });
    } catch (error) {
      console.error('Failed to save category:', error);
      setAlertMessage('Failed to save category: ' + (error.response?.data?.message || error.message));
    }
  };
  
  const openUserModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        phone: user.phone || '',
        userType: user.userType === 'EXPERT' ? 2 : user.userType === 'USER' ? 1 : user.userType === 'ADMIN' ? 3 : 1,
        categoryId: user.categoryId || '',
        hourlyRate: user.hourlyRate || '',
        bio: user.bio || '',
        isApproved: user.isApproved !== undefined ? user.isApproved : true
      });
    } else {
      setEditingUser(null);
      setUserForm({ name: '', email: '', password: '', phone: '', userType: 1, categoryId: '', hourlyRate: '', bio: '', isApproved: true });
    }
    setShowUserModal(true);
  };
  
  const handleSessionSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...sessionForm,
        endTime: sessionForm.endTime ? new Date(sessionForm.endTime).toISOString() : null,
        durationMinutes: sessionForm.durationMinutes ? parseInt(sessionForm.durationMinutes) : null,
        totalAmount: sessionForm.totalAmount ? parseFloat(sessionForm.totalAmount) : null
      };
      
      await adminAPI.updateSession(editingSession.id, submitData);
      await fetchData();
      setShowSessionModal(false);
      setEditingSession(null);
      setSessionForm({ endTime: '', status: '', durationMinutes: '', totalAmount: '' });
    } catch (error) {
      console.error('Failed to update session:', error);
      setAlertMessage('Failed to update session: ' + (error.response?.data?.message || error.message));
    }
  };
  
  const openSessionModal = (session) => {
    setEditingSession(session);
    setSessionForm({
      endTime: session.endTime ? new Date(session.endTime).toISOString().slice(0, 16) : '',
      status: session.status || '',
      durationMinutes: session.durationMinutes || '',
      totalAmount: session.totalAmount || ''
    });
    setShowSessionModal(true);
  };
  
  const deleteSession = async (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Session',
      message: 'Are you sure you want to delete this session?',
      onConfirm: async () => {
        try {
          await adminAPI.deleteSession(id);
          await fetchData();
          setConfirmModal({ isOpen: false });
        } catch (error) {
          console.error('Failed to delete session:', error);
          setAlertMessage('Failed to delete session: ' + (error.response?.data?.message || error.message));
          setConfirmModal({ isOpen: false });
        }
      }
    });
  };
  
  const openCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description,
        icon: category.icon
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', description: '', icon: '' });
    }
    setShowCategoryModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:p-8 mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
            Welcome back, {user?.name}! Manage your ExpertTalk platform
          </p>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.totalUsers || 0}</div>
              <div className="text-xs sm:text-sm text-gray-600">Total Users</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.totalExperts || 0}</div>
              <div className="text-xs sm:text-sm text-gray-600">Active Experts</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.activeSessions || 0}</div>
              <div className="text-xs sm:text-sm text-gray-600">Active Sessions</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-orange-600">₹{(stats.totalRevenue || 0).toFixed(2)}</div>
              <div className="text-xs sm:text-sm text-gray-600">Total Revenue</div>
            </div>
          </div>
        </div>

        <div className="mb-6 sm:mb-8">
          <div className="flex overflow-x-auto border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 sm:px-6 py-3 font-medium transition-colors whitespace-nowrap text-sm ${
                activeTab === 'overview'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 sm:px-6 py-3 font-medium transition-colors whitespace-nowrap text-sm ${
                activeTab === 'users'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              👥 Users ({(stats.totalUsers || 0) + (stats.totalExperts || 0)})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 sm:px-6 py-3 font-medium transition-colors whitespace-nowrap text-sm ${
                activeTab === 'categories'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              📂 Categories ({stats.totalCategories || 0})
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-4 sm:px-6 py-3 font-medium transition-colors whitespace-nowrap text-sm ${
                activeTab === 'sessions'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              💬 Sessions ({stats.totalSessions || 0})
            </button>
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`px-4 sm:px-6 py-3 font-medium transition-colors whitespace-nowrap text-sm ${
                activeTab === 'inquiries'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              📧 Inquiries ({inquiries.filter(i => !i.isRead).length})
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Sessions</span>
                  <span className="font-semibold">{stats.totalSessions || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed Sessions</span>
                  <span className="font-semibold">{stats.completedSessions || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending Experts</span>
                  <span className="font-semibold">{stats.pendingExperts || 0}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold mb-4">Platform Health</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Active Users</span>
                  <span className="text-green-600 font-semibold">{stats.totalUsers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Experts</span>
                  <span className="text-blue-600 font-semibold">{stats.totalExperts || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Categories</span>
                  <span className="text-purple-600 font-semibold">{stats.totalCategories || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
              <h2 className="text-lg sm:text-xl font-bold">User Management</h2>
              <button
                onClick={() => openUserModal()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
              >
                ➕ Add User
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 sm:p-3">Name</th>
                    <th className="text-left p-2 sm:p-3">Email</th>
                    <th className="text-left p-2 sm:p-3">Type</th>
                    <th className="text-left p-2 sm:p-3 hidden sm:table-cell">Category</th>
                    <th className="text-left p-2 sm:p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-3 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map(user => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 sm:p-3 font-medium">{user.name}</td>
                        <td className="p-2 sm:p-3 truncate max-w-[150px]">{user.email}</td>
                        <td className="p-2 sm:p-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            user.userType === 'EXPERT' ? 'bg-blue-100 text-blue-800' :
                            user.userType === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.userType}
                          </span>
                        </td>
                        <td className="p-2 sm:p-3 hidden sm:table-cell">{user.categoryId || '-'}</td>
                        <td className="p-2 sm:p-3">
                          <div className="flex gap-1">
                            <button 
                              onClick={() => openUserModal(user)}
                              className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => deleteUser(user.id)}
                              className="text-red-600 hover:text-red-800 text-xs px-2 py-1"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Category Management</h2>
              <button
                onClick={() => openCategoryModal()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add Category
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(category => (
                <div key={category.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-2xl">{category.icon}</div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openCategoryModal(category)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                  <p className="text-xs text-blue-600">{category.expertCount} experts</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Session Management</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 sm:p-3">ID</th>
                    <th className="text-left p-2 sm:p-3">User</th>
                    <th className="text-left p-2 sm:p-3">Expert</th>
                    <th className="text-left p-2 sm:p-3 hidden sm:table-cell">Start</th>
                    <th className="text-left p-2 sm:p-3 hidden md:table-cell">Duration</th>
                    <th className="text-left p-2 sm:p-3">Amount</th>
                    <th className="text-left p-2 sm:p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(session => (
                    <tr key={session.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 sm:p-3 font-mono text-xs">#{session.id}</td>
                      <td className="p-2 sm:p-3 truncate max-w-[100px]">{session.userName}</td>
                      <td className="p-2 sm:p-3 truncate max-w-[100px]">{session.expertName}</td>
                      <td className="p-2 sm:p-3 text-xs hidden sm:table-cell">
                        {new Date(session.startTime).toLocaleDateString()}
                      </td>
                      <td className="p-2 sm:p-3 hidden md:table-cell">{session.durationMinutes || 0}m</td>
                      <td className="p-2 sm:p-3 font-medium">₹{(session.totalAmount || 0).toFixed(0)}</td>
                      <td className="p-2 sm:p-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => openSessionModal(session)}
                            className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteSession(session.id)}
                            className="text-red-600 hover:text-red-800 text-xs px-2 py-1"
                          >
                            Del
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'inquiries' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6">Contact Inquiries</h2>
            
            {inquiries.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📧</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Inquiries Yet</h3>
                <p className="text-gray-600">Contact form submissions will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inquiries.map((inquiry) => (
                  <div key={inquiry.id} className={`border rounded-lg p-4 ${!inquiry.isRead ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{inquiry.subject}</h3>
                        <p className="text-sm text-gray-600">
                          From: {inquiry.name} ({inquiry.email})
                          {inquiry.phone && ` • ${inquiry.phone}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(inquiry.createdAt).toLocaleString()} • Category: {inquiry.category}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!inquiry.isRead && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">New</span>
                        )}
                        <button
                          onClick={() => markAsRead(inquiry.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Mark as Read
                        </button>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <p className="text-gray-700">{inquiry.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">{editingUser ? 'Edit User' : 'Add User'}</h3>
            <form onSubmit={handleUserSubmit}>
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    value={userForm.name}
                    onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}</label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required={!editingUser}
                    placeholder={editingUser ? 'Leave blank to keep current password' : 'Enter password'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              
              {/* User Type Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">User Type *</label>
                <div className="grid grid-cols-3 gap-3">
                  <label className={`cursor-pointer p-3 border-2 rounded-lg text-center transition-all ${
                    userForm.userType === 1 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="userType"
                      value={1}
                      checked={userForm.userType === 1}
                      onChange={() => setUserForm({...userForm, userType: 1, categoryId: '', hourlyRate: '', bio: ''})}
                      className="sr-only"
                    />
                    <div className="text-2xl mb-1">👤</div>
                    <div className="font-medium">User</div>
                    <div className="text-xs text-gray-500">Regular user</div>
                  </label>
                  <label className={`cursor-pointer p-3 border-2 rounded-lg text-center transition-all ${
                    userForm.userType === 2 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="userType"
                      value={2}
                      checked={userForm.userType === 2}
                      onChange={() => setUserForm({...userForm, userType: 2})}
                      className="sr-only"
                    />
                    <div className="text-2xl mb-1">👨‍💼</div>
                    <div className="font-medium">Expert</div>
                    <div className="text-xs text-gray-500">Consultant</div>
                  </label>
                  <label className={`cursor-pointer p-3 border-2 rounded-lg text-center transition-all ${
                    userForm.userType === 3 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="userType"
                      value={3}
                      checked={userForm.userType === 3}
                      onChange={() => setUserForm({...userForm, userType: 3, categoryId: '', hourlyRate: '', bio: ''})}
                      className="sr-only"
                    />
                    <div className="text-2xl mb-1">👑</div>
                    <div className="font-medium">Admin</div>
                    <div className="text-xs text-gray-500">Administrator</div>
                  </label>
                </div>
              </div>
              
              {/* Expert-specific fields */}
              {userForm.userType === 2 && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-blue-900 mb-3">Expert Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Category *</label>
                      <select
                        value={userForm.categoryId}
                        onChange={(e) => setUserForm({...userForm, categoryId: e.target.value})}
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Hourly Rate (₹) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={userForm.hourlyRate}
                        onChange={(e) => setUserForm({...userForm, hourlyRate: e.target.value})}
                        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 2500.00"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Bio *</label>
                    <textarea
                      value={userForm.bio}
                      onChange={(e) => setUserForm({...userForm, bio: e.target.value})}
                      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="Describe expertise, qualifications, and experience (minimum 50 characters)..."
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">{userForm.bio.length}/50 characters minimum</p>
                  </div>
                  <div className="mt-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={userForm.isApproved}
                        onChange={(e) => setUserForm({...userForm, isApproved: e.target.checked})}
                        className="mr-2"
                      />
                      <span className="text-sm">Approved Expert</span>
                    </label>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserModal(false);
                    setEditingUser(null);
                    setUserForm({ name: '', email: '', password: '', phone: '', userType: 1, categoryId: '', hourlyRate: '', bio: '', isApproved: true });
                  }}
                  className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
            <form onSubmit={handleCategorySubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Icon</label>
                <input
                  type="text"
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({...categoryForm, icon: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="📚"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">Edit Session</h3>
            <form onSubmit={handleSessionSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">End Time</label>
                <input
                  type="datetime-local"
                  value={sessionForm.endTime}
                  onChange={(e) => setSessionForm({...sessionForm, endTime: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={sessionForm.status}
                  onChange={(e) => setSessionForm({...sessionForm, status: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={sessionForm.durationMinutes}
                  onChange={(e) => setSessionForm({...sessionForm, durationMinutes: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Total Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={sessionForm.totalAmount}
                  onChange={(e) => setSessionForm({...sessionForm, totalAmount: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowSessionModal(false)}
                  className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Alert Message */}
      {alertMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">Alert</h3>
            <p className="text-gray-600 mb-6">{alertMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setAlertMessage('')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ isOpen: false })}
      />
    </div>
  );
};

export default AdminDashboard;