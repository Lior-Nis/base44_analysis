import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, MapPin, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function QuickActions({ onStartTour }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Link to={createPageUrl("Bookings")}>
        <Button className="bg-blue-600 text-white hover:bg-blue-600 w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Book Workspace
        </Button>
      </Link>
      <Link to={createPageUrl("FloorPlans")}>
        <Button variant="outline" className="border-blue-500 text-blue-600 bg-white hover:bg-white hover:text-blue-600 w-full sm:w-auto">
          <MapPin className="w-4 h-4 mr-2" />
          View Floor Plans
        </Button>
      </Link>
      {onStartTour &&
      <Button
        variant="outline"
        onClick={onStartTour}
        className="border-blue-500 text-blue-600 bg-white hover:bg-white hover:text-blue-600 w-full sm:w-auto">
        <PlayCircle className="w-4 h-4 mr-2" />
        Take Tour
      </Button>
      }
    </div>);
}