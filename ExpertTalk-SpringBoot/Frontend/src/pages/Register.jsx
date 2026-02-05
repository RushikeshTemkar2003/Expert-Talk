import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { categoriesAPI } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    userType: 1,
    categoryId: 0,
    hourlyRate: '',
    bio: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Validation patterns
  const patterns = {
    name: /^[a-zA-Z\s]{2,50}$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    phone: /^[+]?[0-9]{10,15}$/,
    hourlyRate: /^[0-9]+(\.[0-9]{1,2})?$/
  };

  const validateField = (name, value) => {
    const errors = { ...validationErrors };
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          errors.name = 'Name is required';
        } else if (!patterns.name.test(value)) {
          errors.name = 'Name must be 2-50 characters, letters and spaces only';
        } else {
          delete errors.name;
        }
        break;
      case 'email':
        if (!value.trim()) {
          errors.email = 'Email is required';
        } else if (!patterns.email.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;
      case 'password':
        if (!value.trim()) {
          errors.password = 'Password is required';
        } else if (!patterns.password.test(value)) {
          errors.password = 'Password must be 8+ chars with uppercase, lowercase, number & special char';
        } else {
          delete errors.password;
        }
        break;
      case 'phone':
        if (value && !patterns.phone.test(value)) {
          errors.phone = 'Phone must be 10-15 digits, + allowed at start';
        } else {
          delete errors.phone;
        }
        break;
      case 'hourlyRate':
        if (formData.userType === 2) {
          if (!value.trim()) {
            errors.hourlyRate = 'Hourly rate is required for experts';
          } else if (!patterns.hourlyRate.test(value)) {
            errors.hourlyRate = 'Enter valid hourly rate (e.g., 2500 or 2500.50)';
          } else {
            delete errors.hourlyRate;
          }
        } else {
          delete errors.hourlyRate;
        }
        break;
      case 'bio':
        if (formData.userType === 2) {
          if (!value.trim()) {
            errors.bio = 'Bio is required for experts';
          } else if (value.length < 50) {
            errors.bio = 'Bio must be at least 50 characters for experts';
          } else {
            delete errors.bio;
          }
        } else {
          delete errors.bio;
        }
        break;
      case 'categoryId':
        if (formData.userType === 2 && (!value || value === 0)) {
          errors.categoryId = 'Please select your expertise category';
        } else {
          delete errors.categoryId;
        }
        break;
    }
    
    setValidationErrors(errors);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'userType' ? parseInt(value) || 1 : 
                    name === 'categoryId' ? parseInt(value) || 0 : value;
    
    setFormData({
      ...formData,
      [name]: newValue
    });
    
    // Validate field on change
    validateField(name, newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    Object.keys(formData).forEach(key => {
      validateField(key, formData[key]);
    });
    
    // Check if there are validation errors
    if (Object.keys(validationErrors).length > 0) {
      setError('Please fix the validation errors before submitting');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        categoryId: formData.userType === 2 && formData.categoryId > 0 ? formData.categoryId : undefined,
        hourlyRate: formData.userType === 2 && formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
        bio: formData.userType === 2 ? formData.bio : undefined
      };

      await register(submitData);
      
      // Redirect to login page after successful registration
      navigate('/login');
    } catch (error) {
      let errorMessage = 'Registration failed';
      
      if (error.response?.status === 409) {
        errorMessage = 'Email already exists. Please use a different email address.';
      } else if (error.response?.status === 400) {
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = 'Invalid registration data. Please check all fields.';
        }
      } else if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = error.response.data.errors.join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold text-white mb-2">ExpertTalk</h1>
          </Link>
          <h2 className="text-3xl font-bold text-white mb-2">Join Our Community</h2>
          <p className="text-blue-100">Create your account to start consulting with experts</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                I want to join as:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`cursor-pointer p-4 border-2 rounded-xl transition-all duration-200 ${
                  formData.userType === 1 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-purple-300'
                }`}>
                  <input
                    type="radio"
                    name="userType"
                    value={1}
                    checked={formData.userType === 1}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-3xl mb-2">👤</div>
                    <div className="font-semibold text-gray-900">User</div>
                    <div className="text-sm text-gray-600">Seek expert consultation</div>
                  </div>
                </label>
                <label className={`cursor-pointer p-4 border-2 rounded-xl transition-all duration-200 ${
                  formData.userType === 2 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-purple-300'
                }`}>
                  <input
                    type="radio"
                    name="userType"
                    value={2}
                    checked={formData.userType === 2}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-3xl mb-2">👨💼</div>
                    <div className="font-semibold text-gray-900">Expert</div>
                    <div className="text-sm text-gray-600">Provide consultation services</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    validationErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    validationErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      validationErrors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
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
                {validationErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your phone number"
                />
                {validationErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                )}
              </div>
            </div>

            {/* Expert-specific fields */}
            {formData.userType === 2 && (
              <div className="space-y-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Expert Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="categoryId" className="block text-sm font-semibold text-gray-700 mb-2">
                      Expertise Category *
                    </label>
                    <select
                      id="categoryId"
                      name="categoryId"
                      required
                      value={formData.categoryId || ''}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                        validationErrors.categoryId ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select your expertise</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </select>
                    {validationErrors.categoryId && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.categoryId}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="hourlyRate" className="block text-sm font-semibold text-gray-700 mb-2">
                      Hourly Rate (₹) *
                    </label>
                    <input
                      id="hourlyRate"
                      name="hourlyRate"
                      type="text"
                      required
                      value={formData.hourlyRate}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                        validationErrors.hourlyRate ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 2500.00"
                    />
                    {validationErrors.hourlyRate && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.hourlyRate}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 mb-2">
                    Professional Bio *
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    required
                    value={formData.bio}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      validationErrors.bio ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Describe your expertise, qualifications, and experience (minimum 50 characters)..."
                  />
                  {validationErrors.bio && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.bio}</p>
                  )}
                  <p className="text-gray-500 text-sm mt-1">{formData.bio.length}/50 characters minimum</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                `Create ${formData.userType === 1 ? 'User' : 'Expert'} Account`
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <div>
              <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold text-sm">
                Already have an account? Sign in
              </Link>
            </div>
            <div>
              <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 text-center text-white">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-2xl mb-1">🛡️</div>
              <div>Secure Platform</div>
            </div>
            <div>
              <div className="text-2xl mb-1">✅</div>
              <div>Verified Experts</div>
            </div>
            <div>
              <div className="text-2xl mb-1">💬</div>
              <div>Instant Connect</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;