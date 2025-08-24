import React, { useState, useEffect } from "react";
import { Policy } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Search, Filter, Download, Eye, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import ReactMarkdown from "react-markdown";

export default function Policies() {
  const [policies, setPolicies] = useState([]);
  const [filteredPolicies, setFilteredPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  useEffect(() => {
    loadPolicies();
  }, []);

  useEffect(() => {
    filterPolicies();
  }, [policies, searchTerm, filterCategory]);

  const loadPolicies = async () => {
    try {
      const policyData = await Policy.filter({ status: 'active' }, '-last_reviewed');
      setPolicies(policyData);
    } catch (error) {
      console.error("Error loading policies:", error);
    }
    setLoading(false);
  };

  const filterPolicies = () => {
    let filtered = policies;

    if (searchTerm) {
      filtered = filtered.filter(policy => 
        policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter(policy => policy.category === filterCategory);
    }

    setFilteredPolicies(filtered);
  };

  const getCategoryColor = (category) => {
    const colors = {
      hr: "bg-blue-100 text-blue-800 border-blue-200",
      safety: "bg-red-100 text-red-800 border-red-200",
      conduct: "bg-purple-100 text-purple-800 border-purple-200",
      procedures: "bg-green-100 text-green-800 border-green-200",
      benefits: "bg-amber-100 text-amber-800 border-amber-200",
      technology: "bg-indigo-100 text-indigo-800 border-indigo-200",
      other: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[category] || colors.other;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-64 bg-slate-200 rounded-xl"></div>
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
                <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Company Policies</h1>
                <p className="text-slate-600 text-lg">Access all company guidelines and procedures</p>
              </div>
              
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search policies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="conduct">Code of Conduct</SelectItem>
                    <SelectItem value="procedures">Procedures</SelectItem>
                    <SelectItem value="benefits">Benefits</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Policies Grid */}
          {filteredPolicies.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Policies Found</h3>
                <p className="text-slate-600">Try adjusting your search or filter criteria.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPolicies.map((policy) => (
                <Card key={policy.id} className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className={getCategoryColor(policy.category)}>
                        {policy.category.replace('_', ' ')}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {format(parseISO(policy.last_reviewed), "MMM yyyy")}
                      </div>
                    </div>
                    <CardTitle className="text-lg text-slate-900 line-clamp-2">
                      {policy.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                      {policy.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <div className="text-xs text-slate-500">
                        <p>Effective: {format(parseISO(policy.effective_date), "MMM d, yyyy")}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPolicy(policy)}
                          className="hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {policy.file_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="hover:bg-green-50"
                          >
                            <a href={policy.file_url} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4 mr-1" />
                              PDF
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Policy Detail Modal */}
          <Dialog open={!!selectedPolicy} onOpenChange={() => setSelectedPolicy(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              {selectedPolicy && (
                <>
                  <DialogHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <DialogTitle className="text-2xl font-bold text-slate-900 mb-2">
                          {selectedPolicy.title}
                        </DialogTitle>
                        <div className="flex items-center gap-3">
                          <Badge className={getCategoryColor(selectedPolicy.category)}>
                            {selectedPolicy.category.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-slate-600">
                            Effective: {format(parseISO(selectedPolicy.effective_date), "MMMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                      {selectedPolicy.file_url && (
                        <Button variant="outline" asChild>
                          <a href={selectedPolicy.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </a>
                        </Button>
                      )}
                    </div>
                  </DialogHeader>
                  <div className="mt-6">
                    <div className="prose prose-slate max-w-none">
                      <ReactMarkdown>{selectedPolicy.content}</ReactMarkdown>
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-200 text-sm text-slate-500">
                      <p>Last reviewed: {format(parseISO(selectedPolicy.last_reviewed), "MMMM d, yyyy")}</p>
                      <p>Created: {format(parseISO(selectedPolicy.created_date), "MMMM d, yyyy")}</p>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}