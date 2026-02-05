import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Services = () => {
  const services = [
    {
      icon: '💰',
      title: 'Finance Consultation',
      description: 'Get expert advice on investments, tax planning, retirement planning, and financial management from certified financial planners.',
      features: ['Investment Planning', 'Tax Optimization', 'Retirement Planning', 'Insurance Guidance']
    },
    {
      icon: '🏥',
      title: 'Healthcare Advice',
      description: 'Consult with qualified doctors and healthcare professionals for medical advice, health checkups, and wellness guidance.',
      features: ['Medical Consultation', 'Health Checkups', 'Wellness Planning', 'Preventive Care']
    },
    {
      icon: '💻',
      title: 'Technology Support',
      description: 'Get technical support and guidance from experienced IT professionals for software, hardware, and digital solutions.',
      features: ['Technical Support', 'Software Guidance', 'IT Consulting', 'Digital Solutions']
    },
    {
      icon: '⚖️',
      title: 'Legal Guidance',
      description: 'Receive legal advice and consultation from qualified lawyers and legal experts for various legal matters.',
      features: ['Legal Consultation', 'Document Review', 'Legal Advice', 'Court Guidance']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with verified experts across multiple domains for professional consultation and guidance
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="text-6xl mb-4">{service.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
              <p className="text-gray-600 mb-6">{service.description}</p>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Key Features:</h4>
                <ul className="space-y-1">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-600">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 rounded-xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Expert Advice?</h2>
          <p className="text-xl mb-6">Join thousands of satisfied customers who trust our platform</p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Get Started Today
          </button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Services;