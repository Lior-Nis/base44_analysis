import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { 
  Star, 
  Heart, 
  ShoppingCart,
  Clock,
  ChefHat
} from "lucide-react";

export default function ProductCard({ product, index, viewMode = "grid" }) {
  const isGridView = viewMode === "grid";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Card className={`group overflow-hidden hover:shadow-2xl transition-all duration-500 border-pink-100 bg-white/80 backdrop-blur-sm ${
        isGridView ? "" : "flex flex-row"
      }`}>
        <div className={`relative overflow-hidden ${isGridView ? "" : "w-64 flex-shrink-0"}`}>
          <img
            src={product.images?.[0] || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400"}
            alt={product.name}
            className={`object-cover group-hover:scale-110 transition-transform duration-500 ${
              isGridView ? "w-full h-64" : "w-full h-full"
            }`}
          />
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.is_featured && (
              <Badge className="bg-gradient-to-r from-pink-500 to-amber-500 text-white">
                <Star className="w-3 h-3 mr-1" />
                Destaque
              </Badge>
            )}
            {product.is_promotion && (
              <Badge className="bg-red-500 text-white">
                Promoção
              </Badge>
            )}
            {product.customizable && (
              <Badge variant="outline" className="bg-white/90 border-purple-200 text-purple-700">
                <ChefHat className="w-3 h-3 mr-1" />
                Personalizável
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-white/80 hover:bg-white hover:text-pink-500"
          >
            <Heart className="w-5 h-5" />
          </Button>
        </div>
        
        <CardContent className={`p-6 ${isGridView ? "" : "flex-1"}`}>
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-xl text-gray-800 group-hover:text-pink-600 transition-colors">
              {product.name}
            </h3>
            <Badge variant="outline" className="text-xs ml-2">
              {product.category}
            </Badge>
          </div>
          
          <p className="text-gray-600 mb-4 line-clamp-2">
            {product.short_description || product.description}
          </p>

          {product.preparation_time && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
              <Clock className="w-4 h-4" />
              <span>Preparo: {product.preparation_time}h</span>
            </div>
          )}

          {product.ingredients && product.ingredients.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Ingredientes principais:</p>
              <div className="flex flex-wrap gap-1">
                {product.ingredients.slice(0, 3).map((ingredient, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {ingredient}
                  </Badge>
                ))}
                {product.ingredients.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{product.ingredients.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <div className={`flex items-center justify-between ${isGridView ? "" : "mt-auto"}`}>
            <div className="flex flex-col">
              {product.is_promotion ? (
                <>
                  <span className="text-sm text-gray-500 line-through">
                    R$ {product.price?.toFixed(2)}
                  </span>
                  <span className="text-2xl font-bold text-pink-600">
                    R$ {product.promotion_price?.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-bold text-pink-600">
                  R$ {product.price?.toFixed(2)}
                </span>
              )}
              {product.variations && product.variations.length > 0 && (
                <span className="text-xs text-gray-500">
                  A partir de
                </span>
              )}
            </div>
            
            <Link to={createPageUrl(`ProductDetails?id=${product.id}`)}>
              <Button className="bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white rounded-full px-6">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Ver Detalhes
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}