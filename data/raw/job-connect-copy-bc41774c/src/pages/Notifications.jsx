
import React, { useState, useEffect } from "react";
import { Bell, Check, Trash2, MessageCircle, Briefcase, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Notification, User as UserEntity } from "@/api/entities";
import { formatDistanceToNow } from "date-fns";
import AppHeader from "../components/common/AppHeader";
import LoginScreen from "../components/auth/LoginScreen";
import { useLocalization } from "@/components/common/Localization";

export default function Notifications() {
  const { t } = useLocalization();
  const [notifications, setNotifications] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Mock data for demonstration purposes
  useEffect(() => {
    // In a real application, you'd fetch this from an API
    setCurrentUser({ id: 'user123', name: 'John Doe' });

    setNotifications([
      {
        id: '1',
        title: 'New job application',
        message: 'You received a new application for the "Senior React Developer" position.',
        type: 'job',
        icon: Briefcase,
        is_read: false,
        created_at: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      },
      {
        id: '2',
        title: 'Interview scheduled',
        message: 'Your interview with Alice Smith for "Product Manager" is scheduled for tomorrow at 10 AM.',
        type: 'event',
        icon: MessageCircle,
        is_read: false,
        created_at: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
      {
        id: '3',
        title: 'Profile update required',
        message: 'Your profile is 70% complete. Add more details to get better job matches!',
        type: 'alert',
        icon: AlertCircle,
        is_read: true,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        id: '4',
        title: 'New follower',
        message: 'John Doe started following your profile.',
        type: 'social',
        icon: User,
        is_read: true,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
    ]);
  }, []);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, is_read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  if (!currentUser) {
    return <LoginScreen />; // Or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title={t('notifications')} />

      <div className="p-4 pb-24">
        {/* Header Actions */}
        {notifications.length > 0 && (
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('unread', { count: notifications.filter(n => !n.is_read).length })}
            </h2>
            <Button
              onClick={markAllAsRead}
              variant="outline"
              className="border-orange-500 text-orange-500 hover:bg-orange-50"
            >
              <Check className="w-4 h-4 mr-2" />
              {t('markAllRead')}
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`relative shadow-sm transition-all duration-200 ${
                  !notification.is_read ? "border-orange-200 bg-orange-50" : "border-gray-200 bg-white"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 p-2 rounded-full bg-orange-100 text-orange-600">
                      {notification.icon && <notification.icon className="w-5 h-5" />}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {!notification.is_read && (
                            <Badge className="bg-orange-500 text-white text-xs px-2 py-1">
                              {t('new')}
                            </Badge>
                          )}
                          <Button
                            onClick={() => deleteNotification(notification.id)}
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-red-500 p-0 h-auto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>
                          {formatDistanceToNow(notification.created_at, { addSuffix: true })}
                        </span>
                        {!notification.is_read && (
                          <Button
                            onClick={() => markAsRead(notification.id)}
                            variant="ghost"
                            size="sm"
                            className="text-orange-600 hover:text-orange-700 h-6 px-2 text-xs"
                          >
                            {t('markRead')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noNotifications')}</h3>
              <p className="text-gray-500">
                {t('notificationsHint')}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
