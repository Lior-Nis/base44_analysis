
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { 
  Users, 
  PlusCircle, 
  Search, 
  Menu, 
  X, 
  Home,
  Tag,
  Settings,
  LogOut,
  User as UserIcon,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (error) {
        console.log("User not logged in");
      }
    };
    
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await User.logout();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-slate-200">
            <Link to={createPageUrl("Home")} className="flex items-center gap-2.5">
              <div className="bg-slate-800 p-2 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800 tracking-tight">CardConnect</span>
            </Link>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            <NavItem icon={<Home size={18} />} label="Home" page="Home" currentPageName={currentPageName} setSidebarOpen={setSidebarOpen} />
            <NavItem icon={<PlusCircle size={18} />} label="Add Contact" page="Scan" currentPageName={currentPageName} setSidebarOpen={setSidebarOpen} />
            <NavItem icon={<Search size={18} />} label="Search" page="Search" currentPageName={currentPageName} setSidebarOpen={setSidebarOpen} />
            <NavItem icon={<Tag size={18} />} label="Tags" page="Tags" currentPageName={currentPageName} setSidebarOpen={setSidebarOpen} />
          </nav>
          
          <div className="p-4 border-t border-slate-200">
            {user ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 px-2 py-2">
                  <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium shadow-sm ring-2 ring-white">
                    {user.full_name?.charAt(0) || user.email?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-800 truncate">{user.full_name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start gap-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => User.login()}
              >
                <UserIcon size={16} className="mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64 transition-all duration-300">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-lg border-b border-slate-200 lg:hidden">
          <div className="flex items-center justify-between px-4 py-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-slate-500 hover:bg-slate-100"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            
            <Link to={createPageUrl("Home")} className="flex items-center gap-2">
               <div className="bg-slate-800 p-1.5 rounded-md">
                <Users className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-800 tracking-tight">CardConnect</span>
            </Link>
            
            <div className="w-8"></div>
          </div>
        </header>

        {/* Main content area */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {/* Mobile bottom navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-lg border-t border-slate-200 py-1 lg:hidden z-30">
          <div className="flex justify-around">
            <MobileNavItem icon={<Home size={22} />} label="Home" page="Home" currentPageName={currentPageName} />
            <MobileNavItem icon={<PlusCircle size={22} />} label="Add" page="Scan" currentPageName={currentPageName} />
            <MobileNavItem icon={<Search size={22} />} label="Search" page="Search" currentPageName={currentPageName} />
            <MobileNavItem icon={<Tag size={22} />} label="Tags" page="Tags" currentPageName={currentPageName} />
          </div>
        </div>

        {/* Add extra padding at the bottom for mobile to account for the nav bar */}
        <div className="h-16 lg:hidden"></div>
      </div>
    </div>
  );
}

const NavItem = ({ icon, label, page, currentPageName, setSidebarOpen }) => (
  <Link 
    to={createPageUrl(page)} 
    className={cn(
      "flex items-center gap-3 px-3 py-2.5 text-slate-600 rounded-lg transition-colors text-sm font-medium",
      "hover:bg-slate-100 hover:text-slate-900",
      currentPageName === page && "bg-slate-100 text-slate-900"
    )}
    onClick={() => setSidebarOpen(false)}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

const MobileNavItem = ({ icon, label, page, currentPageName }) => (
  <Link 
    to={createPageUrl(page)}
    className={cn(
      "flex flex-col items-center p-2 text-xs w-16 rounded-md transition-colors",
      currentPageName === page ? "text-slate-800 bg-slate-100" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
    )}
  >
    {icon}
    <span className="mt-0.5">{label}</span>
  </Link>
)
