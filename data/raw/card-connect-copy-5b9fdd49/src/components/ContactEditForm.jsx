
import React, { useState } from "react";
import { format } from "date-fns";
import { 
  MapPin,
  CalendarIcon,
  Tag as TagIcon,
  X,
  Check
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function ContactEditForm({ contact, onSave, onCancel, loading }) {
  const [contactData, setContactData] = useState({
    full_name: contact?.full_name || "",
    company: contact?.company || "",
    job_title: contact?.job_title || "",
    email: contact?.email || "",
    phone: contact?.phone || "",
    website: contact?.website || "",
    address: contact?.address || "",
    notes: contact?.notes || "",
    location_met: contact?.location_met || "",
    event_met: contact?.event_met || "",
    date_met: contact?.date_met || new Date().toISOString().split('T')[0],
    tags: contact?.tags || [],
    starred: contact?.starred || false,
    image_url: contact?.image_url || ""
  });
  
  const [locationInput, setLocationInput] = useState("");
  const [eventInput, setEventInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  
  const [commonTags] = useState([
    "client", "prospect", "vendor", "partner", "investor", 
    "networking", "conference", "sales", "marketing", "engineering",
    "design", "management", "finance", "hr", "operations"
  ]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleDateSelect = (date) => {
    setContactData(prev => ({
      ...prev,
      date_met: date.toISOString().split('T')[0]
    }));
  };
  
  const addTag = (tagToAdd = null) => {
    const tag = tagToAdd || tagInput.trim();
    
    if (tag && !contactData.tags.includes(tag)) {
      setContactData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
      setTagInput("");
    }
  };
  
  const removeTag = (tagToRemove) => {
    setContactData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  return (
    <div className="grid gap-6 py-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Full Name
          </label>
          <Input 
            name="full_name"
            value={contactData.full_name}
            onChange={handleInputChange}
            placeholder="John Doe"
            className="w-full"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Job Title
          </label>
          <Input 
            name="job_title"
            value={contactData.job_title}
            onChange={handleInputChange}
            placeholder="Marketing Director"
            className="w-full"
          />
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          Company
        </label>
        <Input 
          name="company"
          value={contactData.company}
          onChange={handleInputChange}
          placeholder="Company name"
          className="w-full"
        />
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Email
          </label>
          <Input 
            name="email"
            value={contactData.email}
            onChange={handleInputChange}
            placeholder="email@example.com"
            className="w-full"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Phone
          </label>
          <Input 
            name="phone"
            value={contactData.phone}
            onChange={handleInputChange}
            placeholder="+1 234 567 8900"
            className="w-full"
          />
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Website
          </label>
          <Input 
            name="website"
            value={contactData.website}
            onChange={handleInputChange}
            placeholder="https://example.com"
            className="w-full"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Address
          </label>
          <Input 
            name="address"
            value={contactData.address}
            onChange={handleInputChange}
            placeholder="123 Business St, City"
            className="w-full"
          />
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Meeting Context
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-2">
              <MapPin size={14} />
              Where you met
            </label>
            <div className="relative">
              <Input 
                name="location_met"
                value={contactData.location_met}
                onChange={handleInputChange}
                placeholder="Location"
                className="w-full pr-10"
              />
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                  >
                    <MapPin size={14} />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Location</DialogTitle>
                    <DialogDescription>
                      Where did you meet this contact?
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="flex items-center gap-4">
                      <Input
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        placeholder="Enter location"
                        className="flex-1"
                      />
                      <Button 
                        onClick={() => {
                          if (locationInput.trim()) {
                            setContactData(prev => ({
                              ...prev,
                              location_met: locationInput.trim()
                            }));
                            setLocationInput("");
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-center gap-2"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (position) => {
                              const { latitude, longitude } = position.coords;
                              
                              // Use reverse geocoding to get address from coordinates
                              fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                                .then(response => response.json())
                                .then(data => {
                                  if (data && data.address) {
                                    const place = data.address.city || data.address.town || data.address.village || data.address.suburb;
                                    if (place) {
                                      setContactData(prev => ({
                                        ...prev,
                                        location_met: place
                                      }));
                                    }
                                  }
                                })
                                .catch(error => {
                                  console.error("Error getting location name:", error);
                                });
                            },
                            (error) => {
                              console.error("Error getting location:", error);
                            }
                          );
                        }
                      }}
                    >
                      <MapPin size={14} />
                      Use Current Location
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-2">
              <CalendarIcon size={14} />
              Event Name
            </label>
            <div className="relative">
              <Input 
                name="event_met"
                value={contactData.event_met}
                onChange={handleInputChange}
                placeholder="Event or conference"
                className="w-full pr-10"
              />
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                  >
                    <CalendarIcon size={14} />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Event</DialogTitle>
                    <DialogDescription>
                      At what event did you meet this contact?
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="flex items-center gap-4">
                      <Input
                        value={eventInput}
                        onChange={(e) => setEventInput(e.target.value)}
                        placeholder="Enter event name"
                        className="flex-1"
                      />
                      <Button 
                        onClick={() => {
                          if (eventInput.trim()) {
                            setContactData(prev => ({
                              ...prev,
                              event_met: eventInput.trim()
                            }));
                            setEventInput("");
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Recent Events</h4>
                      <div className="flex flex-wrap gap-2">
                        {["Tech Conference 2023", "Networking Lunch", "Industry Meetup"].map(event => (
                          <Badge 
                            key={event}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => {
                              setContactData(prev => ({
                                ...prev,
                                event_met: event
                              }));
                            }}
                          >
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-2">
              <CalendarIcon size={14} />
              Date Met
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {contactData.date_met ? (
                    <span>{format(new Date(contactData.date_met), "PPP")}</span>
                  ) : (
                    <span>Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={contactData.date_met ? new Date(contactData.date_met) : new Date()}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block flex items-center gap-2">
          <TagIcon size={14} />
          Tags
        </label>
        
        {/* Tag selection dropdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            onValueChange={(value) => addTag(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Common Tags</SelectLabel>
                {commonTags.map(tag => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Custom tag"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button onClick={() => addTag()}>Add</Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {contactData.tags && contactData.tags.map(tag => (
            <Badge 
              key={tag} 
              variant="secondary"
              className="flex items-center gap-1"
            >
              {tag}
              <X 
                size={14} 
                className="cursor-pointer opacity-70 hover:opacity-100"
                onClick={() => removeTag(tag)}
              />
            </Badge>
          ))}
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          Notes
        </label>
        <Textarea
          name="notes"
          value={contactData.notes}
          onChange={handleInputChange}
          placeholder="Add notes about this contact"
          className="w-full min-h-[100px]"
        />
      </div>
      
      <div className="flex justify-end gap-3 mt-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          className="bg-zinc-600 hover:bg-zinc-700" 
          onClick={() => onSave(contactData)}
          disabled={loading || !contactData.full_name}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check size={16} className="mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
