import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Loader2 } from "lucide-react";

const businessTypes = [
  { value: "roofing", label: "Roofing Services" },
  { value: "plumbing", label: "Plumbing Services" },
  { value: "electrical", label: "Electrical Services" },
  { value: "pest_control", label: "Pest Control" },
  { value: "water_damage", label: "Water Damage Restoration" },
  { value: "porta_potty", label: "Porta Potty Rental" },
  { value: "landscaping", label: "Landscaping" },
  { value: "hvac", label: "HVAC Services" },
  { value: "cleaning", label: "Cleaning Services" },
  { value: "auto_repair", label: "Auto Repair" },
  { value: "other", label: "Other Service Business" }
];

export default function BusinessForm({ onSubmit, isGenerating, formData, setFormData }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="business_name" className="text-sm font-semibold text-gray-700">
            Business Name *
          </Label>
          <Input
            id="business_name"
            placeholder="Enter your business name"
            value={formData.business_name}
            onChange={(e) => handleInputChange('business_name', e.target.value)}
            required
            className="h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="business_type" className="text-sm font-semibold text-gray-700">
            Business Type *
          </Label>
          <Select value={formData.business_type} onValueChange={(value) => handleInputChange('business_type', value)}>
            <SelectTrigger className="h-12 border-gray-200 focus:border-indigo-500">
              <SelectValue placeholder="Select your business type" />
            </SelectTrigger>
            <SelectContent>
              {businessTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
          Business Description *
        </Label>
        <Textarea
          id="description"
          placeholder="Describe your services, what makes you unique, your experience, etc."
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          required
          className="min-h-[120px] border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 resize-none"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-semibold text-gray-700">
            Service Area
          </Label>
          <Input
            id="location"
            placeholder="City, State or Region you serve"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_phone" className="text-sm font-semibold text-gray-700">
            Phone Number
          </Label>
          <Input
            id="contact_phone"
            placeholder="(555) 123-4567"
            value={formData.contact_phone}
            onChange={(e) => handleInputChange('contact_phone', e.target.value)}
            className="h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="contact_email" className="text-sm font-semibold text-gray-700">
            Email Address
          </Label>
          <Input
            id="contact_email"
            type="email"
            placeholder="contact@yourbusiness.com"
            value={formData.contact_email}
            onChange={(e) => handleInputChange('contact_email', e.target.value)}
            className="h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website_url" className="text-sm font-semibold text-gray-700">
            Current Website (Optional)
          </Label>
          <Input
            id="website_url"
            placeholder="https://yourwebsite.com"
            value={formData.website_url}
            onChange={(e) => handleInputChange('website_url', e.target.value)}
            className="h-12 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="pt-6">
        <Button
          type="submit"
          disabled={isGenerating || !formData.business_name || !formData.business_type || !formData.description}
          className="w-full h-14 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-lg rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              Generating Your Website...
            </>
          ) : (
            <>
              Generate Website
              <ArrowRight className="w-5 h-5 ml-3" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}