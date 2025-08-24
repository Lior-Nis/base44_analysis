
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Mail, Download, CheckCircle } from "lucide-react";
import { EmailSubscriber } from "@/api/entities";
import { User as UserEntity } from "@/api/entities";
import { SendEmail } from "@/api/integrations";

export default function EmailCaptureSection() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    
    try {
      // Create email subscriber
      await EmailSubscriber.create({
        email,
        full_name: fullName,
        subscription_source: "safety_guide"
      });

      // Update user profile if logged in
      try {
        const user = await UserEntity.me();
        await UserEntity.updateMyUserData({
          has_downloaded_guide: true,
          email_subscription: true
        });
      } catch (error) {
        // User not logged in, that's okay
      }

      // !! ACTION REQUIRED !!
      // Replace the placeholder below with the actual public URL of your uploaded PDF guide.
      const safetyGuideUrl = "https://homescopehq.com/HomeScope_Safety_Guide.pdf"; 

      // Send welcome email with safety guide
      await SendEmail({
        to: email,
        subject: "Your Free Home Safety Guide + Welcome to HomeScope",
        body: `
Hi ${fullName || 'there'}!

Thank you for downloading our Home Safety Guide! 🏠

Here's your comprehensive guide to keeping your home safe and identifying issues early:

📋 **What's Included:**
• Monthly home inspection checklist
• Signs to watch for with plumbing, electrical, and heating
• Your rights as a tenant or homeowner in the UK
• Emergency contact templates
• When to call a professional vs. DIY fixes

**Download your guide here:** ${safetyGuideUrl}

As a HomeScope subscriber, you'll also receive:
✅ Weekly home maintenance tips
✅ Seasonal home care reminders  
✅ Exclusive discounts on expert consultations
✅ Early access to new services

Need immediate help with a home issue? Our AI triage is available 24/7, and you can book expert consultations at homescopehq.com

Questions? Just reply to this email - we're here to help!

Best regards,
The HomeScope Team

P.S. Keep an eye out for our upcoming emails with insider tips on common home issues UK renters and homeowners face.
        `
      });

      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail('');
        setFullName('');
      }, 5000);

    } catch (error) {
      console.error("Error subscribing user:", error);
      alert("There was an error subscribing you. Please try again.");
    }

    setIsSubmitting(false);
  };

  return (
    <section className="py-20 bg-green-500">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Card className="border-none shadow-2xl">
            <CardContent className="p-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Download className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Free Home Safety Guide
              </h2>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Get our comprehensive home safety checklist and learn how to spot common issues before they become expensive problems. Plus, receive monthly tips and subscriber-only discounts!
              </p>

              <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
                <Input
                  type="text"
                  placeholder="Your full name (optional)"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="py-3 text-lg"
                />
                <div className="flex flex-col sm:flex-row gap-4">
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 py-3 text-lg"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg font-semibold whitespace-nowrap"
                    disabled={isSubmitted || isSubmitting}
                  >
                    {isSubmitted ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Sent!
                      </>
                    ) : isSubmitting ? (
                      <>
                        <Mail className="w-5 h-5 mr-2 animate-pulse" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5 mr-2" />
                        Get the Guide
                      </>
                    )}
                  </Button>
                </div>
              </form>

              <p className="text-sm text-gray-500 mt-6">
                We'll also send you inspection tips and subscriber-only discounts. Unsubscribe anytime.
              </p>

              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-green-50 rounded-lg"
                >
                  <p className="text-green-700 font-medium">
                    Thanks! Check your email for the free guide and welcome message.
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
