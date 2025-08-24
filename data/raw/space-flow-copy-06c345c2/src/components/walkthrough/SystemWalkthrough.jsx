
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Building2,
  Briefcase,
  CheckCircle,
  PlayCircle,
  ClipboardList,
  UserCheck
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const walkthroughSteps = [
  {
    id: 'welcome',
    title: 'Welcome to SpaceFlow',
    icon: Building2,
    content: (
      <div className="space-y-4 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
          <Building2 className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Welcome to SpaceFlow!</h2>
        <p className="text-slate-600 max-w-md mx-auto">
          Your complete office workspace management solution. Let's take a quick tour to get you started.
        </p>
        <div className="flex justify-center">
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Interactive Tour • 5 minutes
          </Badge>
        </div>
      </div>
    )
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    icon: CheckCircle,
    actionButton: { text: 'View Dashboard', link: 'Dashboard' },
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <h3 className="text-xl font-semibold text-slate-900">Dashboard Overview</h3>
        </div>
        <p className="text-slate-600 mb-4">
          Your dashboard provides a personalized view of your workspace activity:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Today's Bookings</h4>
            <p className="text-sm text-blue-700">See your workspace reservations and check-in status</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">Upcoming Schedule</h4>
            <p className="text-sm text-green-700">View your next few days of office assignments</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-medium text-purple-900 mb-2">Office Status</h4>
            <p className="text-sm text-purple-700">Real-time occupancy levels across locations</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
            <h4 className="font-medium text-orange-900 mb-2">Quick Actions</h4>
            <p className="text-sm text-orange-700">Fast access to book workspaces or view floor plans</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'bookings',
    title: 'Book Your Workspace',
    icon: Calendar,
    actionButton: { text: 'Try Booking', link: 'Bookings' },
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-8 h-8 text-blue-600" />
          <h3 className="text-xl font-semibold text-slate-900">Workspace Booking</h3>
        </div>
        <p className="text-slate-600 mb-4">
          Reserve the perfect workspace for your needs:
        </p>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm mt-0.5">1</div>
            <div>
              <h4 className="font-medium text-slate-900">Choose Your Date</h4>
              <p className="text-sm text-slate-600">Select when you need a workspace</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm mt-0.5">2</div>
            <div>
              <h4 className="font-medium text-slate-900">Browse Available Spaces</h4>
              <p className="text-sm text-slate-600">Filter by location, zone, or search for specific features</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm mt-0.5">3</div>
            <div>
              <h4 className="font-medium text-slate-900">Book Instantly</h4>
              <p className="text-sm text-slate-600">One-click booking with automatic confirmation</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'roster',
    title: 'Daily Roster System',
    icon: ClipboardList,
    actionButton: { text: 'View Today\'s Roster', link: 'DailyRoster' },
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <ClipboardList className="w-8 h-8 text-purple-600" />
          <h3 className="text-xl font-semibold text-slate-900">Automated Seating Plan</h3>
        </div>
        <p className="text-slate-600 mb-4">
          SpaceFlow automatically assigns workspaces based on your office schedule:
        </p>
        <div className="space-y-3">
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <h4 className="font-medium text-slate-900 mb-2">Smart Assignment</h4>
            <p className="text-sm text-slate-600">
              The system considers your preferred zones, dedicated workspaces, and availability to assign you the best available spot.
            </p>
          </div>
          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-slate-900 mb-2">Conflict Resolution</h4>
            <p className="text-sm text-slate-600">
              Automatically detects and resolves seating conflicts, ensuring everyone has a workspace.
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'floorplans',
    title: 'Explore Floor Plans',
    icon: MapPin,
    actionButton: { text: 'Explore Floor Plans', link: 'FloorPlans' },
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="w-8 h-8 text-green-600" />
          <h3 className="text-xl font-semibold text-slate-900">Interactive Floor Plans</h3>
        </div>
        <p className="text-slate-600 mb-4">
          Get a visual overview of office layouts and real-time availability:
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
            <div className="w-8 h-8 bg-green-500 rounded mx-auto mb-2"></div>
            <p className="text-sm font-medium text-green-900">Available</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
            <div className="w-8 h-8 bg-blue-500 rounded mx-auto mb-2"></div>
            <p className="text-sm font-medium text-blue-900">Manual Booking</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-center">
            <div className="w-8 h-8 bg-purple-500 rounded mx-auto mb-2"></div>
            <p className="text-sm font-medium text-purple-900">Roster Assigned</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200 text-center">
            <div className="w-8 h-8 bg-orange-500 rounded mx-auto mb-2"></div>
            <p className="text-sm font-medium text-orange-900">Zone Indicator</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'profile',
    title: 'Customize Your Profile',
    icon: UserCheck,
    actionButton: { text: 'Edit Profile', link: 'Profile' },
    content: (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <UserCheck className="w-8 h-8 text-amber-600" />
          <h3 className="text-xl font-semibold text-slate-900">Personal Preferences</h3>
        </div>
        <p className="text-slate-600 mb-4">
          Customize your workspace preferences for better assignments:
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <Building2 className="w-5 h-5 text-amber-600" />
            <div>
              <h4 className="font-medium text-slate-900">Preferred Locations</h4>
              <p className="text-sm text-slate-600">Select your favorite office locations</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <Users className="w-5 h-5 text-amber-600" />
            <div>
              <h4 className="font-medium text-slate-900">Preferred Zones</h4>
              <p className="text-sm text-slate-600">Choose zones for better auto-assignments</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <Calendar className="w-5 h-5 text-amber-600" />
            <div>
              <h4 className="font-medium text-slate-900">Out of Office</h4>
              <p className="text-sm text-slate-600">Manage vacation days and absences</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    icon: CheckCircle,
    content: (
      <div className="space-y-4 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Welcome to the Team!</h2>
        <p className="text-slate-600 max-w-md mx-auto">
          You're now ready to make the most of SpaceFlow. Start by booking your first workspace or exploring the floor plans.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Link to={createPageUrl("Bookings")}>
            <Button className="bg-slate-900 text-white">
              <Calendar className="w-4 h-4 mr-2" />
              Book Your First Workspace
            </Button>
          </Link>
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline">
              <Building2 className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
        <p className="text-sm text-slate-500 mt-4">
          You can restart this tour anytime from the dashboard or your profile settings.
        </p>
      </div>
    )
  }
];

export default function SystemWalkthrough({ isOpen, onClose, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < walkthroughSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    onComplete();
    onClose();
  };

  if (!isOpen) return null;

  const step = walkthroughSteps[currentStep];
  const isLastStep = currentStep === walkthroughSteps.length - 1;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-0">
        <CardHeader className="pb-4 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center">
                <step.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">{step.title}</CardTitle>
                <p className="text-sm text-slate-500">
                  Step {currentStep + 1} of {walkthroughSteps.length}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSkip}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
            <div 
              className="bg-gradient-to-r from-slate-700 to-slate-900 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / walkthroughSteps.length) * 100}%` }}
            />
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          {step.content}
        </CardContent>

        <div className="p-6 pt-0 flex justify-between items-center">
          <div className="flex gap-2">
            {walkthroughSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep 
                    ? 'bg-slate-700' 
                    : index < currentStep 
                      ? 'bg-slate-400' 
                      : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
            
            {step.actionButton && (
              <Link to={createPageUrl(step.actionButton.link)}>
                <Button variant="outline" onClick={handleSkip}>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  {step.actionButton.text}
                </Button>
              </Link>
            )}

            {!isLastStep ? (
              <Button onClick={handleNext} className="bg-slate-900 text-white">
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} className="bg-green-600 text-white">
                <CheckCircle className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
