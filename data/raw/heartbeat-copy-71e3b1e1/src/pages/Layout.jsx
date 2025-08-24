
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Users, Clock, Plus, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  
  const navigation = [
    { name: "Home", href: createPageUrl("Home"), icon: Home, current: currentPageName === "Home" },
    { name: "People", href: createPageUrl("Contacts"), icon: Users, current: currentPageName === "Contacts" },
    { name: "Timeline", href: createPageUrl("Timeline"), icon: Clock, current: currentPageName === "Timeline" },
    { name: "Add Note", href: createPageUrl("AddNote"), icon: Plus, current: currentPageName === "AddNote" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg-gradient-start)] via-[var(--bg-gradient-mid)] to-[var(--bg-gradient-end)]">
      <style>{`
        :root {
          --vivid-teal: #2DD4BF; /* Tailwind teal-400 */
          --teal-light: #5EEAD4; /* Tailwind teal-300 */
          --teal-dark: #14B8A6;  /* Tailwind teal-500 */
          --warm-coral: #FF7E67;
          --coral-light: #FFA695;
          --coral-dark: #E56A54;
          
          --bg-gradient-start: #F0FDFA; /* Very light teal */
          --bg-gradient-mid: #FFF0EC;   /* Very light coral */
          --bg-gradient-end: #E0FEF7;   /* Another very light teal */

          --warm-stone: #FFFFFF; /* Brighter card background */
          --text-primary: #1F2937; /* Dark Gray */
          --text-secondary: #4B5563; /* Medium Gray */
          --border-soft: rgba(31, 41, 55, 0.08); /* Softer border for cards */

          --soft-shadow: 0 4px 16px rgba(45, 212, 191, 0.1); /* Tealish shadow */
          --gentle-shadow: 0 2px 8px rgba(45, 212, 191, 0.07);
        }
        
        * {
          font-feature-settings: "cv02", "cv03", "cv04", "cv11";
        }
        
        .vivid-accent-text { color: var(--vivid-teal); }
        .vivid-accent-bg { background-color: var(--vivid-teal); }
        .vivid-accent-border { border-color: var(--vivid-teal); }

        .coral-accent-text { color: var(--warm-coral); }
        .coral-accent-bg { background-color: var(--warm-coral); }
        
        .soft-shadow { box-shadow: var(--soft-shadow); }
        .gentle-shadow { box-shadow: var(--gentle-shadow); }
        
        .tactile-card {
          background: var(--warm-stone);
          backdrop-filter: blur(12px); /* Enhanced blur for depth */
          border: 1px solid var(--border-soft);
          transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
        }
        
        .tactile-card:hover {
          transform: translateY(-3px) scale(1.01);
          box-shadow: 0 10px 35px rgba(45, 212, 191, 0.15);
          border-color: rgba(45, 212, 191, 0.2);
        }
        
        .nav-item {
          transition: all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
        }
        
        .nav-item:hover {
          transform: translateY(-1px);
        }
      `}</style>
      
      {/* Desktop Layout */}
      <div className="hidden md:flex h-screen">
        {/* Sidebar */}
        <nav className="w-72 bg-white/70 backdrop-blur-xl border-r border-[var(--border-soft)] p-6 flex flex-col">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 vivid-accent-bg rounded-2xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[var(--text-primary)]">Heartbeat</h1>
                <p className="text-sm text-[var(--text-secondary)]">Your connection journal</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 flex-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "nav-item flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all",
                    item.current
                      ? "vivid-accent-bg text-white shadow-lg"
                      : "text-[var(--text-secondary)] hover:bg-[var(--teal-light)]/20 hover:text-[var(--teal-dark)]"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
          
          <div className="mt-auto pt-6 border-t border-[var(--border-soft)]">
            <p className="text-xs text-gray-400 text-center">
              Crafted with <span className="coral-accent-text">♥</span> for meaningful connections
            </p>
          </div>
        </nav>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      
      {/* Mobile Layout */}
      <div className="md:hidden">
        <main className="pb-20">
          {children}
        </main>
        
        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-[var(--border-soft)] px-4 py-2">
          <div className="flex justify-around">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "nav-item flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all",
                    item.current
                      ? "vivid-accent-text"
                      : "text-[var(--text-secondary)] hover:text-[var(--teal-dark)]"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
