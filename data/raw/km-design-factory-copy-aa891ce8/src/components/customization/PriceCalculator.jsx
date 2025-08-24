
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const metalPrices = {
  yellow_gold: 180, white_gold: 190, rose_gold: 185,
  platinum: 320, sterling_silver: 85, titanium: 145,
  gold_plated_stainless_steel: 25, stainless_steel: 25
};

const gemstonePrices = {
  diamond: 450, ruby: 320, sapphire: 280, emerald: 350,
  pearl: 180, amethyst: 120, topaz: 95, opal: 200, garnet: 85, none: 0,
  moissanite: 220
};

const chainPrices = {
  cable: 45, curb: 55, figaro: 65, rope: 75,
  box: 50, snake: 70, wheat: 80, byzantine: 95
};

const jewelryTypePrices = {
  necklace: 80, pendant: 60, ring: 120,
  earrings: 140, bracelet: 90, brooch: 110, cufflinks: 160
};

const sizeMultipliers = {
  small: 0.8, medium: 1.0, large: 1.4, extra_large: 1.8
};

const thicknessMultipliers = {
  delicate: 0.8, medium: 1.0, bold: 1.3, statement: 1.6
};

const closurePrices = {
  lobster_clasp: 15, spring_ring: 12, magnetic: 25,
  toggle: 30, box_clasp: 40, fishhook: 18
};

export default function PriceCalculator({ design }) {
  const calculateUnitPrice = () => {
    let total = 0;
    const isSteelMetal = design.metal_type === 'gold_plated_stainless_steel' || design.metal_type === 'stainless_steel';

    // Metal cost
    if (design.metal_type) {
      total += metalPrices[design.metal_type] || 0;
    }

    // Jewelry types cost with pendant discount and steel discounts
    if (design.jewelry_types && design.jewelry_types.length > 0) {
      const hasNecklaceAndPendant = design.jewelry_types.includes('necklace') && design.jewelry_types.includes('pendant');
      
      design.jewelry_types.forEach(type => {
        let typePrice = jewelryTypePrices[type] || 0;
        
        // Apply 75% discount for steel metals
        if (isSteelMetal) {
          typePrice = Math.round(typePrice * 0.25); // 75% discount = pay 25% of original
        }
        
        // Apply 50% discount to pendant if both necklace and pendant are selected (applies after steel discount)
        if (type === 'pendant' && hasNecklaceAndPendant) {
          typePrice = Math.round(typePrice * 0.5);
        }
        
        total += typePrice;
      });
    }

    // Gemstone cost
    if (design.gemstone_type && design.gemstone_type !== 'none') {
      const baseGemPrice = gemstonePrices[design.gemstone_type] || 0;
      const sizeMultiplier = design.gemstone_size ? sizeMultipliers[design.gemstone_size] : 1;
      total += Math.round(baseGemPrice * sizeMultiplier);
    }

    // Chain cost (if applicable) - only if not steel metal
    const needsChain = design.jewelry_types && (design.jewelry_types.includes('necklace') || design.jewelry_types.includes('bracelet'));
    
    if (needsChain && !isSteelMetal) {
      if (design.chain_style) {
        const chainBase = chainPrices[design.chain_style] || 0;
        const thicknessMultiplier = design.chain_thickness ? thicknessMultipliers[design.chain_thickness] : 1;
        const lengthMultiplier = design.chain_length ? design.chain_length / 18 : 1;
        total += Math.round(chainBase * thicknessMultiplier * lengthMultiplier);
      }

      if (design.closure_type) {
        total += closurePrices[design.closure_type] || 0;
      }
    }

    // Custom design fee - waived for steel
    if (design.logo_image_url && !isSteelMetal) {
      total += 150; // Custom engraving/design fee
    }

    return total;
  };

  const calculateTotalPrice = () => {
    const unitPrice = calculateUnitPrice();
    const quantity = design.quantity || 1;
    let total = unitPrice * quantity;
    
    // Apply bulk discount for orders of 25 or more
    if (quantity >= 25) {
      const discountRate = quantity >= 100 ? 0.35 : quantity >= 50 ? 0.30 : 0.25;
      total = total * (1 - discountRate);
    }
    
    return Math.round(total);
  };

  const getBulkDiscount = () => {
    const quantity = design.quantity || 1;
    if (quantity >= 100) return { rate: 35, savings: Math.round(calculateUnitPrice() * quantity * 0.35) };
    if (quantity >= 50) return { rate: 30, savings: Math.round(calculateUnitPrice() * quantity * 0.30) };
    if (quantity >= 25) return { rate: 25, savings: Math.round(calculateUnitPrice() * quantity * 0.25) };
    return null;
  };

  const getBreakdown = () => {
    const breakdown = [];
    const isSteelMetal = design.metal_type === 'gold_plated_stainless_steel' || design.metal_type === 'stainless_steel';

    // Jewelry types breakdown
    if (design.jewelry_types && design.jewelry_types.length > 0) {
      const hasNecklaceAndPendant = design.jewelry_types.includes('necklace') && design.jewelry_types.includes('pendant');
      
      design.jewelry_types.forEach(type => {
        let typePrice = jewelryTypePrices[type] || 0;
        let itemName = `${type.replace('_', ' ')} Base`;
        
        // Apply 75% discount for steel metals
        if (isSteelMetal) {
          typePrice = Math.round(typePrice * 0.25);
          itemName += ' (75% Steel Discount)';
        }
        
        // Apply 50% discount to pendant if both necklace and pendant are selected
        if (type === 'pendant' && hasNecklaceAndPendant) {
          typePrice = Math.round(typePrice * 0.5);
          if (isSteelMetal) {
            itemName = itemName.replace('(75% Steel Discount)', '(75% Steel + 50% Bundle Discount)');
          } else {
            itemName += ' (50% Bundle Discount)';
          }
        }
        
        breakdown.push({
          item: itemName,
          price: typePrice
        });
      });
    }

    if (design.metal_type) {
      breakdown.push({
        item: `${design.metal_type.replace('_', ' ')} Metal`,
        price: metalPrices[design.metal_type]
      });
    }

    if (design.gemstone_type && design.gemstone_type !== 'none') {
      const basePrice = gemstonePrices[design.gemstone_type];
      const multiplier = design.gemstone_size ? sizeMultipliers[design.gemstone_size] : 1;
      breakdown.push({
        item: `${design.gemstone_size ? design.gemstone_size.replace('_', ' ') : 'medium'} ${design.gemstone_type}`,
        price: Math.round(basePrice * multiplier)
      });
    }

    // Chain cost breakdown - only if not steel metal
    const needsChain = design.jewelry_types && (design.jewelry_types.includes('necklace') || design.jewelry_types.includes('bracelet'));
    
    if (needsChain && !isSteelMetal) {
      if (design.chain_style) {
        const chainBase = chainPrices[design.chain_style] || 0;
        const thicknessMultiplier = design.chain_thickness ? thicknessMultipliers[design.chain_thickness] : 1;
        const lengthMultiplier = design.chain_length ? design.chain_length / 18 : 1;
        breakdown.push({
          item: `${design.chain_thickness ? design.chain_thickness.replace('_', ' ') : ''} ${design.chain_style.replace('_', ' ')} Chain`,
          price: Math.round(chainBase * thicknessMultiplier * lengthMultiplier)
        });
      }

      if (design.closure_type) {
        breakdown.push({
          item: `${design.closure_type.replace('_', ' ')} Closure`,
          price: closurePrices[design.closure_type]
        });
      }
    }

    if (design.logo_image_url && !isSteelMetal) {
      breakdown.push({
        item: 'Custom Design Fee',
        price: 150
      });
    } else if (design.logo_image_url && isSteelMetal) {
      breakdown.push({
        item: 'Custom Design Fee (Waived for Steel)',
        price: 0
      });
    }

    return breakdown;
  };

  const unitPrice = calculateUnitPrice();
  const totalPrice = calculateTotalPrice();
  const quantity = design.quantity || 1;
  const breakdown = getBreakdown();
  const bulkDiscount = getBulkDiscount();

  return (
    <Card className="bg-white border-yellow-500/30 shadow-xl">
      <CardHeader className="bg-black text-white border-b border-yellow-500/30">
        <CardTitle className="flex items-center gap-2">
          Price Estimate
          <Badge className="bg-yellow-500 text-black font-bold">Live Pricing</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6 bg-white">
        {/* Unit Price Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm font-semibold border-b border-gray-200 pb-2">
            <span className="text-gray-800">Unit Price Breakdown:</span>
            <span className="text-yellow-600">${unitPrice}</span>
          </div>
          {breakdown.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
              <span className="text-gray-800 font-medium">{item.item}</span>
              <span className="text-yellow-600 font-bold">${item.price}</span>
            </div>
          ))}
        </div>

        {/* Quantity and Bulk Pricing */}
        {quantity > 1 && (
          <div className="space-y-3 border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-800">Quantity:</span>
              <span className="text-gray-900 font-bold">{quantity} piece{quantity > 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-800">Subtotal:</span>
              <span className="text-gray-900 font-bold">${unitPrice * quantity}</span>
            </div>
            
            {bulkDiscount && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-800 font-medium">Bulk Discount ({bulkDiscount.rate}%):</span>
                  <span className="text-green-600 font-bold">-${bulkDiscount.savings}</span>
                </div>
                <p className="text-xs text-green-700 mt-1">🎉 Great savings on bulk orders!</p>
              </div>
            )}
          </div>
        )}

        {breakdown.length > 0 && (
          <div className="border-t-2 border-yellow-500/30 pt-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span className="text-black">
                {quantity > 1 ? 'Total Estimate:' : 'Unit Price:'}
              </span>
              <span className="text-yellow-600">${totalPrice}</span>
            </div>
            {quantity > 1 && (
              <p className="text-xs text-gray-600 mt-1">
                ${Math.round(totalPrice / quantity)} per piece
              </p>
            )}
          </div>
        )}

        {/* Bulk Pricing Info */}
        {quantity < 25 && (
          <div className="text-xs text-blue-600 italic bg-blue-50 p-3 rounded-lg border border-blue-200">
            💡 Order 25+ pieces for 25% bulk discount, 50+ for 30% off, 100+ for 35% off!
          </div>
        )}

        <div className="text-xs text-gray-600 italic bg-gray-50 p-3 rounded-lg border border-gray-200">
          * Final price may vary based on actual materials, timeframe, and quantity requested
        </div>
      </CardContent>
    </Card>
  );
}
