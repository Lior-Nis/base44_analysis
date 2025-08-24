
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Hash, TrendingUp, Shirt, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ESTIMATION_METHODS = {
  fibonacci_simplified: {
    name: "Fibonacci Simplified",
    description: "1, 2, 3, 5, 8, 13, 21, ?, ☕",
    icon: Hash,
    cards: ["1", "2", "3", "5", "8", "13", "21", "?", "☕"]
  },
  fibonacci: {
    name: "Fibonacci",
    description: "0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?, ☕",
    icon: TrendingUp,
    cards: ["0", "1", "2", "3", "5", "8", "13", "21", "34", "55", "89", "?", "☕"]
  },
  tshirt: {
    name: "T-shirt Sizes",
    description: "XS, S, M, L, XL, XXL, ?, ☕",
    icon: Shirt,
    cards: ["XS", "S", "M", "L", "XL", "XXL", "?", "☕"]
  }
};

export default function EstimationMethodSelector({ currentMethod, onMethodChange, isHost, isMinimized, onToggleMinimize }) {
  if (!isHost) return null;

  return (
    <Card className="glass-effect border-white/10 mb-6">
      <CardHeader className="border-b border-white/10 flex flex-row items-center justify-between cursor-pointer" onClick={onToggleMinimize}>
        <CardTitle className="flex items-center gap-2 text-white">
          <Settings className="w-5 h-5" />
          Estimation Method
        </CardTitle>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${!isMinimized && 'rotate-180'}`} />
      </CardHeader>
      
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }} // Ensure content is clipped during animation
          >
            <CardContent className="p-4">
              <div className="grid gap-3">
                {Object.entries(ESTIMATION_METHODS).map(([key, method]) => {
                  const IconComponent = method.icon;
                  const isSelected = currentMethod === key;
                  
                  return (
                    <button
                      key={key}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent click from propagating to parent CardHeader
                        onMethodChange(key);
                      }}
                      className={`p-4 rounded-lg border text-left transition-all duration-200 ${
                        isSelected
                          ? 'bg-blue-500/20 border-blue-500/40 ring-2 ring-blue-500/30'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isSelected
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/10 text-slate-400'
                        }`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-white">{method.name}</h3>
                            {isSelected && (
                              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                                Active
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-slate-400 mb-2">{method.description}</p>
                          
                          <div className="flex flex-wrap gap-1">
                            {method.cards.slice(0, 6).map((card) => (
                              <span 
                                key={card}
                                className="px-2 py-1 bg-white/10 rounded text-xs text-slate-300 font-mono"
                              >
                                {card}
                              </span>
                            ))}
                            {method.cards.length > 6 && (
                              <span className="px-2 py-1 text-xs text-slate-400">
                                +{method.cards.length - 6} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
