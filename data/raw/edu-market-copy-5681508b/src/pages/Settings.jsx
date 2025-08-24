import React, { useState, useEffect } from "react";
import { AppSettings } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, AlertCircle, DollarSign, Smartphone } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    paypal_email: "",
    paypal_me_link: "",
    zelle_email: "",
    venmo_username: "",
    cashapp_username: "",
    payment_instructions: ""
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const appSettings = await AppSettings.list();
      const userSettings = appSettings.find(s => s.admin_email === currentUser.email);
      
      if (userSettings) {
        setSettings(userSettings);
        setFormData({
          paypal_email: userSettings.paypal_email || "",
          paypal_me_link: userSettings.paypal_me_link || "",
          zelle_email: userSettings.zelle_email || "",
          venmo_username: userSettings.venmo_username || "",
          cashapp_username: userSettings.cashapp_username || "",
          payment_instructions: userSettings.payment_instructions || "Please send payment using one of the methods below. After payment, click 'I Have Paid' and I will verify your purchase within 24 hours."
        });
      } else {
        // Initialize with default instructions
        setFormData(prev => ({
          ...prev,
          payment_instructions: "Please send payment using one of the methods below. After payment, click 'I Have Paid' and I will verify your purchase within 24 hours."
        }));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const dataToSave = {
        ...formData,
        admin_email: user.email
      };
      
      if (settings) {
        // Update existing settings
        await AppSettings.update(settings.id, dataToSave);
        setMessage("Settings updated successfully!");
      } else {
        // Create new settings
        const newSettings = await AppSettings.create(dataToSave);
        setSettings(newSettings);
        setMessage("Settings saved successfully!");
      }
      
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage("Failed to save settings. Please try again.");
    }
    setSaving(false);
  };

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Payment Settings</h1>
          <p className="text-slate-600 mt-1">Configure how you receive payments from students.</p>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
          <CardHeader>
            <CardTitle>Payment Methods Configuration</CardTitle>
            <CardDescription>
              Set up your preferred payment methods. Students will see these options when purchasing courses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="paypal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="paypal" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  PayPal
                </TabsTrigger>
                <TabsTrigger value="digital" className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Digital Payments
                </TabsTrigger>
                <TabsTrigger value="instructions">Instructions</TabsTrigger>
              </TabsList>

              <TabsContent value="paypal" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paypalEmail">PayPal Email</Label>
                    <Input
                      id="paypalEmail"
                      placeholder="your-email@example.com"
                      value={formData.paypal_email}
                      onChange={(e) => handleInputChange('paypal_email', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paypalMe">PayPal.Me Link</Label>
                    <Input
                      id="paypalMe"
                      placeholder="https://paypal.me/yourname"
                      value={formData.paypal_me_link}
                      onChange={(e) => handleInputChange('paypal_me_link', e.target.value)}
                    />
                  </div>
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your PayPal information will only be shown to students who purchase your courses. The PayPal.Me link makes it easier for students to send payments.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="digital" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zelle">Zelle Email/Phone</Label>
                    <Input
                      id="zelle"
                      placeholder="your-email@example.com or phone number"
                      value={formData.zelle_email}
                      onChange={(e) => handleInputChange('zelle_email', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="venmo">Venmo Username</Label>
                    <Input
                      id="venmo"
                      placeholder="@yourusername"
                      value={formData.venmo_username}
                      onChange={(e) => handleInputChange('venmo_username', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cashapp">Cash App Username</Label>
                    <Input
                      id="cashapp"
                      placeholder="$yourusername"
                      value={formData.cashapp_username}
                      onChange={(e) => handleInputChange('cashapp_username', e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="instructions" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instructions">Payment Instructions</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Provide detailed instructions for students on how to send payment..."
                    value={formData.payment_instructions}
                    onChange={(e) => handleInputChange('payment_instructions', e.target.value)}
                    rows={6}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end items-center gap-4 pt-6 border-t">
              {message && (
                <p className={`text-sm ${message.includes('Failed') ? 'text-red-600' : 'text-emerald-600'}`}>
                  {message}
                </p>
              )}
              <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}