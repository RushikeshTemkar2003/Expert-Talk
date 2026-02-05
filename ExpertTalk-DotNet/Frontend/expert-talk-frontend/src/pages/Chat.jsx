import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { useAuth } from '../context/AuthContext';
import { chatAPI, paymentAPI } from '../services/api';

const Chat = () => {
  const { sessionId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [connection, setConnection] = useState(null);
  const [sessionActive, setSessionActive] = useState(true);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!sessionId || !token) return;

    // Setup SignalR connection
    const newConnection = new HubConnectionBuilder()
      .withUrl(`http://localhost:5045/chatHub?access_token=${token}`)
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    newConnection.start()
      .then(() => {
        console.log('Connected to chat hub');
        setConnectionStatus('Connected');
        newConnection.invoke('JoinChatSession', parseInt(sessionId));
        
        newConnection.on('ReceiveMessage', (message) => {
          setMessages(prev => [...prev, message]);
        });
        
        newConnection.on('SessionEnded', (sessionId) => {
          setSessionActive(false);
          setSessionExpired(true);
        });

        newConnection.onreconnecting(() => {
          setConnectionStatus('Reconnecting...');
        });

        newConnection.onreconnected(() => {
          setConnectionStatus('Connected');
        });

        newConnection.onclose(() => {
          setConnectionStatus('Disconnected');
        });
      })
      .catch(err => {
        console.error('Connection failed: ', err);
        setConnectionStatus('Connection Failed');
      });

    // Fetch existing messages and session info
    fetchMessages();
    fetchSessionInfo();

    return () => {
      newConnection.stop();
    };
  }, [sessionId, token]);

  // Fetch session info to get accurate remaining time
  const fetchSessionInfo = async () => {
    if (!sessionId) return;
    
    try {
      const data = await chatAPI.getSessionInfo(parseInt(sessionId));
      setTimeRemaining(data.remainingSeconds);
      setSessionStartTime(new Date(data.startTime));
      
      if (data.isExpired) {
        setSessionExpired(true);
        endSession();
      }
    } catch (error) {
      console.error('Failed to fetch session info:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Countdown timer effect - only runs if not expired
  useEffect(() => {
    if (!sessionActive || sessionExpired || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setSessionExpired(true);
          endSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionActive, sessionExpired, timeRemaining]);

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
    if (!newMessage.trim() || !connection || !sessionId) return;

    try {
      await connection.invoke('SendMessage', parseInt(sessionId), newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message');
    }
  };

  const endSession = async () => {
    if (!sessionId) return;

    // Don't show confirmation if session expired automatically
    if (!sessionExpired) {
      const confirmEnd = window.confirm('Are you sure you want to end this session?');
      if (!confirmEnd) return;
    }

    try {
      const result = await chatAPI.endSession(parseInt(sessionId));
      setSessionActive(false);
      setSessionInfo(result);
      
      if (connection) {
        await connection.invoke('NotifySessionEnded', parseInt(sessionId));
        connection.invoke('LeaveChatSession', parseInt(sessionId));
      }
    } catch (error) {
      console.error('Failed to end session');
    }
  };

  const formatTime = (seconds) => {
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

  if (!sessionActive && sessionInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full border border-gray-200">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Session Completed</h2>
            <p className="text-gray-600 text-sm sm:text-base">Thank you for using ExpertTalk!</p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 sm:p-6 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium text-sm sm:text-base">Session Duration:</span>
                <span className="font-bold text-gray-900 text-sm sm:text-base">{sessionInfo.duration} minutes</span>
              </div>
              <div className="text-center">
                <span className="text-green-600 font-medium text-base sm:text-lg flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  Session Completed Successfully
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <span className="text-blue-700 font-medium text-sm sm:text-base flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
                Thank you for using our consultation service
              </span>
            </div>
            <button
              onClick={() => navigate(user?.userType === 1 ? '/user-dashboard' : '/expert-dashboard')}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
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
      <div className="bg-white shadow-lg border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm sm:text-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Expert Consultation</h1>
              <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
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
                  <span className="hidden sm:inline">⏱️ </span>{formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <button
              onClick={endSession}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg font-medium text-sm hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-md"
            >
              <span className="hidden sm:inline">End Session</span>
              <span className="sm:hidden">End</span>
            </button>
            <button
              onClick={() => navigate(user?.userType === 1 ? '/user-dashboard' : '/expert-dashboard')}
              className="bg-gray-100 text-gray-700 px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg font-medium text-sm hover:bg-gray-200 transition-all duration-200"
            >
              <span className="hidden sm:inline">Back</span>
              <span className="sm:hidden">←</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-4">
                <svg className="w-16 h-16 sm:w-24 sm:h-24 mx-auto text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Start Your Conversation</h3>
              <p className="text-gray-500 text-sm sm:text-base">Send a message to begin your expert consultation</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs sm:max-w-sm lg:max-w-md ${message.senderId === user?.id ? 'order-2' : 'order-1'}`}>
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
              <div className="bg-gray-200 rounded-2xl px-4 sm:px-6 py-2 sm:py-3">
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

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
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
            {connectionStatus === 'Connected' ? (
              <>
                <span className="hidden sm:inline">Connected • Messages are encrypted • </span>
                <span className={timeRemaining <= 300 ? 'text-red-600 font-semibold' : ''}>
                  <span className="hidden sm:inline">Time remaining: </span>{formatTime(timeRemaining)}
                </span>
              </>
            ) : (
              connectionStatus
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;