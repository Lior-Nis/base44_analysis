import React from 'react';
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  BarChart3, Upload, FileText, Users, Shield, Stethoscope
} from "lucide-react";
import {
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";

const navigationItems = [
  { 
    title: "Dashboard", 
    description: "Analytics and activity", 
    icon: BarChart3, 
    url: createPageUrl("Dashboard") 
  },
  { 
    title: "Upload Study", 
    description: "Submit new medical images", 
    icon: Upload, 
    url: createPageUrl("Upload") 
  },
  { 
    title: "Reports", 
    description: "Access generated reports", 
    icon: FileText, 
    url: createPageUrl("Reports") 
  },
  { 
    title: "Patients", 
    description: "Manage patient records", 
    icon: Users, 
    url: createPageUrl("Patients") 
  },
];

export default function SidebarNavigation({ currentUser }) {
  const location = useLocation();

  return (
    <>
      <SidebarHeader className="border-b border-slate-100 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-lg">OsteoScope</h2>
            <p className="text-xs text-slate-500 font-medium">Medical Imaging Analysis</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
            Medical Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`group relative hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg p-3 ${
                      location.pathname === item.url 
                        ? 'bg-blue-50 text-blue-700 shadow-sm border-l-4 border-blue-600' 
                        : 'text-slate-600'
                    }`}
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className={`w-5 h-5 transition-colors ${
                        location.pathname === item.url ? 'text-blue-600' : 'text-slate-500'
                      }`} />
                      <div className="flex-1">
                        <span className="font-medium text-sm">{item.title}</span>
                        <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {currentUser && currentUser.role === 'admin' && (
          <SidebarGroup className="mt-8">
            <SidebarGroupLabel className="text-xs font-semibold text-red-500 uppercase tracking-wider px-3 py-2">
              Admin Panel
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                 <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    className={`group relative hover:bg-red-50 hover:text-red-700 transition-all duration-200 rounded-lg p-3 ${
                      location.pathname === createPageUrl("Admin")
                        ? 'bg-red-50 text-red-700' : 'text-slate-600'
                    }`}
                  >
                    <Link to={createPageUrl("Admin")} className="flex items-center gap-3">
                       <Shield className={`w-5 h-5 transition-colors ${
                        location.pathname === createPageUrl("Admin") ? 'text-red-600' : 'text-slate-500'
                      }`} />
                      <div className="flex-1">
                        <span className="font-medium text-sm">Payment Verification</span>
                        <p className="text-xs text-slate-400 mt-0.5">Approve/reject payments</p>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        
        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
            System Status
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-3 py-3 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-slate-600 font-medium">AI Engine</span>
                </div>
                <span className="text-green-600 font-semibold text-xs">Online</span>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-slate-100 p-4">
         <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
             <span className="text-slate-600 text-sm">{currentUser?.full_name?.[0] || 'U'}</span> 
           </div>
           <div className="flex-1">
             <p className="text-sm font-medium text-slate-700">{currentUser?.full_name || 'User'}</p>
             <p className="text-xs text-slate-500">{currentUser?.email || 'user@example.com'}</p>
           </div>
         </div>
      </SidebarFooter>
    </>
  );
}