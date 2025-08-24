import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { SiteContent } from "@/api/entities";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/toaster";
import {
  ShieldAlert,
  Home,
  BarChart3,
  Layers,
  Target,
  Users,
  BookOpen,
  Plus,
  Trash2,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import SectionEditor from "@/components/admin/SectionEditor";
import { Spinner } from "@/components/ui/spinner";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [contents, setContents] = useState([]);
  const [activeSection, setActiveSection] = useState("hero");
  const [activeItem, setActiveItem] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    checkUserAccess();
    fetchSiteContent();
  }, []);

  const checkUserAccess = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setIsAdmin(currentUser.role === "admin");
      setIsLoading(false);
    } catch (error) {
      console.error("Authentication error:", error);
      setIsLoading(false);
    }
  };

  const fetchSiteContent = async () => {
    try {
      setIsRefreshing(true);
      const data = await SiteContent.list();
      setContents(data);
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleNewItem = () => {
    setActiveItem({ section: activeSection });
  };

  const handleEditItem = (item) => {
    setActiveItem(item);
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await SiteContent.delete(id);
        fetchSiteContent();
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  const getSectionIcon = (section) => {
    switch (section) {
      case "hero": return <Home className="h-5 w-5" />;
      case "impact": return <BarChart3 className="h-5 w-5" />;
      case "projects": return <Layers className="h-5 w-5" />;
      case "goals": return <Target className="h-5 w-5" />;
      case "join": return <Users className="h-5 w-5" />;
      case "footer": return <BookOpen className="h-5 w-5" />;
      default: return <Home className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center p-6">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
        <p className="text-gray-600 max-w-md mb-6">
          You don't have permission to access the admin panel. Please contact an administrator if you believe this is an error.
        </p>
        <Button onClick={() => window.location.href = "/"}>
          Return to Home
        </Button>
      </div>
    );
  }

  const filteredContents = contents.filter(item => item.section === activeSection);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <Toaster />
      <header className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Website Admin</h1>
            <p className="text-gray-500">Manage your website content and appearance</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={fetchSiteContent} 
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => window.location.href = "/"}>
              View Website
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Website Sections</CardTitle>
              <CardDescription>Select a section to edit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant={activeSection === "hero" ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveSection("hero");
                    setActiveItem(null);
                  }}
                >
                  <Home className="h-5 w-5 mr-2" />
                  Hero Section
                </Button>
                <Button 
                  variant={activeSection === "impact" ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveSection("impact");
                    setActiveItem(null);
                  }}
                >
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Impact Numbers
                </Button>
                <Button 
                  variant={activeSection === "projects" ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveSection("projects");
                    setActiveItem(null);
                  }}
                >
                  <Layers className="h-5 w-5 mr-2" />
                  Projects
                </Button>
                <Button 
                  variant={activeSection === "goals" ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveSection("goals");
                    setActiveItem(null);
                  }}
                >
                  <Target className="h-5 w-5 mr-2" />
                  Goals
                </Button>
                <Button 
                  variant={activeSection === "join" ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveSection("join");
                    setActiveItem(null);
                  }}
                >
                  <Users className="h-5 w-5 mr-2" />
                  Join Us
                </Button>
                <Button 
                  variant={activeSection === "footer" ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveSection("footer");
                    setActiveItem(null);
                  }}
                >
                  <BookOpen className="h-5 w-5 mr-2" />
                  Footer
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Admin User</CardTitle>
              <CardDescription>Currently logged in as:</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="font-medium">{user?.full_name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <p className="text-xs mt-1 uppercase tracking-wider text-green-600 bg-green-100 inline-block px-2 py-1 rounded">
                  {user?.role}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-9">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {getSectionIcon(activeSection)}
                  {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Section
                </CardTitle>
                <CardDescription>Manage content for this section of your website</CardDescription>
              </div>
              <Button onClick={handleNewItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Item
              </Button>
            </CardHeader>
            <CardContent>
              {activeItem ? (
                <SectionEditor
                  section={activeSection}
                  data={activeItem}
                  onUpdate={() => {
                    fetchSiteContent();
                    setActiveItem(null);
                  }}
                />
              ) : (
                <>
                  {filteredContents.length === 0 ? (
                    <div className="text-center py-12 px-4 border-2 border-dashed rounded-md">
                      <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No content items found</h3>
                      <p className="text-gray-500 mb-4">This section doesn't have any content items yet.</p>
                      <Button onClick={handleNewItem}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Item
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredContents.map((item) => (
                        <div key={item.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-md hover:bg-gray-50">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getSectionIcon(item.section)}
                              <h3 className="font-medium">
                                {item.title || item.key || item.project_title || item.goal_title || "Untitled"}
                              </h3>
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                              {item.description || item.short_description || item.subtitle || "No description"}
                            </p>
                          </div>
                          <div className="flex mt-2 md:mt-0 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditItem(item)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}