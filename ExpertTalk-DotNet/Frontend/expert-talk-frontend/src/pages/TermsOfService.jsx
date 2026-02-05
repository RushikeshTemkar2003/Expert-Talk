import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  By accessing and using ExpertTalk platform, you accept and agree to be bound by the terms 
                  and provision of this agreement. If you do not agree to abide by the above, please do not 
                  use this service.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Platform Description</h2>
              <div className="space-y-4 text-gray-700">
                <p>ExpertTalk is an online platform that connects users with verified experts across various domains including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Financial consultation and planning</li>
                  <li>Healthcare advice and medical consultation</li>
                  <li>Technology support and IT guidance</li>
                  <li>Legal advice and consultation</li>
                  <li>Educational guidance and counseling</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Responsibilities</h2>
              <div className="space-y-4 text-gray-700">
                <p>As a user of our platform, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate and truthful information</li>
                  <li>Use the platform for lawful purposes only</li>
                  <li>Respect the intellectual property rights of others</li>
                  <li>Maintain the confidentiality of your account credentials</li>
                  <li>Not engage in any fraudulent or harmful activities</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Expert Responsibilities</h2>
              <div className="space-y-4 text-gray-700">
                <p>Experts on our platform must:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate credentials and qualifications</li>
                  <li>Deliver professional and ethical consultation services</li>
                  <li>Maintain client confidentiality</li>
                  <li>Be available during specified consultation hours</li>
                  <li>Follow all applicable professional standards and regulations</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Payment Terms</h2>
              <div className="space-y-4 text-gray-700">
                <p>Payment terms and conditions:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>All payments are processed securely through our payment partners</li>
                  <li>Consultation fees are charged based on actual time used</li>
                  <li>Refunds are subject to our refund policy</li>
                  <li>Platform service fees may apply</li>
                  <li>All prices are inclusive of applicable taxes</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  ExpertTalk acts as a platform connecting users with experts. We do not provide direct 
                  consultation services. The platform is not liable for:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The quality or accuracy of expert advice</li>
                  <li>Any decisions made based on consultations</li>
                  <li>Technical issues or service interruptions</li>
                  <li>Any indirect or consequential damages</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Privacy and Data Protection</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Your privacy is important to us. Please review our Privacy Policy to understand 
                  how we collect, use, and protect your information.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Termination</h2>
              <div className="space-y-4 text-gray-700">
                <p>We reserve the right to terminate or suspend accounts that:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Violate these terms of service</li>
                  <li>Engage in fraudulent activities</li>
                  <li>Misuse the platform or harm other users</li>
                  <li>Provide false information or credentials</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to Terms</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We reserve the right to modify these terms at any time. Users will be notified 
                  of significant changes, and continued use of the platform constitutes acceptance 
                  of the modified terms.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Information</h2>
              <div className="space-y-4 text-gray-700">
                <p>For questions about these Terms of Service, contact us:</p>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p><strong>Email:</strong> legal@experttalk.com</p>
                  <p><strong>Phone:</strong> +91 9876543210</p>
                  <p><strong>Address:</strong> ExpertTalk Platform, Mumbai, India</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TermsOfService;