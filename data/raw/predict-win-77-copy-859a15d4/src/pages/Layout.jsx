

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import {
  Home,
  Wallet,
  Trophy,
  User as UserIcon,
  Settings,
  Gamepad2,
  Menu,
  X,
  Coins,
  TrendingUp,
  Shield,
  Puzzle,
  HelpCircle,
  Bell,
  Gift,
  ShoppingCart // Added ShoppingCart import
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SupportChatWidget from './components/user/SupportChatWidget';
import { motion, AnimatePresence } from "framer-motion";

const navigationItems = [
  {
    title: "Home",
    url: createPageUrl("Home"),
    icon: Home,
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    title: "Colour Game",
    url: createPageUrl("ColourGame"),
    icon: Gamepad2,
    gradient: "from-red-500 to-pink-500"
  },
  {
    title: "Cricket",
    url: createPageUrl("Cricket"),
    icon: Trophy,
    gradient: "from-green-500 to-emerald-500"
  },
  {
    title: "Football",
    url: createPageUrl("Football"),
    icon: Trophy,
    gradient: "from-sky-500 to-blue-500"
  },
  {
    title: "Tournaments",
    url: createPageUrl("Tournament"),
    icon: Trophy,
    gradient: "from-yellow-500 to-orange-500"
  },
  {
    title: "Slots",
    url: createPageUrl("Slots"),
    icon: Gamepad2,
    gradient: "from-purple-500 to-violet-500"
  },
  {
    title: "Lottery",
    url: createPageUrl("Lottery"),
    icon: Gift,
    gradient: "from-indigo-500 to-blue-500"
  },
  {
    title: "Arcade",
    url: createPageUrl("Arcade"),
    icon: Puzzle,
    gradient: "from-pink-500 to-rose-500"
  },
  {
    title: "How to Play",
    url: createPageUrl("HowToPlay"),
    icon: HelpCircle,
    gradient: "from-teal-500 to-cyan-500"
  },
  {
    title: "Game Store", // New navigation item
    url: createPageUrl("Store"),
    icon: ShoppingCart,
    gradient: "from-orange-500 to-amber-500"
  },
  {
    title: "Wallet",
    url: createPageUrl("Wallet"),
    icon: Wallet,
    gradient: "from-emerald-500 to-green-500"
  },
  {
    title: "Profile",
    url: createPageUrl("Profile"),
    icon: UserIcon,
    gradient: "from-orange-500 to-red-500"
  }
];

const adminNavigationItem = {
  title: "Admin Panel",
  url: createPageUrl("Admin"),
  icon: Shield,
  gradient: "from-yellow-400 to-orange-500"
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.log("User not authenticated");
    }
    setIsLoading(false);
  };

  const finalNavItems = user?.role === 'admin' ? [...navigationItems, adminNavigationItem] : navigationItems;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md w-full"
        >
          {/* Enhanced Logo */}
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Link to={createPageUrl("Home")} className="inline-block">
              <div className="relative">
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
                  <Gamepad2 className="w-12 h-12 text-white" />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-2 right-12 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                >
                  <span className="text-xs font-bold text-slate-900">77</span>
                </motion.div>
              </div>
            </Link>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold mb-2"
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              Welcome to WinVerse
            </span>
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-400 mb-8"
          >
            Your hub for real money play. Please log in to continue.
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={() => User.login()}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-4 text-lg font-semibold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
            >
              Login & Play Now
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex bg-slate-900 text-white">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-slate-800/90 backdrop-blur-xl border-r border-purple-500/20 min-h-screen">
        {/* Enhanced Logo Section */}
        <div className="p-6 border-b border-purple-500/20">
          <Link to={createPageUrl("Home")}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-4"
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Gamepad2 className="w-7 h-7 text-white" />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center"
                >
                  <span className="text-xs font-bold text-slate-900">77</span>
                </motion.div>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                  WinVerse
                </h2>
                <p className="text-xs text-gray-400">Real Money Play Hub</p>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {finalNavItems.map((item) => (
            <Link key={item.title} to={item.url}>
              <motion.div
                whileHover={{ x: 5, backgroundColor: 'rgba(168, 85, 247, 0.1)' }}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                  location.pathname === item.url
                    ? 'bg-purple-500/20 border border-purple-500/30'
                    : 'hover:bg-purple-500/10'
                }`}
              >
                <item.icon className="w-5 h-5 mr-4 text-purple-400" />
                <span className="font-medium text-gray-200">{item.title}</span>
              </motion.div>
            </Link>
          ))}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-purple-500/20">
          <div className="flex items-center gap-3">
            <UserIcon className="w-8 h-8 p-1.5 bg-slate-700 rounded-full" />
            <div>
              <p className="font-semibold text-sm">{user.full_name}</p>
              <p className="text-xs text-gray-400">Balance: ₹{user.wallet_balance?.toFixed(2) || 0}</p>
            </div>
          </div>
          <Button
            onClick={() => User.logout()}
            variant="outline"
            className="w-full mt-4 border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden p-4 flex justify-between items-center bg-slate-800/90 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-50">
           <Link to={createPageUrl("Home")}>
              <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Gamepad2 className="w-5 h-5 text-white"/>
                  </div>
                  <span className="font-bold text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">WinVerse</span>
              </div>
           </Link>
          <div className="flex items-center gap-2">
            <Link to={createPageUrl("Wallet")}>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    ₹{user.wallet_balance?.toFixed(2) || 0}
                </Badge>
            </Link>
            <Button size="icon" variant="ghost" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </header>

        {/* Mobile Menu */}
        <AnimatePresence>
        {isMobileMenuOpen && (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="lg:hidden bg-slate-800 p-4 absolute w-full z-40"
            >
                <nav className="flex flex-col gap-2">
                    {finalNavItems.map((item) => (
                        <Link key={item.title} to={item.url} onClick={() => setIsMobileMenuOpen(false)}>
                            <div className={`flex items-center p-3 rounded-lg ${location.pathname === item.url ? 'bg-purple-500/20' : ''}`}>
                                <item.icon className="w-5 h-5 mr-3 text-purple-400" />
                                <span>{item.title}</span>
                            </div>
                        </Link>
                    ))}
                </nav>
            </motion.div>
        )}
        </AnimatePresence>
        
        <main className="bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
            {children}
        </main>
      </div>
      <SupportChatWidget />
    </div>
  );
}

