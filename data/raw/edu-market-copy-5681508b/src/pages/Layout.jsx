

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BookOpen, User, Settings, GraduationCap, Library, CreditCard, Info, Star, Bookmark, BarChart3, Users, Bot, FileText, Shield, TestTubeDiagonal, Palette, MessageCircle, DollarSign } from "lucide-react";
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
import { User as UserEntity } from "@/api/entities";
import LanguageSwitcher from "./components/common/LanguageSwitcher";


const studentNavigationItems = [
  {
    title: "Professional Courses",
    url: createPageUrl("Catalog"),
    icon: Library,
  },
  {
    title: "My Learning Journey",
    url: createPageUrl("Catalog"),
    icon: BookOpen,
  },
  {
    title: "My Bookmarks",
    url: createPageUrl("Catalog"),
    icon: Bookmark,
  },
  {
    title: "Course Reviews",
    url: createPageUrl("Reviews"),
    icon: Star,
  },
  {
    title: "Private Messages",
    url: createPageUrl("Messages"),
    icon: MessageCircle,
  },
  {
    title: "AI Assistant",
    url: createPageUrl("AIAssistant"),
    icon: Bot,
  },
  {
      title: "Test Generator",
      url: createPageUrl("TestGenerator"),
      icon: TestTubeDiagonal,
  },
  {
      title: "Doodle Notes AI",
      url: createPageUrl("DoodleNotes"),
      icon: Palette,
  },
  {
    title: "About Our Mission",
    url: createPageUrl("About"),
    icon: Info,
  },
];

const adminNavigationItems = [
  {
    title: "Course Management",
    url: createPageUrl("ManageCourses"),
    icon: Settings,
  },
  {
    title: "Purchase Verification",
    url: createPageUrl("PurchaseVerification"),
    icon: DollarSign,
  },
  {
    title: "Private Messages",
    url: createPageUrl("Messages"),
    icon: MessageCircle,
  },
  {
    title: "Analytics Dashboard",
    url: createPageUrl("Dashboard"),
    icon: BarChart3,
  },
  {
    title: "Affiliate Program",
    url: createPageUrl("Affiliates"),
    icon: Users,
  },
  {
    title: "Payment Settings",
    url: createPageUrl("Settings"),
    icon: CreditCard,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
        try {
            const currentUser = await UserEntity.me();
            setUser(currentUser);
        } catch (error) {
            // Not logged in
        }
    };
    fetchUser();
  }, []);

  return (
    <SidebarProvider>
      <style>
        {`
          :root {
            --primary: 217 91% 60%;
            --primary-foreground: 217 91% 98%;
            --secondary: 210 40% 50%;
            --secondary-foreground: 210 40% 98%;
            --accent: 45 93% 58%;
            --accent-foreground: 45 93% 15%;
            --background: 220 15% 97%;
            --foreground: 220 15% 15%;
            --muted: 220 15% 95%;
            --muted-foreground: 220 15% 45%;
            --border: 220 15% 90%;
            --ring: 217 91% 60%;
            --radius: 0.75rem;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            cursor: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><text y="24" font-size="24">🎓</text></svg>'), auto !important;
          }
          
          * {
            cursor: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><text y="24" font-size="24">🎓</text></svg>'), auto !important;
          }
          
          button, a, input, select, textarea {
            cursor: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><text y="24" font-size="24">🎓</text></svg>'), pointer !important;
          }
        `}
      </style>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Sidebar className="border-r border-slate-200/80 bg-white/90 backdrop-blur-md shadow-xl">
          <SidebarHeader className="border-b border-slate-200/80 p-6 bg-gradient-to-r from-slate-50 to-blue-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-xl tracking-tight">Academic Zone</h2>
                <p className="text-xs text-slate-600 font-medium">Professional Learning Excellence</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4 bg-gradient-to-b from-white/50 to-blue-50/30">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-3">
                Academic Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {studentNavigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-xl mb-2 group ${
                          location.pathname === item.url ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm border border-blue-100' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            {user?.role === 'admin' && (
                <SidebarGroup className="mt-4">
                <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-3">
                    Administration
                </SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                    {adminNavigationItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                            asChild 
                            className={`hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 rounded-xl mb-2 group ${
                            location.pathname === item.url ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 shadow-sm border border-purple-100' : ''
                            }`}
                        >
                            <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-medium">{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                    </SidebarMenu>
                </SidebarGroupContent>
                </SidebarGroup>
            )}

            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-3">
                Legal & Policies
              </SidebarGroupLabel>
              <SidebarGroupContent>
                 <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="hover:bg-slate-100 transition-all duration-200 rounded-xl mb-2 group">
                            <Link to={createPageUrl("TermsOfService")} className="flex items-center gap-3 px-4 py-3">
                                <FileText className="w-5 h-5 text-slate-500"/>
                                <span className="font-medium text-slate-700">Terms of Service</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="hover:bg-slate-100 transition-all duration-200 rounded-xl mb-2 group">
                            <Link to={createPageUrl("PrivacyPolicy")} className="flex items-center gap-3 px-4 py-3">
                                <Shield className="w-5 h-5 text-slate-500"/>
                                <span className="font-medium text-slate-700">Privacy Policy</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                 </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200/80 p-6 bg-gradient-to-r from-slate-50 to-blue-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">{user ? user.full_name : "Guest"}</p>
                <p className="text-xs text-slate-600 truncate">{user ? user.email : "Advancing Academic Excellence"}</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/70 backdrop-blur-sm border-b border-slate-200/60 px-6 py-3 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200 md:hidden" />
                    <h1 className="text-xl font-bold text-slate-900 hidden md:block">{currentPageName}</h1>
                </div>
                <LanguageSwitcher />
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

