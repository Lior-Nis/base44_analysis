

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Calendar, BarChart3, User, Settings, Activity, LogOut, ChevronDown } from "lucide-react"; // Added LogOut, ChevronDown
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Assuming shadcn
import { Button } from "@/components/ui/button"; // For the trigger
import { User as UserSDK } from "@/api/entities"; // For logout

// Updated navigation items - Dashboard removed too
const navigationItems = [
  // { // Dashboard removed
  //   title: "Dashboard",
  //   url: createPageUrl("Dashboard"),
  //   icon: Calendar,
  // },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    UserSDK.me().then(setUser).catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await UserSDK.logout();
    window.location.reload(); // Or redirect to a public page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-100 to-indigo-100 relative overflow-hidden">
      {/* Enhanced Animated Background Elements - Larger and More Opaque */}
      <div className="fixed inset-0 pointer-events-none opacity-90"> {/* Increased main opacity */}
        <motion.div 
          className="absolute w-96 h-96 bg-gradient-to-r from-sky-400/40 to-blue-500/40 rounded-full blur-3xl" // Increased size and opacity
          animate={{ 
            x: [100, 400, 100], 
            y: [150, 450, 150], 
            scale: [0.9, 1.3, 0.9]
          }}
          transition={{ duration: 30, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute w-100 h-100 bg-gradient-to-r from-indigo-400/35 to-purple-500/35 rounded-full blur-3xl" // Increased size and opacity
          animate={{ 
            x: [500, 900, 500], 
            y: [100, 400, 100], 
            scale: [1.2, 0.8, 1.2]
          }}
          transition={{ duration: 35, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 5 }}
        />
        <motion.div 
          className="absolute w-80 h-80 bg-gradient-to-r from-cyan-400/45 to-teal-400/45 rounded-full blur-2xl" // Increased size and opacity
          animate={{ 
            x: [150, 550, 150], 
            y: [450, 250, 450], 
            scale: [1.0, 1.4, 1.0]
          }}
          transition={{ duration: 40, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 10 }}
        />
      </div>

      {/* Semi-Transparent Header with Navigation - Updated transparency */}
      <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-lg shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / App Name */}
            <div className="flex items-center">
              <Link to={createPageUrl("Dashboard")} className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-br from-slate-800 to-slate-600 rounded-xl flex items-center justify-center shadow-md">
                  <Activity className="w-5 h-5 text-sky-400" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  FlowSchedule
                </h1>
              </Link>
            </div>

            {/* Desktop Navigation - Now only User Dropdown */}
            <nav className="hidden md:flex items-center space-x-2">
              {/* User Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                    <div className="w-7 h-7 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center text-slate-700 font-medium text-xs">
                      {user && user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <ChevronDown className="w-4 h-4 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white/90 backdrop-blur-md border-slate-200/80 shadow-lg rounded-xl">
                  <DropdownMenuLabel className="text-slate-800 px-2 py-1.5">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-200/50"/>
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-100/80 rounded-md m-1">
                    <Link to={createPageUrl("Profile")} className="flex items-center px-2 py-1.5 text-slate-700">
                      <User className="w-4 h-4 mr-2 opacity-80" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-100/80 rounded-md m-1">
                    <Link to={createPageUrl("Settings")} className="flex items-center px-2 py-1.5 text-slate-700">
                      <Settings className="w-4 h-4 mr-2 opacity-80" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-200/50"/>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-red-50/80 rounded-md m-1 text-red-600 flex items-center px-2 py-1.5">
                    <LogOut className="w-4 h-4 mr-2 opacity-80" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
            
            {/* Mobile User Icon */}
            <div className="md:hidden flex items-center">
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full text-slate-600 hover:bg-slate-100">
                       <User className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white/90 backdrop-blur-md border-slate-200/80 shadow-lg rounded-xl">
                    <DropdownMenuLabel className="text-slate-800 px-2 py-1.5">My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-200/50"/>
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-100/80 rounded-md m-1">
                      <Link to={createPageUrl("Profile")} className="flex items-center px-2 py-1.5 text-slate-700">
                        <User className="w-4 h-4 mr-2 opacity-80" /> Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-slate-100/80 rounded-md m-1">
                      <Link to={createPageUrl("Settings")} className="flex items-center px-2 py-1.5 text-slate-700">
                        <Settings className="w-4 h-4 mr-2 opacity-80" /> Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-200/50"/>
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-red-50/80 rounded-md m-1 text-red-600 flex items-center px-2 py-1.5">
                      <LogOut className="w-4 h-4 mr-2 opacity-80" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>
        </div>
        {/* Mobile Navigation - Now empty since no navigation items */}
        {navigationItems.length > 0 && (
          <div className="md:hidden border-t border-slate-200/50">
              <nav className="flex justify-around p-2">
                   {navigationItems.map((item) => {
                      const isActive = location.pathname === item.url;
                      return (
                          <Link
                          key={item.title + "-mobile"}
                          to={item.url}
                          className={`flex flex-col items-center p-2 rounded-lg ${isActive ? 'text-sky-600' : 'text-slate-500'}`}
                          >
                          <item.icon className="w-5 h-5" />
                          <span className="text-xs">{item.title}</span>
                          </Link>
                      );
                  })}
              </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
}

