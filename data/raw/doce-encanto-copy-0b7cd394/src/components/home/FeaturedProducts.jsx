import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Heart, ShoppingCart } from "lucide-react";

export default function FeaturedProducts({ products, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-64 w-full" />
            <CardContent className="p-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-8 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
        >
          <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-pink-100 bg-white/80 backdrop-blur-sm">
            <div className="relative overflow-hidden">
              <img
                src={product.images?.[0] || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400"}
                alt={product.name}
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 flex gap-2">
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
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-white/80 hover:bg-white hover:text-pink-500"
              >
                <Heart className="w-5 h-5" />
              </Button>
            </div>
            
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-xl text-gray-800 group-hover:text-pink-600 transition-colors">
                  {product.name}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {product.category}
                </Badge>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-2">
                {product.short_description || product.description}
              </p>
              
              <div className="flex items-center justify-between">
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
                </div>
                
                <Link to={createPageUrl(`ProductDetails?id=${product.id}`)}>
                  <Button className="bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white rounded-full px-6">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Ver Mais
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}