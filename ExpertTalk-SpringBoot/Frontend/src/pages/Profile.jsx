import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import Header from '../components/Header';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    hourlyRate: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [validationErrors, setValidationErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Validation patterns
  const patterns = {
    name: /^[a-zA-Z\s]{2,50}$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: /^[+]?[0-9]{10,15}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    hourlyRate: /^[0-9]+(\.[0-9]{1,2})?$/
  };

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        hourlyRate: user.hourlyRate || ''
      });
    }
  }, [user]);

  const validateProfileField = (name, value) => {
    const errors = { ...validationErrors };
    
    switch (name) {
      case 'name':
        if (!value || !value.trim()) {
          errors.name = 'Name is required';
        } else if (!patterns.name.test(value)) {
          errors.name = 'Name must be 2-50 characters, letters and spaces only';
        } else {
          delete errors.name;
        }
        break;
      case 'email':
        if (!value || !value.trim()) {
          errors.email = 'Email is required';
        } else if (!patterns.email.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;
      case 'phone':
        if (value && typeof value === 'string' && !patterns.phone.test(value)) {
          errors.phone = 'Phone must be 10-15 digits, + allowed at start';
        } else {
          delete errors.phone;
        }
        break;
      case 'hourlyRate':
        if (user?.userType === 2 && value && typeof value === 'string' && value.trim() !== '' && !patterns.hourlyRate.test(value)) {
          errors.hourlyRate = 'Enter valid hourly rate (e.g., 2500 or 2500.50)';
        } else {
          delete errors.hourlyRate;
        }
        break;
      case 'bio':
        if (user?.userType === 2 && value && typeof value === 'string' && value.length < 50) {
          errors.bio = 'Bio must be at least 50 characters for experts';
        } else {
          delete errors.bio;
        }
        break;
    }
    
    setValidationErrors(errors);
  };

  const validatePasswordField = (name, value) => {
    const errors = { ...validationErrors };
    
    switch (name) {
      case 'currentPassword':
        if (!value.trim()) {
          errors.currentPassword = 'Current password is required';
        } else {
          delete errors.currentPassword;
        }
        break;
      case 'newPassword':
        if (!value.trim()) {
          errors.newPassword = 'New password is required';
        } else if (!patterns.password.test(value)) {
          errors.newPassword = 'Password must be 8+ chars with uppercase, lowercase, number & special char';
        } else {
          delete errors.newPassword;
        }
        break;
      case 'confirmPassword':
        if (!value.trim()) {
          errors.confirmPassword = 'Please confirm your password';
        } else if (value !== passwordData.newPassword) {
          errors.confirmPassword = 'Passwords do not match';
        } else {
          delete errors.confirmPassword;
        }
        break;
    }
    
    setValidationErrors(errors);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
    validateProfileField(name, value);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    validatePasswordField(name, value);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    Object.keys(profileData).forEach(key => {
      validateProfileField(key, profileData[key]);
    });
    
    if (Object.keys(validationErrors).length > 0) {
      setMessage('Please fix the validation errors before submitting');
      return;
    }
    
    setLoading(true);
    setMessage('');

    try {
      await profileAPI.updateProfile(profileData);
      updateUser({ ...user, ...profileData });
      setMessage('Profile updated successfully!');
    } catch (error) {
      let errorMessage = 'Failed to update profile';
      if (error.response?.status === 409) {
        errorMessage = 'Email already exists. Please use a different email address.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all password fields
    Object.keys(passwordData).forEach(key => {
      validatePasswordField(key, passwordData[key]);
    });
    
    if (Object.keys(validationErrors).length > 0) {
      setMessage('Please fix the validation errors before submitting');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await profileAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setValidationErrors({});
      setMessage('Password changed successfully!');
    } catch (error) {
      let errorMessage = 'Failed to change password';
      if (error.response?.status === 400) {
        errorMessage = 'Current password is incorrect';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 sm:mb-0 sm:mr-6 flex-shrink-0">
                <span className="text-white font-bold text-2xl">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="text-center sm:text-left min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{user?.name}</h1>
                <p className="text-gray-600 text-sm sm:text-base">{user?.userType === 2 ? 'Expert' : 'User'} Account</p>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex px-4 sm:px-6 overflow-x-auto">
                <button
                  onClick={() => { setActiveTab('profile'); setMessage(''); setValidationErrors({}); }}
                  className={`py-4 px-2 sm:px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'profile'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  📝 Profile Information
                </button>
                <button
                  onClick={() => { setActiveTab('password'); setMessage(''); setValidationErrors({}); }}
                  className={`py-4 px-2 sm:px-4 border-b-2 font-medium text-sm whitespace-nowrap ml-4 sm:ml-8 ${
                    activeTab === 'password'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  🔒 Change Password
                </button>
              </nav>
            </div>

            <div className="p-4 sm:p-6">
              {/* Message Display */}
              {message && (
                <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border text-sm sm:text-base ${
                  message.includes('successfully') 
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  <div className="flex items-center">
                    <span className="mr-2 flex-shrink-0">
                      {message.includes('successfully') ? '✅' : '❌'}
                    </span>
                    <span className="break-words">{message}</span>
                  </div>
                </div>
              )}

              {/* Profile Information Tab */}
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileUpdate} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                          validationErrors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your full name"
                        required
                      />
                      {validationErrors.name && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1">{validationErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                          validationErrors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your email address"
                        required
                      />
                      {validationErrors.email && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1">{validationErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                          validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your phone number"
                      />
                      {validationErrors.phone && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1">{validationErrors.phone}</p>
                      )}
                    </div>

                    {user?.userType === 2 && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Hourly Rate (₹)
                        </label>
                        <input
                          type="text"
                          name="hourlyRate"
                          value={profileData.hourlyRate}
                          onChange={handleProfileChange}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                            validationErrors.hourlyRate ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="e.g., 2500.00"
                        />
                        {validationErrors.hourlyRate && (
                          <p className="text-red-500 text-xs sm:text-sm mt-1">{validationErrors.hourlyRate}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {user?.userType === 2 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Professional Bio
                      </label>
                      <textarea
                        name="bio"
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        rows={4}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                          validationErrors.bio ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Describe your expertise, qualifications, and experience (minimum 50 characters)..."
                      />
                      {validationErrors.bio && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1">{validationErrors.bio}</p>
                      )}
                      <p className="text-gray-500 text-xs sm:text-sm mt-1">{profileData.bio.length}/50 characters minimum</p>
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                          Updating...
                        </div>
                      ) : (
                        '💾 Update Profile'
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Change Password Tab */}
              {activeTab === 'password' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4 sm:space-y-6 max-w-md mx-auto sm:mx-0">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                          validationErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter current password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {showPasswords.current ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878a3 3 0 00-.007 4.243m4.242-4.242L15.536 15.536m0 0l1.414 1.414M15.536 15.536a3 3 0 01-4.243.007m6.364-13.364L3.636 20.364" />
                          ) : (
                            <>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </>
                          )}
                        </svg>
                      </button>
                    </div>
                    {validationErrors.currentPassword && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">{validationErrors.currentPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                          validationErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {showPasswords.new ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878a3 3 0 00-.007 4.243m4.242-4.242L15.536 15.536m0 0l1.414 1.414M15.536 15.536a3 3 0 01-4.243.007m6.364-13.364L3.636 20.364" />
                          ) : (
                            <>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </>
                          )}
                        </svg>
                      </button>
                    </div>
                    {validationErrors.newPassword && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">{validationErrors.newPassword}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base ${
                          validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Confirm new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {showPasswords.confirm ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878a3 3 0 00-.007 4.243m4.242-4.242L15.536 15.536m0 0l1.414 1.414M15.536 15.536a3 3 0 01-4.243.007m6.364-13.364L3.636 20.364" />
                          ) : (
                            <>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </>
                          )}
                        </svg>
                      </button>
                    </div>
                    {validationErrors.confirmPassword && (
                      <p className="text-red-500 text-xs sm:text-sm mt-1">{validationErrors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <h4 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">Password Requirements:</h4>
                    <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
                      <li>• At least 8 characters long</li>
                      <li>• Contains uppercase letter (A-Z)</li>
                      <li>• Contains lowercase letter (a-z)</li>
                      <li>• Contains number (0-9)</li>
                      <li>• Contains special character (@$!%*?&)</li>
                    </ul>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                          Changing...
                        </div>
                      ) : (
                        '🔒 Change Password'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;