import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Contact } from "@/api/entities";
import { User } from "@/api/entities";
import { format } from "date-fns";
import { 
  PlusCircle, 
  Calendar, 
  MapPin, 
  Star, 
  Search,
  Phone,
  Mail,
  Building,
  Users,
  Clock,
  Download,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContactCard from "../components/ContactCard";
import EmptyState from "../components/EmptyState";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [contacts, setContacts] = useState([]);
  const [recentContacts, setRecentContacts] = useState([]);
  const [starredContacts, setStarredContacts] = useState([]);
  const [user, setUser] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
        
        const allContacts = await Contact.filter({ created_by: userData.email }, "-created_date");
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recent = allContacts.filter(contact => {
          const contactDate = new Date(contact.created_date);
          return contactDate >= thirtyDaysAgo;
        });
        
        const starred = allContacts.filter(contact => contact.starred);
        
        setContacts(allContacts);
        setRecentContacts(recent);
        setStarredContacts(starred);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setInitialLoad(false);
      }
    };

    loadInitialData();
  }, []);

  const refreshContacts = async () => {
    if (!user?.email) return;
    
    try {
      const allContacts = await Contact.filter({ created_by: user.email }, "-created_date");
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recent = allContacts.filter(contact => {
        const contactDate = new Date(contact.created_date);
        return contactDate >= thirtyDaysAgo;
      });
      
      const starred = allContacts.filter(contact => contact.starred);
      
      setContacts(allContacts);
      setRecentContacts(recent);
      setStarredContacts(starred);
    } catch (error) {
      console.error("Error refreshing contacts:", error);
    }
  };

  const getLocationStats = () => {
    const locationCounts = {};
    contacts.forEach(contact => {
      if (contact.location_met) {
        locationCounts[contact.location_met] = (locationCounts[contact.location_met] || 0) + 1;
      }
    });
    
    return Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const getEventStats = () => {
    const eventCounts = {};
    contacts.forEach(contact => {
      if (contact.event_met) {
        eventCounts[contact.event_met] = (eventCounts[contact.event_met] || 0) + 1;
      }
    });
    
    return Object.entries(eventCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const exportContactsToCSV = () => {
    const csvData = contacts.map(contact => ({
      "Full Name": contact.full_name,
      "Email": contact.email,
      "Phone": contact.phone,
      "Company": contact.company,
      "Job Title": contact.job_title,
      "Location Met": contact.location_met,
      "Event Met": contact.event_met,
      "Notes": contact.notes,
      "Created Date": contact.created_date
    }));

    const csvHeaders = Object.keys(csvData[0] || {});
    const csvRows = [
      csvHeaders.join(','),
      ...csvData.map(row => csvHeaders.map(header => `"${row[header] ? row[header].toString().replace(/"/g, '""') : ''}"`).join(','))
    ];

    const csvString = csvRows.join('\r\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'contacts.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (initialLoad) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="flex flex-col gap-4">
            <div className="h-8 bg-slate-200 rounded-lg w-3/4 sm:w-1/2"></div>
            <div className="h-4 bg-slate-200 rounded w-full sm:w-2/3"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 sm:h-24 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="max-w-7xl mx-auto space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex-1">
          <motion.h1 
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            Welcome{user ? `, ${user.full_name.split(' ')[0]}` : ''}
          </motion.h1>
          <motion.p 
            className="text-slate-600 text-base sm:text-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Your digital business card organizer
          </motion.p>
        </div>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link to={createPageUrl("Scan")} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white gap-2 h-11 px-6 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200">
              <PlusCircle size={18} />
              Add New Contact
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="w-full sm:w-auto gap-2 h-11 px-6 border-slate-300 hover:bg-slate-50" 
            onClick={exportContactsToCSV}
          >
            <Download size={18} />
            Export CSV
          </Button>
        </motion.div>
      </div>
      
      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <StatCard 
          icon={<Users className="text-slate-600" size={20} />} 
          label="Total" 
          value={contacts.length} 
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard 
          icon={<Clock className="text-slate-600" size={20} />} 
          label="Recent" 
          value={recentContacts.length}
          gradient="from-green-500 to-green-600"
        />
        <StatCard 
          icon={<Star className="text-amber-500" size={20} />} 
          label="Starred" 
          value={starredContacts.length}
          gradient="from-amber-500 to-amber-600"
        />
        <StatCard 
          icon={<MapPin className="text-slate-600" size={20} />} 
          label="Locations" 
          value={getLocationStats().length}
          gradient="from-purple-500 to-purple-600"
        />
      </motion.div>
      
      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Tabs defaultValue="recent" className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <TabsList className="grid w-full sm:w-auto grid-cols-3 bg-slate-100 p-1">
              <TabsTrigger value="recent" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Recent
              </TabsTrigger>
              <TabsTrigger value="starred" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Starred
              </TabsTrigger>
              <TabsTrigger value="stats" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Insights
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="recent" className="space-y-6 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={18} className="text-slate-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">Recent Connections</h2>
            </div>
            
            <AnimatePresence>
              {recentContacts.length > 0 ? (
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
                    hidden: { opacity: 0 }
                  }}
                >
                  {recentContacts.map(contact => (
                    <motion.div 
                      key={contact.id} 
                      layout 
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ContactCard 
                        contact={contact} 
                        onRefresh={refreshContacts}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <EmptyState 
                  icon={<Calendar className="w-12 h-12 text-blue-500" />}
                  title="No recent connections"
                  description="Start by scanning your first business card"
                  actionLabel="Scan a Card"
                  actionHref={createPageUrl("Scan")}
                />
              )}
            </AnimatePresence>
          </TabsContent>
          
          <TabsContent value="starred" className="space-y-6 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Star size={18} className="text-amber-500" />
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">Starred Contacts</h2>
            </div>
            
            <AnimatePresence>
              {starredContacts.length > 0 ? (
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
                    hidden: { opacity: 0 }
                  }}
                >
                  {starredContacts.map(contact => (
                    <motion.div 
                      key={contact.id} 
                      layout 
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ContactCard 
                        contact={contact} 
                        onRefresh={refreshContacts}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <EmptyState 
                  icon={<Star className="w-12 h-12 text-amber-500" />}
                  title="No starred contacts"
                  description="Star your important contacts to see them here"
                  actionLabel="Browse Contacts"
                  actionHref={createPageUrl("Search")}
                />
              )}
            </AnimatePresence>
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-6 mt-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-slate-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">Network Insights</h2>
            </div>
            
            {contacts.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-4 flex items-center gap-2">
                      <MapPin size={18} className="text-red-500" /> Top Locations
                    </h3>
                    <div className="space-y-3">
                      {getLocationStats().length > 0 ? getLocationStats().map(([location, count]) => (
                        <div key={location} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <MapPin size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-700 text-sm truncate">{location}</span>
                          </div>
                          <Badge variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-100 text-xs">
                            {count}
                          </Badge>
                        </div>
                      )) : (
                        <p className="text-slate-500 text-sm">No location data available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-medium text-slate-800 mb-4 flex items-center gap-2">
                      <Calendar size={18} className="text-blue-500" /> Top Events
                    </h3>
                    <div className="space-y-3">
                      {getEventStats().length > 0 ? getEventStats().map(([event, count]) => (
                        <div key={event} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Calendar size={14} className="text-slate-400 flex-shrink-0" />
                            <span className="text-slate-700 text-sm truncate">{event}</span>
                          </div>
                          <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs">
                            {count}
                          </Badge>
                        </div>
                      )) : (
                        <p className="text-slate-500 text-sm">No event data available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <EmptyState 
                icon={<Sparkles className="w-12 h-12 text-indigo-500" />}
                title="No data for insights"
                description="Add contacts to see statistics and insights"
                actionLabel="Scan a Card"
                actionHref={createPageUrl("Scan")}
              />
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}

const StatCard = ({ icon, label, value, gradient }) => (
  <motion.div
    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
    whileTap={{ scale: 0.98 }}
  >
    <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-slate-800">{value}</div>
            <div className="text-xs sm:text-sm text-slate-500 uppercase tracking-wider truncate">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);