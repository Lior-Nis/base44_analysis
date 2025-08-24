import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard } from "lucide-react";

export default function CheckoutForm({ onCheckout, isProcessing, total }) {
  const [shippingData, setShippingData] = useState({
    street: "",
    city: "",
    state: "",
    zip: ""
  });

  const handleInputChange = (field, value) => {
    setShippingData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCheckout(shippingData);
  };

  const isFormValid = Object.values(shippingData).every(value => value.trim() !== "");

  return (
    <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <CreditCard className="w-5 h-5" />
          Checkout
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Shipping Address</h3>
            
            <div>
              <Label htmlFor="street" className="text-gray-300">Street Address</Label>
              <Input
                id="street"
                value={shippingData.street}
                onChange={(e) => handleInputChange("street", e.target.value)}
                placeholder="123 Main Street"
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="city" className="text-gray-300">City</Label>
                <Input
                  id="city"
                  value={shippingData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="New York"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="state" className="text-gray-300">State</Label>
                <Input
                  id="state"
                  value={shippingData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="NY"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="zip" className="text-gray-300">ZIP Code</Label>
              <Input
                id="zip"
                value={shippingData.zip}
                onChange={(e) => handleInputChange("zip", e.target.value)}
                placeholder="10001"
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white text-lg py-6 font-semibold"
            disabled={isProcessing || !isFormValid}
          >
            {isProcessing ? (
              "Processing Order..."
            ) : (
              `Complete Order - $${total.toFixed(2)}`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}