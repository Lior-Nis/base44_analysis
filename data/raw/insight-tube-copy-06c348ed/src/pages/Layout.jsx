
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Youtube, Library, Sparkles } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <style>{`
        :root {
          --primary: 240 10% 98%;
          --primary-foreground: 240 6% 10%;
          --background: 240 6% 10%;
          --foreground: 240 10% 98%;
        }
      `}</style>
      
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Youtube className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">SummaryTube</h1>
                <p className="text-xs text-purple-300">AI Video Insights</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <Link 
                to={createPageUrl("Summarizer")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  location.pathname === createPageUrl("Summarizer")
                    ? "bg-white/20 text-white"
                    : "text-purple-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">Summarize</span>
              </Link>
              
              <Link 
                to={createPageUrl("Library")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  location.pathname === createPageUrl("Library")
                    ? "bg-white/20 text-white"
                    : "text-purple-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Library className="w-4 h-4" />
                <span className="font-medium">Library</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative">
        {children}
      </main>
    </div>
  );
}
