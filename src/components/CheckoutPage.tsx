import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Smartphone, Globe, ArrowRight, Check, Zap } from 'lucide-react';

const CheckoutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50/30 animate-fade-in font-sans">
      {/* Header - Reusing the style from LandingPage but keeping it simple */}
      <header className="fixed top-0 left-0 right-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between text-white">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/logo1.png" alt="Logo" className="h-10 w-10 rounded-lg shadow-lg group-hover:scale-105 transition-transform" />
            <span className="text-lg font-bold tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Tori</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/services" className="text-sm font-medium px-5 py-2 rounded-full bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300">
              See All Services
            </Link>
          </nav>
        </div>
      </header>

      <div className="pt-24 pb-20 px-6">
        <div className="mx-auto max-w-5xl">
          
          {/* Main Title Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-1.5 mb-4 rounded-full bg-teal-100/50 border border-teal-200 text-teal-800">
              <span className="bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full mr-2">NEW</span>
              <span className="text-sm font-medium pr-2">Seamless WhatsApp Booking</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
              Booking made <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">frictionless.</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              No apps to download. No confusing forms. Just chat and book.
            </p>
          </div>

          {/* Core Purpose Section - Highlighted */}
          <div className="relative mb-20">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 transform -skew-y-1 rounded-3xl opacity-10 blur-xl"></div>
            <div className="relative bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="grid md:grid-cols-5 gap-0">
                <div className="md:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 p-10 text-white flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-teal-500/20 rounded-full blur-2xl"></div>
                  <Zap className="w-12 h-12 text-yellow-400 mb-6" />
                  <h2 className="text-2xl font-bold mb-4">The Core Purpose</h2>
                  <p className="text-gray-300 leading-relaxed opacity-90">
                    We eliminated the friction. No logins, no OTPs, no manual entry. Just the speed of chat.
                  </p>
                </div>
                <div className="md:col-span-3 p-10 md:p-12 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold text-black mb-6">
                    Why choose Tori?
                  </h3>
                  <ul className="space-y-4">
                    {[
                      'No inconvenient login processes',
                      'No manual booking details entry',
                      'No waiting for irritating OTPs',
                      'Instant confirmation via WhatsApp'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <Check className="w-5 h-5 text-teal-500" strokeWidth={3} />
                        </div>
                        <span className="text-gray-700 font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Two Ways Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Method 1 */}
            <div className="group relative bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:border-teal-200 transition-all duration-300">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Smartphone className="w-24 h-24 text-teal-600" />
              </div>
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-teal-600">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Direct WhatsApp</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Simply send "Hi" to our official number. Our AI assistant will guide you through all available services and help you book instantly.
              </p>
              <a 
                href="https://wa.me/919351504729?text=Hi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-teal-600 font-bold hover:text-teal-700 group-hover:translate-x-1 transition-transform"
              >
                Chat now <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </div>

            {/* Method 2 */}
            <div className="group relative bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:border-teal-200 transition-all duration-300">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Globe className="w-24 h-24 text-blue-600" />
              </div>
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Website Booking</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Browse services here. Click "Book Now" on any profile to be redirected to WhatsApp with the service details pre-filled.
              </p>
              <Link 
                to="/services" 
                className="inline-flex items-center text-blue-600 font-bold hover:text-blue-700 group-hover:translate-x-1 transition-transform"
              >
                Browse Services <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <a 
              href="https://wa.me/919351504729?text=Hi" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white transition-all duration-300 bg-gray-900 rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></span>
              <span className="relative flex items-center gap-3">
                <MessageCircle className="w-6 h-6" />
                Start Booking on WhatsApp
              </span>
            </a>
            <p className="mt-4 text-sm text-gray-500">
              Official Number: <span className="font-semibold text-gray-700">9351504729</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
