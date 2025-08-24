
import React, { useState } from "react";
import { ArrowRight, Check, MapPin, Phone, Mail, Clock, CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { createCheckoutSession } from "@/api/functions";

export default function Home() {
  // Booking form state
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: ""
  });

  // Contact form state
  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const [isProcessing, setIsProcessing] = useState(null); // null, or item name

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

  const treatments = [
    {
      name: "Microblading",
      duration: "2-3 hours",
      price: "$350",
      description: "Semi-permanent eyebrow technique using fine needles to create hair-like strokes",
      features: ["Lasts 1-2 years", "Natural looking results", "Includes touch-up session"],
      image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
    },
    {
      name: "Brow Lamination",
      duration: "45 minutes",
      price: "$85",
      description: "Chemical treatment that restructures brow hairs for a fuller, more defined look",
      features: ["Lasts 6-8 weeks", "Creates fuller appearance", "Low maintenance"],
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
    },
    {
      name: "Classic Brow Shaping",
      duration: "30 minutes",
      price: "$45",
      description: "Professional waxing and tweezing to create your ideal brow shape",
      features: ["Custom shape design", "Includes styling", "Aftercare products"],
      image: "https://images.unsplash.com/photo-1559599101-f09722fb4948?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
    },
    {
      name: "Hybrid Brows",
      duration: "2 hours",
      price: "$280",
      description: "Combination of microblading and shading for maximum fullness",
      features: ["Best of both techniques", "Long-lasting results", "Highly customizable"],
      image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
    },
    {
      name: "Brow Tinting",
      duration: "20 minutes",
      price: "$35",
      description: "Semi-permanent dye to enhance and define your natural brow color",
      features: ["Lasts 4-6 weeks", "Multiple color options", "Quick treatment"],
      image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
    },
    {
      name: "Brow Consultation",
      duration: "30 minutes",
      price: "Free",
      description: "Professional assessment to determine the best treatment for your brows",
      features: ["Expert advice", "Treatment planning", "No obligation"],
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=2126&q=80"
    }
  ];

  const packages = [
    {
      name: "Starter Package",
      price: "$120",
      originalPrice: "$160",
      savings: "Save $40",
      description: "Perfect for first-time clients wanting to try our services",
      services: [
        "Free consultation",
        "Classic brow shaping",
        "Brow tinting",
        "Aftercare kit"
      ],
      popular: false,
      color: "bg-gray-50"
    },
    {
      name: "Complete Transformation",
      price: "$400",
      originalPrice: "$485",
      savings: "Save $85",
      description: "Our most popular package for dramatic brow enhancement",
      services: [
        "Free consultation",
        "Microblading session",
        "Brow lamination",
        "Touch-up session (6-8 weeks)",
        "Premium aftercare kit",
        "Follow-up consultation"
      ],
      popular: true,
      color: "bg-sage-50"
    },
    {
      name: "Maintenance Plan",
      price: "$200",
      originalPrice: "$240",
      savings: "Save $40",
      description: "Keep your brows looking perfect year-round",
      services: [
        "4 classic shaping sessions",
        "2 tinting sessions",
        "Priority booking",
        "20% off additional services"
      ],
      popular: false,
      color: "bg-gray-50"
    }
  ];

  const scrollToBooking = () => {
    const element = document.getElementById('booking');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCheckout = async (itemName, itemPrice, itemDescription) => {
    if (itemPrice.toLowerCase() === 'free') {
      // If it's a free item, we assume it's a "Free Consultation" type of booking
      // and just scroll to the booking section for the user to fill out details.
      // The booking form is now specifically for free consultations.
      scrollToBooking();
      // No need to set selectedService because the booking form UI for service selection is removed.
      // The user will fill out their details and submit for a free consultation.
      return; // Exit, no Stripe checkout needed.
    }

    // Handle paid items via Stripe checkout
    setIsProcessing(itemName); // Set loading state for the specific item
    try {
      // Ensure user is logged in
      await User.me();
    } catch (error) {
      alert("Please log in to make a booking.");
      await User.login(); // Attempt to log in
      setIsProcessing(null); // Reset processing state if login fails or is cancelled
      return;
    }

    try {
      // Convert price string ($XXX) to cents (integer)
      const priceInCents = Math.round(parseFloat(itemPrice.replace('$', '')) * 100);
      if (isNaN(priceInCents) || priceInCents <= 0) {
        throw new Error("Invalid price for checkout.");
      }

      // Construct success and cancel URLs
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}${createPageUrl('PaymentSuccess')}`;
      const cancelUrl = `${baseUrl}${createPageUrl('PaymentCancel')}`;

      // Create Stripe checkout session
      const { data: session } = await createCheckoutSession({
        name: itemName,
        description: itemDescription,
        priceInCents,
        successUrl,
        cancelUrl,
      });
      
      // Redirect to Stripe checkout page
      if (session && session.url) {
        window.location.href = session.url;
      } else {
        throw new Error("Could not create a checkout session.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert(`Error: ${error.message || "An unknown error occurred during checkout."}`);
    } finally {
      setIsProcessing(null); // Always reset processing state
    }
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    console.log("Free consultation booking submitted:", {
      date: selectedDate,
      time: selectedTime,
      ...formData
    });
    alert("Your free consultation has been booked!");
    // In a real app, you would send this data to a backend for booking.
    // Reset form fields after successful submission (optional)
    setSelectedDate(null);
    setSelectedTime("");
    setFormData({
      name: "",
      email: "",
      phone: "",
      notes: ""
    });
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    console.log("Contact form submitted:", contactData);
    // In a real app, you would send this data to a backend.
    alert("Your message has been sent!");
    setContactData({
      name: "",
      email: "",
      phone: "",
      message: ""
    });
  };

  const handleBookingChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleContactChange = (e) => {
    setContactData({
      ...contactData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          {/* Sage green geometric shapes */}
          <div 
            className="absolute top-20 right-0 w-96 h-96 opacity-30"
            style={{ backgroundColor: 'var(--sage-green)' }}
          />
          <div 
            className="absolute bottom-0 right-40 w-64 h-64 opacity-20"
            style={{ backgroundColor: 'var(--sage-light)' }}
          />
          
          {/* Diagonal stripes */}
          <div className="absolute bottom-0 left-0 w-full h-32 overflow-hidden">
            <div className="absolute inset-0 opacity-80">
              {Array.from({ length: 50 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-black transform rotate-45 w-1 h-64"
                  style={{
                    left: `${i * 16}px`,
                    bottom: '-120px',
                    transform: 'rotate(45deg)',
                    opacity: 0.1
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="hero-text text-6xl lg:text-7xl xl:text-8xl text-gray-600 font-light leading-none">
                  WE CHANGE
                </h1>
                <h1 className="hero-text text-6xl lg:text-7xl xl:text-8xl text-gray-600 font-light leading-none">
                  THE WORLD
                </h1>
                <h1 className="hero-text text-6xl lg:text-7xl xl:text-8xl text-black font-semibold leading-none">
                  ONE EYEBROW
                </h1>
                <h1 className="hero-text text-6xl lg:text-7xl xl:text-8xl text-black font-semibold leading-none">
                  AT A TIME
                </h1>
              </div>

              <div className="pt-8">
                <Button 
                  onClick={scrollToBooking}
                  className="group bg-transparent border-none p-0 h-auto text-black hover:bg-transparent"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-medium tracking-wide">
                      Book an Appointment
                    </span>
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                  <div className="mt-2 h-px bg-black w-full group-hover:w-1/2 transition-all duration-300" />
                </Button>
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="aspect-[4/5] rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
                  alt="Professional eyebrow artistry"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
              
              {/* Overlay text box */}
              <div 
                className="absolute bottom-8 right-8 p-8 max-w-sm"
                style={{ backgroundColor: 'var(--cream)' }}
              >
                <div className="space-y-4">
                  <h3 className="text-2xl font-light text-black leading-tight">
                    Precision Crafted
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Every brow is unique. Our expert artists create personalized shapes that enhance your natural beauty and complement your facial structure.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-light text-black mb-6">About BRW Bar</h2>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              We believe that great brows frame not just your face, but your confidence.
            </p>
          </div>

          <div className="space-y-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-light text-black mb-6">Our Story</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Founded in 2019, BRW Bar Inc. has been at the forefront of eyebrow artistry, 
                  combining traditional techniques with modern innovation to create the perfect 
                  brow for every client.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Our team of certified professionals is dedicated to enhancing your natural 
                  beauty through precision, artistry, and personalized care.
                </p>
              </div>
              <div className="aspect-square rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=2126&q=80"
                  alt="BRW Bar studio"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="aspect-square rounded-lg overflow-hidden md:order-2">
                <img
                  src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80"
                  alt="Professional team"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="md:order-1">
                <h3 className="text-3xl font-light text-black mb-6">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  To provide exceptional eyebrow services that enhance natural beauty 
                  and boost confidence through expert artistry and personalized care.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  We are committed to using only the highest quality products and 
                  maintaining the strictest safety standards in all our procedures.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Treatments Section */}
      <section id="treatments" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-light text-black mb-6">Our Treatments</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover our comprehensive range of eyebrow services, each designed to enhance 
              your natural beauty with precision and artistry.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {treatments.map((treatment, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={treatment.image}
                    alt={treatment.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-medium text-black">{treatment.name}</h3>
                    <span className="text-lg font-semibold text-black">{treatment.price}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{treatment.duration}</span>
                  </div>
                  
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {treatment.description}
                  </p>
                  
                  <ul className="space-y-1">
                    {treatment.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="text-sm text-gray-500 flex items-center">
                        <span className="w-1 h-1 bg-black rounded-full mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => handleCheckout(treatment.name, treatment.price, treatment.description)}
                    disabled={isProcessing === treatment.name}
                    className="w-full mt-4 bg-black hover:bg-gray-800 text-white"
                  >
                    {isProcessing === treatment.name ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Book Now'
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-light text-black mb-6">Treatment Packages</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Save money while achieving your perfect brows with our carefully curated packages.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <div 
                key={index} 
                className={`relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 ${
                  pkg.popular ? 'ring-2 ring-black' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Badge className="bg-black text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <div className={`${pkg.color} p-8 h-full flex flex-col`}>
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-medium text-black mb-2">{pkg.name}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">
                      {pkg.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-3xl font-bold text-black">{pkg.price}</span>
                        <span className="text-lg text-gray-400 line-through">{pkg.originalPrice}</span>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {pkg.savings}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 mb-8">
                    {pkg.services.map((service, serviceIndex) => (
                      <div key={serviceIndex} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm leading-relaxed">{service}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={() => handleCheckout(pkg.name, pkg.price, pkg.description)}
                    disabled={isProcessing === pkg.name}
                    className={`w-full ${
                      pkg.popular 
                        ? 'bg-black hover:bg-gray-800 text-white' 
                        : 'bg-white hover:bg-gray-50 text-black border border-gray-200'
                    }`}
                  >
                    {isProcessing === pkg.name ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Select Package'
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Section for Free Consultation */}
      <section id="booking" className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-light text-black mb-6">Book a Free Consultation</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Not sure which service is right for you? Let's talk.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <form onSubmit={handleBookingSubmit} className="p-8 space-y-8">
               {/* No longer need service selection UI here as this form is specifically for free consultations */}
               
              {/* Personal Information */}
              <div>
                <h3 className="text-xl font-medium text-black mb-6">Your Information</h3>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleBookingChange}
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
                      onChange={handleBookingChange}
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
                    onChange={handleBookingChange}
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
                    onChange={handleBookingChange}
                    rows={4}
                    className="border-gray-200 focus:border-black"
                    placeholder="Tell us about your brow goals..."
                  />
                </div>
              </div>
              
              {/* Date & Time Selection */}
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-medium text-black mb-6">Select Date</h3>
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
                  <h3 className="text-xl font-medium text-black mb-6">Select Time</h3>
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


              {/* Submit Button */}
              <div className="pt-6 border-t border-gray-100">
                <Button 
                  type="submit" 
                  className="w-full bg-black hover:bg-gray-800 text-white py-3 text-lg"
                  disabled={!selectedDate || !selectedTime}
                >
                  Confirm Free Consultation
                </Button>
                <p className="text-sm text-gray-500 text-center mt-4">
                  You will receive a confirmation email within 24 hours
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-light text-black mb-6">Contact Us</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Ready to transform your brows? Get in touch with our team to schedule 
              your consultation or ask any questions.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-2xl font-light text-black mb-8">Send us a message</h3>
              
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={contactData.name}
                      onChange={handleContactChange}
                      className="bg-white border-gray-200 focus:border-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={contactData.phone}
                      onChange={handleContactChange}
                      className="bg-white border-gray-200 focus:border-black"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={contactData.email}
                    onChange={handleContactChange}
                    className="bg-white border-gray-200 focus:border-black"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <Textarea
                    name="message"
                    value={contactData.message}
                    onChange={handleContactChange}
                    rows={6}
                    className="bg-white border-gray-200 focus:border-black"
                    placeholder="Tell us about your brow goals or any questions you have..."
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-black hover:bg-gray-800 text-white"
                >
                  Send Message
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-light text-black mb-8">Visit our studio</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="w-6 h-6 text-black flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-medium text-black mb-1">Address</h4>
                      <p className="text-gray-600 leading-relaxed">
                        123 Beauty Lane<br />
                        Downtown District<br />
                        New York, NY 10001
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <Phone className="w-6 h-6 text-black flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-medium text-black mb-1">Phone</h4>
                      <p className="text-gray-600">(555) 123-BROW</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <Mail className="w-6 h-6 text-black flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-medium text-black mb-1">Email</h4>
                      <p className="text-gray-600">hello@brwbar.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <Clock className="w-6 h-6 text-black flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-medium text-black mb-1">Hours</h4>
                      <div className="text-gray-600 space-y-1">
                        <p>Monday - Friday: 9:00 AM - 7:00 PM</p>
                        <p>Saturday: 9:00 AM - 6:00 PM</p>
                        <p>Sunday: 10:00 AM - 5:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map placeholder */}
              <div className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1524813686514-a57563d77965?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80"
                  alt="Studio location"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
