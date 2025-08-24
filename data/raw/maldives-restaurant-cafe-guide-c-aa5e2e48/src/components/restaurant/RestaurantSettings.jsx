
import React, { useState, useEffect } from 'react';
import { Restaurant, Location } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Save, Upload, X, MapPin, Phone, Mail, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { LocationCombobox } from '@/components/ui/location-combobox';

export default function RestaurantSettings({ restaurant, onUpdate }) {
  const [formData, setFormData] = useState(restaurant);
  const [locations, setLocations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [restaurantImages, setRestaurantImages] = useState(restaurant.restaurant_images || []);
  const [menuImages, setMenuImages] = useState(restaurant.menu_images || []);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const locationData = await Location.list();
      const atolls = locationData.filter(l => l.type === 'atoll');
      const islands = locationData.filter(l => l.type === 'island');
      
      const enrichedLocations = islands.map(island => {
        const parentAtoll = atolls.find(atoll => atoll.id === island.parent_id);
        return {
          ...island,
          display_name: parentAtoll ? `${island.name} (${parentAtoll.name})` : island.name
        };
      });

      setLocations(enrichedLocations.sort((a, b) => a.display_name.localeCompare(b.display_name)));
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleLogoUpload = async (file) => {
    if (!file) return;
    setUploadingLogo(true);
    try {
      const result = await UploadFile({ file });
      handleInputChange('logo_url', result.file_url);
    } catch (error) {
      console.error('Error uploading logo:', error);
    }
    setUploadingLogo(false);
  };


  const handleImageUpload = async (files, type) => {
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploadPromises = Array.from(files).map(file => UploadFile({ file }));
      const results = await Promise.all(uploadPromises);
      const urls = results.map(res => res.file_url);
      
      if (type === 'restaurant') {
        setRestaurantImages(prev => [...prev, ...urls]);
      } else if (type === 'menu') {
        setMenuImages(prev => [...prev, ...urls]);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
    }
    setUploadingImage(false);
  };

  const removeImage = (type, index) => {
    if (type === 'restaurant') {
      setRestaurantImages(prev => prev.filter((_, i) => i !== index));
    } else if (type === 'menu') {
      setMenuImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updatedData = {
        ...formData,
        restaurant_images: restaurantImages,
        menu_images: menuImages
      };

      await Restaurant.update(restaurant.id, updatedData);
      onUpdate();
    } catch (error) {
      console.error('Error updating restaurant:', error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">Restaurant Settings</h3>
        <p className="text-gray-600">Update your restaurant information and media</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Restaurant Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div>
                <Label>Location</Label>
                <LocationCombobox
                  locations={locations}
                  value={formData.location_id}
                  onValueChange={(value) => handleInputChange('location_id', value)}
                  placeholder="Select location"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="logo">Restaurant Logo</Label>
              <div className="flex items-center gap-4 mt-2">
                {formData.logo_url && (
                  <img src={formData.logo_url} alt="Logo" className="w-16 h-16 rounded-lg object-cover" />
                )}
                <Input
                  id="logo-upload-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleLogoUpload(e.target.files[0])}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('logo-upload-input').click()}
                  disabled={uploadingLogo}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingLogo ? 'Uploading...' : 'Change Logo'}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cuisine">Cuisine Type</Label>
                <Input
                  id="cuisine"
                  value={formData.cuisine_type}
                  onChange={(e) => handleInputChange('cuisine_type', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="hours">Opening Hours</Label>
                <Input
                  id="hours"
                  value={formData.opening_hours}
                  onChange={(e) => handleInputChange('opening_hours', e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Contact Phone</Label>
                <Input
                  id="phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Restaurant Photos */}
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Photos</CardTitle>
            <p className="text-sm text-gray-600">Recommended: 1200x600px, landscape format</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {restaurantImages.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Restaurant ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0"
                    onClick={() => removeImage('restaurant', index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e.target.files, 'restaurant')}
                className="hidden"
                id="restaurant-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('restaurant-upload').click()}
                disabled={uploadingImage}
              >
                {uploadingImage ? 'Uploading...' : 'Add Photos'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Menu Photos */}
        <Card>
          <CardHeader>
            <CardTitle>Menu Photos</CardTitle>
            <p className="text-sm text-gray-600">Recommended: 800x600px, clear and well-lit</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {menuImages.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Menu ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0"
                    onClick={() => removeImage('menu', index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e.target.files, 'menu')}
                className="hidden"
                id="menu-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('menu-upload').click()}
                disabled={uploadingImage}
              >
                {uploadingImage ? 'Uploading...' : 'Add Menu Photos'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[var(--primary-cta)] hover:bg-[var(--primary-cta)]/90"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
