import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import Header from '../components/Header';

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
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '', email: '', password: '', phone: '', userType: 1, categoryId: '', hourlyRate: '', bio: '', isApproved: true
  });
  const [categoryForm, setCategoryForm] = useState({
    name: '', description: '', icon: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const [statsData, usersData, categoriesData, sessionsData, inquiriesData] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        adminAPI.getCategories(),
        adminAPI.getSessions(),
        adminAPI.getInquiries()
      ]);
      setStats(statsData);
      setUsers(usersData);
      setCategories(categoriesData);
      setSessions(sessionsData);
      setInquiries(inquiriesData);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
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
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(id);
        await fetchData();
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user: ' + (error.response?.data?.message || error.message));
      }
    }
  };
  
  const deleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await adminAPI.deleteCategory(id);
        await fetchData();
      } catch (error) {
        console.error('Failed to delete category:', error);
        alert('Failed to delete category: ' + (error.response?.data?.message || error.message));
      }
    }
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
      alert('Failed to save user: ' + (error.response?.data?.message || error.message));
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
      alert('Failed to save category: ' + (error.response?.data?.message || error.message));
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
        userType: user.userType === 'Expert' ? 2 : user.userType === 'Admin' ? 3 : 1,
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

  const viewChatMessages = async (session) => {
    try {
      setSelectedSession(session);
      const messages = await adminAPI.getChatMessages(session.id);
      setChatMessages(messages);
      setShowChatModal(true);
    } catch (error) {
      console.error('Failed to fetch chat messages:', error);
      alert('Failed to load chat messages');
    }
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
        {/* Welcome Section */}
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

        {/* Tab Navigation */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-wrap space-x-2 sm:space-x-4 border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 sm:px-6 py-3 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
                activeTab === 'overview'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 sm:px-6 py-3 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
                activeTab === 'users'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              Users ({stats.totalUsers || 0})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 sm:px-6 py-3 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
                activeTab === 'categories'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              Categories ({stats.totalCategories || 0})
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-4 sm:px-6 py-3 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
                activeTab === 'sessions'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              Sessions ({stats.totalSessions || 0})
            </button>
            <button
              onClick={() => setActiveTab('chats')}
              className={`px-4 sm:px-6 py-3 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
                activeTab === 'chats'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              Chat History
            </button>
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`px-4 sm:px-6 py-3 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
                activeTab === 'inquiries'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              Inquiries ({inquiries.filter(i => !i.isRead).length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
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
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">User Management</h2>
              <button
                onClick={() => openUserModal()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add User
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Type</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b">
                      <td className="p-3">{user.name}</td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">{user.userType}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.isApproved ? 'Active' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => openUserModal(user)}
                          className="text-blue-600 hover:text-blue-800 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
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
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6">Session Monitoring</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.totalSessions || 0}</div>
                <div className="text-sm text-gray-600">Total Sessions</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.activeSessions || 0}</div>
                <div className="text-sm text-gray-600">Active Sessions</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.completedSessions || 0}</div>
                <div className="text-sm text-gray-600">Completed Sessions</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">₹{(stats.totalRevenue || 0).toFixed(2)}</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Session ID</th>
                    <th className="text-left p-3">User</th>
                    <th className="text-left p-3">Expert</th>
                    <th className="text-left p-3">Start Time</th>
                    <th className="text-left p-3">End Time</th>
                    <th className="text-left p-3">Duration</th>
                    <th className="text-left p-3">Amount</th>
                    <th className="text-left p-3">Messages</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(session => (
                    <tr key={session.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-sm">#{session.id}</td>
                      <td className="p-3">
                        <div className="font-medium">{session.userName}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{session.expertName}</div>
                      </td>
                      <td className="p-3 text-sm">
                        {new Date(session.startTime).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}<br/>
                        {new Date(session.startTime).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-3 text-sm">
                        {session.endTime ? (
                          <>
                            {new Date(session.endTime).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}<br/>
                            {new Date(session.endTime).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}
                          </>
                        ) : (
                          <span className="text-green-600">Ongoing</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="font-medium">{session.durationMinutes || 0}</span> min
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-green-600">₹{(session.totalAmount || 0).toFixed(2)}</span>
                      </td>
                      <td className="p-3">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {session.messageCount || 0} msgs
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {sessions.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">
                    <svg className="w-16 h-16 mx-auto text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Sessions Yet</h3>
                  <p className="text-gray-500">Chat sessions will appear here when users start consultations</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'chats' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6">Chat History</h2>
            
            {sessions.length > 0 ? (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3 text-sm">
                            {session.userName?.charAt(0)}
                          </div>
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold mr-3 text-sm">
                            {session.expertName?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base truncate">
                              {session.userName} ↔ {session.expertName}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {new Date(session.startTime).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })} at{' '}
                              {new Date(session.startTime).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <span className="text-green-600 font-semibold text-xs sm:text-sm">
                          Amount: ₹{(session.totalAmount || 0).toFixed(2)}
                        </span>
                        <span className="text-blue-600 font-semibold text-xs sm:text-sm">
                          Duration: {session.durationMinutes || 0} min
                        </span>
                        <span className="text-purple-600 font-semibold text-xs sm:text-sm">
                          Expert Earned: ₹{(session.expertEarnings || 0).toFixed(2)}
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                          {session.messageCount || 0} messages
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          session.endTime ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {session.endTime ? 'Completed' : 'Active'}
                        </span>
                      </div>
                      </div>
                      
                      <div className="text-right">
                        <button
                          onClick={() => viewChatMessages(session)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 mb-2"
                        >
                          View Chat
                        </button>
                        <div className="text-xs text-gray-500">
                          Session #{session.id}
                        </div>
                        {session.endTime && (
                          <div className="text-xs text-gray-500 mt-1">
                            Ended: {new Date(session.endTime).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">
                  <svg className="w-16 h-16 mx-auto text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Chat History</h3>
                <p className="text-gray-500">Chat sessions will appear here when users start consultations</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'inquiries' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6">Contact Inquiries</h2>
            
            {inquiries.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">
                  <svg className="w-24 h-24 mx-auto text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                </div>
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">{editingUser ? 'Edit User' : 'Add User'}</h3>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={userForm.name}
                onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={userForm.email}
                onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="password"
                placeholder={editingUser ? "New Password (leave blank to keep current)" : "Password"}
                value={userForm.password}
                onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                className="w-full p-2 border rounded"
                required={!editingUser}
              />
              <input
                type="tel"
                placeholder="Phone"
                value={userForm.phone}
                onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                className="w-full p-2 border rounded"
              />
              <select
                value={userForm.userType}
                onChange={(e) => setUserForm({...userForm, userType: parseInt(e.target.value)})}
                className="w-full p-2 border rounded"
              >
                <option value={1}>User</option>
                <option value={2}>Expert</option>
                <option value={3}>Admin</option>
              </select>
              {userForm.userType === 2 && (
                <>
                  <select
                    value={userForm.categoryId}
                    onChange={(e) => setUserForm({...userForm, categoryId: e.target.value})}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Hourly Rate"
                    value={userForm.hourlyRate}
                    onChange={(e) => setUserForm({...userForm, hourlyRate: e.target.value})}
                    className="w-full p-2 border rounded"
                  />
                  <textarea
                    placeholder="Bio"
                    value={userForm.bio}
                    onChange={(e) => setUserForm({...userForm, bio: e.target.value})}
                    className="w-full p-2 border rounded"
                    rows={3}
                  />
                </>
              )}
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={userForm.isApproved}
                  onChange={(e) => setUserForm({...userForm, isApproved: e.target.checked})}
                  className="mr-2"
                />
                Approved
              </label>
              <div className="flex space-x-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  {editingUser ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {setShowUserModal(false); setEditingUser(null);}}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
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
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Category Name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
              <textarea
                placeholder="Description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                className="w-full p-2 border rounded"
                rows={3}
                required
              />
              <input
                type="text"
                placeholder="Icon (emoji)"
                value={categoryForm.icon}
                onChange={(e) => setCategoryForm({...categoryForm, icon: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
              <div className="flex space-x-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  {editingCategory ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {setShowCategoryModal(false); setEditingCategory(null);}}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Chat Messages Modal */}
      {showChatModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">Chat Messages - Session #{selectedSession.id}</h3>
                <p className="text-sm text-gray-600">
                  {selectedSession.userName} ↔ {selectedSession.expertName}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(selectedSession.startTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                </p>
              </div>
              <button
                onClick={() => {setShowChatModal(false); setSelectedSession(null); setChatMessages([]);}}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {chatMessages.length > 0 ? (
                <div className="space-y-4">
                  {chatMessages.map((message) => (
                    <div key={message.id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm bg-gradient-to-r from-blue-500 to-purple-500">
                        {message.senderName?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-sm">{message.senderName}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(message.sentAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-gray-800">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">💬</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Messages</h3>
                  <p className="text-gray-500">This session has no chat messages yet</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Total Messages: {chatMessages.length}</span>
                <span>Amount: ₹{(selectedSession.totalAmount || 0).toFixed(2)}</span>
                <span>Duration: {selectedSession.durationMinutes || 0} min</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;