import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentAPI, chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PaymentModal = ({ expert, isOpen, onClose }) => {
  const [duration, setDuration] = useState(30); // Default 30 minutes
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const totalAmount = (expert.hourlyRate * duration) / 60;

  const handlePayment = async () => {
    setLoading(true);
    
    const options = {
      key: 'rzp_test_Rw7fhblsCmczia',
      amount: totalAmount * 100,
      currency: 'INR',
      name: 'ExpertTalk Platform',
      description: `${duration} min consultation with ${expert.name}`,
      handler: async function (response) {
        setLoading(false);
        try {
          const session = await chatAPI.startSession(expert.id);
          alert(`🎉 Payment Successful! ₹${totalAmount.toFixed(2)} paid. Starting consultation...`);
          navigate(`/chat/${session.sessionId}`);
          onClose();
        } catch (error) {
          alert('Payment successful but failed to start session.');
        }
      },
      modal: {
        ondismiss: function() {
          setLoading(false);
        }
      },
      prefill: {
        name: user?.name || 'User',
        email: user?.email || 'user@example.com',
        contact: '9999999999'
      },
      theme: {
        color: '#3399cc'
      }
    };

    const rzp = new window.Razorpay(options);
    
    rzp.on('payment.failed', function (response) {
      alert('Payment failed');
      setLoading(false);
    });
    
    rzp.open();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl sm:text-3xl text-white font-bold">{expert.name.charAt(0)}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Consultation Payment</h2>
          <p className="text-gray-600 text-sm sm:text-base">Pay before starting your session with {expert.name}</p>
        </div>

        <div className="space-y-6">
          {/* Expert Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{expert.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{expert.categoryName} Expert</p>
            <p className="text-sm text-gray-700 line-clamp-3">{expert.bio}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-lg font-bold text-blue-600">₹{expert.hourlyRate}/hour</span>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="ml-1 text-sm text-green-600">Available Now</span>
              </div>
            </div>
          </div>

          {/* Duration Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Consultation Duration
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[15, 30, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setDuration(mins)}
                  className={`p-2 sm:p-3 rounded-lg border-2 text-center transition-all ${
                    duration === mins
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-sm sm:text-base">{mins} min</div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    ₹{((expert.hourlyRate * mins) / 60).toFixed(0)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700 text-sm sm:text-base">Duration:</span>
              <span className="font-semibold text-sm sm:text-base">{duration} minutes</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700 text-sm sm:text-base">Rate:</span>
              <span className="font-semibold text-sm sm:text-base">₹{expert.hourlyRate}/hour</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-base sm:text-lg font-bold text-gray-900">Total Amount:</span>
                <span className="text-xl sm:text-2xl font-bold text-blue-600">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                  </svg>
                  Pay ₹{totalAmount.toFixed(2)}
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
            Secure payment powered by Razorpay. Your payment information is encrypted and secure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;