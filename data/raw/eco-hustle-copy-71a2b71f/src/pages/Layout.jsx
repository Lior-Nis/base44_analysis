
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User as UserSDK } from "@/api/entities";
import { 
  Home, 
  Zap, 
  Trophy, 
  Gift, 
  User,
  Leaf,
  Map,
  Shield
} from "lucide-react";
import { motion } from "framer-motion";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: Home,
  },
  {
    title: "Actions",
    url: createPageUrl("Actions"),
    icon: Zap,
  },
  {
    title: "Map",
    url: createPageUrl("Map"),
    icon: Map,
  },
  {
    title: "Challenges",
    url: createPageUrl("Challenges"),
    icon: Trophy,
  },
  {
    title: "Rewards",
    url: createPageUrl("Rewards"),
    icon: Gift,
  },
  {
    title: "Profile",
    url: createPageUrl("Profile"),
    icon: User,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await UserSDK.me();
        setUser(currentUser);
      } catch (e) {
        // Not logged in or error fetching user. User state will remain null.
      }
    };
    fetchUser();
  }, []);

  const adminNavigationItem = {
    title: "Admin",
    url: createPageUrl("Admin"),
    icon: Shield,
  };

  const navItemsWithAdmin = user?.role === 'admin' 
    ? [...navigationItems, adminNavigationItem]
    : navigationItems;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-green-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-green-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/2 w-64 h-64 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Nearly Invisible Platform Badge */}
      <div className="absolute top-2 right-2 opacity-5 hover:opacity-20 transition-opacity duration-1000 z-50">
        <div className="text-xs text-white/30 font-light">base44</div>
      </div>

      {/* Mobile Header */}
      <header className="md:hidden bg-black/20 backdrop-blur-2xl border-b border-emerald-400/30 px-4 py-3 sticky top-0 z-50 shadow-2xl">
        <div className="flex items-center justify-center">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 via-green-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/50">
                <Leaf className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl blur-lg opacity-60 animate-pulse"></div>
            </div>
            <span className="font-black text-2xl bg-gradient-to-r from-emerald-300 via-green-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-2xl">
              EcoHustle
            </span>
          </motion.div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-72 bg-black/40 backdrop-blur-2xl border-r border-emerald-400/30 flex-col z-40 shadow-2xl">
        <div className="p-8 border-b border-emerald-400/30">
          <motion.div 
            className="flex items-center gap-4"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 via-green-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/50">
                <Leaf className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl blur-xl opacity-60 animate-pulse"></div>
            </div>
            <div>
              <h2 className="font-black text-2xl bg-gradient-to-r from-emerald-300 via-green-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-2xl">
                EcoHustle
              </h2>
              <p className="text-sm text-emerald-300/80 font-bold tracking-wide">TURN GREEN INTO GREEN</p>
            </div>
          </motion.div>
        </div>
        
        <nav className="flex-1 p-6">
          <ul className="space-y-3">
            {navItemsWithAdmin.map((item, index) => {
              const isActive = location.pathname === item.url;
              return (
                <motion.li 
                  key={item.title}
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.url}
                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                      isActive 
                        ? 'bg-gradient-to-r from-emerald-400 via-green-500 to-cyan-400 text-white shadow-2xl shadow-emerald-500/50 transform scale-105' 
                        : 'hover:bg-white/10 text-emerald-200 hover:text-white hover:scale-102 hover:shadow-xl'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 blur-xl opacity-60 animate-pulse"></div>
                    )}
                    <item.icon className={`w-6 h-6 relative z-10 ${isActive ? 'text-white drop-shadow-lg' : 'text-emerald-300 group-hover:text-white group-hover:drop-shadow-lg'} transition-all duration-300`} />
                    <span className="font-bold relative z-10 tracking-wide">{item.title}</span>
                    {isActive && (
                      <motion.div
                        className="absolute right-4 w-2 h-2 bg-white rounded-full shadow-lg"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      />
                    )}
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </nav>

        <div className="p-6 border-t border-emerald-400/30">
          <motion.div 
            className="bg-gradient-to-r from-emerald-500 via-green-600 to-cyan-500 rounded-2xl p-6 text-white shadow-2xl shadow-emerald-500/50 relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 blur-2xl opacity-40 animate-pulse"></div>
            <div className="relative z-10">
              <div className="text-lg font-black mb-2 drop-shadow-lg">Daily Goal 🎯</div>
              <div className="text-sm opacity-90 mb-4 font-semibold">Complete 3 eco actions today</div>
              <div className="bg-white/30 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                <motion.div 
                  className="bg-white h-full rounded-full shadow-lg"
                  initial={{ width: 0 }}
                  animate={{ width: "66%" }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-72 min-h-screen relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="pb-24 md:pb-0"
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-2xl border-t border-emerald-400/30 px-2 py-3 z-50 shadow-2xl">
        <div className="flex justify-around">
          {navItemsWithAdmin.map((item, index) => {
            const isActive = location.pathname === item.url;
            return (
              <Link
                key={item.title}
                to={item.url}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all duration-300 relative ${
                  isActive 
                    ? 'text-emerald-300 scale-110' 
                    : 'text-emerald-400/70 hover:text-emerald-300'
                }`}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-green-500/30 rounded-xl blur-lg"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}
                <item.icon className={`w-5 h-5 relative z-10 ${isActive ? 'drop-shadow-lg' : ''} transition-all duration-300`} />
                <span className="text-xs font-bold relative z-10 tracking-wide">{item.title}</span>
                {isActive && (
                  <motion.div
                    className="absolute -top-1 w-1 h-1 bg-emerald-300 rounded-full shadow-lg"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
