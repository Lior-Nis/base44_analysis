
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  MoreHorizontal,
  Clock,
  Users,
  FileText,
  Sparkles,
  Zap,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";

import ProjectCard from "../components/dashboard/ProjectCard";
import CreateProjectModal from "../components/dashboard/CreateProjectModal";
import StatsOverview from "../components/dashboard/StatsOverview";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();

    // Add a listener to re-fetch data when the window/tab is focused
    window.addEventListener('focus', loadData);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('focus', loadData);
    };
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [currentUser, userProjects, userTeams] = await Promise.all([
        base44.auth.me(),
        base44.entities.Project.list("-last_accessed"),
        base44.entities.Team.list("-updated_date")
      ]);
      
      setUser(currentUser);
      setProjects(userProjects);
      setTeams(userTeams);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  const handleCreateProject = async (projectData) => {
    try {
      const newProject = await base44.entities.Project.create({
        ...projectData,
        last_accessed: new Date().toISOString()
      });
      setShowCreateModal(false);
      navigate(createPageUrl(`Editor?projectId=${newProject.id}`));
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const recentProjects = projects.slice(0, 8);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-3">
                {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Designer'} ✨
              </h1>
              <p className="text-lg text-purple-100 mb-6 max-w-xl">
                Ready to bring your ideas to life? Create stunning designs with Digma.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-50 font-semibold px-6 py-3 rounded-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Design
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/50 font-medium px-6 py-3 rounded-lg backdrop-blur-sm transition-all duration-200 flex items-center gap-2"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  Explore Templates
                </Button>
              </div>
            </div>
            <div className="flex-1 max-w-sm">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20">
                <h3 className="text-md font-semibold mb-3">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-left">
                    <div className="text-xl font-bold">{projects.length}</div>
                    <div className="text-xs text-purple-200">Projects</div>
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold">{teams.length}</div>
                    <div className="text-xs text-purple-200">Teams</div>
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold">
                      {projects.filter(p => {
                        const lastAccessed = new Date(p.last_accessed || p.created_date);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return lastAccessed > weekAgo;
                      }).length}
                    </div>
                    <div className="text-xs text-purple-200">Active this week</div>
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold">Pro</div>
                    <div className="text-xs text-purple-200">Current Plan</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Recent Projects Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Continue Working</h2>
              <p className="text-gray-600 text-sm">Pick up where you left off</p>
            </div>
            <Link 
              to={createPageUrl("Recent")} 
              className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2 text-sm"
            >
              View all
              <TrendingUp className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-52 animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-5">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Ready to create something amazing?</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm">
                Start your first project and bring your creative vision to life with Digma's powerful design tools.
              </p>
              <Button 
                onClick={() => setShowCreateModal(true)}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold px-6 py-3 rounded-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {recentProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project}
                  onUpdate={loadData}
                />
              ))}
            </div>
          )}
        </div>

        {/* All Projects Section */}
        <div>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">All Projects</h2>
              <p className="text-gray-600 text-sm">Organize and manage your design files</p>
            </div>
            
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border-gray-200 rounded-lg bg-white text-sm"
                />
              </div>
              
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="w-9 h-8"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="w-9 h-8"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" : "space-y-2"}>
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className={viewMode === "grid" ? "bg-white rounded-xl h-52 animate-pulse border border-gray-100" : "bg-white rounded-lg h-16 animate-pulse border border-gray-100"} />
              ))}
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" : "space-y-2"}>
              {filteredProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project}
                  viewMode={viewMode}
                  onUpdate={loadData}
                />
              ))}
            </div>
          )}

          {filteredProjects.length === 0 && !isLoading && searchTerm && (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      </div>

      <CreateProjectModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateProject}
        teams={teams}
      />
    </div>
  );
}
