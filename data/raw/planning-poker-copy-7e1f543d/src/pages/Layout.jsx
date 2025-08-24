
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
      <style>
        {`
          :root {
            --primary-navy: #1a1f36;
            --primary-blue: #3b82ff;
            --accent-purple: #8b5cf6;
            --text-primary: #f8fafc;
            --text-secondary: #cbd5e1;
            --card-bg: rgba(255, 255, 255, 0.95);
            --glass-bg: rgba(255, 255, 255, 0.1);
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          }
          
          .glass-effect {
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .card-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .card-hover:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          }
        `}
      </style>
      
      <nav className="glass-effect border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/2e85a7c8e_AHlogo_sygnet1.png" 
                alt="Agile Hunters Logo"
                className="w-10 h-10 group-hover:scale-110 transition-transform duration-300"
              />
              <div>
                <h1 className="text-xl font-bold text-white">Planning Poker</h1>
                <p className="text-xs text-slate-400">by Agile Hunters</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-6">
              <Link 
                to={createPageUrl("Home")} 
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  location.pathname === createPageUrl("Home") 
                    ? 'bg-white/20 text-white' 
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Home className="w-4 h-4" />
                <span className="font-medium">Home</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="relative">
        {children}
      </main>
    </div>
  );
}
