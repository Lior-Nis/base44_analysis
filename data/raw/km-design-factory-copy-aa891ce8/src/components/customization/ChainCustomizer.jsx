
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

const chainStyles = {
  cable: {
    name: "Cable Chain",
    description: "Classic round or oval links, timeless and versatile",
    price: 45,
    pattern: "○-○-○-○"
  },
  curb: {
    name: "Curb Chain",
    description: "Interlocking links laid flat, modern and sleek",
    price: 55,
    pattern: "◇-◇-◇-◇"
  },
  figaro: {
    name: "Figaro Chain",
    description: "Alternating long and short links, Italian elegance",
    price: 65,
    pattern: "○-◇-○-◇"
  },
  rope: {
    name: "Rope Chain",
    description: "Twisted design resembling rope, textured luxury",
    price: 75,
    pattern: "∞-∞-∞-∞"
  },
  box: {
    name: "Box Chain",
    description: "Square links creating smooth texture, contemporary",
    price: 50,
    pattern: "□-□-□-□"
  },
  snake: {
    name: "Snake Chain",
    description: "Smooth, flexible design that flows like liquid metal",
    price: 70,
    pattern: "~~~"
  },
  wheat: {
    name: "Wheat Chain",
    description: "Braided pattern resembling wheat, sophisticated",
    price: 80,
    pattern: "≈≈≈≈"
  },
  byzantine: {
    name: "Byzantine Chain",
    description: "Complex interwoven pattern, ultimate luxury",
    price: 95,
    pattern: "∝-∝-∝"
  }
};

const thicknessOptions = {
  delicate: { name: "Delicate", description: "1-2mm, subtle elegance", multiplier: 0.8 },
  medium: { name: "Medium", description: "3-4mm, perfect balance", multiplier: 1.0 },
  bold: { name: "Bold", description: "5-6mm, confident presence", multiplier: 1.3 },
  statement: { name: "Statement", description: "7mm+, dramatic impact", multiplier: 1.6 }
};

const closureTypes = {
  lobster_clasp: {
    name: "Lobster Clasp",
    description: "Secure spring-loaded mechanism, most popular choice",
    price: 15
  },
  spring_ring: {
    name: "Spring Ring",
    description: "Classic circular clasp, simple and reliable",
    price: 12
  },
  magnetic: {
    name: "Magnetic Clasp",
    description: "Easy-to-use magnetic closure, perfect for all ages",
    price: 25
  },
  toggle: {
    name: "Toggle Clasp",
    description: "Decorative T-bar and ring, adds design element",
    price: 30
  },
  box_clasp: {
    name: "Box Clasp",
    description: "Hidden mechanism for seamless look, premium choice",
    price: 40
  },
  fishhook: {
    name: "Fishhook Clasp",
    description: "Simple hook design, easy one-handed operation",
    price: 18
  }
};

export default function ChainCustomizer({ 
  selectedStyle,
  selectedThickness,
  selectedClosure,
  chainLength,
  onStyleChange,
  onThicknessChange,
  onClosureChange,
  onLengthChange
}) {
  const calculateChainPrice = () => {
    const stylePrice = selectedStyle ? chainStyles[selectedStyle].price : 0;
    const thicknessMultiplier = selectedThickness ? thicknessOptions[selectedThickness].multiplier : 1;
    const closurePrice = selectedClosure ? closureTypes[selectedClosure].price : 0;
    const lengthMultiplier = chainLength ? chainLength / 18 : 1; // 18" as base
    
    return Math.round((stylePrice * thicknessMultiplier * lengthMultiplier) + closurePrice);
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          Chain Customization
          <Badge className="bg-blue-500/20 text-blue-300">Premium Chains</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chain Style */}
        <div className="space-y-3">
          <h4 className="text-white font-semibold">Chain Style</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(chainStyles).map(([key, style]) => (
              <div
                key={key}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                  selectedStyle === key
                    ? 'border-blue-400 bg-blue-400/10'
                    : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                }`}
                onClick={() => onStyleChange(key)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-semibold text-white">{style.name}</h5>
                  <span className="text-blue-400 font-bold text-sm">Included</span>
                </div>
                <p className="text-xs text-gray-300 mb-2">{style.description}</p>
                <div className="text-yellow-400 font-mono text-sm">{style.pattern}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Chain Length */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-white font-semibold">Chain Length</h4>
            <Badge className="bg-blue-500/20 text-blue-300">
              {chainLength || 18}"
            </Badge>
          </div>
          <div className="px-2">
            <Slider
              value={[chainLength || 18]}
              onValueChange={(value) => onLengthChange(value[0])}
              max={32}
              min={6}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>6" (Bracelet)</span>
              <span>18" (Necklace)</span>
              <span>32" (Long)</span>
            </div>
          </div>
        </div>

        {/* Chain Thickness */}
        <div className="space-y-3">
          <h4 className="text-white font-semibold">Chain Thickness</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {Object.entries(thicknessOptions).map(([key, option]) => (
              <div
                key={key}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 ${
                  selectedThickness === key
                    ? 'border-blue-400 bg-blue-400/10'
                    : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                }`}
                onClick={() => onThicknessChange(key)}
              >
                <div className="font-semibold text-white text-sm">{option.name}</div>
                <div className="text-xs text-gray-300 mt-1">{option.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Closure Type */}
        <div className="space-y-3">
          <h4 className="text-white font-semibold">Closure Type</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(closureTypes).map(([key, closure]) => (
              <div
                key={key}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 ${
                  selectedClosure === key
                    ? 'border-blue-400 bg-blue-400/10'
                    : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                }`}
                onClick={() => onClosureChange(key)}
              >
                <div className="flex justify-between items-start">
                  <h5 className="font-semibold text-white text-sm">{closure.name}</h5>
                  <span className="text-blue-400 font-bold text-xs">Included</span>
                </div>
                <p className="text-xs text-gray-300 mt-1">{closure.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-white/20">
          <div className="flex justify-between items-center">
            <span className="text-white font-semibold">Chain Total:</span>
            <span className="text-blue-400 font-bold text-lg">Included</span>
          </div>
          <p className="text-gray-300 text-xs mt-1">No additional cost with steel metals</p>
        </div>
      </CardContent>
    </Card>
  );
}
