import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { User as UserEntity } from "@/api/entities";
import { CreditCard, Shield, CheckCircle, Loader2 } from "lucide-react";

export default function PaymentModal({ isOpen, onClose, onPaymentSuccess, price, productName }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    setIsProcessing(true);
    try {
      // ** MOCK PAYMENT LOGIC **
      // In a real implementation, you would call your payment provider here.
      // We simulate a successful payment.
      
      // The parent component now handles all logic after success.
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      onPaymentSuccess();
      
    } catch (error) {
      console.error("Error during mock payment:", error);
      alert("There was an error processing your payment. Please try again.");
      setIsProcessing(false); // Only set to false on error
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-green-600">
            Secure Payment
          </DialogTitle>
          <DialogDescription className="text-center">
            Complete your booking by confirming the payment below.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Card className="border-green-500 border-2 shadow-lg">
            <CardContent className="p-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-gray-900">{productName || "Expert Consultation"}</h3>
                <p className="text-3xl font-bold text-green-600">£{price || '0.00'}</p>
                <p className="text-gray-500 text-sm">One-time payment for your selected time slot.</p>
              </div>
              <ul className="space-y-3 mt-6 mb-6">
                <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Licensed UK expert</span>
                </li>
                <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Detailed PDF summary</span>
                </li>
                 <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Secure video link</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex flex-col space-y-4">
           <Button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="w-full bg-green-600 hover:bg-green-700 py-3 text-lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                Pay £{price || '0.00'} Now
              </>
            )}
          </Button>
          <div className="flex items-center justify-center text-xs text-gray-500">
            <Shield className="w-3 h-3 mr-1" />
            Secure payment processed by Stripe
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}