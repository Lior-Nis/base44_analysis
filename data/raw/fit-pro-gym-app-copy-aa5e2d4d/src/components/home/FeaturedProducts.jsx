import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function FeaturedProducts({ products, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {Array(4).fill(0).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] w-full bg-slate-800 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-12 h-12 text-gray-500" />
        </div>
        <p className="text-gray-400 text-lg mb-6">No featured products available.</p>
        <Link to={createPageUrl("Shop")}>
          <Button className="bg-blue-600 hover:bg-blue-700">Browse All Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
          className="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500"
        >
          <img
            src={product.image_url || "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-all duration-500 group-hover:from-black/90 group-hover:via-black/50"></div>
          
          <div className="relative h-full flex flex-col justify-end p-6 text-white">
            <h3 className="text-2xl font-bold mb-2 transition-transform duration-300 ease-out group-hover:-translate-y-20">{product.name}</h3>
            
            <div className="transition-all duration-300 ease-out opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-40 group-hover:-translate-y-8">
              <Badge variant="outline" className="capitalize text-xs font-medium bg-white/10 border-white/20 text-white mb-3">
                {product.category}
              </Badge>
              <p className="text-4xl font-extrabold mb-4">${product.price}</p>
            </div>
            
            <Link to={createPageUrl("Shop")}>
              <Button className="w-full bg-white/90 text-black font-semibold hover:bg-white transition-all duration-300 ease-out translate-y-20 group-hover:translate-y-0">
                Shop Now <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
}