import React, { useState, useEffect } from "react";
import { SocialMetrics } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Users, 
  Heart, 
  Share2, 
  Eye,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from "lucide-react";

import MetricCard from "../components/dashboard/MetricCard";

export default function SocialPage() {
  const [metrics, setMetrics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadSocialMetrics();
  }, []);

  const loadSocialMetrics = async () => {
    setIsLoading(true);
    try {
      const data = await SocialMetrics.list('-created_date');
      setMetrics(data);
    } catch (error) {
      console.error('Error loading social metrics:', error);
      setMetrics(generateMockMetrics());
    }
    setIsLoading(false);
  };

  const generateMockMetrics = () => {
    return [
      { platform: 'twitter', metric_type: 'followers', value: 127, growth_rate: 8.3 },
      { platform: 'twitter', metric_type: 'engagement', value: 3.7, growth_rate: 12.1 },
      { platform: 'telegram', metric_type: 'followers', value: 2, growth_rate: 100 },
      { platform: 'discord', metric_type: 'followers', value: 23, growth_rate: 15.2 },
      { platform: 'tiktok', metric_type: 'views', value: 0, growth_rate: 0 },
      { platform: 'opensea', metric_type: 'views', value: 45, growth_rate: 22.5 }
    ];
  };

  const mockMetrics = generateMockMetrics();
  const displayMetrics = metrics.length > 0 ? metrics : mockMetrics;

  const platformData = {
    twitter: {
      name: 'Twitter/X',
      handle: '@MakutaZ',
      url: 'https://x.com/MakutaZ',
      icon: MessageSquare,
      color: 'blue',
      description: 'Main announcement channel for MAKUTA updates'
    },
    telegram: {
      name: 'Telegram',
      handle: 'MAKUTA_MKT',
      url: 'https://t.me/MAKUTA_MKT',
      icon: Users,
      color: 'sky',
      description: 'Community discussions and real-time updates'
    },
    discord: {
      name: 'Discord',
      handle: 'MAKUTA Server',
      url: 'https://discord.gg/3BT68Yj8',
      icon: MessageSquare,
      color: 'indigo',
      description: 'Community hub for deeper conversations'
    },
    tiktok: {
      name: 'TikTok',
      handle: 'Coming Soon',
      url: '#',
      icon: Eye,
      color: 'pink',
      description: 'Short-form content featuring NFT characters'
    },
    opensea: {
      name: 'OpenSea',
      handle: 'MAKUTA Collectibles',
      url: 'https://opensea.io/collection/makuta-collectibles',
      icon: Share2,
      color: 'purple',
      description: 'NFT marketplace for MAKUTA collection'
    }
  };

  const getMetricsByPlatform = (platform) => {
    return displayMetrics.filter(m => m.platform === platform);
  };

  const getTotalFollowers = () => {
    return displayMetrics
      .filter(m => m.metric_type === 'followers')
      .reduce((sum, m) => sum + m.value, 0);
  };

  const getAverageEngagement = () => {
    const engagementMetrics = displayMetrics.filter(m => m.metric_type === 'engagement');
    if (engagementMetrics.length === 0) return 0;
    return engagementMetrics.reduce((sum, m) => sum + m.value, 0) / engagementMetrics.length;
  };

  const getTotalViews = () => {
    return displayMetrics
      .filter(m => m.metric_type === 'views')
      .reduce((sum, m) => sum + m.value, 0);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">
            Social Media Analytics
          </h1>
          <p className="text-emerald-600 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Track #CryptoCongo community growth and engagement
          </p>
        </div>
        <Button 
          onClick={loadSocialMetrics}
          disabled={isLoading}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Followers"
          value={getTotalFollowers().toString()}
          change={15.2}
          icon={Users}
          colorScheme="emerald"
          loading={isLoading}
        />
        <MetricCard
          title="Avg Engagement"
          value={getAverageEngagement().toFixed(1)}
          suffix="%"
          change={8.7}
          icon={Heart}
          colorScheme="blue"
          loading={isLoading}
        />
        <MetricCard
          title="Total Views"
          value={getTotalViews().toString()}
          change={22.5}
          icon={Eye}
          colorScheme="purple"
          loading={isLoading}
        />
        <MetricCard
          title="Active Platforms"
          value="4"
          icon={MessageSquare}
          colorScheme="yellow"
          loading={isLoading}
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.keys(platformData).map((key) => {
          const platform = platformData[key];
          const metricsForPlatform = getMetricsByPlatform(key);
          const followerMetric = metricsForPlatform.find(m => m.metric_type === 'followers');
          const engagementMetric = metricsForPlatform.find(m => m.metric_type === 'engagement');
          const viewsMetric = metricsForPlatform.find(m => m.metric_type === 'views');
          
          return (
            <Card key={key} className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gray-100">
                      <platform.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-900">{platform.name}</CardTitle>
                      <p className="text-sm text-slate-600">{platform.handle}</p>
                    </div>
                  </div>
                  {platform.url !== '#' && (
                    <a
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">{platform.description}</p>
                <div className="space-y-3">
                  {followerMetric && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Followers</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{followerMetric.value}</span>
                        {followerMetric.growth_rate !== undefined && (
                          <div className={`flex items-center text-xs ${
                            followerMetric.growth_rate >= 0 ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {followerMetric.growth_rate >= 0 ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            {Math.abs(followerMetric.growth_rate).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {engagementMetric && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Engagement</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{engagementMetric.value}%</span>
                        {engagementMetric.growth_rate !== undefined && (
                          <div className={`flex items-center text-xs ${
                            engagementMetric.growth_rate >= 0 ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {engagementMetric.growth_rate >= 0 ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            {Math.abs(engagementMetric.growth_rate).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {viewsMetric && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Views</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{viewsMetric.value}</span>
                        {viewsMetric.growth_rate !== undefined && (
                          <div className={`flex items-center text-xs ${
                            viewsMetric.growth_rate >= 0 ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {viewsMetric.growth_rate >= 0 ? (
                              <TrendingUp className="w-3 h-3 mr-1" />
                            ) : (
                              <TrendingDown className="w-3 h-3 mr-1" />
                            )}
                            {Math.abs(viewsMetric.growth_rate).toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}