
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Clock, User, Phone, MapPin, Zap, Info, Star } from "lucide-react";
import { Appointment } from "@/api/entities";
import { User as UserEntity } from "@/api/entities";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const issueTypes = [
  { value: "leaks_water_damage", label: "Leaks & Water Damage" },
  { value: "damp_mould", label: "Damp & Mould" },
  { value: "heating_hot_water", label: "Heating & No Hot Water" },
  { value: "electrical", label: "Electrical Concerns" },
  { value: "gas_boiler", label: "Gas & Boiler Checks" },
  { value: "broken_fixtures", label: "Broken Fixtures" },
  { value: "safety_hazards", label: "Home Safety Hazards" },
  { value: "general", label: "General Property Concerns" }
];

const generateTimeSlots = (isWeekend) => {
  if (isWeekend) {
    // Saturday–Sunday: 10:00 – 16:00 (every 60 mins)
    return Array.from({ length: 7 }, (_, i) => `${10 + i}:00`);
  } else {
    // Monday–Friday: 09:00 – 19:00 (every 30 mins)
    const slots = [];
    for (let i = 9; i < 19; i++) {
      slots.push(`${String(i).padStart(2, '0')}:00`);
      slots.push(`${String(i).padStart(2, '0')}:30`);
    }
    return slots;
  }
};

const PRICING = {
  FIRST_TIME: 79,
  WEEKDAY: 145,
  WEEKEND: 175,
};

export default function BookingModal({ isOpen, onClose, onConfirm, isLaunchOfferAvailable }) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [user, setUser] = useState(null);
  const [price, setPrice] = useState(PRICING.FIRST_TIME);
  const [isWeekend, setIsWeekend] = useState(false);
  const [timeSlots, setTimeSlots] = useState(generateTimeSlots(false));
  const [formData, setFormData] = useState({
    issueType: "",
    description: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    propertyType: "",
    tenantOrOwner: "",
    urgency: "medium"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await UserEntity.me();
        setUser(currentUser);
        setFormData(prev => ({
          ...prev,
          fullName: currentUser.full_name || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          address: currentUser.address || '',
          propertyType: currentUser.property_type || '',
          tenantOrOwner: currentUser.tenant_or_owner || ''
        }));
      } catch (e) {
        // Not logged in, user is null
        setUser(null);
        // Clear sensitive info if user logs out or isn't logged in
        setFormData(prev => ({
          ...prev,
          fullName: '',
          email: '',
          phone: '',
          address: '',
          propertyType: '',
          tenantOrOwner: ''
        }));
      }
    };
    if (isOpen) {
      fetchUser();
      // Reset on open
      setStep(1);
      setSelectedDate(null);
      setSelectedTime("");
      setIsWeekend(false);
      // Price is now calculated in the next useEffect
      setFormData(prev => ({
        ...prev,
        issueType: "",
        description: "",
        urgency: "medium"
      }));
    }
  }, [isOpen]);

  useEffect(() => {
    if (!selectedDate) {
      // If no date selected, default to weekday slots
      setTimeSlots(generateTimeSlots(false));
      setIsWeekend(false);
    } else {
      const day = selectedDate.getDay();
      const weekend = day === 0 || day === 6;
      setIsWeekend(weekend);
      setTimeSlots(generateTimeSlots(weekend));
    }
    
    // Price calculation
    if (isLaunchOfferAvailable && (user === null || !user.has_used_first_time_offer)) {
      setPrice(PRICING.FIRST_TIME);
    } else {
      // If offer is not available, or user has used it, calculate standard price
      // Use selectedDate if available, otherwise default to today's day for price
      const effectiveDate = selectedDate || new Date();
      const day = effectiveDate.getDay();
      const weekend = day === 0 || day === 6;
      setPrice(weekend ? PRICING.WEEKEND : PRICING.WEEKDAY);
    }

    if(selectedDate) setSelectedTime(""); // Reset time selection when date changes
  }, [selectedDate, user, isLaunchOfferAvailable, isOpen]);


  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const findBestExpert = async (issueType, appointmentDate) => {
    try {
      // Get all available users
      const allUsers = await UserEntity.list();
      // Filter out users who have expert_specialty and are available
      const allExperts = allUsers.filter(user => user.expert_specialty && user.is_available);
      
      // Filter experts by specialty matching the issue type
      const specialtyMap = {
        'leaks_water_damage': ['Plumbing', 'General', 'Water Damage', 'Maintenance'],
        'damp_mould': ['Surveying', 'Property Assessment', 'General', 'Maintenance'],
        'heating_hot_water': ['Plumbing', 'Heating', 'Boiler', 'Maintenance'],
        'electrical': ['Electrical', 'General', 'Maintenance'],
        'gas_boiler': ['Gas Safety', 'Boiler', 'Heating', 'Maintenance'],
        'broken_fixtures': ['General', 'Maintenance'],
        'safety_hazards': ['General', 'Property Assessment', 'Maintenance'],
        'general': ['General', 'Maintenance'] // Default for general inquiries
      };

      const relevantSpecialties = specialtyMap[issueType] || ['General', 'Maintenance'];
      
      const matchingExperts = allExperts.filter(expert => 
        // Ensure expert.expert_specialty is a string and contains at least one of the relevant specialties
        expert.expert_specialty && relevantSpecialties.some(specialty => 
          expert.expert_specialty.toLowerCase().includes(specialty.toLowerCase())
        )
      );

      // If we have matching experts, return the first available one
      // In a more advanced system, you could check their current workload or other criteria
      if (matchingExperts.length > 0) {
        return matchingExperts[0];
      } else if (allExperts.length > 0) {
        // If no specialty match, return any available expert
        return allExperts[0];
      } else {
        // No experts available at all
        return null;
      }
      
    } catch (error) {
      console.error('Error finding expert:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !formData.issueType || !formData.email || !formData.fullName) {
      alert("Please fill in all required fields (Issue Type, Date, Time, Full Name, Email)");
      return;
    }

    setIsSubmitting(true);
    
    // The new logic for public-facing booking flow
    if (onConfirm) {
      const [hours, minutes] = selectedTime.split(':');
      const appointmentDateTime = new Date(selectedDate);
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

      // Find the best expert for this issue
      const assignedExpert = await findBestExpert(formData.issueType, appointmentDateTime);

      onConfirm({
        ...formData,
        appointment_date: appointmentDateTime.toISOString(),
        price_paid: price,
        expert_id: assignedExpert?.id || null, // Pass expert ID if found
        expert_name: assignedExpert?.full_name || "Available Expert", // Fallback name
        expert_specialty: assignedExpert?.expert_specialty || issueTypes.find(t => t.value === formData.issueType)?.label || "General", // Fallback specialty
        isLaunchOffer: price === PRICING.FIRST_TIME && isLaunchOfferAvailable // Pass if the offer was applied
      });
      setIsSubmitting(false);
      onClose(); // Close the modal after confirming
      return; // Stop execution here for the new flow
    }

    // --- Legacy flow for dashboard booking (maintains existing functionality) ---
    // This part is now effectively bypassed in the pre-launch phase from the landing page
    // For simplicity, we are removing the legacy `onSuccess` path as it won't be triggered by the homepage.
    setIsSubmitting(false);
  };

  const weekendModifier = { weekend: { daysOfWeek: [0, 6] } };
  const weekendModifierStyles = { weekend: { 
    backgroundColor: 'hsl(var(--yellow-100))', 
    color: 'hsl(var(--yellow-800))',
    borderRadius: 'var(--radius)'
  } };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-600">
            Preview Our Booking Process
          </DialogTitle>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className={step >= 1 ? "text-green-600 font-medium" : ""}>Issue Details</span>
            <span>→</span>
            <span className={step >= 2 ? "text-green-600 font-medium" : ""}>Schedule</span>
            <span>→</span>
            <span className={step >= 3 ? "text-green-600 font-medium" : ""}>Contact Info</span>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Issue Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label>What type of issue are you experiencing? *</Label>
                <Select value={formData.issueType} onValueChange={(value) => handleInputChange('issueType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    {issueTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Describe your issue in detail</Label>
                <Textarea
                  placeholder="Please provide as much detail as possible about your home issue..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="h-32"
                />
              </div>

              <div>
                <Label>How urgent is this issue?</Label>
                <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Not urgent - can wait a few days</SelectItem>
                    <SelectItem value="medium">Moderate - prefer within 24-48 hours</SelectItem>
                    <SelectItem value="urgent">Urgent - need help today</SelectItem>
                    <SelectItem value="emergency">Emergency - immediate attention needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleNext} className="w-full bg-green-600 hover:bg-green-700" disabled={!formData.issueType}>
                Next: Choose Date & Time
              </Button>
            </div>
          )}

          {/* Step 2: Schedule */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <TooltipProvider>
                    <div className="flex items-center">
                      <h3 className="font-bold text-lg text-gray-800">Example Consultation Price</h3>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 ml-2 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs p-3" side="bottom" align="start">
                          <p className="text-sm">
                            This is an example price to show you our rates. No charge will be made, and you will be added to our waiting list.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                  {isWeekend && (
                    <Badge className="bg-yellow-400 text-gray-900 mt-1">
                      <Zap className="w-4 h-4 mr-1" />
                      Weekend Premium
                    </Badge>
                  )}
                  {price === PRICING.FIRST_TIME && isLaunchOfferAvailable && (
                     <div className="mt-1">
                        <Badge className="bg-green-200 text-green-800">
                          <Star className="w-3 h-3 mr-1" />
                          Launch Offer
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          You're claiming one of the first 1000 spots!
                        </p>
                      </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-600">£{price}</p>
                  <p className="text-sm text-gray-500">
                    {price === PRICING.FIRST_TIME && isLaunchOfferAvailable ? "Limited Launch Offer" : (isWeekend ? "Weekend Rate" : "Standard Rate")}
                  </p>
                </div>
              </div>

              <div>
                <Label>Select a date</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                  className="rounded-md border"
                  modifiers={weekendModifier}
                  modifiersClassNames={weekendModifierStyles}
                />
              </div>

              {selectedDate && (
                <div>
                  <Label>Available time slots</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        className={`text-sm ${selectedTime === time ? 'bg-green-600 hover:bg-green-700' : ''}`}
                        onClick={() => setSelectedTime(time)}
                      >
                        <Clock className="w-4 h-4 mr-1" />
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={handleBack} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleNext} 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={!selectedDate || !selectedTime}
                >
                  Next: Contact Details
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Contact Info */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Your phone number"
                  />
                </div>
                <div>
                  <Label>Property Type</Label>
                  <Select value={formData.propertyType} onValueChange={(value) => handleInputChange('propertyType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat">Flat/Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="shared_house">Shared House</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Property Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Your property address"
                />
              </div>

              <div>
                <Label>Are you a tenant or homeowner?</Label>
                <Select value={formData.tenantOrOwner} onValueChange={(value) => handleInputChange('tenantOrOwner', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select one" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tenant">Tenant</SelectItem>
                    <SelectItem value="homeowner">Homeowner</SelectItem>
                    <SelectItem value="landlord">Landlord</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleBack} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={!formData.fullName || !formData.email || isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Join Waiting List"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
