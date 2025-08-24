
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const metalOptions = {
  yellow_gold: {
    name: "Yellow Gold",
    description: "Classic warm golden hue, timeless and luxurious",
    price: 180,
    gradient: "from-yellow-400 to-yellow-600"
  },
  white_gold: {
    name: "White Gold",
    description: "Modern and elegant with a bright, silvery finish",
    price: 190,
    gradient: "from-gray-200 to-gray-400"
  },
  rose_gold: {
    name: "Rose Gold",
    description: "Romantic pinkish hue, contemporary and feminine",
    price: 185,
    gradient: "from-rose-300 to-rose-500"
  },
  platinum: {
    name: "Platinum",
    description: "Premium white metal, hypoallergenic and durable",
    price: 320,
    gradient: "from-slate-300 to-slate-500"
  },
  sterling_silver: {
    name: "Sterling Silver",
    description: "Affordable bright silver, perfect for everyday wear",
    price: 85,
    gradient: "from-gray-100 to-gray-300"
  },
  titanium: {
    name: "Titanium",
    description: "Ultra-lightweight and strong, modern industrial look",
    price: 145,
    gradient: "from-gray-400 to-gray-600"
  },
  gold_plated_stainless_steel: {
    name: "Gold Plated Steel",
    description: "Tarnish-free, hypoallergenic with a rich gold look",
    price: 25,
    gradient: "from-yellow-300 to-yellow-500"
  },
  stainless_steel: {
    name: "Stainless Steel",
    description: "Tarnish-free, hypoallergenic, durable modern finish",
    price: 25,
    gradient: "from-gray-300 to-gray-500"
  }
};

const karatOptions = {
  "10k": "More durable, less gold content (41.7% gold)",
  "14k": "Perfect balance of durability and gold content (58.3% gold)",
  "18k": "High gold content, luxurious feel (75% gold)",
  "24k": "Pure gold, maximum luxury (99.9% gold)",
  "925_silver": "92.5% pure silver, standard for sterling silver",
  "pure_platinum": "95% pure platinum, ultimate premium quality"
};

export default function MetalSelector({ 
  selectedMetal, 
  selectedKarat, 
  onMetalChange, 
  onKaratChange 
}) {
  return (
    <Card className="bg-white border-yellow-500/30 shadow-lg">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-black flex items-center gap-2">
          Metal Selection
          <Badge className="bg-yellow-500 text-black font-bold">Premium Materials</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(metalOptions).map(([key, metal]) => (
            <div
              key={key}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                selectedMetal === key
                  ? 'border-yellow-500 bg-yellow-50 shadow-lg'
                  : 'border-gray-200 hover:border-yellow-300 hover:bg-gray-50'
              }`}
              onClick={() => onMetalChange(key)}
            >
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${metal.gradient} mb-3 shadow-lg border border-gray-200`} />
              <h4 className="font-semibold text-black mb-1">{metal.name}</h4>
              <p className="text-xs text-gray-600 mb-2 leading-tight">{metal.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-yellow-600 font-bold">${metal.price}</span>
                {selectedMetal === key && (
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedMetal && (
          <div className="space-y-3">
            <h4 className="text-black font-semibold">Purity Level</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(karatOptions).map(([karat, description]) => {
                const isApplicable = 
                  (['yellow_gold', 'white_gold', 'rose_gold'].includes(selectedMetal) && karat.includes('k')) ||
                  (selectedMetal === 'sterling_silver' && karat === '925_silver') ||
                  (selectedMetal === 'platinum' && karat === 'pure_platinum');

                if (!isApplicable) return null;

                return (
                  <div
                    key={karat}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 ${
                      selectedKarat === karat
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-yellow-300 hover:bg-gray-50'
                    }`}
                    onClick={() => onKaratChange(karat)}
                  >
                    <div className="font-semibold text-black">{karat.replace('_', ' ').toUpperCase()}</div>
                    <div className="text-xs text-gray-600 mt-1">{description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
