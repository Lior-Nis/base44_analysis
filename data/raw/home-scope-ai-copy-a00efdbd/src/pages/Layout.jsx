

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { User as UserEntity } from '@/api/entities';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthModal from "@/components/auth/AuthModal";

export default function Layout({ children, currentPageName }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Effect for checking user login status
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const currentUser = await UserEntity.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    };
    checkUserStatus();
  }, [showAuthModal]); // Re-check on auth modal close

  // Effect for handling page scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Effect for Termly script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://app.termly.io/resource-blocker/5491c062-7c1c-4b93-ba0c-c4d325a31a6a?autoBlock=on';
    script.async = true;
    const existingScript = document.querySelector('script[src*="termly.io"]');
    if (!existingScript) {
      document.head.appendChild(script);
    }
  }, []);

  // Effect for scrolling to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPageName]);

  const handleLogout = async () => {
    try {
      await UserEntity.logout();
      setUser(null);
      // Redirect to home or refresh to ensure state is clean
      window.location.href = createPageUrl('Home');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  const navigateAndScroll = (sectionId) => {
    if (currentPageName === 'Home') {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Use react-router-dom Link's `to` prop with hash for better SPA navigation
      // This is a conceptual representation. The actual implementation is simpler.
      window.location.href = `${createPageUrl('Home')}#${sectionId}`;
    }
    setIsMenuOpen(false);
  };

  const isHomePage = currentPageName === 'Home';
  const isBusinessPage = currentPageName === 'Business';

  const navLinks = (
    <>
      {isHomePage && (
        <>
          <button onClick={() => navigateAndScroll('services')} className="text-gray-700 hover:text-green-600 transition-colors">What We Cover</button>
          <button onClick={() => navigateAndScroll('pricing')} className="text-gray-700 hover:text-green-600 transition-colors">Pricing</button>
          <button onClick={() => navigateAndScroll('faq')} className="text-gray-700 hover:text-green-600 transition-colors">FAQ</button>
          <button onClick={() => navigateAndScroll('about')} className="text-gray-700 hover:text-green-600 transition-colors">About Us</button>
        </>
      )}
      <Link to={createPageUrl('Business')} className="text-gray-700 hover:text-green-600 transition-colors">For Business</Link>
      {!user?.expert_specialty && (
         <Link to={createPageUrl('ApplyAsExpert')} className="text-gray-700 hover:text-green-600 transition-colors">
            Join as Expert
         </Link>
      )}
      {user ? (
        <>
          <Link to={createPageUrl('Dashboard')} className="text-gray-700 hover:text-green-600 transition-colors">Dashboard</Link>
          <button onClick={handleLogout} className="text-gray-700 hover:text-green-600 transition-colors">Logout</button>
        </>
      ) : (
        <button onClick={() => setShowAuthModal(true)} className="text-gray-700 hover:text-green-600 transition-colors">Login</button>
      )}
    </>
  );

  const mobileNavLinks = (
    <>
       {isHomePage && (
        <>
          <button onClick={() => navigateAndScroll('services')} className="block w-full text-left text-gray-700 hover:text-green-600">What We Cover</button>
          <button onClick={() => navigateAndScroll('pricing')} className="block w-full text-left text-gray-700 hover:text-green-600">Pricing</button>
          <button onClick={() => navigateAndScroll('faq')} className="block w-full text-left text-gray-700 hover:text-green-600">FAQ</button>
          <button onClick={() => navigateAndScroll('about')} className="block w-full text-left text-gray-700 hover:text-green-600">About Us</button>
        </>
      )}
      <Link to={createPageUrl('Business')} className="block w-full text-left text-gray-700 hover:text-green-600" onClick={() => setIsMenuOpen(false)}>For Business</Link>
      {!user?.expert_specialty && (
          <Link to={createPageUrl('ApplyAsExpert')} className="block w-full text-left text-gray-700 hover:text-green-600" onClick={() => setIsMenuOpen(false)}>
              Join as Expert
          </Link>
      )}
      {user ? (
        <>
          <Link to={createPageUrl('Dashboard')} className="block w-full text-left text-gray-700 hover:text-green-600" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
          <button onClick={handleLogout} className="block w-full text-left text-gray-700 hover:text-green-600">Logout</button>
        </>
      ) : (
        <button onClick={() => { setShowAuthModal(true); setIsMenuOpen(false); }} className="block w-full text-left text-gray-700 hover:text-green-600">Login</button>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-white">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || !isHomePage ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to={createPageUrl('Home')} className="flex items-center flex-shrink-0">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/52d7270f2_homescope_logo_transparent.png"
                alt="HomeScope Logo" className="my-2 px-3 h-20 w-auto object-contain" />
            </Link>

            <nav className="hidden lg:flex items-center space-x-8">{navLinks}</nav>

            <div className="hidden lg:block">
               {isBusinessPage ? (
                 <a href="#contact-form">
                    <Button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6">Request a Demo</Button>
                 </a>
               ) : user ? (
                <Link to={createPageUrl('Dashboard')}>
                  <Button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6">Go to Dashboard</Button>
                </Link>
              ) : (
                <Button onClick={() => setShowAuthModal(true)} className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6">Book Now</Button>
              )}
            </div>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 rounded-md text-gray-700 hover:text-green-600">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden bg-white border-t border-gray-100">
              <div className="px-4 py-4 space-y-4">
                {mobileNavLinks}
                <div className="pt-4 border-t">
                  {isBusinessPage ? (
                     <a href="#contact-form" onClick={() => setIsMenuOpen(false)}>
                       <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold">Request a Demo</Button>
                     </a>
                  ) : user ? (
                    <Link to={createPageUrl('Dashboard')} onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold">Go to Dashboard</Button>
                    </Link>
                  ) : (
                    <Button onClick={() => { setShowAuthModal(true); setIsMenuOpen(false); }} className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold">Book Now</Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      
      {/* Add padding to body to prevent content from hiding behind fixed header */}
      <div className={`${isBusinessPage ? '' : 'pt-20'}`}>
        {children}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          // The user effect will re-check status
        }}
      />
    </div>
  );
}

