
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowRight, X } from "lucide-react";
import { User } from "@/api/entities";
import { CartItem } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const ProductCard = ({ product, user, onProductAdded }) => {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      await User.login();
      return;
    }
    setIsAdding(true);
    try {
      const existingItems = await CartItem.filter({ 
        user_email: user.email, 
        item_type: "product",
        item_id: product.id 
      });

      if (existingItems.length > 0) {
        const item = existingItems[0];
        await CartItem.update(item.id, { quantity: item.quantity + 1 });
      } else {
        await CartItem.create({
          user_email: user.email,
          item_type: "product",
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          quantity: 1,
          image_url: product.image_url
        });
      }
      onProductAdded(product.name);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
    setIsAdding(false);
  };

  return (
    <Card className="group overflow-hidden bg-white/10 backdrop-blur-lg border border-white/10 shadow-md hover:border-white/20 transition-all duration-300 text-white">
      <div className="relative aspect-square overflow-hidden bg-gray-900/50">
        <img
          src={product.image_url || `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80`}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold line-clamp-1">{product.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xl font-bold">${product.price}</span>
          <Button size="icon" className="bg-blue-500 hover:bg-blue-600 rounded-full w-9 h-9" onClick={handleAddToCart} disabled={isAdding}>
            {isAdding ? "..." : <ShoppingCart className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function ProductSuggestionModal({ isOpen, onClose, products, user, onProductAdded }) {
  if (!products || products.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl bg-gray-900/80 backdrop-blur-2xl border-2 border-white/10 text-white rounded-3xl shadow-2xl">
        <DialogHeader className="text-center pt-4">
          <DialogTitle className="text-3xl font-bold">
            Complete Your Setup
          </DialogTitle>
          <DialogDescription className="text-gray-300 pt-2">
            Members who bought this plan also love these items.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} user={user} onProductAdded={onProductAdded} />
          ))}
        </div>
        <div className="flex justify-center items-center gap-4 pb-4">
          <Button variant="ghost" onClick={onClose} className="hover:bg-white/10 hover:text-white">
            No, Thanks
          </Button>
          <Link to={createPageUrl("Cart")}>
            <Button className="bg-green-600 hover:bg-green-700 font-semibold text-white">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Go to Cart
            </Button>
          </Link>
          <Link to={createPageUrl("Shop")}>
            <Button className="bg-blue-600 hover:bg-blue-700 font-semibold">
              Explore Full Store <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        <Button size="icon" variant="ghost" className="absolute top-4 right-4 rounded-full w-8 h-8 hover:bg-white/10" onClick={onClose}>
          <X className="w-4 h-4"/>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
