

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { Camera, Home, User as UserIcon, Image, Shield, LogOut, Menu, X, Mail } from "lucide-react";
import BarklyChat from "./components/BarklyChat";
import ReviewsBanner from "./components/ReviewsBanner";
import { useHapticFeedback } from "./components/useHapticFeedback.js";


export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Initialize haptic feedback globally
  const triggerHaptic = useHapticFeedback();

  React.useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    triggerHaptic(); // Add haptic feedback to logout
    await User.logout();
    setUser(null);
    setMobileMenuOpen(false);
  };

  const isActive = (pageName) => {
    return location.pathname === createPageUrl(pageName);
  };

  const closeMobileMenu = () => {
    triggerHaptic(); // Add haptic feedback to menu close
    setMobileMenuOpen(false);
  };

  const handleMobileMenuToggle = () => {
    triggerHaptic(); // Add haptic feedback to menu toggle
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavClick = () => {
    triggerHaptic(); // Add haptic feedback to navigation clicks
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-orange-400">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 via-purple-500/20 to-pink-500/30"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-40 backdrop-blur-md bg-white/10 border-b border-white/20 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to={createPageUrl("Home")} onClick={handleNavClick} className="flex items-center gap-2">
              <Camera className="w-8 h-8 text-white" />
              <span className="text-2xl font-bold text-white">PupPack</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                to={createPageUrl("Home")}
                onClick={handleNavClick}
                className={`px-4 py-2 rounded-lg backdrop-blur-sm transition-all ${
                  isActive("Home") 
                    ? "bg-white/20 text-white border border-white/30" 
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                Home
              </Link>

              <Link
                to={createPageUrl("Gallery")}
                onClick={handleNavClick}
                className={`px-4 py-2 rounded-lg backdrop-blur-sm transition-all ${
                  isActive("Gallery") 
                    ? "bg-white/20 text-white border border-white/30" 
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                Gallery
              </Link>

              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to={createPageUrl("Dashboard")}
                    onClick={handleNavClick}
                    className={`px-4 py-2 rounded-lg backdrop-blur-sm transition-all ${
                      isActive("Dashboard") 
                        ? "bg-white/20 text-white border border-white/30" 
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    Dashboard
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      to={createPageUrl("Admin")}
                      onClick={handleNavClick}
                      className={`px-4 py-2 rounded-lg backdrop-blur-sm transition-all ${
                        isActive("Admin") 
                          ? "bg-white/20 text-white border border-white/30" 
                          : "text-white/80 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      Admin
                    </Link>
                  )}

                  <div className="h-6 w-px bg-white/30"></div>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                !loading && (
                  <button
                    onClick={() => {
                      triggerHaptic();
                      User.loginWithRedirect(window.location.href);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2 text-white rounded-lg border border-white/30 transition-all"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderColor: 'rgba(255,255,255,0.3)',
                      color: 'white'
                    }}
                  >
                    Sign In
                  </button>
                )
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              {user ? (
                <button
                  onClick={handleMobileMenuToggle}
                  className="p-2 rounded-lg text-white hover:bg-white/10 transition-all"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              ) : (
                !loading && (
                  <button
                    onClick={() => {
                      triggerHaptic();
                      User.loginWithRedirect(window.location.href);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg border border-white/30 transition-all text-sm"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderColor: 'rgba(255,255,255,0.3)',
                      color: 'white'
                    }}
                  >
                    Sign In
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && user && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
            <div className="px-4 py-2 space-y-1">
              <Link
                to={createPageUrl("Home")}
                onClick={closeMobileMenu}
                className={`block w-full px-4 py-3 rounded-lg text-left transition-all ${
                  isActive("Home") 
                    ? "bg-white/20 text-white border border-white/30" 
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5" />
                  Home
                </div>
              </Link>

              <Link
                to={createPageUrl("Gallery")}
                onClick={closeMobileMenu}
                className={`block w-full px-4 py-3 rounded-lg text-left transition-all ${
                  isActive("Gallery") 
                    ? "bg-white/20 text-white border border-white/30" 
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Image className="w-5 h-5" />
                  Gallery
                </div>
              </Link>

              <Link
                to={createPageUrl("Dashboard")}
                onClick={closeMobileMenu}
                className={`block w-full px-4 py-3 rounded-lg text-left transition-all ${
                  isActive("Dashboard") 
                    ? "bg-white/20 text-white border border-white/30" 
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserIcon className="w-5 h-5" />
                  Dashboard
                </div>
              </Link>

              {user.role === 'admin' && (
                <Link
                  to={createPageUrl("Admin")}
                  onClick={closeMobileMenu}
                  className={`block w-full px-4 py-3 rounded-lg text-left transition-all ${
                    isActive("Admin") 
                      ? "bg-white/20 text-white border border-white/30" 
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5" />
                    Admin
                  </div>
                </Link>
              )}

              <div className="h-px bg-white/20 my-2"></div>

              <button
                onClick={handleLogout}
                className="block w-full px-4 py-3 rounded-lg text-left text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </div>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Reviews Banner */}
      <ReviewsBanner />

      {/* Footer */}
      <footer className="relative z-10 backdrop-blur-md bg-white/10 border-t border-white/20 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Camera className="w-6 h-6 text-white" />
              <span className="text-xl font-bold text-white">PupPack</span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <Link
                to={createPageUrl("ContactSupport")}
                onClick={handleNavClick}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg border border-white/20 hover:bg-white/20 transition-all"
              >
                <Mail className="w-4 h-4" />
                Contact Support
              </Link>
              <p className="text-white/70 text-sm">© 2025 PupPack. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Barkly Chat Component */}
      <BarklyChat />
    </div>
  );
}

