
import React, { useState, useEffect } from 'react';
import { Seller } from '@/api/entities';
import { Location } from '@/api/entities';
import { Category } from '@/api/entities'; // Added Category entity
import { SellerType } from '@/api/entities'; // Added SellerType entity
import { User as UserEntity } from '@/api/entities'; // Renamed User to UserEntity to avoid conflict
import { Upload, Save, User as UserIcon, MapPin, Phone, Mail, Instagram, Facebook, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { UploadFile, SendEmail } from '@/api/integrations';
import { LocationCombobox } from '@/components/ui/location-combobox';

export default function SellerRegistrationForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    seller_type: '',
    location_id: '',
    contact_phone: '',
    contact_email: '',
    profile_image: '',
    cover_image: '',
    specialties: [], // This will now store category slugs
    certifications: [],
    delivery_zones: [],
    minimum_order: 0,
    social_media: {
      instagram: '',
      facebook: '',
      website: ''
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState({
    profile: false,
    cover: false
  });
  const [categories, setCategories] = useState([]); // Renamed from specialties
  const [locations, setLocations] = useState([]);
  const [sellerTypes, setSellerTypes] = useState([]); // New state for seller types

  const loadDropdownData = async () => {
    try {
      const [locationData, categoryData, sellerTypeData] = await Promise.all([
        Location.list(),
        Category.list(),
        SellerType.list(),
      ]);

      const atolls = locationData.filter(l => l.type === 'atoll');
      const islands = locationData.filter(l => l.type === 'island');
      
      const enrichedLocations = islands.map(island => {
        const parentAtoll = atolls.find(atoll => atoll.id === island.parent_id);
        return {
          ...island,
          display_name: parentAtoll ? `${island.name} (${parentAtoll.name})` : island.name
        };
      });

      const sortedLocations = enrichedLocations.sort((a, b) => 
        a.display_name.localeCompare(b.display_name)
      );

      setLocations(sortedLocations);
      setCategories(categoryData);
      setSellerTypes(sellerTypeData);
    } catch (error) {
      console.error('Error loading data for registration form:', error);
    }
  };

  useEffect(() => {
    loadDropdownData(); 
  }, []);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
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

  const handleSpecialtyChange = (slug, checked) => { // Updated to use slug
    setFormData(prev => ({
      ...prev,
      specialties: checked
        ? [...(prev.specialties || []), slug] // Ensure specialties is an array
        : (prev.specialties || []).filter(s => s !== slug) // Ensure specialties is an array
    }));
  };

  const handleDeliveryZoneChange = (zoneName, checked) => {
    setFormData(prev => ({
      ...prev,
      delivery_zones: checked
        ? [...prev.delivery_zones, zoneName]
        : prev.delivery_zones.filter(z => z !== zoneName)
    }));
  };

  // Helper function for welcome email content
  const getWelcomeEmailContent = (name, sellerName) => {
    const baseURL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'; // Default for SSR
    const styles = `
      body { font-family: 'Inter', sans-serif; color: #333; line-height: 1.6; }
      .container { max-width: 600px; margin: 20px auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
      .header { font-size: 24px; font-weight: bold; color: #884C24; margin-bottom: 10px; }
      .button { background-color: #884C24; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
      .highlight { background-color: #f7fafc; border-left: 4px solid #884C24; padding: 15px; margin-top: 15px; }
      .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
    `;

    return {
      subject: `Welcome to the Dining Guide Marketplace!`,
      body: `
        <html>
        <head>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
            <style>${styles}</style>
        </head>
        <body>
            <div class="container">
                <div class="header">Welcome to the Marketplace!</div>
                <p>Hi ${name},</p>
                <p>Thank you for registering as a seller with Dining Guide under the name <strong>${sellerName}</strong>. We're excited to see what you bring to our community!</p>
                <div class="highlight">
                    <p><strong>Next Steps:</strong> Your seller profile is now under review by our team. We'll notify you once it's approved. You can then start listing your products.</p>
                </div>
                <p>Head to your Seller Portal to get everything ready.</p>
                <a href="${baseURL}/SellerPortal" class="button">Go to Seller Portal</a>
                <div class="footer">
                    Thank you for being a part of the Dining Guide community.<br>
                    This is an automated message. Please do not reply.
                </div>
            </div>
        </body>
        </html>
      `
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const user = await UserEntity.me(); // Changed to UserEntity.me()
      
      await Seller.create({
        ...formData,
        owner_id: user.id,
        owner_email: user.email,
        status: 'pending'
      });
      
      // Send welcome email using Core integration directly
      try {
        const emailContent = getWelcomeEmailContent(user.full_name || 'Partner', formData.name);
        await SendEmail({
          to: user.email,
          subject: emailContent.subject,
          body: emailContent.body,
          from_name: "Dining Guide Team"
        });
      } catch(emailError) {
        console.error("Failed to send seller welcome email:", emailError);
      }

      onSuccess();
    } catch (error) {
      console.error('Error creating seller profile:', error);
      alert('Failed to create seller profile. Please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="soft-shadow">
        <CardHeader>
          <CardTitle className="text-2xl font-poppins text-[var(--headings-labels)]">
            Become a Seller
          </CardTitle>
          <p className="text-[var(--text-muted)]">
            Join our marketplace and start selling your products to customers across the Maldives
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-[var(--headings-labels)]">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Business/Shop Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="seller_type">Seller Type *</Label>
                  <Select value={formData.seller_type} onValueChange={(value) => handleInputChange('seller_type', value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select seller type" />
                    </SelectTrigger>
                    <SelectContent>
                      {sellerTypes.map(type => (
                          <SelectItem key={type.slug} value={type.slug}>{type.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="bio">About Your Business</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Tell customers about your business, what you sell, and what makes you unique..."
                  rows={4}
                />
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
                    placeholder="Select your primary location"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact_phone">Contact Phone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="contact_phone"
                      value={formData.contact_phone}
                      onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                      placeholder="+960 xxx xxxx"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    placeholder="your@email.com"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-[var(--headings-labels)]">Profile Images</h3>
              <p className="text-sm text-[var(--text-muted)]">
                Add images to showcase your business and build trust with customers
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Image */}
                <div>
                  <Label>Profile Image (Logo)</Label>
                  <p className="text-xs text-[var(--text-muted)] mb-2">Recommended: 300x300px, Square format</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {formData.profile_image ? (
                      <div className="space-y-2">
                        <img
                          src={formData.profile_image}
                          alt="Profile"
                          className="w-24 h-24 object-cover rounded-full mx-auto"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleInputChange('profile_image', '')}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <UserIcon className="w-12 h-12 text-gray-400 mx-auto" />
                        <div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('profile-image').click()}
                            disabled={uploadingImages.profile}
                          >
                            {uploadingImages.profile ? 'Uploading...' : 'Choose Profile Image'}
                          </Button>
                          <input
                            id="profile-image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e.target.files[0], 'profile')}
                            className="hidden"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cover Image */}
                <div>
                  <Label>Cover Image</Label>
                  <p className="text-xs text-[var(--text-muted)] mb-2">Recommended: 1200x400px, Landscape format</p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {formData.cover_image ? (
                      <div className="space-y-2">
                        <img
                          src={formData.cover_image}
                          alt="Cover"
                          className="w-full h-24 object-cover rounded mx-auto"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleInputChange('cover_image', '')}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                        <div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('cover-image').click()}
                            disabled={uploadingImages.cover}
                          >
                            {uploadingImages.cover ? 'Uploading...' : 'Choose Cover Image'}
                          </Button>
                          <input
                            id="cover-image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e.target.files[0], 'cover')}
                            className="hidden"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[var(--headings-labels)]">Your Categories</h3>
                <p className="text-sm text-[var(--text-muted)]">
                  Select the categories that best describe what you sell
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`specialty-${cat.id}`}
                        checked={(formData.specialties || []).includes(cat.slug)}
                        onCheckedChange={(checked) => handleSpecialtyChange(cat.slug, checked)}
                      />
                      <Label htmlFor={`specialty-${cat.id}`} className="text-sm font-normal">
                        {cat.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Zones */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-[var(--headings-labels)]">Delivery Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="minimum_order">Minimum Order Amount (MVR)</Label>
                  <Input
                    id="minimum_order"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minimum_order}
                    onChange={(e) => handleInputChange('minimum_order', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <Label>Delivery Zones</Label>
                <p className="text-sm text-[var(--text-muted)] mb-2">
                  Select the areas where you can deliver your products
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {locations.slice(0, 12).map((location) => (
                    <div key={location.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`delivery-${location.id}`}
                        checked={formData.delivery_zones.includes(location.name)}
                        onCheckedChange={(checked) => handleDeliveryZoneChange(location.name, checked)}
                      />
                      <Label htmlFor={`delivery-${location.id}`} className="text-sm">
                        {location.display_name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-[var(--headings-labels)]">Social Media (Optional)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="instagram"
                      value={formData.social_media.instagram}
                      onChange={(e) => handleInputChange('social_media.instagram', e.target.value)}
                      placeholder="@username"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <div className="relative">
                    <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="facebook"
                      value={formData.social_media.facebook}
                      onChange={(e) => handleInputChange('social_media.facebook', e.target.value)}
                      placeholder="facebook.com/page"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="website"
                      value={formData.social_media.website}
                      onChange={(e) => handleInputChange('social_media.website', e.target.value)}
                      placeholder="www.example.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="cta-button"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Submit for Review
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
