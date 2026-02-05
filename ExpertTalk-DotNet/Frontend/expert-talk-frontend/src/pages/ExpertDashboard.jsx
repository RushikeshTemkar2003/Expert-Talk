import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../services/api';
import Header from '../components/Header';

const ExpertDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('sessions');
  const [sessions, setSessions] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const data = await chatAPI.getSessions();
      setSessions(data);
      await fetchExpertEarnings(data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchExpertEarnings = async (sessionsData = sessions) => {
    try {
      const response = await chatAPI.getExpertEarnings();
      setTotalEarnings(response.totalEarnings || 0);
    } catch (error) {
      console.error('Failed to fetch expert earnings:', error);
      const calculatedEarnings = sessionsData.reduce((sum, session) => sum + (session.totalAmount || 0), 0);
      setTotalEarnings(calculatedEarnings);
    }
  };

  const joinSession = (sessionId) => {
    navigate(`/chat/${sessionId}`);
  };
  const activeSessions = sessions.filter(session => !session.endTime).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:p-8 mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl mb-4 sm:mb-0 sm:mr-6">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{user?.name}</h1>
              <p className="text-gray-600 text-sm sm:text-base">{user?.categoryName} Expert</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">{user?.bio}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-green-50 rounded-lg p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-green-600">₹{totalEarnings.toFixed(2)}</div>
              <div className="text-xs sm:text-sm text-gray-600">Total Earnings</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{sessions.length}</div>
              <div className="text-xs sm:text-sm text-gray-600">Total Sessions</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-orange-600">{activeSessions}</div>
              <div className="text-xs sm:text-sm text-gray-600">Active Sessions</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">₹{user?.hourlyRate || 0}/hr</div>
              <div className="text-xs sm:text-sm text-gray-600">Hourly Rate</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm mb-6 lg:mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-6 py-4 font-medium text-sm ${activeTab === 'sessions' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              My Chats
            </button>
          </div>
        </div>

        {/* Sessions */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">My Chat Sessions</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading sessions...</p>
            </div>
          ) : sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold mr-3 text-sm">
                          {session.userName?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{session.userName}</h3>
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
                            Earned: ₹{session.totalAmount.toFixed(2)}
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
              <div className="text-4xl mb-4">
                <svg className="w-16 h-16 mx-auto text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 21H5V3H13V9H19Z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Sessions Yet</h3>
              <p className="text-gray-500">Your consultation sessions will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpertDashboard;