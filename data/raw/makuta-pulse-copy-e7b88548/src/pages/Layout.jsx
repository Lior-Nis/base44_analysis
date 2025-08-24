
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Bell, 
  Wallet,
  MessageSquare,
  Activity
} from "lucide-react";
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
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: BarChart3,
  },
  {
    title: "Assets",
    url: createPageUrl("Assets"),
    icon: Wallet,
  },
  {
    title: "Social Media",
    url: createPageUrl("Social"),
    icon: MessageSquare,
  },
  {
    title: "Community",
    url: createPageUrl("Community"),
    icon: Users,
  },
  {
    title: "Alerts",
    url: createPageUrl("Alerts"),
    icon: Bell,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-emerald-50 via-white to-yellow-50">
        <style>
          {`
            :root {
              --makuta-green: #0D4F3C;
              --makuta-light-green: #2D8A5A;
              --makuta-gold: #D4AF37;
              --makuta-cream: #F8F6F0;
            }
          `}
        </style>
        
        <Sidebar className="border-r border-emerald-100 bg-white/80 backdrop-blur-sm">
          <SidebarHeader className="border-b border-emerald-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-emerald-900 text-lg">MAKUTA</h2>
                <p className="text-xs text-emerald-600 font-medium">Project Monitor</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-emerald-700 uppercase tracking-wider px-2 mb-3">
                Monitoring Hub
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`group hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-300 rounded-xl ${
                          location.pathname === item.url 
                            ? 'bg-gradient-to-r from-emerald-100 to-yellow-50 text-emerald-800 shadow-sm border border-emerald-200' 
                            : 'text-slate-600'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-xs font-semibold text-emerald-700 uppercase tracking-wider px-2 mb-3">
                #CryptoCongo
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-4 py-3 bg-gradient-to-br from-emerald-50 to-yellow-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-800">MKTZ Status</span>
                  </div>
                  <div className="text-xs text-emerald-600">
                    SuiVision verification pending...
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white/70 backdrop-blur-sm border-b border-emerald-100 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-emerald-50 p-2 rounded-lg transition-colors" />
              <h1 className="text-xl font-bold text-emerald-900">MAKUTA Monitor</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
