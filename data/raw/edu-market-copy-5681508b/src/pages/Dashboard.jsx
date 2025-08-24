import React, { useState, useEffect } from "react";
import { Course } from "@/api/entities";
import { Purchase } from "@/api/entities";
import { Review } from "@/api/entities";
import { CourseView } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, Eye, Star, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalUploads: 0,
    totalReviews: 0,
    totalPurchases: 0
  });
  const [topCourses, setTopCourses] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [courses, purchases, reviews, views] = await Promise.all([
        Course.list(),
        Purchase.list(),
        Review.list(),
        CourseView.list()
      ]);

      // Calculate basic stats
      const uniqueUsers = new Set(purchases.map(p => p.student_email)).size;

      setStats({
        totalUsers: uniqueUsers,
        totalUploads: courses.length,
        totalReviews: reviews.length,
        totalPurchases: purchases.length
      });

      // Calculate top courses by views
      const courseViewsMap = {};
      views.forEach(view => {
        courseViewsMap[view.course_id] = (courseViewsMap[view.course_id] || 0) + view.view_count;
      });

      const coursesWithViews = courses.map(course => ({
        ...course,
        total_views: courseViewsMap[course.id] || 0
      })).sort((a, b) => b.total_views - a.total_views).slice(0, 5);

      setTopCourses(coursesWithViews);

      // Recent activity (last 10 purchases)
      const recentPurchases = purchases.sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      ).slice(0, 10);

      setRecentActivity(recentPurchases);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Analytics Dashboard</h1>
          <p className="text-slate-600">Comprehensive insights into your Academic Zone performance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-blue-500" },
            { title: "Total Uploads", value: stats.totalUploads, icon: Eye, color: "bg-green-500" },
            { title: "Total Reviews", value: stats.totalReviews, icon: Star, color: "bg-yellow-500" },
            { title: "Total Purchases", value: stats.totalPurchases, icon: ShoppingCart, color: "bg-purple-500" }
          ].map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">{metric.title}</p>
                      <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${metric.color} bg-opacity-10`}>
                      <metric.icon className="w-6 h-6 text-slate-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Most Viewed Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Most Viewed Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCourses.map((course, index) => (
                  <div key={course.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{course.title}</h4>
                      <p className="text-sm text-slate-600 capitalize">{course.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{course.total_views} views</p>
                      <Badge variant="outline">#{index + 1}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Purchase Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{purchase.student_email}</p>
                      <p className="text-sm text-slate-600">
                        {new Date(purchase.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        className={
                          purchase.status === 'completed' ? 'bg-green-100 text-green-800' :
                          purchase.status === 'pending_verification' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }
                      >
                        {purchase.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}