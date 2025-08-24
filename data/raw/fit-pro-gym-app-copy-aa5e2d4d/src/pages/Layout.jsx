

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { CartItem } from "@/api/entities";
import { 
  Home, 
  CreditCard, 
  ShoppingBag, 
  ShoppingCart, 
  User as UserIcon,
  Menu,
  X,
  Dumbbell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navigationItems = [
  { title: "Home", url: createPageUrl("Home"), icon: Home },
  { title: "Memberships", url: createPageUrl("Memberships"), icon: CreditCard },
  { title: "Shop", url: createPageUrl("Shop"), icon: ShoppingBag },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadUser();
    loadCartCount();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      // User not logged in
    }
  };

  const loadCartCount = async () => {
    try {
      if (user) {
        const cartItems = await CartItem.filter({ user_email: user.email });
        setCartCount(cartItems.reduce((sum, item) => sum + item.quantity, 0));
      }
    } catch (error) {
      console.error("Error loading cart count:", error);
    }
  };

  useEffect(() => {
    if (user) {
      loadCartCount();
    }
  }, [user]);

  const handleLogin = async () => {
    await User.login();
  };

  const handleLogout = async () => {
    await User.logout();
    setUser(null);
    setCartCount(0);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <style>
        {`
          :root {
            --gym-primary: #0ea5e9;
            --gym-secondary: #10b981;
            --gym-dark: #1f2937;
            --gym-accent: #f59e0b;
          }
        `}
      </style>

      {/* Header */}
      <header className="bg-transparent backdrop-blur-md border-b border-white/10 sticky top-0 z-50 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">FitnessPro</h1>
                <p className="text-xs text-gray-400">Premium Gym</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                    location.pathname === item.url
                      ? "bg-white/10 text-white"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <Link to={createPageUrl("Cart")} className="relative">
                <Button variant="ghost" size="icon" className="relative hover:bg-white/10">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-blue-500 text-xs border-2 border-gray-800">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* User Menu */}
              <div className="hidden md:flex items-center space-x-3">
                {user ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.full_name?.[0] || user.email[0].toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleLogout} className="text-white border-white/20 hover:bg-white/10 hover:text-white bg-transparent">
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-700">
                    Login
                  </Button>
                )}
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden hover:bg-white/10"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-gray-900/90 backdrop-blur-lg">
            <div className="px-4 py-3 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                    location.pathname === item.url
                      ? "bg-white/10 text-white"
                      : "text-gray-300 hover:bg-white/5"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              ))}
              
              <div className="pt-3 border-t border-white/10">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 px-3">
                      <UserIcon className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-white">
                        {user.full_name || user.email}
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleLogout}
                      className="w-full text-white border-white/20 hover:bg-white/10"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700">
                    Login
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gray-900">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">FitnessPro</span>
              </div>
              <p className="text-gray-400 text-sm">
                Premium fitness experience with top-tier equipment and expert guidance.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link to={createPageUrl("Memberships")} className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Memberships
                </Link>
                <Link to={createPageUrl("Shop")} className="block text-gray-400 hover:text-white transition-colors text-sm">
                  Shop
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Email: support@fitnesspro.com</p>
                <p>Phone: (555) 123-4567</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Hours</h3>
              <div className="space-y-1 text-sm text-gray-400">
                <p>Mon-Fri: 5:00 AM - 11:00 PM</p>
                <p>Sat-Sun: 6:00 AM - 10:00 PM</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 FitnessPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

