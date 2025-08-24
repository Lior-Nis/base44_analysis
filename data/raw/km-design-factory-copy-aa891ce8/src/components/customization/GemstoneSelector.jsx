import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const gemstoneOptions = {
  none: {
    name: "No Gemstone",
    description: "Focus on the metal and design beauty",
    price: 0,
    color: "text-gray-400",
    bg: "bg-gray-400/20"
  },
  diamond: {
    name: "Diamond",
    description: "The ultimate symbol of luxury, brilliant and timeless",
    price: 450,
    color: "text-blue-100",
    bg: "bg-blue-100/20"
  },
  moissanite: {
    name: "Moissanite",
    description: "Lab-created gem with more fire and brilliance than diamond",
    price: 220,
    color: "text-teal-200",
    bg: "bg-teal-200/20"
  },
  ruby: {
    name: "Ruby",
    description: "Passionate red gem, symbol of love and power",
    price: 320,
    color: "text-red-400",
    bg: "bg-red-400/20"
  },
  sapphire: {
    name: "Sapphire",
    description: "Royal blue stone of wisdom and nobility",
    price: 280,
    color: "text-blue-400",
    bg: "bg-blue-400/20"
  },
  emerald: {
    name: "Emerald",
    description: "Vibrant green gem representing growth and harmony",
    price: 350,
    color: "text-green-400",
    bg: "bg-green-400/20"
  },
  pearl: {
    name: "Pearl",
    description: "Classic elegance from the ocean's depths",
    price: 180,
    color: "text-gray-100",
    bg: "bg-gray-100/20"
  },
  amethyst: {
    name: "Amethyst",
    description: "Purple quartz promoting clarity and peace",
    price: 120,
    color: "text-purple-400",
    bg: "bg-purple-400/20"
  },
  topaz: {
    name: "Topaz",
    description: "Brilliant crystal available in many colors",
    price: 95,
    color: "text-yellow-300",
    bg: "bg-yellow-300/20"
  },
  opal: {
    name: "Opal",
    description: "Mystical stone with rainbow fire within",
    price: 200,
    color: "text-pink-300",
    bg: "bg-pink-300/20"
  },
  garnet: {
    name: "Garnet",
    description: "Deep red stone of commitment and devotion",
    price: 85,
    color: "text-red-300",
    bg: "bg-red-300/20"
  }
};

const sizeOptions = {
  small: { name: "Delicate", description: "2-3mm, subtle accent", multiplier: 0.8 },
  medium: { name: "Classic", description: "4-5mm, perfect balance", multiplier: 1.0 },
  large: { name: "Statement", description: "6-7mm, eye-catching", multiplier: 1.4 },
  extra_large: { name: "Showstopper", description: "8mm+, dramatic presence", multiplier: 1.8 }
};

export default function GemstoneSelector({ 
  selectedGemstone, 
  selectedSize, 
  onGemstoneChange, 
  onSizeChange 
}) {
  const calculatePrice = () => {
    if (!selectedGemstone || selectedGemstone === 'none') return 0;
    const basePrice = gemstoneOptions[selectedGemstone]?.price || 0;
    const sizeMultiplier = selectedSize ? sizeOptions[selectedSize].multiplier : 1;
    return Math.round(basePrice * sizeMultiplier);
  };

  return (
    <Card className="bg-white border-yellow-500/30 shadow-lg">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-black flex items-center gap-2">
          Gemstone Selection
          <Badge className="bg-yellow-500 text-black font-bold">Premium Stones</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(gemstoneOptions).map(([key, gem]) => (
            <div
              key={key}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                selectedGemstone === key
                  ? 'border-yellow-500 bg-yellow-50 shadow-lg'
                  : 'border-gray-200 hover:border-yellow-300 hover:bg-gray-50'
              }`}
              onClick={() => onGemstoneChange(key)}
            >
              <div className={`w-12 h-12 rounded-full ${gem.bg} mb-3 flex items-center justify-center shadow-lg border border-gray-200`}>
                <div className={`w-6 h-6 rounded-full ${gem.bg} ${gem.color} font-bold flex items-center justify-center text-xs`}>
                  {gem.name[0]}
                </div>
              </div>
              <h4 className="font-semibold text-black mb-1">{gem.name}</h4>
              <p className="text-xs text-gray-600 mb-2 leading-tight">{gem.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-yellow-600 font-bold">
                  {gem.price === 0 ? 'Free' : `+$${gem.price}`}
                </span>
                {selectedGemstone === key && (
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedGemstone && selectedGemstone !== 'none' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-black font-semibold">Size Selection</h4>
              <Badge className="bg-yellow-500 text-black font-bold">
                Current: +${calculatePrice()}
              </Badge>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(sizeOptions).map(([size, option]) => (
                <div
                  key={size}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 ${
                    selectedSize === size
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-yellow-300 hover:bg-gray-50'
                  }`}
                  onClick={() => onSizeChange(size)}
                >
                  <div className="font-semibold text-black text-sm">{option.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{option.description}</div>
                  <div className="text-xs text-yellow-600 mt-1 font-medium">
                    {option.multiplier}x price
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}