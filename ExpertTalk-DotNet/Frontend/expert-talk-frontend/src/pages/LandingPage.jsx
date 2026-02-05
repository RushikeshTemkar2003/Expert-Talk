import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoriesAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const LandingPage = () => {
  const [categories, setCategories] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const heroSlides = [
    {
      title: "Connect with Expert Consultants",
      subtitle: "Get professional advice from verified Indian experts across multiple domains",
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=600&fit=crop&crop=center",
      cta: "Start Consultation"
    },
    {
      title: "24/7 Expert Support in India",
      subtitle: "Access healthcare, finance, legal, and technology experts anytime from anywhere in India",
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=1200&h=600&fit=crop&crop=center",
      cta: "Find Experts"
    },
    {
      title: "Trusted by 50,000+ Indians",
      subtitle: "All consultations are private, secure, and conducted by verified Indian professionals",
      image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=600&fit=crop&crop=center",
      cta: "Join Now"
    },
    {
      title: "Expert Financial Guidance",
      subtitle: "Get personalized investment advice from IIM and CA qualified financial experts",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=600&fit=crop&crop=center",
      cta: "Consult Finance Expert"
    },
    {
      title: "Healthcare at Your Fingertips",
      subtitle: "Consult with AIIMS and top medical college doctors from the comfort of your home",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1200&h=600&fit=crop&crop=center",
      cta: "Book Health Consultation"
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Software Engineer, Bangalore",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      text: "Got excellent financial advice for my investment portfolio. The expert was very knowledgeable and helped me save on taxes."
    },
    {
      name: "Rajesh Kumar",
      role: "Business Owner, Delhi",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      text: "The legal consultation helped me understand my business contracts better. Highly recommend ExpertTalk!"
    },
    {
      name: "Dr. Anita Patel",
      role: "Doctor, Mumbai",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
      text: "As a healthcare professional, I appreciate the quality of medical consultations available on this platform."
    }
  ];

  useEffect(() => {
    fetchCategories();
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section with Slider */}
      <section className="relative overflow-hidden h-screen">
        <div className="absolute inset-0">
          <img 
            src={heroSlides[currentSlide].image} 
            alt={heroSlides[currentSlide].title}
            className="w-full h-full object-cover transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-purple-900/70 to-indigo-900/80"></div>
        </div>
        
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-4xl text-white">
            <h1 className="text-7xl font-bold mb-6 leading-tight animate-fade-in">
              {heroSlides[currentSlide].title.split(' ').map((word, index) => (
                <span key={index} className={index === heroSlides[currentSlide].title.split(' ').length - 1 ? 'text-yellow-300' : ''}>
                  {word}{' '}
                </span>
              ))}
            </h1>
            <p className="text-2xl mb-8 opacity-90 leading-relaxed max-w-3xl">
              {heroSlides[currentSlide].subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 mb-12">
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-10 py-5 rounded-full font-bold text-xl hover:from-yellow-300 hover:to-orange-400 transform hover:scale-105 transition-all duration-300 shadow-2xl"
              >
                🚀 {heroSlides[currentSlide].cta}
              </Link>
              <Link 
                to="/login" 
                className="border-3 border-white text-white px-10 py-5 rounded-full font-semibold text-xl hover:bg-white hover:text-gray-900 transition-all duration-300 backdrop-blur-sm"
              >
                Sign In
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-8 text-lg opacity-90">
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-green-400 mr-2 text-xl">✓</span>
                1000+ Verified Experts
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-green-400 mr-2 text-xl">✓</span>
                Instant Connection
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-green-400 mr-2 text-xl">✓</span>
                Secure Razorpay Payments
              </div>
            </div>
          </div>
        </div>
        
        {/* Slider Navigation */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-yellow-400 scale-125' : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 right-8 text-white animate-bounce">
          <div className="flex flex-col items-center">
            <span className="text-sm mb-2">Scroll Down</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Consultation Category</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Our verified experts are ready to help you with personalized advice and solutions</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <div key={category.id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 card-hover-effect">
                <div className="p-8">
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{category.name}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{category.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-blue-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                      <span className="font-semibold">{category.expertCount || Math.floor(Math.random() * 50) + 10} Experts Online</span>
                    </div>
                    <Link 
                      to="/register" 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-md"
                    >
                      Consult Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600">Real experiences from satisfied customers</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.text}"</p>
                <div className="flex text-yellow-400 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">50K+</div>
              <div className="text-blue-200 font-semibold">Happy Clients</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">1000+</div>
              <div className="text-blue-200 font-semibold">Expert Consultants</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">24/7</div>
              <div className="text-blue-200 font-semibold">Available Support</div>
            </div>
            <div className="group">
              <div className="text-5xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">99%</div>
              <div className="text-blue-200 font-semibold">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;