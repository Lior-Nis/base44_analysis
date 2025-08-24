
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Cake, 
  Cookie, 
  Pizza, 
  Cherry, 
  Muffin, // Changed from Cupcake to Muffin
  Star,
  Grid3X3
} from "lucide-react";

const categoryIcons = {
  all: Grid3X3,
  bolos: Cake,
  doces: Cookie,
  salgados: Pizza,
  tortas: Cherry,
  cupcakes: Muffin, // Changed from Cupcake to Muffin
  especiais: Star
};

export default function CategoryFilter({ categories, selectedCategory, onCategoryChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-wrap gap-3 mb-6"
    >
      {categories.map((category) => {
        const Icon = categoryIcons[category.value] || Cookie;
        const isSelected = selectedCategory === category.value;
        
        return (
          <Button
            key={category.value}
            variant={isSelected ? "default" : "outline"}
            onClick={() => onCategoryChange(category.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
              isSelected 
                ? "bg-gradient-to-r from-pink-500 to-amber-500 text-white shadow-lg" 
                : "border-pink-200 hover:border-pink-300 hover:bg-pink-50"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{category.label}</span>
            <Badge 
              variant="secondary" 
              className={`ml-1 ${
                isSelected 
                  ? "bg-white/20 text-white" 
                  : "bg-pink-100 text-pink-600"
              }`}
            >
              {category.count}
            </Badge>
          </Button>
        );
      })}
    </motion.div>
  );
}
