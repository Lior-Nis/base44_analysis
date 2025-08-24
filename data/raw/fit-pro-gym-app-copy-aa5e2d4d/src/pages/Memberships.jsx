
import React, { useState, useEffect } from "react";
import { Membership } from "@/api/entities";
import { User } from "@/api/entities";
import { CartItem } from "@/api/entities";
import { Product } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, ShoppingCart, Star, Zap, Users, Award } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import ProductSuggestionModal from "../components/memberships/ProductSuggestionModal";
import { motion } from "framer-motion";

const colorSchemes = {
  blue: "from-blue-500 to-blue-600",
  green: "from-green-500 to-green-600",
  purple: "from-purple-500 to-purple-600",
  orange: "from-orange-500 to-orange-600"
};

export default function Memberships() {
  const [memberships, setMemberships] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});
  const [message, setMessage] = useState(null);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [membershipData, userData, productData] = await Promise.all([
      Membership.list("-created_date"),
      User.me().catch(() => null),
      Product.filter({ featured: true }, "-created_date", 3)]
      );

      setMemberships(Array.isArray(membershipData) ? membershipData : []);
      setUser(userData);
      setSuggestedProducts(Array.isArray(productData) ? productData : []);
    } catch (error) {
      console.error("Error loading memberships:", error);
      setMemberships([]);
      setSuggestedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductAdded = (productName) => {
    setMessage({ type: "success", text: `${productName} added to cart!` });
    setTimeout(() => setMessage(null), 3000);
  };

  const addToCart = async (membership) => {
    if (!user) {
      await User.login();
      return;
    }

    setAddingToCart((prev) => ({ ...prev, [membership.id]: true }));
    setMessage(null);

    try {
      const existingItems = await CartItem.filter({
        user_email: user.email,
        item_type: "membership",
        item_id: membership.id
      });

      if (existingItems.length > 0) {
        setMessage({ type: "info", text: "Membership already in your cart!" });
      } else {
        await CartItem.create({
          user_email: user.email,
          item_type: "membership",
          item_id: membership.id,
          item_name: membership.name,
          price: membership.price,
          quantity: 1,
          image_url: null
        });

        setMessage({ type: "success", text: "Membership added to cart!" });
        setShowSuggestionModal(true);
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error adding to cart. Please try again." });
    }

    setAddingToCart((prev) => ({ ...prev, [membership.id]: false }));
    setTimeout(() => setMessage(null), 3000);
  };

  // Sort memberships by price from cheapest to most expensive
  const sortedMemberships = memberships.sort((a, b) => a.price - b.price);

  return (
    <div className="min-h-screen bg-gray-900 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 text-white text-center overflow-hidden">
        {/* Animated Glowing Stripes */}
        <motion.div
          className="absolute top-[15%] h-1 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 shadow-[0_0_20px_#22d3ee]"
          style={{ filter: 'blur(1px)' }}
          initial={{ x: '100vw' }}
          animate={{ x: '-100vw' }}
          transition={{ duration: 10, delay: 0, repeat: Infinity, ease: 'linear' }} />

        <motion.div
          className="absolute top-[25%] h-2 w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-70 shadow-[0_0_30px_#3b82f6]"
          style={{ filter: 'blur(1.5px)' }}
          initial={{ x: '100vw' }}
          animate={{ x: '-100vw' }}
          transition={{ duration: 8, delay: 1, repeat: Infinity, ease: 'linear' }} />

        <motion.div
          className="absolute top-[35%] h-1 w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-60 shadow-[0_0_25px_#facc15]"
          style={{ filter: 'blur(1px)' }}
          initial={{ x: '100vw' }}
          animate={{ x: '-100vw' }}
          transition={{ duration: 12, delay: 0.5, repeat: Infinity, ease: 'linear' }} />

        <motion.div
          className="absolute top-[50%] h-2 w-full bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-70 shadow-[0_0_35px_#22c55e]"
          style={{ filter: 'blur(1.5px)' }}
          initial={{ x: '100vw' }}
          animate={{ x: '-100vw' }}
          transition={{ duration: 9, delay: 2, repeat: Infinity, ease: 'linear' }} />

        <motion.div
          className="absolute top-[60%] h-1 w-full bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-80 shadow-[0_0_30px_#60a5fa]"
          style={{ filter: 'blur(1px)' }}
          initial={{ x: '100vw' }}
          animate={{ x: '-100vw' }}
          transition={{ duration: 7, delay: 1.5, repeat: Infinity, ease: 'linear' }} />

         <motion.div
          className="absolute top-[75%] h-1 w-full bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-60 shadow-[0_0_25px_#2dd4bf]"
          style={{ filter: 'blur(1px)' }}
          initial={{ x: '100vw' }}
          animate={{ x: '-100vw' }}
          transition={{ duration: 11, delay: 2.5, repeat: Infinity, ease: 'linear' }} />

        {/* Core stripes for brightness */}
        <motion.div
          className="absolute top-[25%] h-2 w-full bg-gradient-to-r from-transparent via-blue-300 to-transparent opacity-90"
          initial={{ x: '100vw' }}
          animate={{ x: '-100vw' }}
          transition={{ duration: 8, delay: 1, repeat: Infinity, ease: 'linear' }} />

        <motion.div
          className="absolute top-[50%] h-2 w-full bg-gradient-to-r from-transparent via-green-300 to-transparent opacity-90"
          initial={{ x: '100vw' }}
          animate={{ x: '-100vw' }}
          transition={{ duration: 9, delay: 2, repeat: Infinity, ease: 'linear' }} />


        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h1
            className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}>

                Choose Your Path to Greatness
            </motion.h1>
            <motion.p
            className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}>

                Find the perfect plan that aligns with your fitness goals. 
                Each membership is a step towards a stronger, healthier you.
            </motion.p>
        </div>
      </section>

      {/* Membership Plans */}
      <section className="pt-0 pb-20 bg-gray-900">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {message &&
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Alert className={`max-w-md mx-auto mb-12 border-0 ${
            message.type === "success" ? "bg-green-500/20" :
            message.type === "error" ? "bg-red-500/20" :
            "bg-blue-500/20"}`
            }>
                <AlertDescription className={`text-center ${
              message.type === "success" ? "text-green-300" :
              message.type === "error" ? "text-red-300" :
              "text-blue-300"}`
              }>
                  {message.text}
                </AlertDescription>
              </Alert>
            </motion.div>
          }

          <ProductSuggestionModal
            isOpen={showSuggestionModal}
            onClose={() => setShowSuggestionModal(false)}
            products={suggestedProducts}
            user={user}
            onProductAdded={handleProductAdded} />


          {loading ?
          <div className="flex overflow-x-auto space-x-8 pb-8 -mx-4 px-4">
              {Array(3).fill(0).map((_, i) =>
            <div key={i} className="flex-shrink-0 w-full sm:w-[320px] bg-slate-800/30 rounded-3xl p-8 space-y-6 border border-slate-700/50">
                  <Skeleton className="h-8 w-3/4 bg-slate-700" />
                  <Skeleton className="h-12 w-1/2 bg-slate-700" />
                  <Skeleton className="h-4 w-full bg-slate-700" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full bg-slate-700" />
                    <Skeleton className="h-4 w-full bg-slate-700" />
                    <Skeleton className="h-4 w-5/6 bg-slate-700" />
                  </div>
                  <Skeleton className="h-12 w-full bg-slate-700" />
                </div>
            )}
            </div> :

          <div className="flex overflow-x-auto space-x-8 pb-8 -mx-4 px-4">
              {sortedMemberships.map((membership, index) =>
            <motion.div
              key={membership.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`flex-shrink-0 w-full sm:w-[320px] bg-slate-800/30 relative backdrop-blur-xl border rounded-3xl p-8 hover:bg-slate-800/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
              membership.popular ?
              'border-blue-500/50 ring-2 ring-blue-500/20' :
              'border-slate-700/50'}`
              }>

                  {membership.popular &&
              <Badge className="bg-gradient-to-r text-white mt-10 mb-4 ml-8 px-1 text-xs font-semibold inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-primary/80 absolute top-6 right-6 from-blue-500 to-blue-600 border-0 shadow-lg">
                      <Crown className="w-4 h-4 mr-1" />
                      Most Popular
                    </Badge>
              }

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">{membership.name}</h3>
                    <div className="mb-4">
                      <span className="text-5xl font-bold text-white">${membership.price}</span>
                      <span className="text-lg text-gray-400 ml-2">/month</span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {membership.description}
                    </p>
                  </div>

                  <div className="space-y-4 mb-8">
                    {membership.features?.map((feature, featureIndex) =>
                <div key={featureIndex} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                )}
                  </div>

                  <Button
                onClick={() => addToCart(membership)}
                disabled={addingToCart[membership.id]}
                className={`w-full bg-gradient-to-r ${colorSchemes[membership.color_scheme] || colorSchemes.blue} hover:shadow-lg hover:shadow-blue-500/25 text-white font-semibold py-3 transition-all duration-300`}>

                    {addingToCart[membership.id] ?
                <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div> :

                <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Choose {membership.name}
                      </>
                }
                  </Button>
                </motion.div>
            )}
            </div>
          }
        </div>
      </section>
    </div>);

}
