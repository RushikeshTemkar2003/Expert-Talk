import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../services/api';

const Chat = () => {
  const { sessionId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const [sessionActive, setSessionActive] = useState(true);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!sessionId || !token) return;

    // First check session status
    fetchSessionInfo();

    // Setup STOMP WebSocket connection only for active sessions
    const setupWebSocket = () => {
      const client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:5045/ws'),
        connectHeaders: {
          Authorization: `Bearer ${token}`
        },
        debug: (str) => console.log('STOMP: ' + str),
        onConnect: () => {
          console.log('Connected to WebSocket');
          setConnectionStatus('Connected');
          
          // Subscribe to session messages
          client.subscribe(`/topic/session/${sessionId}`, (message) => {
            const receivedMessage = JSON.parse(message.body);
            console.log('Received WebSocket message:', receivedMessage);
            setMessages(prev => {
              // Check if message already exists to prevent duplicates
              const exists = prev.some(msg => msg.id === receivedMessage.id);
              if (exists) {
                console.log('Message already exists, skipping:', receivedMessage.id);
                return prev;
              }
              return [...prev, {
                id: receivedMessage.id,
                content: receivedMessage.content,
                senderId: receivedMessage.senderId,
                senderName: receivedMessage.senderName,
                sentAt: receivedMessage.sentAt
              }];
            });
          });
          
          // Subscribe to session end notifications
          client.subscribe(`/topic/session/${sessionId}/end`, (message) => {
            const data = JSON.parse(message.body);
            if (data.endedBy !== user.id) {
              setSessionActive(false);
              setSessionInfo({ duration: 'Session ended by other participant' });
            }
          });
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame);
          setConnectionStatus('Connection Failed');
        },
        onWebSocketClose: () => {
          setConnectionStatus('Disconnected');
        },
        onDisconnect: () => {
          setConnectionStatus('Disconnected');
        }
      });

      client.activate();
      setStompClient(client);
    };

    // Only setup WebSocket for active sessions
    if (sessionActive) {
      setupWebSocket();
    }

    // Fetch existing messages
    fetchMessages();

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, [sessionId, token, sessionActive]);

  // Fetch session info to get accurate remaining time
  const fetchSessionInfo = async () => {
    if (!sessionId) return;
    
    try {
      const data = await chatAPI.getSessionInfo(parseInt(sessionId));
      console.log('Session info received:', data);
      
      // Set remaining time from server
      if (data.remainingSeconds !== undefined && data.remainingSeconds !== null) {
        setTimeRemaining(Math.max(0, data.remainingSeconds));
      }
      
      if (data.startTime) {
        setSessionStartTime(new Date(data.startTime));
      }
      
      // Check if session is completed or expired
      if (data.isExpired || data.status === 1) { // 1 = COMPLETED
        console.log('Session is ended, disabling input');
        setSessionActive(false);
        setSessionExpired(true);
        setSessionInfo({ 
          duration: calculateSessionDuration(data.startTime, data.endTime),
          status: data.status 
        });
      } else {
        console.log('Session is active, remaining seconds:', data.remainingSeconds);
        setSessionActive(true);
        setSessionExpired(false);
      }
    } catch (error) {
      console.error('Failed to fetch session info:', error);
      // If session not found or error, treat as ended
      setSessionActive(false);
      setSessionExpired(true);
    }
  };
  
  // Helper function to calculate session duration
  const calculateSessionDuration = (startTime, endTime) => {
    if (!startTime) return 'Unknown';
    
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const durationMs = end - start;
    const minutes = Math.floor(durationMs / (1000 * 60));
    
    return Math.max(1, minutes); // Minimum 1 minute
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Countdown timer effect - only runs if not expired
  useEffect(() => {
    if (!sessionActive || sessionExpired || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          console.log('Timer expired, ending session');
          setSessionExpired(true);
          endSession();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionActive, sessionExpired]); // Removed timeRemaining from dependencies to prevent timer reset

  // Remove the session start time effect as it's now handled by fetchSessionInfo

  // Periodic session info refresh to handle server-side expiration
  useEffect(() => {
    if (!sessionActive || sessionExpired) return;

    const interval = setInterval(() => {
      fetchSessionInfo();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [sessionActive, sessionExpired, sessionId]);

  const fetchMessages = async () => {
    if (!sessionId) return;
    
    try {
      const data = await chatAPI.getMessages(parseInt(sessionId));
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !stompClient || !sessionId || !sessionActive) return;

    try {
      // Send via WebSocket only - don't add to local state
      stompClient.publish({
        destination: '/app/sendMessage',
        body: JSON.stringify({
          sessionId: parseInt(sessionId),
          senderId: user.id,
          content: newMessage
        })
      });
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;

    try {
      const result = await chatAPI.endSession(parseInt(sessionId));
      console.log('End session result:', result);
      
      setSessionActive(false);
      
      // Set session info with proper duration from server response
      setSessionInfo({
        duration: result.duration || calculateSessionDuration(sessionStartTime, new Date()),
        totalAmount: result.totalAmount
      });
      
      // Notify other participant via WebSocket
      if (stompClient) {
        stompClient.publish({
          destination: '/app/endSession',
          body: JSON.stringify({
            sessionId: parseInt(sessionId),
            endedBy: user.id
          })
        });
        stompClient.deactivate();
      }
    } catch (error) {
      console.error('Failed to end session:', error);
      // Fallback - still end the session locally
      setSessionActive(false);
      setSessionInfo({
        duration: calculateSessionDuration(sessionStartTime, new Date())
      });
    }
  };

  const handleEndSession = () => {
    if (!sessionExpired) {
      setShowEndSessionModal(true);
    } else {
      endSession();
    }
  };

  const confirmEndSession = () => {
    setShowEndSessionModal(false);
    endSession();
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds < 0) {
      return '00:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!sessionActive && sessionInfo && !messages.length) {
    // Only show completion popup if no messages to display
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-200">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Completed</h2>
            <p className="text-gray-600">Thank you for using ExpertTalk!</p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Session Duration:</span>
                <span className="font-bold text-gray-900">
                  {typeof sessionInfo.duration === 'number' 
                    ? `${sessionInfo.duration} minutes` 
                    : sessionInfo.duration || 'Unknown'}
                </span>
              </div>
              {sessionInfo.totalAmount && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Total Amount:</span>
                  <span className="font-bold text-green-600">₹{sessionInfo.totalAmount}</span>
                </div>
              )}
              <div className="text-center">
                <span className="text-green-600 font-medium text-lg">✅ Session Completed Successfully</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <span className="text-blue-700 font-medium">💬 Thank you for using our consultation service</span>
            </div>
            <button
              onClick={() => navigate(user?.userType === 1 ? '/user-dashboard' : '/expert-dashboard')}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm sm:text-lg">Chat</span>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Expert Consultation</h1>
              <div className="flex items-center space-x-2 text-xs sm:text-sm">
                {sessionActive ? (
                  <>
                    <div className={`w-2 h-2 rounded-full ${
                      connectionStatus === 'Connected' ? 'bg-green-500 animate-pulse' : 
                      connectionStatus === 'Connecting...' || connectionStatus === 'Reconnecting...' ? 'bg-yellow-500 animate-pulse' : 
                      'bg-red-500'
                    }`}></div>
                    <span className="text-gray-600 truncate">{connectionStatus}</span>
                    <span className="text-gray-400 hidden sm:inline">•</span>
                    <span className={`font-mono ${
                      timeRemaining <= 300 ? 'text-red-600 font-bold' : 'text-gray-600'
                    }`}>
                      {formatTime(timeRemaining)}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    <span className="text-gray-600">Session Completed</span>
                    {sessionInfo?.endTime && (
                      <>
                        <span className="text-gray-400 hidden sm:inline">•</span>
                        <span className="text-gray-600 hidden sm:inline">
                          Ended: {new Date(sessionInfo.endTime).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {sessionActive && (
              <button
                onClick={handleEndSession}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 sm:px-6 py-2 rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-md text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">End Session</span>
                <span className="sm:hidden">End</span>
              </button>
            )}
            <button
              onClick={() => navigate(user?.userType === 1 ? '/user-dashboard' : '/expert-dashboard')}
              className="bg-gray-100 text-gray-700 px-3 sm:px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Back</span>
              <span className="sm:hidden">←</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">💬</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Start Your Conversation</h3>
              <p className="text-gray-500 text-sm sm:text-base">Send a message to begin your expert consultation</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] sm:max-w-xs lg:max-w-md ${message.senderId === user?.id ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-2xl shadow-md ${
                      message.senderId === user?.id
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm leading-relaxed break-words">{message.content}</p>
                    <p className={`text-xs mt-1 sm:mt-2 ${
                      message.senderId === user?.id ? 'text-purple-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.sentAt).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mx-2 sm:mx-3 flex-shrink-0 ${
                  message.senderId === user?.id ? 'order-1' : 'order-2'
                } ${
                  message.senderId === user?.id 
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                    : 'bg-gradient-to-r from-gray-400 to-gray-500'
                }`}>
                  <span className="text-white font-semibold text-xs sm:text-sm">
                    {message.senderName?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
              </div>
            ))
          )}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-200 rounded-2xl px-6 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input - Only show for active sessions */}
      {sessionActive && (
        <div className="bg-white border-t border-gray-200 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-2 sm:space-x-4">
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message... (Press Enter to send)"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none text-sm sm:text-base"
                  rows={1}
                  style={{ minHeight: '40px', maxHeight: '120px' }}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || connectionStatus !== 'Connected'}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 sm:p-3 rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg flex-shrink-0"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              <span className="hidden sm:inline">Connected • Messages are encrypted • </span>
              <span className={timeRemaining <= 300 ? 'text-red-600 font-semibold' : ''}>
                Time remaining: {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Read-only indicator for ended sessions */}
      {!sessionActive && (
        <div className="bg-gray-100 border-t border-gray-200 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-xs sm:text-sm text-gray-600">
              📖 Chat History (Read-only)
            </div>
          </div>
        </div>
      )}
      
      {/* End Session Modal */}
      {showEndSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">End Session?</h3>
              <p className="text-gray-600">Are you sure you want to end this consultation session?</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowEndSessionModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmEndSession}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;