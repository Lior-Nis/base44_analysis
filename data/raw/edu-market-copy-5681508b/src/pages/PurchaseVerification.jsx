import React, { useState, useEffect } from "react";
import { Purchase } from "@/api/entities";
import { Course } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Clock, DollarSign, User as UserIcon, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PurchaseVerification() {
  const [purchases, setPurchases] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadPurchases();
    loadCourses();
  }, []);

  const loadPurchases = async () => {
    try {
      const data = await Purchase.list("-created_date");
      setPurchases(data);
    } catch (error) {
      console.error("Error loading purchases:", error);
    }
    setLoading(false);
  };

  const loadCourses = async () => {
    try {
      const data = await Course.list();
      setCourses(data);
    } catch (error) {
      console.error("Error loading courses:", error);
    }
  };

  const getCourseTitle = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : "Unknown Course";
  };

  const handleVerifyPurchase = async (purchaseId) => {
    try {
      await Purchase.update(purchaseId, {
        status: "completed",
        access_granted: true
      });
      loadPurchases();
    } catch (error) {
      console.error("Error verifying purchase:", error);
    }
  };

  const handleRejectPurchase = async (purchaseId) => {
    try {
      await Purchase.update(purchaseId, {
        status: "rejected",
        access_granted: false
      });
      loadPurchases();
    } catch (error) {
      console.error("Error rejecting purchase:", error);
    }
  };

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.student_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getCourseTitle(purchase.course_id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || purchase.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending_verification":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending_verification":
        return <Clock className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Purchase Verification</h1>
          <p className="text-slate-600">Review and verify student purchases</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search by student email or course name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending_verification">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchases List */}
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <Card>
                    <CardContent className="p-6">
                      <div className="h-6 bg-slate-200 rounded mb-4"></div>
                      <div className="h-4 bg-slate-200 rounded mb-2"></div>
                      <div className="h-4 bg-slate-200 rounded"></div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPurchases.map((purchase) => (
                <motion.div
                  key={purchase.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <UserIcon className="w-5 h-5 text-slate-600" />
                            <h3 className="text-lg font-semibold text-slate-900">
                              {purchase.student_email}
                            </h3>
                            <Badge className={`${getStatusColor(purchase.status)} flex items-center gap-1`}>
                              {getStatusIcon(purchase.status)}
                              {purchase.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-slate-500">Course</p>
                              <p className="font-medium text-slate-900">{getCourseTitle(purchase.course_id)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-500">Amount Paid</p>
                              <p className="font-medium text-slate-900 flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                {purchase.amount_paid.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-slate-500">Purchase Date</p>
                              <p className="font-medium text-slate-900">
                                {new Date(purchase.created_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {purchase.status === "pending_verification" && (
                          <div className="flex gap-2 ml-4">
                            <Button
                              onClick={() => handleVerifyPurchase(purchase.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              size="sm"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Verify
                            </Button>
                            <Button
                              onClick={() => handleRejectPurchase(purchase.id)}
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              size="sm"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              
              {filteredPurchases.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <DollarSign className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">No purchases found</h3>
                  <p className="text-slate-500">No purchases match your current filters</p>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}