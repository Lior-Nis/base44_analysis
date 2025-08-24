

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Gem, Upload, Palette, Settings, Users, Shield, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { User } from "@/api/entities";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    }
  };

  const navigationItems = [
    {
      title: "Design Studio",
      url: createPageUrl("CustomizeJewelry"),
      icon: Palette,
    },
    {
      title: "My Designs",
      url: createPageUrl("MyDesigns"),
      icon: Gem,
    },
  ];

  // Add admin-only navigation items
  if (user?.role === 'admin') {
    navigationItems.push({
      title: "All Submissions",
      url: createPageUrl("AllDesigns"),
      icon: Shield,
    });
    navigationItems.push({
      title: "Data Table",
      url: createPageUrl("AdminDataTable"),
      icon: Users,
    });
  }

  const handleLogout = async () => {
    try {
      await User.logout();
      setUser(null);
      // Page will reload and redirect user to login screen if necessary
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --primary: 0 0% 0%;
          --primary-foreground: 0 0% 100%;
          --secondary: 0 0% 96%;
          --secondary-foreground: 0 0% 9%;
          --muted: 0 0% 96%;
          --muted-foreground: 0 0% 45%;
          --accent: 45 100% 51%;
          --accent-foreground: 0 0% 9%;
          --destructive: 0 84% 60%;
          --destructive-foreground: 0 0% 98%;
          --border: 0 0% 90%;
          --input: 0 0% 90%;
          --ring: 0 0% 63%;
          --radius: 0.75rem;
          --gold: 45 100% 51%;
          --gold-foreground: 0 0% 9%;
        }
        
        .kiss-gradient {
          background: linear-gradient(135deg, #000000 0%, #1a1a1a 25%, #000000 50%, #0a0a0a 75%, #000000 100%);
        }
        
        .gold-accent {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%);
        }
        
        .gold-border {
          border-image: linear-gradient(135deg, #FFD700, #FFA500) 1;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
      `}</style>
      <div className="min-h-screen flex w-full kiss-gradient">
        <Sidebar className="border-r border-yellow-500/30 bg-black/80 backdrop-blur-xl">
          <SidebarHeader className="border-b border-yellow-500/30 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gold-accent rounded-xl flex items-center justify-center shadow-2xl">
                <Gem className="w-6 h-6 text-black font-bold" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-white">Kiss Moissanite</h2>
                <p className="text-xs text-yellow-400 font-medium">Custom Jewelry Studio</p>
              </div>
            </div>
            {user && (
              <div className="mt-4 p-3 bg-white/5 rounded-lg border border-yellow-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 text-xs font-medium">
                    {user.full_name || user.email}
                  </span>
                  {user.role === 'admin' && (
                    <Shield className="w-3 h-3 text-red-400" />
                  )}
                </div>
              </div>
            )}
          </SidebarHeader>
          
          <SidebarContent className="p-4 flex flex-col justify-between h-full">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`w-full justify-start hover:bg-white/10 transition-colors duration-200 rounded-lg px-4 py-3 ${
                          location.pathname === item.url ? 'bg-yellow-400 text-black font-bold' : 'text-gray-200 hover:text-white'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-semibold">{item.title}</span>
                          {(item.title === "All Submissions" || item.title === "Data Table") && (
                            <Shield className="w-4 h-4 text-red-500 ml-auto" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            {user && (
              <SidebarGroup className="mt-auto">
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={handleLogout}
                        className="hover:bg-red-500/20 hover:text-red-400 transition-all duration-300 rounded-xl px-4 py-3 w-full text-white"
                      >
                        <div className="flex items-center gap-3">
                          <LogOut className="w-5 h-5" />
                          <span className="font-semibold">Logout</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-black/90 backdrop-blur-xl border-b border-yellow-500/30 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-yellow-500/20 p-2 rounded-lg transition-colors duration-200 text-white" />
              <h1 className="text-xl font-bold text-white">Kiss Moissanite</h1>
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


