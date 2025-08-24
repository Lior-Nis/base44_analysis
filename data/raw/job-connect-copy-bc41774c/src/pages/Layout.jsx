

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Search, Plus, MessageCircle, User, Settings, LogOut, Bell, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserEntity } from "@/api/entities";
import { useLocalization } from "@/components/common/Localization";

export default function Layout({ children, currentPageName }) {
  const { t, setLanguage, language } = useLocalization();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  const navigationItems = [
    { name: t('navHome'), url: createPageUrl("Home"), icon: Home },
    { name: t('navExplore'), url: createPageUrl("Search"), icon: Search },
    { name: t('navPost'), url: createPageUrl("CreatePost"), icon: Plus },
    { name: t('navMessages'), url: createPageUrl("Messages"), icon: MessageCircle },
    { name: t('navProfile'), url: createPageUrl("Profile"), icon: User },
  ];

  React.useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const user = await UserEntity.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("User not logged in");
    }
  };

  const handleLogout = async () => {
    try {
      await UserEntity.logout();
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style>
        {`
          :root {
            --primary-orange: #f97316;
            --primary-orange-dark: #ea580c;
            --orange-light: #fed7aa;
            --text-primary: #1f2937;
            --text-secondary: #6b7280;
            --border-light: #e5e7eb;
            --bg-card: #ffffff;
          }
        `}
      </style>

      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 shadow-lg">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              to={item.url}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 ${
                location.pathname === item.url 
                  ? 'text-orange-500 bg-orange-50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Menu Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="fixed top-4 right-16 z-40 text-white hover:bg-white/20"
            style={{ display: 'none' }}
            id="menu-trigger"
          >
            <Settings className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80">
          <div className="flex flex-col h-full">
            <div className="border-b pb-4 mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={currentUser?.avatar_url} />
                  <AvatarFallback className="bg-orange-100 text-orange-600">
                    {currentUser?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{currentUser?.full_name || 'User'}</h3>
                  <p className="text-sm text-gray-500">{currentUser?.email}</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 space-y-2">
              <Link 
                to={createPageUrl("Profile")}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <User className="w-5 h-5" />
                <span>{t('myProfile')}</span>
              </Link>
              
              <Link 
                to={createPageUrl("Notifications")}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span>{t('notifications')}</span>
              </Link>
              
              <div className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                  <Globe className="w-5 h-5" />
                  <button onClick={() => setLanguage('en')} className={`font-medium ${language === 'en' ? 'text-orange-600' : ''}`}>English</button>
                  <span className="text-gray-300">/</span>
                  <button onClick={() => setLanguage('hi')} className={`font-medium ${language === 'hi' ? 'text-orange-600' : ''}`}>हिन्दी</button>
              </div>

              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors w-full text-left text-red-600"
              >
                <LogOut className="w-5 h-5" />
                <span>{t('logout')}</span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

