import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CartItem } from "@/api/entities";
import { User } from "@/api/entities";
import { Order } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Minus, Plus, Trash2, ArrowLeft, CreditCard } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";

import CartItemCard from "../components/cart/CartItemCard";
import CheckoutForm from "../components/cart/CheckoutForm";

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [checkingOut, setCheckingOut] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      const items = await CartItem.filter({ user_email: userData.email });
      setCartItems(items);
    } catch (error) {
      console.error("Error loading cart:", error);
      navigate(createPageUrl("Home"));
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(prev => ({ ...prev, [itemId]: true }));
    
    try {
      await CartItem.update(itemId, { quantity: newQuantity });
      setCartItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      setMessage({ type: "error", text: "Error updating quantity" });
    }
    
    setUpdating(prev => ({ ...prev, [itemId]: false }));
  };

  const removeItem = async (itemId) => {
    setUpdating(prev => ({ ...prev, [itemId]: true }));
    
    try {
      await CartItem.delete(itemId);
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      setMessage({ type: "success", text: "Item removed from cart" });
    } catch (error) {
      setMessage({ type: "error", text: "Error removing item" });
    }
    
    setUpdating(prev => ({ ...prev, [itemId]: false }));
    setTimeout(() => setMessage(null), 3000);
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = async (shippingData) => {
    setCheckingOut(true);
    setMessage(null);

    try {
      const orderItems = cartItems.map(item => ({
        name: item.item_name,
        type: item.item_type,
        price: item.price,
        quantity: item.quantity
      }));

      await Order.create({
        user_email: user.email,
        total_amount: calculateTotal(),
        items: orderItems,
        shipping_address: shippingData,
        status: "pending"
      });

      // Clear cart
      await Promise.all(cartItems.map(item => CartItem.delete(item.id)));
      
      setMessage({ type: "success", text: "Order placed successfully! You will receive a confirmation email shortly." });
      setCartItems([]);
      
      // Redirect after success
      setTimeout(() => {
        navigate(createPageUrl("Home"));
      }, 3000);
      
    } catch (error) {
      setMessage({ type: "error", text: "Error placing order. Please try again." });
    }
    
    setCheckingOut(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading cart...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-green-900/10"></div>
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-white/10 text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Your Cart
          </h1>
        </motion.div>

        {message && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Alert className={`mb-8 border-0 ${
              message.type === "success" ? "bg-green-500/20" :
              "bg-red-500/20"
            }`}>
              <AlertDescription className={`text-center ${
                message.type === "success" ? "text-green-300" : "text-red-300"
              }`}>
                {message.text}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="text-center p-12 bg-white/5 backdrop-blur-lg border border-white/10">
              <CardContent>
                <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Your cart is empty
                </h2>
                <p className="text-gray-400 mb-6">
                  Start shopping to add items to your cart
                </p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={() => navigate(createPageUrl("Memberships"))}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Browse Memberships
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(createPageUrl("Shop"))}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Shop Products
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <ShoppingBag className="w-5 h-5" />
                    Cart Items ({cartItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <CartItemCard
                        item={item}
                        updating={updating[item.id]}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeItem}
                      />
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Checkout Section */}
            <div className="space-y-6">
              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-300">
                        <span>Subtotal</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-300">
                        <span>Shipping</span>
                        <span className="text-green-400">Free</span>
                      </div>
                      <Separator className="bg-white/10" />
                      <div className="flex justify-between font-semibold text-lg text-white">
                        <span>Total</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Checkout Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <CheckoutForm
                  onCheckout={handleCheckout}
                  isProcessing={checkingOut}
                  total={calculateTotal()}
                />
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}