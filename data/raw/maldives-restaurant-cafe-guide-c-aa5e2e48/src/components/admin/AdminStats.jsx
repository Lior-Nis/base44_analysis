import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils, MapPin, LayoutTemplate, Newspaper, Users, Package } from 'lucide-react';

export default function AdminStats({ restaurants, locations, advertisements, blogPosts, polls, sellers }) {
  const stats = [
    { title: "Total Restaurants", value: restaurants.length, icon: <Utensils className="w-5 h-5 text-blue-500" /> },
    { title: "Pending Restaurants", value: restaurants.filter(r => r.status === 'pending').length, icon: <Utensils className="w-5 h-5 text-orange-500" /> },
    { title: "Total Sellers", value: sellers.length, icon: <Package className="w-5 h-5 text-green-500" /> },
    { title: "Pending Sellers", value: sellers.filter(s => s.status === 'pending').length, icon: <Package className="w-5 h-5 text-orange-500" /> },
    { title: "Total Locations", value: locations.length, icon: <MapPin className="w-5 h-5 text-red-500" /> },
    { title: "Active Ads", value: advertisements.filter(a => a.active).length, icon: <LayoutTemplate className="w-5 h-5 text-purple-500" /> },
    { title: "Published Posts", value: blogPosts.filter(p => p.status === 'published').length, icon: <Newspaper className="w-5 h-5 text-indigo-500" /> },
    { title: "Active Polls", value: polls.filter(p => p.active).length, icon: <Users className="w-5 h-5 text-pink-500" /> },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}