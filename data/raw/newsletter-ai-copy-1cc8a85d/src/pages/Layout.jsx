

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { PenTool, Calendar, Send, History, Users, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: Calendar,
  },
  {
    title: "Content Planner",
    url: createPageUrl("Planner"),
    icon: PenTool,
  },
  {
    title: "Send Newsletter",
    url: createPageUrl("Send"),
    icon: Send,
  },
  {
    title: "Subscribers",
    url: createPageUrl("Subscribers"),
    icon: Users,
  },
  {
    title: "History",
    url: createPageUrl("History"),
    icon: History,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Set favicon with NewsletterAI logo
    const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/svg+xml';
    favicon.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" rx="40" fill="white"/><path d="M60 70h20l20 40h-15l-4-8h-22l-4 8h-15l20-40zm10 10l-6 12h12l-6-12z" fill="black"/><path d="M110 70v40h-10v-40h10z" fill="black"/><path d="M50 50h20v10h-20z" fill="black" stroke="black" stroke-width="2"/><text x="100" y="130" font-family="Arial Black, sans-serif" font-size="40" font-weight="900" fill="black" text-anchor="middle">N.AI</text></svg>';
    document.head.appendChild(favicon);

    // Set page title
    document.title = 'NewsletterAI - AI-Powered Content Creation';

    const fetchUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (error) {
        console.error("Not logged in:", error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await User.logout();
    window.location.reload();
  };

  return (
    <SidebarProvider>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .glass-morphism {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(40px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 
            0 8px 32px 0 rgba(31, 38, 135, 0.1),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 
            0 20px 40px -12px rgba(0, 0, 0, 0.15),
            0 8px 25px -5px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        
        .gradient-bg {
          background: linear-gradient(135deg, 
            #667eea 0%, 
            #764ba2 25%, 
            #f093fb 50%, 
            #f5576c 75%, 
            #4facfe 100%);
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .sidebar-bg {
          background: linear-gradient(180deg, 
            rgba(255, 255, 255, 0.98) 0%, 
            rgba(255, 255, 255, 0.95) 100%);
        }
      `}</style>
      
      <div className="min-h-screen flex w-full relative overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="fixed inset-0 -z-10 gradient-bg" />
        
        <Sidebar className="border-r-0 glass-morphism sidebar-bg">
          <SidebarHeader className="border-b border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <svg width="24" height="24" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <rect width="30" height="6" x="15" y="30" fill="white" stroke="white" strokeWidth="2"/>
                  <text x="100" y="130" fontFamily="Arial Black, sans-serif" fontSize="50" fontWeight="900" fill="white" textAnchor="middle">N.AI</text>
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg tracking-tight">NewsletterAI</h2>
                <p className="text-xs text-gray-600 font-medium">AI-Powered Content</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 py-4">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-gray-100 hover:text-gray-900 transition-all duration-300 rounded-3xl mb-3 backdrop-blur-sm border border-transparent group ${
                          location.pathname === item.url 
                            ? 'bg-gray-100 text-gray-900 shadow-lg border-gray-200' 
                            : 'text-gray-700 hover:border-gray-200'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-4 px-5 py-4">
                          <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                          <span className="font-semibold text-sm">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-200 p-6">
            <div className="flex items-center justify-between">
              {currentUser ? (
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-xl border border-gray-300">
                    <span className="text-gray-700 font-bold text-lg">
                      {currentUser.full_name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{currentUser.full_name}</p>
                    <p className="text-xs text-gray-600 truncate">{currentUser.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="p-3 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300 hover:scale-110"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="glass-morphism border-b border-gray-200 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-gray-100 p-3 rounded-3xl transition-all duration-300" />
              <h1 className="text-xl font-bold text-gray-900">NewsletterAI</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

