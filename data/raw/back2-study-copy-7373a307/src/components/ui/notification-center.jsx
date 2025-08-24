import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

const translations = {
  he: {
    notifications: "התראות",
    noNotifications: "אין התראות חדשות",
    markAllRead: "סמן הכל כנקרא"
  },
  en: {
    notifications: "Notifications",
    noNotifications: "No new notifications",
    markAllRead: "Mark all as read"
  }
};

const NotificationCenter = ({ language = 'en' }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const t = translations[language];

  useEffect(() => {
    // Load notifications from localStorage or API
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    try {
      const savedNotifications = localStorage.getItem('back2study_notifications') || '[]';
      const parsedNotifications = JSON.parse(savedNotifications);
      setNotifications(parsedNotifications);
      setUnreadCount(parsedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
    localStorage.setItem('back2study_notifications', JSON.stringify(updatedNotifications));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-10 w-10 p-0 hover:bg-gray-700/60 border border-gray-600/30 text-gray-300 hover:text-white"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1"
            >
              <Badge variant="destructive" className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            </motion.div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 p-0 bg-gray-800/95 backdrop-blur-xl border-gray-600/50 shadow-xl"
      >
        <div className="p-4 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-100">{t.notifications}</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs text-blue-400 hover:text-blue-300 hover:bg-gray-700/50"
              >
                {t.markAllRead}
              </Button>
            )}
          </div>
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t.noNotifications}</p>
            </div>
          ) : (
            notifications.slice(0, 5).map((notification, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-3 border-b border-gray-700/30 last:border-b-0 hover:bg-gray-700/30 transition-colors ${
                  !notification.read ? 'bg-blue-900/20' : ''
                }`}
              >
                <p className="text-sm font-medium text-gray-100">{notification.title}</p>
                <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
              </motion.div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationCenter;