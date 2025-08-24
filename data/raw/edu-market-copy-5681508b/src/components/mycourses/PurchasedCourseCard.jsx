import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Download, Calendar } from "lucide-react";
import { format } from "date-fns";

const subjectColors = {
  mathematics: "bg-blue-100 text-blue-800 border-blue-200",
  science: "bg-green-100 text-green-800 border-green-200",
  ela: "bg-purple-100 text-purple-800 border-purple-200",
  other: "bg-gray-100 text-gray-800 border-gray-200"
};

export default function PurchasedCourseCard({ course, purchase, getIconForMaterial }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl font-bold">{course.title}</CardTitle>
              <p className="text-blue-100 text-sm mt-1">
                {course.description}
              </p>
            </div>
            <Badge className={`${subjectColors[course.subject]} border font-medium bg-white/20 text-white border-white/30`}>
              {course.subject}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
            <Calendar className="w-4 h-4" />
            <span>Purchased: {format(new Date(purchase.created_date), "MMM d, yyyy")}</span>
            <span className="ml-auto font-semibold text-emerald-600">
              ${purchase.amount_paid.toFixed(2)}
            </span>
          </div>

          {course.learning_objectives && course.learning_objectives.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-slate-900 mb-2">What you'll learn:</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                {course.learning_objectives.slice(0, 3).map((objective, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {course.materials && course.materials.length > 0 && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Course Materials:</h4>
              <div className="space-y-2">
                {course.materials.map((material, index) => {
                  const IconComponent = getIconForMaterial(material.type);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-slate-900">{material.name}</p>
                          <p className="text-xs text-slate-500 capitalize">
                            {material.type.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {material.file_url && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(material.file_url, '_blank')}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        {material.google_link && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(material.google_link, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}