import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Building, Users, Shield, TrendingUp, Handshake, CheckCircle, Mail } from "lucide-react";
import { B2BLead } from "@/api/entities";
import Footer from "@/components/landing/Footer";

const B2BFeatureCard = ({ icon: Icon, title, description }) => (
  <div className="flex items-start space-x-4">
    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
      <Icon className="w-6 h-6 text-green-600" />
    </div>
    <div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600 mt-1">{description}</p>
    </div>
  </div>
);

export default function BusinessPage() {
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    number_of_properties: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await B2BLead.create({
        ...formData,
        number_of_properties: formData.number_of_properties ? parseInt(formData.number_of_properties, 10) : 0,
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to submit B2B lead:", error);
      alert("Submission failed. Please try again.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gray-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
              A Smarter Way to Manage Property Maintenance
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Equip your tenants and team with instant expert access, reduce repair costs, and streamline maintenance requests with HomeScope for Business.
            </p>
            <div className="mt-10">
              <a href="#contact-form">
                <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg font-semibold">
                  Request a Demo
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* "Who It's For" Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Designed for Property Professionals
            </h2>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 shadow-sm">
              <Building className="w-12 h-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-bold">Landlords</h3>
              <p className="text-gray-600 mt-2">Protect your assets and keep tenants happy with proactive maintenance support.</p>
            </Card>
            <Card className="text-center p-8 shadow-sm">
              <Users className="w-12 h-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-bold">Property Managers</h3>
              <p className="text-gray-600 mt-2">Reduce your team's workload and resolve issues faster with our expert network.</p>
            </Card>
            <Card className="text-center p-8 shadow-sm">
              <Handshake className="w-12 h-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-bold">Housing Associations</h3>
              <p className="text-gray-600 mt-2">Provide reliable, scalable support to your residents while managing costs effectively.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Unlock Efficiency and Peace of Mind
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform provides the tools you need to stay ahead of maintenance and compliance.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-12">
            <B2BFeatureCard icon={TrendingUp} title="Reduce Emergency Repair Costs" description="Identify and address issues early with tenant-led AI triage and quick expert validation, preventing small problems from becoming costly emergencies." />
            <B2BFeatureCard icon={Shield} title="Enhance Tenant Satisfaction" description="Offer your tenants a valuable amenity—instant access to experts for their home concerns, improving communication and satisfaction." />
            <B2BFeatureCard icon={Building} title="Streamline Maintenance Workflow" description="Receive clear, expert-verified reports on issues, making it easier to dispatch the right tradesperson for the job, saving time and money." />
            <B2BFeatureCard icon={Users} title="Centralized Dashboard & Reporting" description="Manage all your properties, view consultation histories, and track maintenance trends from a single, easy-to-use dashboard." />
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">Let's Work Together</CardTitle>
              <p className="text-gray-600">Fill out the form below to get a custom quote or schedule a demo.</p>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold">Thank You!</h3>
                  <p className="text-gray-600 mt-2">Our team has received your request and will be in touch shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="contact_name">Your Name</Label>
                      <Input id="contact_name" value={formData.contact_name} onChange={handleInputChange} required />
                    </div>
                    <div>
                      <Label htmlFor="company_name">Company Name</Label>
                      <Input id="company_name" value={formData.company_name} onChange={handleInputChange} required />
                    </div>
                  </div>
                   <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="email">Work Email</Label>
                      <Input id="email" type="email" value={formData.email} onChange={handleInputChange} required />
                    </div>
                     <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" value={formData.phone} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="number_of_properties">Number of Properties (Estimate)</Label>
                    <Input id="number_of_properties" type="number" value={formData.number_of_properties} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="message">How can we help?</Label>
                    <Textarea id="message" value={formData.message} onChange={handleInputChange} placeholder="Tell us about your needs..." />
                  </div>
                  <Button type="submit" size="lg" className="w-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Request Demo'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}