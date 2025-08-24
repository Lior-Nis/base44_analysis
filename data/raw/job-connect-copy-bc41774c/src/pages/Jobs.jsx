import React, { useState, useEffect } from "react";
import { Job } from "@/api/entities";
import { Search, Filter, MapPin, Briefcase, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JobCard from "../components/jobs/JobCard";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const fetchedJobs = await Job.filter({ status: "active" }, "-created_date", 20);
      setJobs(fetchedJobs);
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (job) => {
    console.log("Apply to job:", job.title);
    // Application logic would go here
  };

  const handleMessage = (job) => {
    const conversationId = `job_${job.id}_inquiry`;
    const conversation = {
      id: conversationId,
      name: `${job.company} - ${job.title}`,
      title: "Job Inquiry",
      email: job.created_by,
      avatar: job.company_logo
    };
    
    sessionStorage.setItem('activeConversation', JSON.stringify(conversation));
    window.location.href = createPageUrl("Messages");
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchQuery || 
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === "all" || job.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="w-48 h-5 bg-gray-200 rounded"></div>
                  <div className="w-32 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-4 bg-gray-200 rounded"></div>
                <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-500">{jobs.length} opportunities available</span>
                </div>
              </div>
              <Link to={createPageUrl("PostJob")}>
                <Button className="bg-blue-600 hover:bg-blue-700 rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Job
                </Button>
              </Link>
            </div>
            
            {/* Search and Filters */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search jobs, companies, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 rounded-full border-gray-300 focus:border-blue-500"
                />
              </div>
              <Button variant="outline" className="rounded-full px-6">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Job Type Tabs */}
            <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full">
              <TabsList className="bg-gray-100 p-1">
                <TabsTrigger value="all" className="rounded-full">All Jobs</TabsTrigger>
                <TabsTrigger value="full_time" className="rounded-full">Full Time</TabsTrigger>
                <TabsTrigger value="part_time" className="rounded-full">Part Time</TabsTrigger>
                <TabsTrigger value="contract" className="rounded-full">Contract</TabsTrigger>
                <TabsTrigger value="remote" className="rounded-full">Remote</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4">
        {filteredJobs.length > 0 ? (
          <div className="space-y-6">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onApply={handleApply}
                onMessage={handleMessage}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? `No jobs found for "${searchQuery}"` : "No jobs available"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? "Try adjusting your search criteria" : "Be the first to post a job opportunity!"}
            </p>
            <Link to={createPageUrl("PostJob")}>
              <Button className="bg-blue-600 hover:bg-blue-700 rounded-full">
                Post First Job
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}