
import React from "react";
import { ShoppingCart, Facebook, Instagram, Star } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigationItems = [
    { name: "ABOUT", id: "about" },
    { name: "TREATMENTS", id: "treatments" },
    { name: "PACKAGES", id: "packages" },
    { name: "CONTACT", id: "contact" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <style>
        {`
          :root {
            --sage-green: #B8C5A6;
            --sage-light: #D4DEC8;
            --charcoal: #2A2A2A;
            --warm-white: #FEFEFE;
            --cream: #F8F8F6;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            letter-spacing: -0.01em;
          }
          
          .hero-text {
            font-family: 'Inter', sans-serif;
            font-weight: 300;
            letter-spacing: 0.02em;
            line-height: 1.1;
          }
          
          .nav-link {
            position: relative;
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .nav-link::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 0;
            width: 0;
            height: 1px;
            background: var(--charcoal);
            transition: width 0.3s ease;
          }
          
          .nav-link:hover::after {
            width: 100%;
          }
        `}
      </style>

      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div 
              className="flex-shrink-0 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="border-2 border-black px-4 py-2">
                <div className="text-black font-bold text-lg tracking-tight">
                  BRW <span className="font-light">BAR</span>
                </div>
                <div className="text-black text-xs tracking-widest">inc.</div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center space-x-12">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.id)}
                  className="nav-link text-sm font-medium tracking-wide transition-colors hover:text-gray-600 text-gray-700"
                >
                  {item.name}
                </button>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-6">
              <button className="text-sm font-medium text-gray-700 hover:text-black transition-colors hidden lg:block">
                Log In
              </button>
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-gray-700 hover:text-black transition-colors cursor-pointer" />
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  0
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {children}
      </main>

      {/* Social Media Icons - Fixed Position */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block">
        <div className="flex flex-col space-y-4">
          <a href="#" className="text-gray-400 hover:text-black transition-colors">
            <Facebook className="w-5 h-5" />
          </a>
          <a href="#" className="text-gray-400 hover:text-black transition-colors">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="#" className="text-gray-400 hover:text-black transition-colors">
            <Star className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
