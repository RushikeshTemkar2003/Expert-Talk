import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const HowItWorks = () => {
  const steps = [
    {
      step: '1',
      title: 'Choose Your Expert',
      description: 'Browse through our verified experts across different categories and select the one that matches your needs.',
      icon: '🔍'
    },
    {
      step: '2',
      title: 'Make Payment',
      description: 'Secure payment through our integrated payment gateway. Pay only for the time you consult.',
      icon: '💳'
    },
    {
      step: '3',
      title: 'Start Consultation',
      description: 'Connect with your chosen expert through our real-time chat platform and get instant advice.',
      icon: '💬'
    },
    {
      step: '4',
      title: 'Get Solutions',
      description: 'Receive professional guidance, solutions, and follow-up support from qualified experts.',
      icon: '✅'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get expert consultation in just 4 simple steps. Our platform makes it easy to connect with professionals.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {step.step}
              </div>
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Why Choose ExpertTalk?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Verified Experts</h3>
              <p className="text-gray-600">All our experts are thoroughly verified and have proven track records in their respective fields.</p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Connect</h3>
              <p className="text-gray-600">Connect with experts instantly through our real-time chat platform. No waiting, no delays.</p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure & Private</h3>
              <p className="text-gray-600">Your conversations and personal information are completely secure and confidential.</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-100 rounded-xl p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Frequently Asked Questions</h2>
          
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-2">How do I know if an expert is qualified?</h3>
              <p className="text-gray-600">All experts go through a rigorous verification process including credential checks and background verification.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-2">What if I'm not satisfied with the consultation?</h3>
              <p className="text-gray-600">We offer a satisfaction guarantee. If you're not happy with the service, contact our support team for assistance.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-2">How is pricing calculated?</h3>
              <p className="text-gray-600">Pricing is based on the expert's hourly rate. You only pay for the actual consultation time used.</p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default HowItWorks;