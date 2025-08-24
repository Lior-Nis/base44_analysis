import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Treatments() {
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

  return (
    <div className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-light text-black mb-6">Our Treatments</h1>
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
                
                <Link to={createPageUrl("Booking")} className="block">
                  <Button className="w-full mt-4 bg-black hover:bg-gray-800 text-white">
                    Book Now
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}