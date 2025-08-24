
import React, { useState, useEffect } from "react";
import { ProjectAlert } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  TrendingUp, 
  MessageSquare, 
  Users,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await ProjectAlert.list('-created_date');
      setAlerts(data);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
    setIsLoading(false);
  };

  const markAsRead = async (alertId) => {
    try {
      await ProjectAlert.update(alertId, { read: true });
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, read: true } : alert
      ));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const generateMockAlerts = () => [
    {
      id: 1,
      alert_type: 'verification_update',
      title: 'SuiVision Verification Submitted',
      message: 'MKTZ token verification has been submitted to SuiVision. Approval typically takes 2-5 business days.',
      severity: 'medium',
      read: false,
      source: 'SuiVision',
      created_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      alert_type: 'community_milestone',
      title: 'New Telegram Subscribers',
      message: '2 new members joined the MAKUTA Telegram channel. Community growing steadily!',
      severity: 'low',
      read: false,
      source: 'Telegram',
      created_date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      alert_type: 'social_mention',
      title: 'TikTok Content Planning',
      message: 'NFT character roasting video scheduled for production. Expected to boost engagement.',
      severity: 'medium',
      read: true,
      source: 'Content Strategy',
      created_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 4,
      alert_type: 'price_spike',
      title: 'Makuta Collectibles Views Increased',
      message: 'Makuta Collectibles on OpenSea received 45 views this week, up 22.5% from last week.',
      severity: 'low',
      read: true,
      source: 'OpenSea',
      created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const mockAlerts = generateMockAlerts();
  const displayAlerts = alerts.length > 0 ? alerts : mockAlerts;

  const filteredAlerts = filter === 'all' 
    ? displayAlerts 
    : filter === 'unread' 
    ? displayAlerts.filter(alert => !alert.read)
    : displayAlerts.filter(alert => alert.severity === filter);

  const getAlertIcon = (type, severity) => {
    switch (type) {
      case 'price_spike':
      case 'volume_surge':
        return TrendingUp;
      case 'social_mention':
        return MessageSquare;
      case 'community_milestone':
        return Users;
      case 'verification_update':
        return CheckCircle;
      default:
        return severity === 'high' || severity === 'critical' ? AlertTriangle : Info;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'price_spike':
      case 'volume_surge':
        return 'text-emerald-600 bg-emerald-50';
      case 'social_mention':
        return 'text-blue-600 bg-blue-50';
      case 'community_milestone':
        return 'text-purple-600 bg-purple-50';
      case 'verification_update':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const unreadCount = displayAlerts.filter(alert => !alert.read).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900 mb-2 flex items-center gap-3">
            <Bell className="w-8 h-8" />
            Project Alerts
            {unreadCount > 0 && (
              <Badge className="bg-red-100 text-red-800">
                {unreadCount} new
              </Badge>
            )}
          </h1>
          <p className="text-emerald-600 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Stay updated on MAKUTA project developments
          </p>
        </div>
        <Button 
          onClick={loadAlerts}
          disabled={isLoading}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {['all', 'unread', 'critical', 'high', 'medium', 'low'].map((filterOption) => (
          <Button
            key={filterOption}
            variant={filter === filterOption ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(filterOption)}
            className={filter === filterOption ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            {filterOption === 'unread' && unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="py-12 text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-600 mb-2">No alerts found</p>
              <p className="text-sm text-slate-500">
                {filter === 'all' 
                  ? 'All alerts will appear here when they occur'
                  : `No ${filter} alerts at the moment`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => {
            const AlertIcon = getAlertIcon(alert.alert_type, alert.severity);
            
            return (
              <Card 
                key={alert.id} 
                className={`bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 ${
                  !alert.read ? 'ring-2 ring-emerald-200' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(alert.alert_type)}`}>
                        <AlertIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-slate-900 flex items-center gap-2">
                          {alert.title}
                          {!alert.read && (
                            <Badge className="bg-emerald-100 text-emerald-800">
                              New
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {alert.source}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {format(new Date(alert.created_date), 'MMM d, HH:mm')}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!alert.read && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead(alert.id)}
                        className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Read
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700">{alert.message}</p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
