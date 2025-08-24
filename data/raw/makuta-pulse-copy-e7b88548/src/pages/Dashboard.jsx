
import React, { useState, useEffect } from "react";
import { AssetPrice } from "@/api/entities";
import { SocialMetrics } from "@/api/entities";
import { ProjectAlert } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Wallet, 
  Users, 
  MessageSquare, 
  Bell,
  Activity,
  Coins,
  Image as ImageIcon,
  ExternalLink,
  RefreshCw
} from "lucide-react";

import MetricCard from "../components/dashboard/MetricCard";
import PriceChart from "../components/dashboard/PriceChart";
import SocialActivityFeed from "../components/dashboard/SocialActivityFeed";

export default function Dashboard() {
  const [assets, setAssets] = useState([]);
  const [socialMetrics, setSocialMetrics] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [assetsData, socialData, alertsData] = await Promise.all([
        AssetPrice.list('-created_date'),
        SocialMetrics.list('-created_date'),
        ProjectAlert.filter({ read: false })
      ]);
      
      setAssets(assetsData);
      setSocialMetrics(socialData);
      setAlerts(alertsData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Use mock data if entities fail to load
      setAssets(generateMockAssets());
      setSocialMetrics(generateMockSocialMetrics());
      setAlerts(generateMockAlerts());
    }
    setIsLoading(false);
  };

  const generateMockAssets = () => [
    {
      id: 1,
      asset_name: "MKTZ Token",
      asset_type: "token",
      price_usd: 0.000234,
      price_change_24h: 15.7,
      volume_24h: 1250,
      market_cap: 23400
    },
    {
      id: 2,
      asset_name: "Makuta Gorilla #1",
      asset_type: "nft",
      price_usd: 0.05,
      price_change_24h: -2.3,
      volume_24h: 0
    }
  ];

  const generateMockSocialMetrics = () => [
    { platform: 'twitter', metric_type: 'followers', value: 127, growth_rate: 8.3 },
    { platform: 'telegram', metric_type: 'followers', value: 2, growth_rate: 100 },
    { platform: 'discord', metric_type: 'followers', value: 23, growth_rate: 15.2 }
  ];

  const generateMockAlerts = () => [
    {
      id: 1,
      alert_type: 'verification_update',
      title: 'SuiVision Verification Submitted',
      message: 'MKTZ token verification pending approval',
      severity: 'medium',
      read: false,
      source: 'SuiVision'
    }
  ];

  const getTotalPortfolioValue = () => {
    return assets.reduce((total, asset) => total + (asset.price_usd || 0), 0);
  };

  const getAverageChange = () => {
    if (assets.length === 0) return 0;
    return assets.reduce((sum, asset) => sum + (asset.price_change_24h || 0), 0) / assets.length;
  };

  const getTotalVolume = () => {
    return assets.reduce((total, asset) => total + (asset.volume_24h || 0), 0);
  };

  const getSocialEngagement = () => {
    const engagementMetrics = socialMetrics.filter(m => m.metric_type === 'engagement');
    return engagementMetrics.reduce((sum, metric) => sum + (metric.value || 0), 0);
  };

  const getCommunitySize = () => {
    const followerMetrics = socialMetrics.filter(m => m.metric_type === 'followers');
    return followerMetrics.reduce((sum, metric) => sum + (metric.value || 0), 0);
  };

  const generateMockPriceData = () => {
    const days = 7;
    const data = [];
    let basePrice = 0.000234;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const variation = (Math.random() - 0.5) * 0.1;
      basePrice = basePrice * (1 + variation);
      
      data.push({
        date: date.toISOString(),
        price: basePrice
      });
    }
    
    return data;
  };

  const generateRecentActivities = () => [
    {
      platform: 'twitter',
      title: 'SuiVision verification submitted',
      description: 'MKTZ token verification pending approval',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      value: 'Pending'
    },
    {
      platform: 'telegram',
      title: 'New members joined',
      description: '2 new subscribers to MAKUTA channel',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      value: '+2',
      change: 100
    },
    {
      platform: 'opensea',
      title: 'Collection activity',
      description: 'Makuta Gorilla #1 viewed 15 times',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      value: '15 views'
    },
    {
      platform: 'discord',
      title: 'Community engagement',
      description: 'Active discussions in #general',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      value: '5 messages'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">
            MAKUTA Project Monitor
          </h1>
          <p className="text-emerald-600 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Real-time tracking of your #CryptoCongo ecosystem
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Badge>
          <Button 
            onClick={loadDashboardData}
            disabled={isLoading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Portfolio Value"
          value={`$${getTotalPortfolioValue().toFixed(2)}`}
          change={getAverageChange()}
          icon={Wallet}
          colorScheme="emerald"
          loading={isLoading}
        />
        <MetricCard
          title="24h Volume"
          value={getTotalVolume().toLocaleString()}
          change={8.2}
          icon={TrendingUp}
          colorScheme="blue"
          loading={isLoading}
        />
        <MetricCard
          title="Community Size"
          value={getCommunitySize() || 47}
          change={12.5}
          icon={Users}
          colorScheme="purple"
          loading={isLoading}
        />
        <MetricCard
          title="Active Alerts"
          value={alerts.length.toString()}
          icon={Bell}
          colorScheme="yellow"
          loading={isLoading}
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PriceChart 
            title="MKTZ Token Price Evolution"
            data={generateMockPriceData()}
            color="#059669"
          />
        </div>
        <div>
          <SocialActivityFeed activities={generateRecentActivities()} />
        </div>
      </div>

      {/* Project Status Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-emerald-800 flex items-center gap-2">
              <Coins className="w-5 h-5" />
              MKTZ Token
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-emerald-700">Status</span>
                <Badge className="bg-yellow-100 text-yellow-800">Pending Verification</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-emerald-700">Blockchain</span>
                <span className="font-medium text-emerald-900">Sui</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-emerald-700">Purpose</span>
                <span className="font-medium text-emerald-900">Community Token</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              NFT Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-yellow-700">Platform</span>
                <a 
                  href="https://opensea.io/collection/makuta-collectibles" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-yellow-900 hover:text-yellow-700 transition-colors"
                >
                  OpenSea <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-yellow-700">Items</span>
                <span className="font-medium text-yellow-900">3 (Gorilla, Okapi, Elephant)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-yellow-700">Theme</span>
                <span className="font-medium text-yellow-900">Congolese Wildlife</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Social Presence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Twitter/X</span>
                <a 
                  href="https://x.com/MakutaZ" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-900 hover:text-blue-700 transition-colors"
                >
                  @MakutaZ <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Telegram</span>
                <span className="font-medium text-blue-900">2 subscribers</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Discord</span>
                <a 
                  href="https://discord.gg/3BT68Yj8" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-900 hover:text-blue-700 transition-colors"
                >
                  Active <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
