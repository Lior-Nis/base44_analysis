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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { User as UserEntity } from "@/api/entities";
import { Home, UserCheck, Loader2 } from "lucide-react";

const propertyTypes = [
  { value: "flat", label: "Flat / Apartment" },
  { value: "house", label: "House" },
  { value: "studio", label: "Studio" },
  { value: "shared_house", label: "Shared House" },
  { value: "other", label: "Other" }
];

const tenantOrOwnerTypes = [
  { value: "tenant", label: "I am a Tenant" },
  { value: "homeowner", label: "I am a Homeowner" },
  { value: "landlord", label: "I am a Landlord" }
];

export default function CompleteProfileModal({ isOpen, onSuccess, user }) {
  const [propertyType, setPropertyType] = useState('');
  const [tenantOrOwner, setTenantOrOwner] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!propertyType || !tenantOrOwner) {
      alert("Please select both options to continue.");
      return;
    }
    setIsSaving(true);
    try {
      await UserEntity.updateMyUserData({
        property_type: propertyType,
        tenant_or_owner: tenantOrOwner,
      });
      onSuccess();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("There was an error saving your details. Please try again.");
    }
    setIsSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideCloseButton={true}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-green-600">
            Welcome, {user?.full_name}!
          </DialogTitle>
          <DialogDescription className="text-center">
            Just one more step. Please tell us a little about yourself to personalize your experience.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div>
            <Label htmlFor="propertyType">What type of property do you live in?</Label>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger id="propertyType">
                <SelectValue placeholder="Select property type..." />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <Home className="w-4 h-4 mr-2 inline-block" />
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tenantOrOwner">Are you a tenant, homeowner, or landlord?</Label>
            <Select value={tenantOrOwner} onValueChange={setTenantOrOwner}>
              <SelectTrigger id="tenantOrOwner">
                <SelectValue placeholder="Select your status..." />
              </SelectTrigger>
              <SelectContent>
                {tenantOrOwnerTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <UserCheck className="w-4 h-4 mr-2 inline-block" />
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
           <Button
            onClick={handleSave}
            disabled={isSaving || !propertyType || !tenantOrOwner}
            className="w-full bg-green-600 hover:bg-green-700 py-3 text-lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save & Continue to Dashboard"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}