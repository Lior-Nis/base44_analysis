import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Copy, ExternalLink, Smartphone, DollarSign } from "lucide-react";

export default function PaymentModal({ open, onClose, course, settings, onConfirm }) {
  if (!course || !settings) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const hasPayPal = settings.paypal_email || settings.paypal_me_link;
  const hasDigitalPayments = settings.zelle_email || settings.venmo_username || settings.cashapp_username;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Complete Your Purchase</DialogTitle>
          <DialogDescription>
            To get access to "{course.title}", please complete the payment using one of the methods below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <p className="text-sm text-slate-600 mb-2">Total amount:</p>
            <p className="font-bold text-3xl text-blue-600">${course.price.toFixed(2)}</p>
          </div>

          <Tabs defaultValue={hasPayPal ? "paypal" : "digital"} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              {hasPayPal && (
                <TabsTrigger value="paypal" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  PayPal
                </TabsTrigger>
              )}
              {hasDigitalPayments && (
                <TabsTrigger value="digital" className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Digital Payments
                </TabsTrigger>
              )}
            </TabsList>

            {hasPayPal && (
              <TabsContent value="paypal">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      PayPal Payment
                    </h3>
                    
                    <div className="space-y-4">
                      {settings.paypal_me_link && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex justify-between items-center mb-2">
                            <p className="font-medium text-blue-800">PayPal.Me Link (Recommended)</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <a 
                              href={settings.paypal_me_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline font-mono text-sm bg-white p-2 rounded border flex-1 block"
                            >
                              {settings.paypal_me_link}
                            </a>
                            <Button size="sm" variant="outline" onClick={() => copyToClipboard(settings.paypal_me_link)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => window.open(settings.paypal_me_link, '_blank')}>
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-blue-600 mt-2">Click the link to pay directly via PayPal</p>
                        </div>
                      )}
                      
                      {settings.paypal_email && (
                        <div className="p-4 bg-slate-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">PayPal Email</p>
                              <p className="font-mono text-sm text-slate-600">{settings.paypal_email}</p>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => copyToClipboard(settings.paypal_email)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">Send money to this email via PayPal</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {hasDigitalPayments && (
              <TabsContent value="digital">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Smartphone className="w-5 h-5" />
                      Digital Payment Options
                    </h3>
                    
                    <div className="space-y-3">
                      {settings.zelle_email && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">Zelle</p>
                              <p className="font-mono text-sm">{settings.zelle_email}</p>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => copyToClipboard(settings.zelle_email)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {settings.venmo_username && (
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">Venmo</p>
                              <p className="font-mono text-sm">{settings.venmo_username}</p>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => copyToClipboard(settings.venmo_username)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {settings.cashapp_username && (
                        <div className="p-4 bg-green-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">Cash App</p>
                              <p className="font-mono text-sm">{settings.cashapp_username}</p>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => copyToClipboard(settings.cashapp_username)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>

          {settings.payment_instructions && (
            <Card>
              <CardContent className="p-6">
                <h4 className="font-medium text-slate-800 mb-2">Payment Instructions:</h4>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">
                  {settings.payment_instructions}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-2">
          <div className="text-xs text-slate-500 flex items-center gap-2 p-3 bg-slate-100 rounded-md">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <span>
              Your access will be granted manually after payment is verified (usually within 24 hours).
            </span>
          </div>
          <div className="flex justify-end gap-3 w-full">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700">
              I Have Completed The Payment
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}