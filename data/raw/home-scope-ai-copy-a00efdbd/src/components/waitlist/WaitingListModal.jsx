
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Mail, Users, Zap } from "lucide-react";
import { EmailSubscriber } from "@/api/entities";
import { User as UserEntity } from "@/api/entities";

export default function WaitingListModal({ isOpen, onClose, preFilledEmail = "", preFilledName = "", isJoiningWithOffer, onSuccess }) {
  const [formData, setFormData] = useState({
    email: preFilledEmail,
    fullName: preFilledName,
    userType: "",
    mostPressingConcern: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: preFilledEmail,
        fullName: preFilledName,
        userType: "",
        mostPressingConcern: ""
      });
      setIsSubmitted(false);
    }
  }, [isOpen, preFilledEmail, preFilledName]);


  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.fullName) {
      alert("Please fill in your name and email address");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create email subscriber for waiting list
      await EmailSubscriber.create({
        email: formData.email,
        full_name: formData.fullName,
        user_type: formData.userType || "unknown",
        subscription_source: "waiting_list",
        most_pressing_concern: formData.mostPressingConcern,
        claimed_launch_offer: isJoiningWithOffer // Set the offer flag
      });

      // Update user profile if logged in
      try {
        const user = await UserEntity.me();
        await UserEntity.updateMyUserData({
          is_on_waiting_list: true,
          waiting_list_joined_date: new Date().toISOString(),
          has_claimed_launch_offer: user.has_claimed_launch_offer || isJoiningWithOffer // Set the offer flag
        });
      } catch (error) {
        // User not logged in, that's okay
      }

      setIsSubmitted(true);
      if (onSuccess) onSuccess(); // Callback to re-fetch offer count
      
      // Close modal after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          email: "",
          fullName: "",
          userType: "",
          mostPressingConcern: ""
        });
        onClose();
      }, 3000);

    } catch (error) {
      console.error("Error joining waiting list:", error);
      alert("There was an error joining the waiting list. Please try again.");
    }

    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">You're on the list!</h2>
            <p className="text-gray-600 mb-4">
              Thanks for joining our waiting list. You'll be among the first to know when HomeScope launches!
            </p>
            <p className="text-sm text-gray-500">
              We'll send you updates and exclusive early access offers.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-600 text-center">
            {isJoiningWithOffer ? "You're Claiming a Launch Offer!" : "Join the HomeScope Waiting List"}
          </DialogTitle>
          <p className="text-center text-gray-600">
            {isJoiningWithOffer 
              ? "Complete the form below to secure your 50% discount."
              : "Be the first to access expert home consultations when we launch"
            }
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Benefits */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-green-800 mb-4">What you'll get as an early member:</h3>
              <div className="space-y-2">
                <div className="flex items-center text-green-700">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  <span className="text-sm">First access when we launch</span>
                </div>
                <div className="flex items-center text-green-700">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  <span className="text-sm">Exclusive launch pricing (50% off first consultation)</span>
                </div>
                <div className="flex items-center text-green-700">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  <span className="text-sm">Free Home Safety Guide</span>
                </div>
                <div className="flex items-center text-green-700">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  <span className="text-sm">Weekly home maintenance tips</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <Label>Email Address *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <Label>Are you a tenant, homeowner, or landlord?</Label>
              <select
                value={formData.userType}
                onChange={(e) => handleInputChange('userType', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select one (optional)</option>
                <option value="tenant">Tenant</option>
                <option value="homeowner">Homeowner</option>
                <option value="landlord">Landlord</option>
              </select>
            </div>

            <div>
              <Label>What's your most pressing home concern? (optional)</Label>
              <Textarea
                value={formData.mostPressingConcern}
                onChange={(e) => handleInputChange('mostPressingConcern', e.target.value)}
                placeholder="e.g., damp issues, heating problems, tenant rights questions..."
                className="h-24"
              />
            </div>

            <Button 
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 py-3 text-lg font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Mail className="w-4 h-4 mr-2 animate-pulse" />
                  Joining...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  {isJoiningWithOffer ? "Claim My Spot" : "Join the Waiting List"}
                </>
              )}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">
              We'll never spam you. Unsubscribe anytime.
            </p>
            <div className="flex items-center justify-center text-xs text-gray-400">
              <Zap className="w-3 h-3 mr-1" />
              Expected launch: Early 2025
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
