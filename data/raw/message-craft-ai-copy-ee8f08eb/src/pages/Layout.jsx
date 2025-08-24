
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MessageSquarePlus, History, Sparkles, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f2e8]/30 via-[#c0d4ea]/20 to-white">
      <style>
        {`
          :root {
            /* New Color Palette based on image */
            --light-cream: #f5f2e8;
            --dark-blue: #1e4a89;
            --medium-blue: #2e5a9a;
            --light-blue: #6b95c9;
            --very-light-blue: #c0d4ea;
            
            --primary: 215 65% 33%; /* dark-blue */
            --primary-foreground: 46 43% 93%; /* light-cream */
            --secondary: 213 54% 49%; /* light-blue */
            --accent: 214 54% 40%; /* medium-blue */
            --destructive: 0 84% 60%;
            --ring: 213 54% 49%;
            --radius: 0.75rem;
          }
        `}
      </style>

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-[#c0d4ea]/40 bg-[#f5f2e8]/80 backdrop-blur-xl shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to={createPageUrl("Generator")} className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2e5a9a] via-[#1e4a89] to-[#1e4a89] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-[#6b95c9]/30 transition-all duration-300">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl bg-gradient-to-r from-[#1e4a89] via-[#2e5a9a] to-[#6b95c9] bg-clip-text text-transparent">
                  MessageCraft
                </h1>
                <p className="text-xs text-[#2e5a9a]/80 font-medium">AI Messaging Assistant</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <Link
                to={createPageUrl("Generator")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  location.pathname === createPageUrl("Generator")
                    ? 'bg-gradient-to-r from-[#2e5a9a] to-[#1e4a89] text-white shadow-lg shadow-[#6b95c9]/30'
                    : 'text-[#1e4a89] hover:bg-[#c0d4ea]/40'
                }`}
              >
                <MessageSquarePlus className="w-5 h-5" />
                Generator
              </Link>
              <Link
                to={createPageUrl("History")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  location.pathname === createPageUrl("History")
                    ? 'bg-gradient-to-r from-[#6b95c9] to-[#2e5a9a] text-white shadow-lg shadow-[#6b95c9]/30'
                    : 'text-[#1e4a89] hover:bg-[#c0d4ea]/40'
                }`}
              >
                <History className="w-5 h-5" />
                History
              </Link>
            </nav>

            {/* Mobile Menu */}
            <NavigationMenu className="md:hidden">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-gradient-to-r from-[#2e5a9a] to-[#1e4a89] text-white">
                    <Menu className="w-5 h-5" />
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="w-48 p-2 bg-[#f5f2e8]">
                    <div className="space-y-1">
                      <NavigationMenuLink asChild>
                        <Link
                          to={createPageUrl("Generator")}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#c0d4ea]/40 transition-colors"
                        >
                          <MessageSquarePlus className="w-5 h-5 text-[#1e4a89]" />
                          <span className="font-medium text-[#1e4a89]">Generator</span>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          to={createPageUrl("History")}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#c0d4ea]/40 transition-colors"
                        >
                          <History className="w-5 h-5 text-[#2e5a9a]" />
                          <span className="font-medium text-[#1e4a89]">History</span>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full">
        {children}
      </main>
    </div>
  );
}
