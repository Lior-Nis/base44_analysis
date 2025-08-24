import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function PendingApprovals({ pendingPurchases, courses, loading, onApprove }) {
  if (loading || pendingPurchases.length === 0) {
    return null;
  }

  const getCourseTitle = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : "Unknown Course";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <Card className="bg-yellow-50 border-yellow-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Clock className="w-5 h-5" />
            Pending Approvals ({pendingPurchases.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingPurchases.map(purchase => (
              <div key={purchase.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200">
                <div>
                  <p className="font-medium text-slate-900">
                    {purchase.student_email}
                  </p>
                  <p className="text-sm text-slate-600">
                    Wants to purchase: <span className="font-semibold">{getCourseTitle(purchase.course_id)}</span> for ${purchase.amount_paid.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Requested on: {format(new Date(purchase.created_date), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => onApprove(purchase.id)}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}