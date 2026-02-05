import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 opacity-90"></div>
        <div className="relative container mx-auto px-4 py-20 text-center text-white">
          <h1 className="text-5xl font-bold mb-6">About ExpertTalk</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto leading-relaxed">
            Connecting people with verified experts to provide instant, professional consultation across multiple domains
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">Our Mission</h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-12">
              To democratize access to expert knowledge by creating a platform where anyone can connect with verified professionals 
              and get instant, reliable advice on topics that matter most to them.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Access</h3>
                <p className="text-gray-600">Making professional expertise accessible to everyone, anywhere, anytime</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl">
                <div className="text-5xl mb-4">🔒</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Trust & Security</h3>
                <p className="text-gray-600">Ensuring secure, confidential consultations with verified professionals</p>
              </div>
              
              <div className="bg-gradient-to-br from-pink-50 to-indigo-50 p-8 rounded-2xl">
                <div className="text-5xl mb-4">⚡</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Solutions</h3>
                <p className="text-gray-600">Providing immediate access to expert advice when you need it most</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Our Story</h2>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                ExpertTalk was born from a simple observation: people need expert advice, but finding the right professional 
                at the right time can be challenging and expensive. Traditional consultation models often involve long waiting 
                times, high costs, and geographical limitations.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Founded in 2024, we set out to revolutionize how people access professional expertise. By leveraging technology 
                and creating a platform that connects users with verified experts in real-time, we've made professional 
                consultation more accessible, affordable, and convenient than ever before.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Today, ExpertTalk serves thousands of users worldwide, providing instant access to experts in Finance, 
                Healthcare, Technology, Legal, Education, and Counselling. Our platform has facilitated over 50,000 
                successful consultations, helping people make informed decisions and solve complex problems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-900 mb-16 text-center">Our Values</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl text-white">🤝</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Trust</h3>
              <p className="text-gray-600">Building lasting relationships through transparency and reliability</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl text-white">🌟</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Excellence</h3>
              <p className="text-gray-600">Maintaining the highest standards in expert verification and service quality</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-r from-green-500 to-teal-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl text-white">🚀</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Innovation</h3>
              <p className="text-gray-600">Continuously improving our platform with cutting-edge technology</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-r from-orange-500 to-red-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl text-white">❤️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Care</h3>
              <p className="text-gray-600">Putting our users' needs first and providing exceptional support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-gray-900 mb-16 text-center">Meet Our Team</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center group hover:shadow-2xl transition-all duration-300">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl text-white font-bold">RT</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Rushikesh Temkar</h3>
              <p className="text-purple-600 font-semibold mb-3">Project Lead & Handled Expert Module</p>
              <p className="text-gray-600 text-sm">CDAC KH</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center group hover:shadow-2xl transition-all duration-300">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl text-white font-bold">SC</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Shubham Chaudhari</h3>
              <p className="text-purple-600 font-semibold mb-3">Handled User Module</p>
              <p className="text-gray-600 text-sm">CDAC KH</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center group hover:shadow-2xl transition-all duration-300">
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl text-white font-bold">OL</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Om Londhe</h3>
              <p className="text-purple-600 font-semibold mb-3">Handled Admin Module</p>
              <p className="text-gray-600 text-sm">CDAC KH </p>
          </div>
           <div className="bg-white rounded-2xl shadow-lg p-8 text-center group hover:shadow-2xl transition-all duration-300">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl text-white font-bold">FD</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fameshwari Deshmukh</h3>
              <p className="text-purple-600 font-semibold mb-3">Handled Admin Module</p>
              <p className="text-gray-600 text-sm">CDAC KH</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center group hover:shadow-2xl transition-all duration-300">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl text-white font-bold">MS</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Mohit Sarode</h3>
              <p className="text-purple-600 font-semibold mb-3">Handled User Module</p>
              <p className="text-gray-600 text-sm">CDAC KH</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center group hover:shadow-2xl transition-all duration-300">
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl text-white font-bold">SC</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Shubham Chandrikapure</h3>
              <p className="text-purple-600 font-semibold mb-3">Handled Expert Module</p>
              <p className="text-gray-600 text-sm">CDAC KH </p>
          </div>
        </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center">ExpertTalk by Numbers</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">50K+</div>
              <div className="text-blue-200 font-semibold">Consultations Completed</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">1000+</div>
              <div className="text-blue-200 font-semibold">Verified Experts</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">25K+</div>
              <div className="text-blue-200 font-semibold">Happy Users</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">99%</div>
              <div className="text-blue-200 font-semibold">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Connect with Experts?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied users who have found the expert advice they needed
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg">
              🚀 Start Consulting Now
            </button>
            <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200">
              Learn More
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;