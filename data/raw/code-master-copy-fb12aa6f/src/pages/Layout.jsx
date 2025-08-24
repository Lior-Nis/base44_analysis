

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  BookOpen,
  Code2,
  Trophy,
  User,
  Home,
  ChevronRight
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
    icon: Home,
  },
  {
    title: "Python Course",
    url: createPageUrl("PythonCourse"),
    icon: Code2,
  },
  {
    title: "Java Course",
    url: createPageUrl("JavaCourse"),
    icon: Code2,
  },
  {
    title: "C Programming",
    url: createPageUrl("CCourse"),
    icon: Code2,
  },
  {
    title: "Practice Lab",
    url: createPageUrl("Practice"),
    icon: BookOpen,
  },
  {
    title: "Coding Games",
    url: createPageUrl("Games"),
    icon: Trophy,
  },
  {
    title: "Achievements",
    url: createPageUrl("Achievements"),
    icon: Trophy,
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --primary: #1a1f36;
          --primary-light: #2a3154;
          --accent-python: #3b82f6;
          --accent-java: #f97316;
          --accent-c: #8b5cf6;
          --success: #10b981;
          --background: #f8fafc;
          --surface: #ffffff;
          --text: #1f2937;
          --text-muted: #6b7280;
        }

        body {
          background: var(--background);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .gradient-text {
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .gradient-bg-main {
          background: linear-gradient(180deg, #f0f4f9 0%, #e6e9ee 100%);
        }

        .glass-effect {
          backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
        }

        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }
      `}</style>

      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r border-gray-100 bg-white/70 backdrop-blur-xl">
          <SidebarHeader className="border-b border-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-gray-900">CodeMaster</h2>
                <p className="text-xs text-gray-500 font-medium">Learn • Practice • Master</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-xl group ${
                          location.pathname === item.url ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:text-white' : 'text-gray-600'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                          <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="mt-8 mx-3">
              <div className="glass-effect rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold text-gray-800">Progress</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600 font-medium">🐍 Python</span>
                      <span className="font-bold text-blue-600">0%</span>
                    </div>
                    <div className="w-full bg-blue-100 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{width: '0%'}}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600 font-medium">☕ Java</span>
                      <span className="font-bold text-orange-600">0%</span>
                    </div>
                    <div className="w-full bg-orange-100 rounded-full h-1.5"><div className="bg-orange-500 h-1.5 rounded-full" style={{width: '0%'}}></div></div>
                  </div>
                  <div>
                     <div className="flex justify-between mb-1">
                      <span className="text-gray-600 font-medium">⚡ C</span>
                      <span className="font-bold text-purple-600">0%</span>
                    </div>
                    <div className="w-full bg-purple-100 rounded-full h-1.5"><div className="bg-purple-500 h-1.5 rounded-full" style={{width: '0%'}}></div></div>
                  </div>
                </div>
              </div>
            </div>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">Learner</p>
                <p className="text-xs text-gray-500 truncate">Keep coding!</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col gradient-bg-main">
          <header className="bg-white/70 backdrop-blur-xl border-b border-gray-100 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-xl transition-colors duration-200" />
              <h1 className="text-xl font-bold text-gray-900">CodeMaster</h1>
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

