
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const jewelryTypes = {
  necklace: {
    name: "Necklace",
    description: "Classic neck piece, perfect for pendants and charms",
    icon: "○",
    basePrice: 80
  },
  pendant: {
    name: "Pendant",
    description: "Decorative hanging element, showcases your design",
    icon: "◊",
    basePrice: 60
  },
  ring: {
    name: "Ring",
    description: "Finger jewelry, intimate and personal statement",
    icon: "◯",
    basePrice: 120
  },
  earrings: {
    name: "Earrings",
    description: "Pair of ear decorations, doubles the elegance",
    icon: "◐",
    basePrice: 140
  },
  bracelet: {
    name: "Bracelet",
    description: "Wrist accessory, comfortable and stylish",
    icon: "◑",
    basePrice: 90
  },
  brooch: {
    name: "Brooch",
    description: "Pin-style accessory, vintage charm meets modern style",
    icon: "❋",
    basePrice: 110
  },
  cufflinks: {
    name: "Cufflinks",
    description: "Sophisticated shirt accessories, perfect for formal wear",
    icon: "⬚",
    basePrice: 160
  }
};

export default function JewelryTypeSelector({ selectedTypes, onTypeChange, metalType }) {
  const handleTypeToggle = (type) => {
    const currentTypes = selectedTypes || [];
    
    if (currentTypes.includes(type)) {
      // Remove type
      onTypeChange(currentTypes.filter(t => t !== type));
    } else {
      // Add type
      onTypeChange([...currentTypes, type]);
    }
  };

  const getPrice = (type) => {
    const currentTypes = selectedTypes || [];
    let basePrice = jewelryTypes[type].basePrice;
    
    // Apply 75% discount for steel metals
    const isSteelMetal = metalType === 'gold_plated_stainless_steel' || metalType === 'stainless_steel';
    if (isSteelMetal) {
      basePrice = Math.round(basePrice * 0.25); // 75% discount = pay 25% of original
    }
    
    // Apply 50% discount to pendant if both pendant and necklace are selected
    if (type === 'pendant' && currentTypes.includes('necklace') && currentTypes.includes('pendant')) {
      basePrice = Math.round(basePrice * 0.5);
    }
    
    return basePrice;
  };

  const hasBothNecklaceAndPendant = () => {
    const currentTypes = selectedTypes || [];
    return currentTypes.includes('necklace') && currentTypes.includes('pendant');
  };

  const isSteelMetal = metalType === 'gold_plated_stainless_steel' || metalType === 'stainless_steel';

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          Jewelry Type Selection
          {hasBothNecklaceAndPendant() && (
            <Badge className="bg-green-500/20 text-green-300">
              Pendant 50% Off
            </Badge>
          )}
          {isSteelMetal && (
            <Badge className="bg-blue-500/20 text-blue-300">
              Steel 75% Off
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(jewelryTypes).map(([key, type]) => {
            const isSelected = (selectedTypes || []).includes(key);
            const currentPrice = getPrice(key);
            const originalPrice = type.basePrice;
            const hasDiscount = currentPrice < originalPrice;
            
            return (
              <div
                key={key}
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? 'border-yellow-400 bg-yellow-400/10 shadow-lg'
                    : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                }`}
                onClick={() => handleTypeToggle(key)}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2 text-yellow-400">{type.icon}</div>
                  <h4 className="font-semibold text-white mb-1">{type.name}</h4>
                  <p className="text-xs text-gray-300 mb-3 leading-tight">{type.description}</p>
                  
                  <div className="space-y-1">
                    {hasDiscount ? (
                      <div>
                        <div className="text-yellow-400 font-bold">${currentPrice}</div>
                        <div className="text-gray-400 line-through text-sm">${originalPrice}</div>
                        {isSteelMetal && key === 'pendant' && hasBothNecklaceAndPendant() ? (
                          <Badge className="bg-purple-500/20 text-purple-300 text-xs mt-1">
                            87.5% OFF
                          </Badge>
                        ) : isSteelMetal ? (
                          <Badge className="bg-blue-500/20 text-blue-300 text-xs mt-1">
                            75% OFF
                          </Badge>
                        ) : (
                          <Badge className="bg-green-500/20 text-green-300 text-xs mt-1">
                            50% OFF
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="text-yellow-400 font-bold">${currentPrice}</div>
                    )}
                  </div>
                </div>
                
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-black text-xs font-bold">✓</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-gray-300 text-sm">
            💡 Select multiple types to create a complete jewelry set
          </p>
          {hasBothNecklaceAndPendant() && (
            <div className="mt-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-300 text-sm font-medium">
                🎉 Bundle Deal: Get 50% off pendant when ordered with necklace!
              </p>
            </div>
          )}
          {isSteelMetal && (
            <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-300 text-sm font-medium">
                🎉 Steel Special: 75% off all jewelry types with steel metals!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
