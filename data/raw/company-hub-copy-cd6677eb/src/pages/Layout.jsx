
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Calendar, 
  FileText, 
  Users, 
  Megaphone, 
  Ticket, 
  Settings,
  Home,
  Building2,
  ChevronRight,
  Clock
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
import { Badge } from "@/components/ui/badge";
import { User } from "@/api/entities";

const navigationItems = [
  {
    title: "Home",
    url: createPageUrl("Home"),
    icon: Home,
    description: "Dashboard overview"
  },
  {
    title: "Company Calendar",
    url: createPageUrl("Calendar"),
    icon: Calendar,
    description: "Training & events"
  },
  {
    title: "Policies",
    url: createPageUrl("Policies"),
    icon: FileText,
    description: "Company guidelines"
  },
  {
    title: "Executives",
    url: createPageUrl("Executives"),
    icon: Users,
    description: "Leadership team"
  },
  {
    title: "Announcements",
    url: createPageUrl("Announcements"),
    icon: Megaphone,
    description: "Company updates"
  },
  {
    title: "Support Tickets",
    url: createPageUrl("Tickets"),
    icon: Ticket,
    description: "Get help & support"
  },
  {
    title: "Time Off",
    url: createPageUrl("TimeOff"),
    icon: Clock,
    description: "Request time off"
  }
];

const adminItems = [
  {
    title: "Admin Dashboard",
    url: createPageUrl("AdminDashboard"),
    icon: Settings,
    description: "Management tools"
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (error) {
        console.log("User not authenticated");
      }
    };
    loadUser();
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-gray-100">
        <style>
          {`
            :root {
              --primary: #1e293b;
              --primary-foreground: #f8fafc;
              --accent: #f59e0b;
              --accent-foreground: #1e293b;
              --muted: #f1f5f9;
              --muted-foreground: #64748b;
              --border: #e2e8f0;
            }
          `}
        </style>
        
        <Sidebar className="border-r border-slate-200 bg-white/80 backdrop-blur-sm">
          <SidebarHeader className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg tracking-tight">CompanyHub</h2>
                <p className="text-xs text-slate-500 font-medium">Employee Portal</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`group relative hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 rounded-xl p-3 ${
                          location.pathname === item.url 
                            ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900 border border-amber-200' 
                            : 'text-slate-600'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3">
                          <item.icon className="w-5 h-5" />
                          <div className="flex-1">
                            <span className="font-medium">{item.title}</span>
                            <p className="text-xs text-slate-500 group-hover:text-slate-600 transition-colors">
                              {item.description}
                            </p>
                          </div>
                          {location.pathname === item.url && (
                            <ChevronRight className="w-4 h-4 text-amber-600" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {isAdmin && (
              <SidebarGroup className="mt-6">
                <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                  Administration
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {adminItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`group relative hover:bg-red-50 hover:text-red-900 transition-all duration-200 rounded-xl p-3 ${
                            location.pathname === item.url 
                              ? 'bg-gradient-to-r from-red-50 to-rose-50 text-red-900 border border-red-200' 
                              : 'text-slate-600'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3">
                            <item.icon className="w-5 h-5" />
                            <div className="flex-1">
                              <span className="font-medium">{item.title}</span>
                              <p className="text-xs text-slate-500 group-hover:text-red-600 transition-colors">
                                {item.description}
                              </p>
                            </div>
                            {location.pathname === item.url && (
                              <ChevronRight className="w-4 h-4 text-red-600" />
                            )}
                            <Badge variant="outline" className="text-xs bg-red-100 text-red-700 border-red-200">
                              Admin
                            </Badge>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 p-4">
            {user ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">
                    {user.full_name || 'User'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user.department || user.email}
                  </p>
                  {user.role === 'admin' && (
                    <Badge variant="outline" className="text-xs mt-1 bg-red-50 text-red-700 border-red-200">
                      Administrator
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center p-3">
                <p className="text-sm text-slate-500">Loading user...</p>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold text-slate-900">CompanyHub</h1>
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
