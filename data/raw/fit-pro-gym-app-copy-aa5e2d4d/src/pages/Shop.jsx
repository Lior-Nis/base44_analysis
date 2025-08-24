
import React, { useState, useEffect } from "react";
import { Product } from "@/api/entities";
import { User } from "@/api/entities";
import { CartItem } from "@/api/entities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Search, Filter, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const categories = [
  { value: "all", label: "All Categories" },
  { value: "equipment", label: "Equipment" },
  { value: "supplements", label: "Supplements" },
  { value: "accessories", label: "Accessories" },
  { value: "apparel", label: "Apparel" }
];

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, sortBy]);

  const loadData = async () => {
    try {
      const [productData, userData] = await Promise.all([
        Product.list("-created_date"),
        User.me().catch(() => null)
      ]);
      
      setProducts(productData);
      setUser(userData);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  };

  const addToCart = async (product) => {
    if (!user) {
      await User.login();
      return;
    }

    setAddingToCart(prev => ({ ...prev, [product.id]: true }));
    setMessage(null);

    try {
      // Check if product already in cart
      const existingItems = await CartItem.filter({ 
        user_email: user.email, 
        item_type: "product",
        item_id: product.id 
      });

      if (existingItems.length > 0) {
        // Update quantity
        const existingItem = existingItems[0];
        await CartItem.update(existingItem.id, {
          quantity: existingItem.quantity + 1
        });
        setMessage({ type: "success", text: "Quantity updated in cart!" });
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
        
        setMessage({ type: "success", text: "Product added to cart!" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error adding to cart. Please try again." });
    }

    setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    
    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Premium Fitness Store
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Discover professional-grade equipment, premium supplements, and accessories 
            to elevate your fitness journey.
          </p>
        </motion.div>

        {message && (
          <Alert className={`max-w-md mx-auto mb-8 border-0 ${
            message.type === "success" ? "bg-green-500/20 text-green-300" :
            "bg-red-500/20 text-red-300"
          }`}>
            <AlertDescription>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-4 mb-8 sticky top-20 z-40">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search products by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array(8).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden border-0 bg-slate-800">
                <Skeleton className="aspect-square w-full bg-slate-700" />
                <div className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2 bg-slate-700" />
                  <Skeleton className="h-5 w-1/2 mb-4 bg-slate-700" />
                  <Skeleton className="h-10 w-full bg-slate-700" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <motion.div 
            layout 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {filteredProducts.map((product) => (
              <motion.div layout key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="group relative overflow-hidden border border-slate-700 rounded-2xl shadow-sm hover:shadow-xl hover:border-slate-600 transition-all duration-300 h-full flex flex-col bg-slate-800">
                  <div className="relative aspect-square overflow-hidden bg-slate-900">
                    <img
                      src={product.image_url || `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4 flex-grow flex flex-col justify-between">
                    <div className="space-y-2">
                      <Badge variant="outline" className="capitalize border-slate-600 text-gray-300">
                        {product.category}
                      </Badge>
                      <h3 className="font-semibold text-lg text-white line-clamp-2">
                        {product.name}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-2xl font-bold text-white">
                        ${product.price}
                      </span>
                      <Button 
                        size="icon"
                        onClick={() => addToCart(product)}
                        disabled={addingToCart[product.id] || (product.stock_quantity === 0)}
                        className="bg-blue-600 hover:bg-blue-700 rounded-full w-10 h-10"
                      >
                        {addingToCart[product.id] ? "..." : <ShoppingCart className="w-5 h-5" />}
                      </Button>
                    </div>
                  </CardContent>
                  {product.stock_quantity === 0 && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-2xl">
                      <Badge variant="destructive" className="text-lg">Out of Stock</Badge>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-24">
            <p className="text-gray-400 text-lg">
              {searchTerm || selectedCategory !== "all" 
                ? "No products found matching your criteria." 
                : "No products available at the moment."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
