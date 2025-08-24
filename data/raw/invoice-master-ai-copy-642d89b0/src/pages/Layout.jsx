

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LayoutDashboard, Upload } from "lucide-react";
import SidebarAgent from "./components/agent/SidebarAgent";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Upload",
    url: createPageUrl("Upload"),
    icon: Upload,
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  // Don't show layout for Agents page as it has its own layout
  if (currentPageName === "Agents") {
    return children;
  }

  return (
    <div className="min-h-screen dashboard-bg flex justify-center items-center p-4 md:p-10">
      <style>
        {`
          .dashboard-bg {
            background: linear-gradient(135deg, #b8a898 0%, #8b7a9e 100%);
          }
          
          .glass-panel {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .glass-dark {
            background: rgba(0, 0, 0, 0.1);
          }
          
          .glass-darker {
            background: rgba(0, 0, 0, 0.2);
          }
          
          .glass-light {
            background: rgba(255, 255, 255, 0.05);
          }
          
          .glass-green {
            background: rgba(34, 197, 94, 0.1);
            backdrop-filter: blur(20px);
            border-left: 1px solid rgba(34, 197, 94, 0.2);
          }
          
          .glass-hover {
            background: rgba(255, 255, 255, 0.2);
          }
          
          .text-glass {
            color: rgba(255, 255, 255, 0.9);
          }
          
          .text-glass-muted {
            color: rgba(255, 255, 255, 0.6);
          }
          
          .text-glass-dim {
            color: rgba(255, 255, 255, 0.8);
          }
          
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }

          .animate-float:hover {
            animation-play-state: paused;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          /* Lighter font weights globally */
          * {
            font-weight: 300 !important;
          }
          
          .font-medium {
            font-weight: 400 !important;
          }
          
          .font-semibold {
            font-weight: 500 !important;
          }
          
          .font-bold {
            font-weight: 600 !important;
          }
          
          /* Fix placeholder text color to white */
          input::placeholder {
            color: white !important;
          }
          
          textarea::placeholder {
            color: white !important;
          }
        `}
      </style>
      
      <div className="glass-panel rounded-[20px] w-full max-w-7xl flex shadow-2xl animate-float transition-all duration-300" style={{height: 'calc(100vh - 80px)', maxHeight: '850px'}}>
        {/* Left Sidebar */}
        <div className="glass-dark w-20 rounded-l-[20px] flex flex-col items-center py-8 gap-8">
          {navigationItems.map((item, index) => (
            <Link
              key={item.title}
              to={item.url}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all duration-300 hover:glass-hover ${
                location.pathname.startsWith(item.url) ? 'glass-hover' : 'glass-light'
              }`}
            >
              <item.icon className="w-5 h-5" />
            </Link>
          ))}
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {children}
        </main>

        {/* Right Sidebar - AI Agent */}
        <div className="w-80 overflow-hidden">
          <SidebarAgent />
        </div>
      </div>
    </div>
  );
}

