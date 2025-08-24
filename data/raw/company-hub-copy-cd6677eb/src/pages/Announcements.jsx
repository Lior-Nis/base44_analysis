import React, { useState, useEffect } from "react";
import { Announcement } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone, Search, Filter, Pin, Clock, AlertTriangle } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    loadAnnouncements();
  }, []);

  useEffect(() => {
    filterAnnouncements();
  }, [announcements, searchTerm, filterPriority, filterCategory]);

  const loadAnnouncements = async () => {
    try {
      const announcementData = await Announcement.list('-created_date');
      // Filter out expired announcements
      const currentDate = new Date();
      const activeAnnouncements = announcementData.filter(announcement => 
        !announcement.expires_at || new Date(announcement.expires_at) > currentDate
      );
      setAnnouncements(activeAnnouncements);
    } catch (error) {
      console.error("Error loading announcements:", error);
    }
    setLoading(false);
  };

  const filterAnnouncements = () => {
    let filtered = announcements;

    if (searchTerm) {
      filtered = filtered.filter(announcement => 
        announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterPriority !== "all") {
      filtered = filtered.filter(announcement => announcement.priority === filterPriority);
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter(announcement => announcement.category === filterCategory);
    }

    // Sort by pinned first, then by creation date
    filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.created_date) - new Date(a.created_date);
    });

    setFilteredAnnouncements(filtered);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-blue-100 text-blue-800 border-blue-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      urgent: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[priority] || colors.medium;
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: "bg-slate-100 text-slate-800",
      hr: "bg-blue-100 text-blue-800",
      safety: "bg-red-100 text-red-800",
      technology: "bg-indigo-100 text-indigo-800",
      training: "bg-green-100 text-green-800",
      events: "bg-purple-100 text-purple-800",
      other: "bg-gray-100 text-gray-800"
    };
    return colors[category] || colors.general;
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'urgent') return <AlertTriangle className="w-4 h-4" />;
    return null;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="space-y-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Company Announcements</h1>
                <p className="text-slate-600 text-lg">Stay updated with the latest company news and updates</p>
              </div>
              
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search announcements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="events">Events</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Announcements List */}
          {filteredAnnouncements.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl">
              <CardContent className="p-12 text-center">
                <Megaphone className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Announcements Found</h3>
                <p className="text-slate-600">Try adjusting your search or filter criteria.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredAnnouncements.map((announcement) => (
                <Card 
                  key={announcement.id} 
                  className={`bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-200 ${
                    announcement.pinned ? 'ring-2 ring-amber-200 bg-amber-50/50' : ''
                  } ${
                    announcement.priority === 'urgent' ? 'ring-2 ring-red-200 bg-red-50/50' : ''
                  }`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          {announcement.pinned && (
                            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1">
                              <Pin className="w-3 h-3" />
                              Pinned
                            </Badge>
                          )}
                          <Badge className={`${getPriorityColor(announcement.priority)} flex items-center gap-1`}>
                            {getPriorityIcon(announcement.priority)}
                            {announcement.priority}
                          </Badge>
                          <Badge className={getCategoryColor(announcement.category)}>
                            {announcement.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl text-slate-900 mb-2">
                          {announcement.title}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {format(parseISO(announcement.created_date), "MMM d, yyyy 'at' h:mm a")}
                          </div>
                          {announcement.expires_at && (
                            <div>
                              Expires: {format(parseISO(announcement.expires_at), "MMM d, yyyy")}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-700 whitespace-pre-wrap">{announcement.content}</p>
                    </div>
                    
                    {announcement.target_audience !== 'all' && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <span className="font-medium">Target Audience:</span>
                          <Badge variant="outline" className="bg-slate-50">
                            {announcement.target_audience.replace('_', ' ')}
                            {announcement.department && ` - ${announcement.department}`}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {announcement.requires_acknowledgment && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 font-medium">
                            This announcement requires acknowledgment
                          </span>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Acknowledge
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}