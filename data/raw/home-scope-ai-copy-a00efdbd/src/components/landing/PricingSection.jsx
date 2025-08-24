import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { CheckCircle, Star, Clock, Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PricingSection({ onBookClick, launchOfferData }) {
  const { available: isOfferAvailable, remaining: offersRemaining } = launchOfferData;

  const pricingPlans = [
    {
      title: "First-Time Offer",
      price: "£79",
      originalPrice: "£145",
      period: "one-time deal",
      description: "For the first 500 members",
      features: [
        "30-minute video consultation",
        "Licensed UK expert",
        "Detailed PDF summary",
        "Available 7 days a week"
      ],
      cta: "Claim Your Deal",
      highlight: true,
      badge: "Most Popular",
      isOffer: true,
    },
    {
      title: "Standard Consultation",
      price: "£123",
      period: "per consultation",
      description: "On-demand expert video inspections",
      features: [
        "30-minute video consultation",
        "Licensed UK expert",
        "Detailed PDF summary",
        "Priority booking",
        "Same-day availability"
      ],
      cta: "Book Now",
      isOffer: false,
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            No hidden fees, no surprises. Choose the plan that works best for your home needs.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
          {pricingPlans.map((plan, index) => {
            const isTheOfferPlan = plan.isOffer;
            const offerIsSoldOut = isTheOfferPlan && !isOfferAvailable;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="flex"
              >
                <Card className={`relative flex flex-col w-full ${
                  plan.highlight && !offerIsSoldOut
                    ? 'border-green-500 border-2 shadow-lg transform lg:scale-105'
                    : 'border-gray-200 hover:shadow-lg transition-shadow'
                } ${offerIsSoldOut ? 'bg-gray-50' : ''}`}>
                  {plan.badge && !offerIsSoldOut && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-yellow-400 text-gray-900 px-4 py-1 font-semibold">
                        <Star className="w-4 h-4 mr-1" />
                        {plan.badge}
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.title}
                    </CardTitle>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <span className={`text-4xl font-bold ${offerIsSoldOut ? 'text-gray-500' : 'text-green-600'}`}>{plan.price}</span>
                        {plan.originalPrice && (
                          <span className={`text-2xl ${offerIsSoldOut ? 'text-gray-400' : 'text-gray-400'} line-through`}>{plan.originalPrice}</span>
                        )}
                      </div>
                      <p className="text-gray-500">{plan.period}</p>
                      <p className="text-gray-600 text-sm mt-4 h-12">
                        <span className="font-bold text-gray-800">{plan.description}</span>
                        {isTheOfferPlan && isOfferAvailable && offersRemaining <= 500 && (
                          <span className="block text-green-600 text-xs italic animate-pulse mt-1">
                            Only {offersRemaining} spots left!
                          </span>
                        )}
                        {offerIsSoldOut && (
                           <span className="block text-red-600 font-medium">
                             Offer fully claimed!
                           </span>
                        )}
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6 flex-grow flex flex-col justify-between">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-3">
                          <CheckCircle className={`w-5 h-5 ${offerIsSoldOut ? 'text-gray-400' : 'text-green-500'} flex-shrink-0`} />
                          <span className={` ${offerIsSoldOut ? 'text-gray-500' : 'text-gray-700'}`}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button
                      onClick={() => onBookClick(plan.isOffer)}
                      className={`w-full font-semibold py-3 group ${
                        plan.highlight && !offerIsSoldOut
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-gray-900 hover:bg-gray-800 text-white'
                      }`}
                      size="lg"
                      disabled={offerIsSoldOut}
                    >
                      {offerIsSoldOut ? 'Offer Ended' : plan.cta}
                      {!offerIsSoldOut && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-12 space-y-4"
        >
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2 text-green-500" />
              Money-back guarantee
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-green-500" />
              No long-term contracts
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Cancel anytime
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}