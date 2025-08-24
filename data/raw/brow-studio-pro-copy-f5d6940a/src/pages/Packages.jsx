import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Packages() {
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

  return (
    <div className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-light text-black mb-6">Treatment Packages</h1>
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

                <Link to={createPageUrl("Booking")}>
                  <Button 
                    className={`w-full ${
                      pkg.popular 
                        ? 'bg-black hover:bg-gray-800 text-white' 
                        : 'bg-white hover:bg-gray-50 text-black border border-gray-200'
                    }`}
                  >
                    Select Package
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gray-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-light text-black mb-4">
              Custom Packages Available
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Need something tailored to your specific needs? We can create a custom package 
              that combines any of our services at special rates.
            </p>
            <Link to={createPageUrl("Contact")}>
              <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                Request Custom Package
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}