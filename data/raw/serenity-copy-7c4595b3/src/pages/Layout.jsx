

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Sparkles, Phone, Mail, Instagram, Facebook, MapPin, X, Menu } from "lucide-react";
import ChatBot from "@/components/ChatBot";
import BookingModal from "@/components/BookingModal";
import ReviewWidget from "@/components/ReviewWidget";
import SeoSchema from "@/components/SeoSchema";
import LoadingScreen from "@/components/LoadingScreen";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isBookingOpen, setIsBookingOpen] = React.useState(false);
  const [initialService, setInitialService] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    const scrollHandler = (e) => handleScroll();
    window.addEventListener('scroll', scrollHandler, { passive: true });

    const openBookingModal = () => {
      setInitialService(null);
      setIsBookingOpen(true);
    };
    
    const openBookingModalWithService = (event) => {
      setInitialService(event.detail.service);
      setIsBookingOpen(true);
    };

    window.addEventListener('open-booking-modal', openBookingModal);
    window.addEventListener('open-booking-modal-with-service', openBookingModalWithService);

    return () => {
      window.removeEventListener('scroll', scrollHandler);
      window.removeEventListener('open-booking-modal', openBookingModal);
      window.removeEventListener('open-booking-modal-with-service', openBookingModalWithService);
    };
  }, []);

  const handleLoadingComplete = React.useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleCloseBookingModal = React.useCallback(() => {
    setIsBookingOpen(false);
    setInitialService(null);
  }, []);

  const navigationItems = React.useMemo(() => [
    { name: "Home", url: "/" },
    { name: "Services", url: createPageUrl("Services") },
    { name: "Gallery", url: createPageUrl("Gallery") },
    { name: "Our Team", url: createPageUrl("Team") },
    { name: "Contact", url: createPageUrl("Contact") }
  ], []);

  // Add admin link only if URL contains admin parameter OR if accessing AdminBookings page
  const isAdminMode = React.useMemo(() => {
    return location.search.includes('admin=true') || 
           location.pathname.includes('admin') ||
           location.pathname.includes('AdminBookings') ||
           currentPageName === 'AdminBookings';
  }, [location.pathname, location.search, currentPageName]);

  const adminNavigationItems = React.useMemo(() => [
    ...navigationItems,
    ...(isAdminMode ? [{ name: "Admin Bookings", url: createPageUrl("AdminBookings") }] : [])
  ], [navigationItems, isAdminMode]);

  const currentNavItems = isAdminMode ? adminNavigationItems : navigationItems;

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <div className="min-h-screen bg-[#F8F2EC] font-sans text-[length:var(--font-body)] leading-[1.618]">
      <style jsx>{`
        :root {
          --obsidian: #0F0F0F;
          --shell: #F8F2EC;
          --champagne: #C8A882;
          --coral: #FF5C8D;
          --font-h1: clamp(2.5rem, 5vw, 4rem);
          --font-h2: clamp(1.75rem, 3.5vw, 2.75rem);
          --font-body: clamp(1rem, 1.6vw, 1.125rem);
        }
        
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500&family=Lato:wght@300;400&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        body {
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          font-display: swap;
        }

        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Lato', sans-serif; }
        
        .glass-nav {
          backdrop-filter: blur(20px);
          background: rgba(248, 242, 236, 0.95);
          border-bottom: 1px solid rgba(200, 168, 130, 0.1);
        }
        
        .nav-transition {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform, opacity;
        }
        
        .sparkle-animation {
          animation: sparkle 3s ease-in-out infinite;
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0.6; transform: scale(1) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.1) rotate(180deg); }
        }
        
        .glow-text {
          text-shadow: 0 0 20px rgba(200, 168, 130, 0.3);
        }

        .text-shadow-dark {
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        
        /* Performance optimizations */
        .motion-reduce {
          animation: none !important;
          transition: none !important;
        }
        
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Image optimization */
        img {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: optimize-contrast;
        }

        @media (max-width: 375px) {
          button[class*="bg-gradient-to-r"],
          button[class*="bg-[#C8A882]"],
          button[class*="bg-black/80"] {
            min-height: 44px;
            padding: 0.75rem 1.25rem !important;
            font-size: clamp(0.9rem, 4.5vw, 1rem) !important;
            max-width: 100%;
            height: auto;
            white-space: normal;
            line-height: 1.3;
            text-align: center;
          }
          
          button[class*="bg-gradient-to-r"] {
            padding: 1rem 1.5rem !important;
          }
        }
      `}</style>
      
      <SeoSchema />

      {/* Navigation with improved accessibility */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 nav-transition ${
          isScrolled || isMenuOpen ? 'glass-nav py-4' : 'bg-transparent py-6'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between pt-4">
            {/* Logo with improved accessibility */}
            <Link 
              to="/" 
              className="flex items-center gap-3 group transform transition-transform hover:scale-105"
              aria-label="SERENITY Spa & Salon - Go to homepage"
            >
              <div className="relative">
                <Sparkles 
                  className={`w-8 h-8 sparkle-animation ${isScrolled || isMenuOpen ? 'text-[#C8A882]' : 'text-white text-shadow-dark'}`}
                  aria-hidden="true"
                />
              </div>
              <div>
                <h1 className={`text-[#C8A882] text-lg font-bold font-serif text-center glow-text`}>
                  SERENITY
                </h1>
                <p className={`text-xs text-center tracking-widest ${isScrolled || isMenuOpen ? 'text-[#C8A882]' : 'text-[#C8A882] text-shadow-dark'}`}>
                  Spa & Salon
                </p>
              </div>
            </Link>

            {/* Desktop Navigation with improved accessibility */}
            <div className="hidden lg:flex items-center gap-8" role="menubar">
              {currentNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.url}
                  role="menuitem"
                  className={`text-sm font-medium transition-all duration-300 hover:text-[#C8A882] relative group ${
                    location.pathname === item.url 
                      ? 'text-[#C8A882]' 
                      : (isScrolled || isMenuOpen ? 'text-[#0F0F0F]' : 'text-white text-shadow-dark')
                  }`}
                  aria-current={location.pathname === item.url ? 'page' : undefined}
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#C8A882] transition-all duration-300 group-hover:w-full" aria-hidden="true" />
                </Link>
              ))}
            </div>

            {/* CTA Button with improved accessibility */}
            <div className="hidden lg:block">
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('open-booking-modal'))}
                className="bg-[#C8A882] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-[#0F0F0F] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#C8A882] focus:ring-offset-2"
                aria-label="Open booking appointment modal"
              >
                Book Appointment
              </button>
            </div>

            {/* Mobile Menu Button with improved accessibility */}
            <button 
              className={`lg:hidden p-2 z-50 focus:outline-none focus:ring-2 focus:ring-[#C8A882] focus:ring-offset-2 rounded ${isScrolled || isMenuOpen ? 'text-[#0F0F0F]' : 'text-white text-shadow-dark'}`} 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>
      
      {/* Mobile Menu Overlay with improved accessibility */}
      {isMenuOpen && (
        <div 
          id="mobile-menu"
          className="fixed inset-0 bg-[#F8F2EC]/95 backdrop-blur-lg z-40 flex flex-col items-center justify-center lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <div className="flex flex-col items-center gap-8">
            {currentNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.url}
                onClick={() => setIsMenuOpen(false)}
                className={`text-2xl font-medium transition-all duration-300 hover:text-[#C8A882] focus:outline-none focus:ring-2 focus:ring-[#C8A882] focus:ring-offset-2 rounded px-2 py-1 ${
                  location.pathname === item.url ? 'text-[#C8A882]' : 'text-[#0F0F0F]'
                }`}
                aria-current={location.pathname === item.url ? 'page' : undefined}
              >
                {item.name}
              </Link>
            ))}
             <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  window.dispatchEvent(new CustomEvent('open-booking-modal'));
                }}
                className="mt-8 bg-[#C8A882] text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-[#0F0F0F] transition-all duration-300 hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-[#C8A882] focus:ring-offset-2"
                aria-label="Open booking appointment modal"
              >
                Book Appointment
              </button>
          </div>
        </div>
      )}

      {/* Main Content with improved accessibility */}
      <main className="relative" role="main">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#0F0F0F] text-white relative overflow-hidden" role="contentinfo">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F0F] via-[#1a1a1a] to-[#0F0F0F]" aria-hidden="true" />
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[clamp(1rem,2vw,2.5rem)] text-center md:text-left">
            {/* Brand */}
            <div className="lg:col-span-1 flex flex-col items-center md:items-start mb-[1.2em]">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-8 h-8 text-[#C8A882] sparkle-animation" aria-hidden="true" />
                <div>
                  <h2 className="font-serif text-2xl font-bold glow-text">SERENITY</h2>
                  <p className="text-xs text-[#C8A882] tracking-widest">Luxury Spa & Salon</p>
                </div>
              </div>
              <p className="text-sm leading-[1.618] text-gray-300 mb-6">
                Kolkata's premier luxury wellness destination. Experience unparalleled service 
                with our highly skilled professionals and state-of-the-art equipment.
              </p>
              <div className="flex gap-4" role="list" aria-label="Social media links">
                <a 
                  href="#" 
                  className="w-10 h-10 bg-[#C8A882] rounded-full flex items-center justify-center hover:bg-[#FF5C8D] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#C8A882] focus:ring-offset-2 focus:ring-offset-[#0F0F0F]"
                  aria-label="Follow us on Instagram"
                  role="listitem"
                >
                  <Instagram className="w-5 h-5" aria-hidden="true" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-[#C8A882] rounded-full flex items-center justify-center hover:bg-[#FF5C8D] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#C8A882] focus:ring-offset-2 focus:ring-offset-[#0F0F0F]"
                  aria-label="Follow us on Facebook"
                  role="listitem"
                >
                  <Facebook className="w-5 h-5" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Services */}
            <div className="mb-[1.2em]">
              <h3 className="font-serif text-lg font-semibold mb-6 text-[#C8A882]">Premium Services</h3>
              <nav aria-label="Services navigation">
                <ul className="space-y-3 text-sm">
                  <li><a href="#" className="text-gray-300 hover:text-[#C8A882] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#C8A882] focus:ring-offset-2 focus:ring-offset-[#0F0F0F] rounded">Luxury Hair Styling</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-[#C8A882] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#C8A882] focus:ring-offset-2 focus:ring-offset-[#0F0F0F] rounded">Advanced Skincare</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-[#C8A882] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#C8A882] focus:ring-offset-2 focus:ring-offset-[#0F0F0F] rounded">Therapeutic Massage</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-[#C8A882] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#C8A882] focus:ring-offset-2 focus:ring-offset-[#0F0F0F] rounded">Premium Nail Care</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-[#C8A882] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#C8A882] focus:ring-offset-2 focus:ring-offset-[#0F0F0F] rounded">Wellness Treatments</a></li>
                </ul>
              </nav>
            </div>

            {/* Contact */}
            <div className="mb-[1.2em]">
              <h3 className="font-serif text-lg font-semibold mb-6 text-[#C8A882]">Visit Our Sanctuary</h3>
              <address className="space-y-4 text-sm flex flex-col items-center md:items-start not-italic">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#C8A882] mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span className="text-gray-300 leading-[1.618]">P-145, Sector A, Metropolitan Co-Operative Housing Society Limited, Tangra, Kolkata 700105</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#C8A882]" aria-hidden="true" />
                  <a href="tel:+919876543210" className="text-gray-300 hover:text-[#C8A882] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#C8A882] focus:ring-offset-2 focus:ring-offset-[#0F0F0F] rounded">+91 98765 43210</a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#C8A882]" aria-hidden="true" />
                  <a href="mailto:info@serenitysalon.in" className="text-gray-300 hover:text-[#C8A882] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#C8A882] focus:ring-offset-2 focus:ring-offset-[#0F0F0F] rounded">info@serenitysalon.in</a>
                </div>
              </address>
            </div>

            {/* Newsletter */}
            <div className="mb-[1.2em]">
              <h3 className="font-serif text-lg font-semibold mb-6 text-[#C8A882]">Luxury Updates</h3>
              <p className="text-sm text-gray-300 mb-4 leading-[1.618]">
                Subscribe for exclusive offers and premium wellness insights.
              </p>
              <form className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto md:max-w-none" aria-label="Newsletter subscription">
                <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-4 py-2 bg-white/10 border border-[#C8A882]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#C8A882] focus:ring-2 focus:ring-[#C8A882] focus:ring-offset-2 focus:ring-offset-[#0F0F0F]"
                  required
                />
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#C8A882] text-white rounded-lg hover:bg-[#FF5C8D] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#C8A882] focus:ring-offset-2 focus:ring-offset-[#0F0F0F]"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © 2024 Serenity Luxury Spa & Salon. All rights reserved.
            </p>
            <nav aria-label="Legal links">
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-[#C8A882] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#C8A882] focus:ring-offset-2 focus:ring-offset-[#0F0F0F] rounded">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-[#C8A882] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#C8A882] focus:ring-offset-2 focus:ring-offset-[#0F0F0F] rounded">Terms of Service</a>
              </div>
            </nav>
          </div>
        </div>
      </footer>

      {/* Components */}
      <ChatBot />
      <ReviewWidget />
      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={handleCloseBookingModal}
        initialService={initialService} 
      />
    </div>
  );
}

