import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, Heart, Share2, Eye } from "lucide-react";
import { format } from "date-fns";

const platformIcons = {
  twitter: MessageSquare,
  telegram: Users,
  discord: MessageSquare,
  tiktok: Eye,
  opensea: Share2,
};

const platformColors = {
  twitter: "bg-blue-100 text-blue-800",
  telegram: "bg-sky-100 text-sky-800",
  discord: "bg-indigo-100 text-indigo-800",
  tiktok: "bg-pink-100 text-pink-800",
  opensea: "bg-purple-100 text-purple-800",
};

export default function SocialActivityFeed({ activities = [] }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-emerald-900 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-80 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm">Social media updates will appear here</p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const Icon = platformIcons[activity.platform] || MessageSquare;
            return (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-transparent hover:from-emerald-50 transition-all duration-300">
                <div className="p-2 rounded-lg bg-white shadow-sm">
                  <Icon className="w-4 h-4 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={platformColors[activity.platform]}>
                      {activity.platform}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {format(new Date(activity.timestamp || new Date()), 'MMM d, HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-800 font-medium mb-1">
                    {activity.title}
                  </p>
                  <p className="text-xs text-slate-600">
                    {activity.description}
                  </p>
                </div>
                {activity.value && (
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-600">
                      {activity.value}
                    </div>
                    {activity.change && (
                      <div className={`text-xs ${activity.change > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {activity.change > 0 ? '+' : ''}{activity.change}%
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}