import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentAPI, chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PaymentModal = ({ expert, isOpen, onClose }) => {
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!isOpen && !showSuccessModal) return null;

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
        try {
          const session = await chatAPI.startSession(expert.id, duration);
          setSessionId(session.sessionId);
          setShowSuccessModal(true);
          setLoading(false);
        } catch (error) {
          alert('Payment successful but failed to start session.');
          setLoading(false);
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

  const startChat = () => {
    navigate(`/chat/${sessionId}`);
    setShowSuccessModal(false);
    onClose();
  };

  if (showSuccessModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl sm:text-4xl">🎉</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">₹{totalAmount.toFixed(2)} paid successfully</p>
          <div className="bg-green-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <p className="text-green-800 font-medium text-sm sm:text-base">Your consultation session is ready!</p>
            <p className="text-green-600 text-xs sm:text-sm mt-1">Click below to start chatting with {expert.name}</p>
          </div>
          <button
            onClick={startChat}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 sm:py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all text-sm sm:text-base"
          >
            💬 Start Chat Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-4 sm:mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="text-2xl sm:text-3xl text-white">{expert.name.charAt(0)}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Consultation Payment</h2>
          <p className="text-gray-600 text-sm sm:text-base">Pay before starting your session with {expert.name}</p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{expert.name}</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-2">{expert.categoryName} Expert</p>
            <p className="text-xs sm:text-sm text-gray-700 line-clamp-3">{expert.bio}</p>
            <div className="mt-2 sm:mt-3 flex items-center">
              <span className="text-base sm:text-lg font-bold text-blue-600">₹{expert.hourlyRate}/hour</span>
              <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="ml-1 text-xs sm:text-sm text-green-600">Available Now</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
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

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 sm:p-4">
            <div className="flex justify-between items-center mb-2 text-sm sm:text-base">
              <span className="text-gray-700">Duration:</span>
              <span className="font-semibold">{duration} minutes</span>
            </div>
            <div className="flex justify-between items-center mb-2 text-sm sm:text-base">
              <span className="text-gray-700">Rate:</span>
              <span className="font-semibold">₹{expert.hourlyRate}/hour</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-base sm:text-lg font-bold text-gray-900">Total Amount:</span>
                <span className="text-xl sm:text-2xl font-bold text-blue-600">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full sm:flex-1 bg-gray-200 text-gray-800 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full sm:flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 sm:py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>💳 Pay ₹{totalAmount.toFixed(2)}</>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center leading-relaxed">
            🔒 Secure payment powered by Razorpay. Your payment information is encrypted and secure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;