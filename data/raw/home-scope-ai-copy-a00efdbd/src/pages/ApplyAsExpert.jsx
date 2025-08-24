
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Send, CheckCircle, Loader2, User as UserIcon, Shield, Star, ArrowLeft } from "lucide-react";
import { ExpertApplication } from "@/api/entities";
import { User as UserEntity } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Footer from "@/components/landing/Footer";

export default function ApplyAsExpert() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    specialty: '',
    other_specialty: '',
    years_experience: '',
    qualifications: '',
    bio: '',
    location: '',
    availability: '',
    why_join: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await UserEntity.me();
        setUser(currentUser);
        setFormData(prev => ({
          ...prev,
          full_name: currentUser.full_name || '',
          email: currentUser.email || '',
          phone: currentUser.phone || ''
        }));
      } catch (e) {
        // Not logged in
      }
    };
    checkUser();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleExperienceChange = (e) => {
    const value = e.target.value;
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
        handleInputChange('years_experience', value);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email || !formData.phone || !formData.specialty || 
        formData.years_experience === '' || !formData.qualifications) {
      setError("Please fill in all required fields marked with *");
      return;
    }

    if (formData.specialty === "Other" && !formData.other_specialty) {
      setError("Please specify your specialty");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Create expert application
      await ExpertApplication.create({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        specialty: formData.specialty === "Other" ? formData.other_specialty : formData.specialty,
        other_specialty: formData.specialty === "Other" ? formData.other_specialty : undefined,
        years_experience: parseInt(formData.years_experience),
        qualifications: formData.qualifications,
        bio: formData.bio,
        location: formData.location,
        availability: formData.availability,
        why_join: formData.why_join
      });

      // If user is logged in, update their profile to indicate they applied as expert
      try {
        const currentUser = await UserEntity.me();
        // Note: We don't set expert_specialty here since that should only be set after approval
        // We could add an "expert_application_submitted" field if needed for tracking
        await UserEntity.updateMyUserData({
          tenant_or_owner: "expert" // This indicates their relationship to property is as an expert
        });
      } catch (error) {
        // User not logged in, that's okay for expert applications
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting application:", error);
      setError("There was an error submitting your application. Please try again.");
    }

    setIsSubmitting(false);
  };
  
  if (user && (user.role === 'expert' || user.role === 'admin')) {
      return (
          <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
               {/* Header is now in Layout.js */}
              <main className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">You're Already Part of the Team!</h1>
                  <p className="text-gray-600 mb-8">
                      Thank you for being a HomeScope expert. You can manage your profile and appointments from your dashboard.
                  </p>
                  <Link to={createPageUrl('Dashboard')}>
                      <Button>Go to Dashboard</Button>
                  </Link>
              </main>
          </div>
      )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        {/* Header is now in Layout.js */}
        <main className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Received!</h1>
            <p className="text-gray-600 mb-8 max-w-lg">
              Thank you for your interest in joining HomeScope. We've received your application and our team will review it. We'll be in touch if your profile matches what we're looking for.
            </p>
            <Link to={createPageUrl('Home')}>
              <Button>Return to Home</Button>
            </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Header section is in Layout.js */}
      <main className="flex-grow py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
              Become a HomeScope Expert
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-xl text-gray-600">
              Join our network of licensed UK professionals and help homeowners and tenants solve
              their problems through flexible, remote video consultations.
            </p>
            <div className="mt-8">
              <Link to={createPageUrl('Home')}>
                <Button variant="outline" className="bg-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Your Application</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name<span className="text-red-500">*</span></label>
                                <Input value={formData.full_name} onChange={(e) => handleInputChange('full_name', e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address<span className="text-red-500">*</span></label>
                                <Input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} required />
                            </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number<span className="text-red-500">*</span></label>
                                <Input value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience<span className="text-red-500">*</span></label>
                                <Input type="text" inputMode="numeric" value={formData.years_experience} onChange={handleExperienceChange} required />
                            </div>
                        </div>
                         <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Specialty<span className="text-red-500">*</span></label>
                                <Select value={formData.specialty} onValueChange={(value) => handleInputChange('specialty', value)} required>
                                    <SelectTrigger><SelectValue placeholder="Select your main expertise" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Plumbing">Plumbing</SelectItem>
                                        <SelectItem value="Electrical">Electrical</SelectItem>
                                        <SelectItem value="Heating & Boiler">Heating & Boiler</SelectItem>
                                        <SelectItem value="Gas Safety">Gas Safety</SelectItem>
                                        <SelectItem value="Property Surveying">Property Surveying</SelectItem>
                                        <SelectItem value="General Maintenance">General Maintenance</SelectItem>
                                        <SelectItem value="Legal Advisory">Legal Advisory (Housing)</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {formData.specialty === 'Other' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Please Specify Other Specialty<span className="text-red-500">*</span></label>
                                    <Input value={formData.other_specialty} onChange={(e) => handleInputChange('other_specialty', e.target.value)} required />
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications & Certifications<span className="text-red-500">*</span></label>
                            <Textarea placeholder="List your professional qualifications, e.g., Gas Safe Registered, NICEIC, RICS..." value={formData.qualifications} onChange={(e) => handleInputChange('qualifications', e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Professional Bio</label>
                            <Textarea placeholder="Tell us about your background and experience." value={formData.bio} onChange={(e) => handleInputChange('bio', e.target.value)} className="h-24" />
                        </div>
                         <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location / Regions Served</label>
                                <Input placeholder="e.g., Greater London, Nationwide" value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                                <Select value={formData.availability} onValueChange={(value) => handleInputChange('availability', value)}>
                                    <SelectTrigger><SelectValue placeholder="Select your availability" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Full-time">Full-time</SelectItem>
                                        <SelectItem value="Part-time">Part-time</SelectItem>
                                        <SelectItem value="Weekends only">Weekends only</SelectItem>
                                        <SelectItem value="Evenings only">Evenings only</SelectItem>
                                        <SelectItem value="Flexible">Flexible</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Why do you want to join HomeScope?</label>
                            <Textarea value={formData.why_join} onChange={(e) => handleInputChange('why_join', e.target.value)} />
                        </div>
                        
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        
                        <div>
                          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 py-3 text-lg font-semibold" disabled={isSubmitting}>
                            {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Submitting...</> : <><Send className="w-5 h-5 mr-2" />Submit Application</>}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                </Card>
            </div>
            <aside className="space-y-8">
                <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                        <CardTitle className="text-green-800">Why Join HomeScope?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start">
                            <Star className="w-5 h-5 text-yellow-500 mr-3 mt-1 flex-shrink-0" />
                            <p className="text-green-700"><span className="font-semibold">Flexible Work.</span> Earn extra income from anywhere, on your own schedule.</p>
                        </div>
                        <div className="flex items-start">
                             <UserIcon className="w-5 h-5 text-yellow-500 mr-3 mt-1 flex-shrink-0" />
                            <p className="text-green-700"><span className="font-semibold">Meaningful Impact.</span> Provide genuine help to people facing stressful home situations.</p>
                        </div>
                        <div className="flex items-start">
                             <Shield className="w-5 h-5 text-yellow-500 mr-3 mt-1 flex-shrink-0" />
                            <p className="text-green-700"><span className="font-semibold">Simple & Supported.</span> We handle the booking, payments, and tech. You just provide your expertise.</p>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>The Process</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ol className="list-decimal list-inside space-y-2 text-gray-600">
                            <li>Submit your application.</li>
                            <li>Our team reviews your qualifications.</li>
                            <li>We'll schedule a brief virtual interview.</li>
                            <li>Complete onboarding & start taking calls!</li>
                        </ol>
                    </CardContent>
                </Card>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
