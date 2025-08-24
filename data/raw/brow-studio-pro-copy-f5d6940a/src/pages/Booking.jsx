import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Check } from "lucide-react";

export default function Booking() {
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: ""
  });

  const services = [
    { name: "Microblading", duration: "2-3 hours", price: "$350" },
    { name: "Brow Lamination", duration: "45 minutes", price: "$85" },
    { name: "Classic Brow Shaping", duration: "30 minutes", price: "$45" },
    { name: "Hybrid Brows", duration: "2 hours", price: "$280" },
    { name: "Brow Tinting", duration: "20 minutes", price: "$35" },
    { name: "Free Consultation", duration: "30 minutes", price: "Free" }
  ];

  const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
    "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Booking submitted:", {
      service: selectedService,
      date: selectedDate,
      time: selectedTime,
      ...formData
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="py-24">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-light text-black mb-6">Book Your Appointment</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Take the first step towards perfect brows. Schedule your appointment today.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Service Selection */}
            <div>
              <h2 className="text-xl font-medium text-black mb-6">Select a Service</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {services.map((service, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedService === service.name
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedService(service.name)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-black">{service.name}</h3>
                      {selectedService === service.name && (
                        <Check className="w-5 h-5 text-black" />
                      )}
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{service.duration}</span>
                      <span className="font-medium">{service.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Date & Time Selection */}
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-medium text-black mb-6">Select Date</h2>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-gray-200 focus:border-black"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <h2 className="text-xl font-medium text-black mb-6">Select Time</h2>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger className="border-gray-200 focus:border-black">
                    <SelectValue placeholder="Choose time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-medium text-black mb-6">Your Information</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="border-gray-200 focus:border-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="border-gray-200 focus:border-black"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="border-gray-200 focus:border-black"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Notes or Requests
                </label>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="border-gray-200 focus:border-black"
                  placeholder="Any allergies, preferences, or special requests..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-100">
              <Button 
                type="submit" 
                className="w-full bg-black hover:bg-gray-800 text-white py-3 text-lg"
                disabled={!selectedService || !selectedDate || !selectedTime}
              >
                Confirm Booking
              </Button>
              <p className="text-sm text-gray-500 text-center mt-4">
                You will receive a confirmation email within 24 hours
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}