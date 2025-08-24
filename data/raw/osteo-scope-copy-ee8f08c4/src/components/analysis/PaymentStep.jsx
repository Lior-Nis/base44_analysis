import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Smartphone, Copy, Check, QrCode } from "lucide-react";

export default function PaymentStep({ onPaymentClaimed, isProcessing, qrCodeUrl }) {
  const [copied, setCopied] = useState(false);
  const upiId = "akr.karunanithi@okhdfcbank";

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-slate-900 flex items-center justify-center gap-2">
          <CreditCard className="w-7 h-7 text-blue-600" />
          Pay ₹199 to Start Analysis
        </CardTitle>
        <CardDescription>Secure payment required before AI analysis begins</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code */}
        <div className="text-center">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center justify-center gap-2">
            <QrCode className="w-5 h-5 text-blue-600" />
            Scan QR Code to Pay
          </h3>
          {qrCodeUrl ? (
            <div className="inline-block p-4 bg-white rounded-xl shadow-lg border border-slate-200">
              <img src={qrCodeUrl} alt="UPI QR Code for ₹199" className="w-56 h-56 mx-auto"/>
              <p className="text-xs text-slate-500 mt-2">Amount: ₹199</p>
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertDescription>UPI QR code missing — please contact support.</AlertDescription>
            </Alert>
          )}
        </div>

        {/* UPI ID */}
        <div className="text-center space-y-3">
           <p className="text-sm font-medium text-slate-700">Or pay using UPI ID:</p>
           <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 max-w-sm mx-auto">
             <span className="font-mono text-slate-800 text-sm select-all">{upiId}</span>
             <Button variant="ghost" size="sm" onClick={handleCopy} className="ml-3">
               {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
               {copied ? 'Copied!' : 'Copy'}
             </Button>
           </div>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start gap-4">
            <Smartphone className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Payment Instructions</h4>
              <ol className="text-sm text-slate-700 space-y-1">
                <li>1. Open any UPI app (GPay, PhonePe, Paytm, etc.)</li>
                <li>2. Scan the QR code OR enter the UPI ID manually</li>
                <li>3. Confirm payment of ₹199</li>
                <li>4. Click "I Have Paid" below after successful payment</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={onPaymentClaimed}
            disabled={isProcessing}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
          >
            {isProcessing ? "Submitting..." : "I Have Paid ₹199"}
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
        </div>

        {/* Security Notice */}
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertDescription className="text-yellow-800 text-xs">
            <strong>Note:</strong> Payment verification is manual. Analysis will start only after admin confirmation. 
            You will be notified once payment is verified.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}