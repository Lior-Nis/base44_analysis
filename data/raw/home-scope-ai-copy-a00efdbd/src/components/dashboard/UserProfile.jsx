
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Home as HomeIcon,
  Settings,
  Bell,
  Save,
  Info,
  AlertTriangle // Added AlertTriangle icon
} from "lucide-react";
import { User as UserEntity } from "@/api/entities";
import { SendEmail } from "@/api/integrations"; // Added SendEmail integration
import { createPageUrl } from "@/utils"; // Added createPageUrl util
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Added AlertDialog components
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function UserProfile({ user, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    property_type: user?.property_type || '',
    tenant_or_owner: user?.tenant_or_owner || '',
    email_subscription: user?.email_subscription || false
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await UserEntity.updateMyUserData({
        phone: formData.phone,
        address: formData.address,
        property_type: formData.property_type,
        tenant_or_owner: formData.tenant_or_owner,
        email_subscription: formData.email_subscription
      });

      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      property_type: user?.property_type || '',
      tenant_or_owner: user?.tenant_or_owner || '',
      email_subscription: user?.email_subscription || false
    });
    setIsEditing(false);
  };

  const handleCancelSubscription = async () => {
    setIsSaving(true);
    try {
      await UserEntity.updateMyUserData({
        subscription_status: 'cancelled'
      });
      alert('Your subscription has been successfully cancelled.');
      onUpdate();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('There was an error cancelling your subscription. Please contact support.');
    }
    setIsSaving(false);
  };

  const handleRequestDeletion = async () => {
    setIsSaving(true);
    try {
      await SendEmail({
        to: "support@homescopehq.com",
        from_name: "HomeScope System",
        subject: `Account Deletion Request for ${user.email}`,
        body: `
          The following user has requested to permanently delete their account:

          - Name: ${user.full_name}
          - Email: ${user.email}
          - User ID: ${user.id}
          - Request Time: ${new Date().toISOString()}

          Please process this deletion request in accordance with your data policy and confirm with the user.
        `
      });

      alert('Your account deletion request has been sent. You will now be logged out.');

      await UserEntity.logout();
      window.location.href = createPageUrl('Home');

    } catch (error) {
      console.error('Error requesting account deletion:', error);
      alert('There was an error sending your deletion request. Please contact support@homescopehq.com directly.');
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-green-600" />
              Profile Information
            </CardTitle>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              size="sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                disabled={true} // Name is managed by auth system
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Name is managed through your account settings
              </p>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled={true} // Email is managed by auth system
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed here
              </p>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
                placeholder="Your phone number"
              />
            </div>

            <div>
              <Label htmlFor="propertyType">Property Type</Label>
              <Select
                value={formData.property_type}
                onValueChange={(value) => handleInputChange('property_type', value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">Flat/Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="shared_house">Shared House</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address">Property Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={!isEditing}
                placeholder="Your property address"
              />
            </div>

            <div>
              <Label htmlFor="tenantOrOwner">Are you a tenant or homeowner?</Label>
              <Select
                value={formData.tenant_or_owner}
                onValueChange={(value) => handleInputChange('tenant_or_owner', value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select one" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tenant">Tenant</SelectItem>
                  <SelectItem value="homeowner">Homeowner</SelectItem>
                  <SelectItem value="landlord">Landlord</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button onClick={handleCancel} variant="outline">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2 text-green-600" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailSubscription" className="text-base font-medium">
                Email Notifications
              </Label>
              <p className="text-sm text-gray-600">
                Receive home tips, maintenance reminders, and exclusive offers
              </p>
            </div>
            <Switch
              id="emailSubscription"
              checked={formData.email_subscription}
              onCheckedChange={(checked) => handleInputChange('email_subscription', checked)}
              disabled={!isEditing}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">SMS Reminders</Label>
              <p className="text-sm text-gray-600">
                Get appointment reminders via SMS
              </p>
            </div>
            <Switch defaultChecked={true} disabled />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Expert Availability</Label>
              <p className="text-sm text-gray-600">
                Notify when your preferred experts become available
              </p>
            </div>
            <Switch defaultChecked={false} disabled />
          </div>
        </CardContent>
      </Card>

      {/* Account Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Account Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {user?.consultation_credits || 0}
                </div>
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <span>Consultation Credits</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 ml-1 cursor-pointer text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Number of pre-paid expert consultations you have.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {user?.role === 'admin' ? 'Admin' : 'User'}
                </div>
                <div className="flex items-center justify-center text-sm text-gray-600">
                   <span>Account Type</span>
                   <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 ml-1 cursor-pointer text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Your role within the platform.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {user?.has_downloaded_guide ? 'Yes' : 'No'}
                </div>
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <span>Safety Guide</span>
                   <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 ml-1 cursor-pointer text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Indicates if you have downloaded the free home safety guide.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {user?.created_date ? new Date(user.created_date).toLocaleDateString() : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Member Since</div>
              </div>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Account Management */}
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="flex items-center text-red-700">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Account Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900">Cancel Subscription</h3>
            <p className="text-sm text-gray-600 my-2">
              Cancel your active subscription. You will retain access to features until the end of your current billing period.
            </p>
            {user?.subscription_type !== 'none' && user?.subscription_status === 'active' ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">Cancel My Subscription</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will cancel your '{user.subscription_type?.replace('_', ' ')}' plan. This action cannot be immediately undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Go Back</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelSubscription} className="bg-red-600 hover:bg-red-700">Yes, Cancel Subscription</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <p className="text-sm text-gray-500 italic">You do not have an active subscription to cancel.</p>
            )}
          </div>

          <div className="border-t border-red-200 pt-6">
            <h3 className="font-semibold text-gray-900">Delete Account</h3>
            <p className="text-sm text-gray-600 my-2">
              Request to permanently delete your account and all associated data. This action is irreversible.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="bg-red-700 hover:bg-red-800">Request Account Deletion</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Request Account Deletion?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You are about to request the permanent deletion of your account. All your data, including profile information and appointment history, will be removed. This cannot be undone. A request will be sent to our support team to process this.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRequestDeletion} className="bg-red-600 hover:bg-red-700">Yes, Request Deletion</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
