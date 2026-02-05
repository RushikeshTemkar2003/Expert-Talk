import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoriesAPI, chatAPI } from '../services/api';
import Header from '../components/Header';
import PaymentModal from '../components/PaymentModal';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('experts');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [experts, setExperts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (activeTab === 'chats') {
      fetchSessions();
    }
  }, [activeTab]);
  
  const fetchSessions = async () => {
    try {
      const data = await chatAPI.getSessions();
      setSessions(data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchExperts = async (categoryId) => {
    setLoading(true);
    try {
      const data = await categoriesAPI.getExperts(categoryId);
      setExperts(data);
      setSelectedCategory(categoryId);
    } catch (error) {
      console.error('Failed to fetch experts:', error);
    } finally {
      setLoading(false);
    }
  };

  const startConsultation = (expert) => {
    setSelectedExpert(expert);
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedExpert(null);
  };
  
  const joinSession = (sessionId) => {
    navigate(`/chat/${sessionId}`);
  };

  const totalExperts = categories.reduce((sum, cat) => sum + (cat.expertCount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:p-8 mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            Welcome back, {user?.name}
          </h1>
          <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
            Find and connect with professional experts for consultation
          </p>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{totalExperts}</div>
              <div className="text-xs sm:text-sm text-gray-600">Available Experts</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-green-600">{categories.length}</div>
              <div className="text-xs sm:text-sm text-gray-600">Categories</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">₹1500+</div>
              <div className="text-xs sm:text-sm text-gray-600">Starting Price</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-orange-600">24/7</div>
              <div className="text-xs sm:text-sm text-gray-600">Available</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm mb-6 lg:mb-8">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('experts')}
              className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm whitespace-nowrap ${activeTab === 'experts' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              🔍 Find Experts
            </button>
            <button
              onClick={() => setActiveTab('chats')}
              className={`px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm whitespace-nowrap ${activeTab === 'chats' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              💬 My Chats
            </button>
          </div>
        </div>

        {/* Chat History Tab */}
        {activeTab === 'chats' && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">📖 Chat History</h2>
            
            {sessions.length > 0 ? (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3 text-sm">
                            {session.expertName?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base truncate">{session.expertName}</h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {new Date(session.startTime).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })} at{' '}
                              {new Date(session.startTime).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        
                        {session.lastMessage && (
                          <p className="text-gray-600 text-xs sm:text-sm mb-3 bg-gray-50 p-2 sm:p-3 rounded line-clamp-2">
                            "{session.lastMessage}"
                          </p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                          {session.totalAmount > 0 && (
                            <span className="text-green-600 font-semibold text-xs sm:text-sm">
                              Paid: ₹{session.totalAmount.toFixed(2)}
                            </span>
                          )}
                          {session.unreadCount > 0 && (
                            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                              {session.unreadCount} new
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => joinSession(session.id)}
                        className="w-full lg:w-auto px-4 py-2 rounded-lg font-medium text-sm bg-blue-600 text-white hover:bg-blue-700"
                      >
                        {session.endTime ? 'View Chat' : 'Join Chat'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Chat History</h3>
                <p className="text-gray-500">Your consultation sessions will appear here</p>
              </div>
            )}
          </div>
        )}

        {/* Categories - only show when experts tab is active */}
        {activeTab === 'experts' && (
          <div className="mb-6 lg:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 px-2 sm:px-0">Choose a Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {categories.map((category) => (
                <div 
                  key={category.id} 
                  className={`bg-white rounded-xl shadow-sm p-4 sm:p-6 cursor-pointer hover:shadow-md transition-shadow border-2 ${
                    selectedCategory === category.id ? 'border-blue-500' : 'border-transparent'
                  }`}
                  onClick={() => fetchExperts(category.id)}
                >
                  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{category.icon}</div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">{category.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 sm:mb-4 line-clamp-2">{category.description}</p>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="text-sm text-green-600 font-medium">
                      {category.expertCount || 0} experts
                    </span>
                    <button className="text-blue-600 text-sm font-medium text-left sm:text-right">
                      View Experts →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experts List - only show when experts tab is active */}
        {activeTab === 'experts' && selectedCategory && (
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              {categories.find(c => c.id === selectedCategory)?.name} Experts
            </h2>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading experts...</p>
              </div>
            ) : experts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {experts.map((expert) => (
                  <div key={expert.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex items-center sm:items-start sm:flex-col sm:text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-blue-200 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg sm:text-xl">
                            {expert.name?.charAt(0).toUpperCase() || 'E'}
                          </span>
                        </div>
                        <div className="ml-3 sm:ml-0 sm:mt-2 flex-1 sm:flex-none min-w-0">
                          <h3 className="font-bold text-base sm:text-lg text-gray-900 truncate">{expert.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-600">{expert.categoryName} Expert</p>
                          <div className="flex items-center justify-start sm:justify-center mt-1">
                            <span className={`w-2 h-2 rounded-full mr-1 ${expert.isAvailable ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></span>
                            <span className={`text-xs font-medium ${expert.isAvailable ? 'text-green-600' : 'text-gray-600'}`}>
                              {expert.isAvailable ? 'Available' : 'Offline'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">{expert.bio}</p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center justify-between sm:justify-start">
                            <div className="flex items-center text-yellow-500">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className="text-sm">⭐</span>
                              ))}
                              <span className="text-sm text-gray-600 ml-1">(4.8)</span>
                            </div>
                            <span className="text-lg sm:text-xl font-bold text-blue-600">₹{expert.hourlyRate}/hr</span>
                          </div>
                          
                          <button 
                            onClick={() => startConsultation(expert)}
                            disabled={!expert.isAvailable}
                            className={`w-full sm:w-auto px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${expert.isAvailable ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                          >
                            {expert.isAvailable ? '💬 Start Chat' : '⏰ Offline'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No experts available in this category</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {selectedExpert && (
        <PaymentModal
          expert={selectedExpert}
          isOpen={showPaymentModal}
          onClose={closePaymentModal}
        />
      )}
    </div>
  );
};

export default UserDashboard;