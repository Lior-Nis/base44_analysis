

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Building2,
  Calendar,
  MapPin,
  User,
  LayoutDashboard,
  Settings,
  ChevronDown,
  Bell,
  LogOut,
  Users as UsersIcon, // Renamed to avoid conflict
  Layers, // Added Layers icon for Floor Management
  Briefcase, // Added Briefcase icon for Workspace Management
  ClipboardList, // Added for Daily Roster
  AlertTriangle, // Added for Conflicts
  UserCheck,
  X,
  CalendarX // Add CalendarX icon for Out of Office
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User as UserEntity } from "@/api/entities";
import { useCurrentUser } from "@/components/useCurrentUser";
import { DataProvider } from "@/components/DataProvider"; // Added import

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
    description: "Overview & analytics"
  },
  {
    title: "Book Workspace",
    url: createPageUrl("Bookings"),
    icon: Calendar,
    description: "Reserve your space"
  },
  {
    title: "Daily Roster",
    url: createPageUrl("DailyRoster"),
    icon: ClipboardList,
    description: "Auto-seating plan"
  },
  {
    title: "Out of Office",
    url: createPageUrl("OutOfOffice"),
    icon: CalendarX,
    description: "Manage absences",
    adminOnly: true
  },
  {
    title: "Conflicts",
    url: createPageUrl("Conflicts"),
    icon: AlertTriangle,
    description: "Resolve seating conflicts",
    adminOnly: true
  },
  {
    title: "Office Locations",
    url: createPageUrl("Locations"),
    icon: Building2,
    description: "Manage locations",
    adminOnly: true
  },
  {
    title: "Manage Floors",
    url: createPageUrl("Floors"),
    icon: Layers,
    description: "Organize floors",
    adminOnly: true
  },
  {
    title: "Manage Zones",
    url: createPageUrl("Zones"),
    icon: UsersIcon,
    description: "Organize workspaces",
    adminOnly: true
  },
  {
    title: "Manage Workspaces",
    url: createPageUrl("Workspaces"),
    icon: Briefcase,
    description: "Configure individual desks",
    adminOnly: true
  },
  {
    title: "Manage Employees",
    url: createPageUrl("Employees"),
    icon: UsersIcon,
    description: "Schedules & assignments",
    adminOnly: true
  },
  {
    title: "Floor Plans",
    url: createPageUrl("FloorPlans"),
    icon: MapPin,
    description: "View layouts"
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const { user, isImpersonating, impersonatedEmployee, realUser, loading } = useCurrentUser();

  const handleLogout = async () => {
    await UserEntity.logout();
    window.location.reload();
  };

  const handleExitImpersonation = () => {
    sessionStorage.removeItem('impersonatedEmployeeId');
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentPage = navigationItems.find(item => item.url === location.pathname);

  return (
    <SidebarProvider>
      <style>
        {`
          :root {
            --primary: 29 78 216; /* blue-600 */
            --primary-foreground: 255 255 255;
            --secondary: 241 245 249; /* slate-100 */
            --secondary-foreground: 15 23 42; /* slate-900 */
            --accent: 5 150 105; /* green-600 */
            --accent-foreground: 255 255 255;
            --muted: 241 245 249; /* slate-100 */
            --muted-foreground: 71 85 105; /* slate-500 */
            --border: 226 232 240; /* slate-200 */
            --input: 255 255 255;
            --ring: 29 78 216; /* blue-600 */
            --background: 248 250 252; /* slate-50 */
            --foreground: 15 23 42; /* slate-900 */
            --destructive: 220 38 38; /* red-600 */
            --destructive-foreground: 255 255 255;
            --success: 22 163 74; /* green-600 */
            --success-foreground: 255 255 255;
            --warning: 29 78 216; /* Replaced orange with blue */
            --warning-foreground: 255 255 255;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacMacSystemFont, 'Segoe UI', sans-serif;
          }
          
          .gradient-bg {
            background-color: var(--background);
          }
          
          .card-hover {
            transition: none;
          }
          
          .card-hover:hover {
            transform: none;
            box-shadow: none;
          }

          .business-primary {
            background-color: rgb(var(--primary));
          }

          .business-secondary {
            background-color: rgb(var(--secondary));
          }

          .business-accent {
            background-color: rgb(var(--accent));
          }

          .business-success {
            background-color: rgb(var(--success));
          }

          .business-warning {
            background-color: rgb(var(--warning));
          }

          .business-danger {
            background-color: rgb(var(--destructive));
          }
        `}
      </style>
      
      <div className="min-h-screen flex w-full gradient-bg">
        <Sidebar className="border-r border-slate-200 bg-white/95 backdrop-blur-sm">
          <SidebarHeader className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 business-primary rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">SpaceFlow</h2>
                <p className="text-xs text-slate-600 font-medium">Office Management</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems
                    .filter(item => !item.adminOnly || realUser?.role === 'admin')
                    .map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`group rounded-xl p-3 ${
                          location.pathname === item.url 
                            ? 'bg-blue-600 text-white shadow-lg' 
                            : 'text-slate-700'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3">
                          <item.icon className={`w-5 h-5 ${
                            location.pathname === item.url ? 'text-white' : 'text-slate-500'
                          }`} />
                          <div className="flex-1">
                            <span className="font-medium text-sm">{item.title}</span>
                            <p className={`text-xs ${
                              location.pathname === item.url 
                                ? 'text-blue-100' 
                                : 'text-slate-400'
                            }`}>
                              {item.description}
                            </p>
                            {/* Admin badge for active admin-only pages */}
                            {location.pathname === item.url && item.adminOnly && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 mt-1">
                                Admin
                              </Badge>
                            )}
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {realUser?.role === 'admin' && !isImpersonating && (
              <SidebarGroup className="mt-8">
                <SidebarGroupLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2">
                  Admin Tools
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="px-3 py-2 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                        Admin
                      </Badge>
                    </div>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-auto p-3 rounded-xl"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-9 h-9 business-accent rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-white font-semibold text-sm">
                        {user?.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium text-slate-900 text-sm truncate">
                        {user?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {user?.department || 'Employee'}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => window.location.href = createPageUrl("Profile")}>
                  <User className="w-4 h-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={isImpersonating ? handleExitImpersonation : handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  {isImpersonating ? "Exit View" : "Sign Out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          {isImpersonating && (
            <div className="bg-blue-500 text-white px-4 py-2 flex items-center justify-center text-sm font-medium gap-4 sticky top-0 z-20">
              <UserCheck className="w-5 h-5" />
              <span>Viewing as <strong>{impersonatedEmployee?.full_name}</strong>.</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleExitImpersonation} 
                className="h-auto py-1 px-2 text-white border-white border"
              >
                Exit View
                <X className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
          <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 sm:px-6 py-4 md:hidden sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="p-2 rounded-lg" />
              <h1 className="text-lg font-bold text-slate-900 truncate">{currentPage?.title || 'SpaceFlow'}</h1>
              {/* Conditional Default badge, assumes 'location' could have 'is_default' property from context */}
              {location.is_default && ( 
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 ml-2">
                  Default
                </Badge>
              )}
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            <DataProvider>
              {children}
            </DataProvider>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

