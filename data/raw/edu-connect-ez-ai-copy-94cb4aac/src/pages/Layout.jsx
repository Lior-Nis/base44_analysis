

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  BookOpen, 
  BarChart3, 
  Calendar, 
  Target,
  User,
  Brain // Added Brain icon
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
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: BarChart3,
    color: "text-blue-600"
  },
  {
    title: "Assignments",
    url: createPageUrl("Assignments"),
    icon: BookOpen,
    color: "text-green-600"
  },
  {
    title: "Study Plans",
    url: createPageUrl("StudyPlans"),
    icon: Target,
    color: "text-purple-600"
  },
  {
    title: "AI Tutor",
    url: createPageUrl("AITutor"),
    icon: Brain,
    color: "text-indigo-600"
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
        <style>
          {`
            :root {
              --primary-blue: #2563eb;
              --primary-green: #059669;
              --primary-purple: #7c3aed;
              --accent-blue: #dbeafe;
              --accent-green: #d1fae5;
              --accent-purple: #e9d5ff;
            }
          `}
        </style>
        
        <Sidebar className="border-r border-white/60 bg-white/80 backdrop-blur-xl">
          <SidebarHeader className="border-b border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/610461df4_AiLogo-1755130782202.png" 
                alt="EduConnect Logo" 
                className="w-10 h-10 rounded-xl"
              />
              <div>
                <h2 className="font-bold text-gray-900 text-lg">EduConnect</h2>
                <p className="text-xs text-gray-500 font-medium">Your Learning Hub</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-3">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-gradient-to-r transition-all duration-300 rounded-xl py-3 px-4 group ${
                          location.pathname === item.url 
                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm border border-blue-100' 
                            : 'hover:from-gray-50 hover:to-blue-50 hover:text-blue-600'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-4">
                          <item.icon className={`w-5 h-5 transition-colors ${
                            location.pathname === item.url ? item.color : 'text-gray-400 group-hover:text-blue-500'
                          }`} />
                          <span className="font-semibold text-sm">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">Student</p>
                <p className="text-xs text-gray-500">Keep learning!</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white/60 backdrop-blur-xl border-b border-white/60 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold text-gray-900">EduConnect</h1>
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

