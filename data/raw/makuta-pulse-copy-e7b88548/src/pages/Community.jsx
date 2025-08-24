
import React, { useState, useEffect } from "react";
import { SocialMetrics } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  MessageSquare, 
  TrendingUp,
  Target,
  Award,
  Calendar,
  ExternalLink,
  RefreshCw
} from "lucide-react";

import MetricCard from "../components/dashboard/MetricCard";

const platformInfo = {
  discord: { name: 'Discord', color: 'indigo' },
  twitter: { name: 'Twitter/X', color: 'blue' },
  telegram: { name: 'Telegram', color: 'sky' },
  opensea: { name: 'OpenSea', color: 'purple' }
};


export default function CommunityPage() {
  const [metrics, setMetrics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    setIsLoading(true);
    try {
      const data = await SocialMetrics.list('-created_date');
      setMetrics(data);
    } catch (error) {
      console.error('Error loading community data:', error);
    }
    setIsLoading(false);
  };
  
  const followerMetrics = metrics.filter(m => m.metric_type === 'followers');
  const engagementMetrics = metrics.filter(m => m.metric_type === 'engagement');

  const totalMembers = followerMetrics.reduce((sum, m) => sum + m.value, 0);
  const engagementRate = engagementMetrics.length > 0 
    ? engagementMetrics.reduce((sum, m) => sum + m.value, 0) / engagementMetrics.length 
    : 0;

  // These values are kept static as they can't be derived from the current data schema.
  const activeMembers = 47; 
  const monthlyGrowth = 23.5;
  const nftHolders = 3;

  const communityMilestones = [
    { target: 50, label: "Early Adopters", reached: totalMembers >= 50, current: totalMembers },
    { target: 100, label: "Community Builders", reached: totalMembers >= 100, current: totalMembers },
    { target: 500, label: "MAKUTA Ambassadors", reached: totalMembers >= 500, current: totalMembers },
    { target: 1000, label: "#CryptoCongo Leaders", reached: totalMembers >= 1000, current: totalMembers },
  ];

  const recentActivities = [
    {
      type: 'new_member',
      platform: 'Telegram',
      description: '2 new members joined MAKUTA channel',
      timestamp: '2 hours ago',
      impact: '+2 members'
    },
    {
      type: 'engagement',
      platform: 'Discord',
      description: 'Active discussion about NFT roadmap',
      timestamp: '5 hours ago',
      impact: '8 messages'
    },
    {
      type: 'milestone',
      platform: 'Twitter',
      description: 'Reached 100+ profile views this week',
      timestamp: '1 day ago',
      impact: '+15% visibility'
    },
    {
      type: 'content',
      platform: 'TikTok',
      description: 'Planning NFT character roasting video',
      timestamp: '2 days ago',
      impact: 'Content strategy'
    }
  ];
  
  const platformBreakdown = Object.keys(platformInfo).map(key => {
    const platformFollowers = followerMetrics
      .filter(m => m.platform === key)
      .reduce((sum, m) => sum + m.value, 0);
    return {
      name: platformInfo[key].name,
      members: platformFollowers,
      percentage: totalMembers > 0 ? (platformFollowers / totalMembers) * 100 : 0,
      color: platformInfo[key].color
    };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">
            Community Analytics
          </h1>
          <p className="text-emerald-600 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Build and track the #CryptoCongo community growth
          </p>
        </div>
        <Button 
          onClick={loadCommunityData}
          disabled={isLoading}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Community Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Members"
          value={totalMembers}
          change={monthlyGrowth}
          icon={Users}
          colorScheme="emerald"
          loading={isLoading}
        />
        <MetricCard
          title="Active Members"
          value={activeMembers}
          change={8.3}
          icon={MessageSquare}
          colorScheme="blue"
          loading={isLoading}
        />
        <MetricCard
          title="Engagement Rate"
          value={engagementRate.toFixed(1)}
          suffix="%"
          change={12.1}
          icon={TrendingUp}
          colorScheme="purple"
          loading={isLoading}
        />
        <MetricCard
          title="NFT Holders"
          value={nftHolders}
          icon={Award}
          colorScheme="yellow"
          loading={isLoading}
        />
      </div>

      {/* Milestones and Platform Breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Community Milestones */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-emerald-900 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Community Milestones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {communityMilestones.map((milestone, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-900">{milestone.label}</span>
                  <Badge className={
                    milestone.reached 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-slate-100 text-slate-800'
                  }>
                    {milestone.current >= milestone.target ? 'Reached!' : `${milestone.current}/${milestone.target}`}
                  </Badge>
                </div>
                <Progress 
                  value={(milestone.current / milestone.target) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-slate-600">
                  {milestone.current < milestone.target 
                    ? `${milestone.target - milestone.current} members to go`
                    : `Goal of ${milestone.target} achieved!`}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Platform Breakdown */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-emerald-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Platform Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {platformBreakdown.map((platform, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-900">{platform.name}</span>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">{platform.members}</span>
                    <span className="text-sm text-slate-600 ml-2">
                      ({platform.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <Progress 
                  value={platform.percentage} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Community Activity */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-emerald-900 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recent Community Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-r from-slate-50 to-transparent hover:from-emerald-50 transition-all duration-300">
                <div className="p-2 rounded-lg bg-white shadow-sm">
                  {activity.type === 'new_member' && <Users className="w-4 h-4 text-emerald-600" />}
                  {activity.type === 'engagement' && <MessageSquare className="w-4 h-4 text-blue-600" />}
                  {activity.type === 'milestone' && <Award className="w-4 h-4 text-purple-600" />}
                  {activity.type === 'content' && <TrendingUp className="w-4 h-4 text-yellow-600" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-slate-100 text-slate-800">
                      {activity.platform}
                    </Badge>
                    <span className="text-xs text-slate-500">{activity.timestamp}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 mb-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-emerald-600 font-medium">
                    {activity.impact}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Community Links */}
      <Card className="bg-gradient-to-br from-emerald-50 to-yellow-50 border-emerald-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-emerald-900 flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Join the MAKUTA Community
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="https://discord.gg/3BT68Yj8"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
            >
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="font-medium text-slate-900">Discord</p>
                <p className="text-xs text-slate-600">Join discussions</p>
              </div>
            </a>
            <a
              href="https://t.me/MAKUTA_MKT"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
            >
              <Users className="w-5 h-5 text-sky-600" />
              <div>
                <p className="font-medium text-slate-900">Telegram</p>
                <p className="text-xs text-slate-600">Get updates</p>
              </div>
            </a>
            <a
              href="https://x.com/MakutaZ"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
            >
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-slate-900">Twitter/X</p>
                <p className="text-xs text-slate-600">Follow news</p>
              </div>
            </a>
            <a
              href="https://opensea.io/collection/makuta-collectibles"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
            >
              <Award className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-slate-900">OpenSea</p>
                <p className="text-xs text-slate-600">View NFTs</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
