import React, { useState, useEffect } from 'react';
import { Seller, Location, Category, SellerType } from '@/api/entities';
import { User as UserEntity } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { LocationCombobox } from '@/components/ui/location-combobox';
import { Save, Upload as UploadIcon, Phone, Mail, Instagram, Facebook, Globe, User as UserIcon } from 'lucide-react';

export default function SellerSettings({ seller, onUpdate }) {
  const [formData, setFormData] = useState(seller);
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sellerTypes, setSellerTypes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState({ profile: false, cover: false });

  useEffect(() => {
    loadDropdownData();
  }, []);

  const loadDropdownData = async () => {
    try {
      const [locationData, categoryData, sellerTypeData] = await Promise.all([
        Location.list(),
        Category.list(),
        SellerType.list(),
      ]);

      const atolls = locationData.filter(l => l.type === 'atoll');
      const islands = locationData.filter(l => l.type === 'island');
      const enrichedLocations = islands.map(island => ({
        ...island,
        display_name: `${island.name} (${atolls.find(a => a.id === island.parent_id)?.name || 'Atoll'})`
      })).sort((a, b) => a.display_name.localeCompare(b.display_name));
      
      setLocations(enrichedLocations);
      setCategories(categoryData);
      setSellerTypes(sellerTypeData);
    } catch (error) {
      console.error('Error loading data for settings:', error);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };
  
  const handleImageUpload = async (file, type) => {
    if (!file) return;
    setUploadingImages(prev => ({ ...prev, [type]: true }));
    try {
      const result = await UploadFile({ file });
      const field = type === 'profile' ? 'profile_image' : 'cover_image';
      setFormData(prev => ({ ...prev, [field]: result.file_url }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    }
    setUploadingImages(prev => ({ ...prev, [type]: false }));
  };

  const handleSpecialtyChange = (slug, checked) => {
    setFormData(prev => ({
      ...prev,
      specialties: checked
        ? [...(prev.specialties || []), slug]
        : (prev.specialties || []).filter(s => s !== slug)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updatedSeller = await Seller.update(seller.id, formData);
      onUpdate(updatedSeller);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating seller profile:', error);
      alert('Failed to update profile. Please try again.');
    }
    setIsSubmitting(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Seller Profile Settings</CardTitle>
        <CardDescription>Update your public profile and business information here.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
           {/* Form sections are similar to registration but pre-filled */}
            
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-[var(--headings-labels)]">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Business/Shop Name *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} required />
                </div>
                <div>
                    <Label htmlFor="seller_type">Seller Type *</Label>
                    <select
                        id="seller_type"
                        value={formData.seller_type}
                        onChange={(e) => handleInputChange('seller_type', e.target.value)}
                        className="w-full p-2 border rounded-md"
                        required
                    >
                        <option value="" disabled>Select a type</option>
                        {sellerTypes.map(type => (
                            <option key={type.slug} value={type.slug}>{type.name}</option>
                        ))}
                    </select>
                </div>
              </div>
              <div>
                <Label htmlFor="bio">About Your Business</Label>
                <Textarea id="bio" value={formData.bio} onChange={(e) => handleInputChange('bio', e.target.value)} rows={4} />
              </div>
            </div>

            {/* Location & Contact */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-[var(--headings-labels)]">Location & Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Primary Location *</Label>
                  <LocationCombobox
                    locations={locations}
                    value={formData.location_id}
                    onValueChange={(value) => handleInputChange('location_id', value)}
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone">Contact Phone *</Label>
                  <Input id="contact_phone" value={formData.contact_phone} onChange={(e) => handleInputChange('contact_phone', e.target.value)} required />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-[var(--headings-labels)]">Profile Images</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Profile Image (Logo)</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    {formData.profile_image && <img src={formData.profile_image} alt="Profile" className="w-24 h-24 object-cover rounded-full mx-auto mb-2"/>}
                    <Button type="button" variant="outline" onClick={() => document.getElementById('profile-image-upload').click()} disabled={uploadingImages.profile}>
                      <UploadIcon className="w-4 h-4 mr-2"/> {uploadingImages.profile ? 'Uploading...' : 'Upload Image'}
                    </Button>
                    <input id="profile-image-upload" type="file" className="hidden" onChange={(e) => handleImageUpload(e.target.files[0], 'profile')} />
                  </div>
                </div>
                <div>
                  <Label>Cover Image</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    {formData.cover_image && <img src={formData.cover_image} alt="Cover" className="w-full h-24 object-cover rounded mx-auto mb-2"/>}
                    <Button type="button" variant="outline" onClick={() => document.getElementById('cover-image-upload').click()} disabled={uploadingImages.cover}>
                       <UploadIcon className="w-4 h-4 mr-2"/> {uploadingImages.cover ? 'Uploading...' : 'Upload Image'}
                    </Button>
                    <input id="cover-image-upload" type="file" className="hidden" onChange={(e) => handleImageUpload(e.target.files[0], 'cover')} />
                  </div>
                </div>
              </div>
            </div>

            {/* Specialties */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-[var(--headings-labels)]">Your Categories</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${cat.slug}`}
                        checked={(formData.specialties || []).includes(cat.slug)}
                        onCheckedChange={(checked) => handleSpecialtyChange(cat.slug, checked)}
                      />
                      <Label htmlFor={`cat-${cat.slug}`} className="text-sm font-normal">{cat.name}</Label>
                    </div>
                  ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
        </form>
      </CardContent>
    </Card>
  );
}