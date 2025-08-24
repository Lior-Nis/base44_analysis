import React, { useState, useEffect } from "react";
import { Executive } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, Calendar, Linkedin, Search, Filter, Users } from "lucide-react";

export default function Executives() {
  const [executives, setExecutives] = useState([]);
  const [filteredExecutives, setFilteredExecutives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");

  useEffect(() => {
    loadExecutives();
  }, []);

  useEffect(() => {
    filterExecutives();
  }, [executives, searchTerm, filterDepartment]);

  const loadExecutives = async () => {
    try {
      const executiveData = await Executive.list('display_order');
      setExecutives(executiveData);
    } catch (error) {
      console.error("Error loading executives:", error);
    }
    setLoading(false);
  };

  const filterExecutives = () => {
    let filtered = executives;

    if (searchTerm) {
      filtered = filtered.filter(exec => 
        exec.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exec.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exec.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterDepartment !== "all") {
      filtered = filtered.filter(exec => exec.department === filterDepartment);
    }

    setFilteredExecutives(filtered);
  };

  const getDepartments = () => {
    const departments = [...new Set(executives.map(exec => exec.department))];
    return departments.sort();
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-80 bg-slate-200 rounded-xl"></div>
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Executive Team</h1>
                <p className="text-slate-600 text-lg">Meet our leadership team and get in touch</p>
              </div>
              
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search executives..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {getDepartments().map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Executives Grid */}
          {filteredExecutives.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl">
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Executives Found</h3>
                <p className="text-slate-600">Try adjusting your search or filter criteria.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExecutives.map((executive) => (
                <Card key={executive.id} className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-200">
                  <CardHeader className="text-center pb-4">
                    <div className="relative mb-4">
                      <div className="w-24 h-24 mx-auto rounded-full overflow-hidden ring-4 ring-white shadow-lg">
                        {executive.photo_url ? (
                          <img 
                            src={executive.photo_url} 
                            alt={executive.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                            <span className="text-white font-bold text-xl">
                              {executive.full_name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-xl text-slate-900 mb-1">
                      {executive.full_name}
                    </CardTitle>
                    <p className="text-lg font-medium text-blue-600 mb-2">{executive.position}</p>
                    <Badge variant="outline" className="bg-slate-50 text-slate-700">
                      {executive.department}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {executive.bio && (
                        <p className="text-sm text-slate-600 line-clamp-4">{executive.bio}</p>
                      )}
                      
                      <div className="space-y-3 pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-3 text-sm">
                          <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                          <a 
                            href={`mailto:${executive.email}`}
                            className="text-blue-600 hover:text-blue-800 truncate"
                          >
                            {executive.email}
                          </a>
                        </div>
                        
                        {executive.phone && (
                          <div className="flex items-center gap-3 text-sm">
                            <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                            <a 
                              href={`tel:${executive.phone}`}
                              className="text-slate-600 hover:text-slate-800"
                            >
                              {executive.phone}
                            </a>
                          </div>
                        )}
                        
                        {executive.office_location && (
                          <div className="flex items-center gap-3 text-sm">
                            <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                            <span className="text-slate-600">{executive.office_location}</span>
                          </div>
                        )}
                        
                        {executive.years_with_company && (
                          <div className="flex items-center gap-3 text-sm">
                            <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
                            <span className="text-slate-600">
                              {executive.years_with_company} year{executive.years_with_company !== 1 ? 's' : ''} with company
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {executive.linkedin_url && (
                        <div className="pt-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            asChild
                            className="w-full hover:bg-blue-50"
                          >
                            <a 
                              href={executive.linkedin_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2"
                            >
                              <Linkedin className="w-4 h-4" />
                              Connect on LinkedIn
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
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