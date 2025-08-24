
import React, { useState, useEffect } from "react";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User, Notification } from "@/api/entities";
import { useLocalization } from "@/components/common/Localization";

export default function AppHeader() {
  const { t } = useLocalization();
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      loadNotifications(user);
    } catch (error) {
      console.error("User not logged in");
    }
  };

  const loadNotifications = async (user) => {
    if (!user) return;
    try {
      const notifications = await Notification.filter(
        { recipient_email: user.email, is_read: false },
        "-created_date",
        10
      );
      setUnreadCount(notifications.length);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };
  
  useEffect(() => {
      if(currentUser) {
          loadNotifications(currentUser);
      }
  }, [currentUser])

  const handleMenuClick = () => {
    document.getElementById('menu-trigger')?.click();
  };

  return (
    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white sticky top-0 z-50 shadow-lg">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('appName')}</h1>
          <div className="flex items-center gap-3">
            <Link to={createPageUrl("Notifications")}>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 relative">
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-5 h-5 flex items-center justify-center p-0">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20"
              onClick={handleMenuClick}
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
