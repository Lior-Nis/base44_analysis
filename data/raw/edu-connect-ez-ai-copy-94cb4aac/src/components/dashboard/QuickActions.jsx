import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Plus, 
  BookOpen, 
  Target,
  Zap
} from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "New Assignment",
      icon: Plus,
      color: "bg-blue-500 hover:bg-blue-600",
      url: createPageUrl("Assignments")
    },
    {
      title: "View All",
      icon: BookOpen,
      color: "bg-green-500 hover:bg-green-600", 
      url: createPageUrl("Assignments")
    },
    {
      title: "Study Plan",
      icon: Target,
      color: "bg-purple-500 hover:bg-purple-600",
      url: createPageUrl("StudyPlans")
    }
  ];

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => (
          <Link key={action.title} to={action.url}>
            <Button 
              className={`w-full ${action.color} text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}
              variant="default"
            >
              <action.icon className="w-4 h-4 mr-2" />
              {action.title}
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}