
import React, { useState, useEffect } from 'react';
import { Restaurant, Location, User as UserEntity } from '@/api/entities';
import { MapPin, Upload, Save, Image as ImageIcon, FileText, UserSquare, FileUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadFile, SendEmail } from '@/api/integrations'; // Added SendEmail
import { LocationCombobox } from '@/components/ui/location-combobox';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


// Fix default marker icon for Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    }
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

export default function RestaurantRegistrationForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    location_id: '',
    cuisine_type: '',
    description: '',
    contact_phone: '',
    contact_email: '',
    opening_hours: '',
    latitude: 4.1755,
    longitude: 73.5093,
    logo_url: '',
    pdf_menu_url: '',
    business_registration_url: '',
    owner_identity_url: ''
  });
  const [locations, setLocations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingState, setUploadingState] = useState({
    logo: false,
    restaurantImages: false,
    menuImages: false,
    pdfMenu: false,
    businessReg: false,
    ownerId: false,
    otherDocs: false
  });
  const [menuImages, setMenuImages] = useState([]);
  const [restaurantImages, setRestaurantImages] = useState([]);
  const [otherDocumentsUrls, setOtherDocumentsUrls] = useState([]);
  const [mapPosition, setMapPosition] = useState([4.1755, 73.5093]);

  useEffect(() => {
    loadLocations();
  }, []);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      latitude: mapPosition[0],
      longitude: mapPosition[1]
    }));
  }, [mapPosition]);

  const loadLocations = async () => {
    try {
      const locationData = await Location.list();
      
      // Only show islands (not atolls as separate locations)
      const atolls = locationData.filter(l => l.type === 'atoll');
      const islands = locationData.filter(l => l.type === 'island');
      
      const enrichedLocations = islands.map(island => {
        const parentAtoll = atolls.find(atoll => atoll.id === island.parent_id);
        return {
          ...island,
          display_name: parentAtoll ? `${island.name} (${parentAtoll.name})` : island.name
        };
      });

      // Sort by display name
      const sortedLocations = enrichedLocations.sort((a, b) => 
        a.display_name.localeCompare(b.display_name)
      );

      setLocations(sortedLocations);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (files, field, isMultiple = false) => {
    if (!files || files.length === 0) return;

    setUploadingState(prev => ({ ...prev, [field]: true }));
    try {
      if (isMultiple) {
        const uploadPromises = Array.from(files).map(file => UploadFile({ file }));
        const results = await Promise.all(uploadPromises);
        const urls = results.map(res => res.file_url);
        if (field === 'restaurantImages') setRestaurantImages(prev => [...prev, ...urls]);
        if (field === 'menuImages') setMenuImages(prev => [...prev, ...urls]);
        if (field === 'otherDocs') setOtherDocumentsUrls(prev => [...prev, ...urls]);
      } else {
        const result = await UploadFile({ file: files[0] });
        const url = result.file_url;
        if (field === 'logo') setFormData(prev => ({ ...prev, logo_url: url }));
        if (field === 'pdfMenu') setFormData(prev => ({ ...prev, pdf_menu_url: url }));
        if (field === 'businessReg') setFormData(prev => ({ ...prev, business_registration_url: url }));
        if (field === 'ownerId') setFormData(prev => ({ ...prev, owner_identity_url: url }));
      }
    } catch (error) {
      console.error(`Error uploading for ${field}:`, error);
    }
    setUploadingState(prev => ({ ...prev, [field]: false }));
  };

  const removeImage = (field, index = null) => {
    if (field === 'logo') {
      setFormData(prev => ({ ...prev, logo_url: '' }));
    } else if (field === 'restaurantImages') {
      setRestaurantImages(prev => prev.filter((_, i) => i !== index));
    } else if (field === 'menuImages') {
      setMenuImages(prev => prev.filter((_, i) => i !== index));
    } else if (field === 'otherDocs') {
      setOtherDocumentsUrls(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Helper function for welcome email content
  const getWelcomeEmailContent = (name, restaurantName) => {
    const baseURL = window.location.origin;
    const styles = `
      body { font-family: 'Inter', sans-serif; color: #333; line-height: 1.6; }
      .container { max-width: 600px; margin: 20px auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
      .header { font-size: 24px; font-weight: bold; color: #884C24; margin-bottom: 10px; }
      .button { background-color: #884C24; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
      .highlight { background-color: #f7fafc; border-left: 4px solid #884C24; padding: 15px; margin-top: 15px; }
      .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
    `;

    return {
      subject: `Welcome to Dining Guide, ${restaurantName}!`,
      body: `
        <html>
        <head>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
            <style>${styles}</style>
        </head>
        <body>
            <div class="container">
                <div class="header">Welcome Aboard!</div>
                <p>Hi ${name},</p>
                <p>Thank you for registering your restaurant, <strong>${restaurantName}</strong>, with Dining Guide. We're thrilled to have you.</p>
                <div class="highlight">
                    <p><strong>What's next?</strong> Our team will now review your application. This process usually takes 1-2 business days. We'll notify you via email as soon as your restaurant is approved.</p>
                </div>
                <p>In the meantime, you can log in to your Restaurant Portal to add your menu items and finalize your profile.</p>
                <a href="${baseURL}/RestaurantPortal" class="button">Go to Your Portal</a>
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
      const user = await UserEntity.me();

      await Restaurant.create({
        ...formData,
        menu_images: menuImages,
        restaurant_images: restaurantImages,
        other_documents_urls: otherDocumentsUrls,
        owner_id: user.id,
        owner_email: user.email, // Save owner's email
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
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }


      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating restaurant:', error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Register Your Restaurant</h2>
        <p className="text-lg text-gray-600">Join Diningmv.com and showcase your culinary offerings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter restaurant name"
                  required
                />
              </div>
              <div>
                <Label>Location *</Label>
                <LocationCombobox
                  locations={locations}
                  value={formData.location_id}
                  onValueChange={(value) => handleInputChange('location_id', value)}
                  placeholder="Select restaurant location"
                  searchPlaceholder="Search islands..."
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="cuisine">Cuisine Type</Label>
                <Input
                  id="cuisine"
                  value={formData.cuisine_type}
                  onChange={(e) => handleInputChange('cuisine_type', e.target.value)}
                  placeholder="e.g., Maldivian, Italian, Asian"
                />
              </div>
              <div>
                <Label htmlFor="hours">Opening Hours</Label>
                <Input
                  id="hours"
                  value={formData.opening_hours}
                  onChange={(e) => handleInputChange('opening_hours', e.target.value)}
                  placeholder="e.g., Mon-Sun: 7:00 AM - 11:00 PM"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your restaurant's atmosphere, specialties, and unique features"
                rows={4}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="phone">Contact Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  placeholder="+960 XXX-XXXX"
                />
              </div>
              <div>
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  placeholder="restaurant@example.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location & Map */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Exact Location
            </CardTitle>
            <p className="text-sm text-gray-600">
              Click on the map to mark your restaurant's exact location
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-64 rounded-lg overflow-hidden border">
              <MapContainer
                center={mapPosition}
                zoom={10}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker position={mapPosition} setPosition={setMapPosition} />
              </MapContainer>
            </div>
          </CardContent>
        </Card>

        {/* Restaurant Photos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Restaurant Photos & Logo
            </CardTitle>
            <p className="text-sm text-gray-600">
              Help customers discover your restaurant with appealing visuals. All uploads are final for this registration.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo Upload */}
            <div>
              <Label>Restaurant Logo</Label>
              <p className="text-xs text-gray-500 mb-2">Recommended: Square format, 300x300px. <span className="font-semibold">This will be your brand identity.</span></p>
              {formData.logo_url ? (
                <div className="relative inline-block">
                  <img
                    src={formData.logo_url}
                    alt="Logo preview"
                    className="w-24 h-24 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0"
                    onClick={() => removeImage('logo')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files, 'logo')}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('logo-upload').click()}
                    disabled={uploadingState.logo}
                  >
                    {uploadingState.logo ? 'Uploading...' : 'Choose Logo'}
                  </Button>
                </div>
              )}
            </div>

            {/* Restaurant Photos */}
            <div>
              <Label>Restaurant Photos (Cover & Interior)</Label>
              <p className="text-xs text-gray-500 mb-2">Recommended: Landscape format (16:9 ratio), 1200x675px minimum. The first photo will be your main cover image.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {restaurantImages.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Restaurant ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      onClick={() => removeImage('restaurantImages', index)}
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
                  onChange={(e) => handleFileUpload(e.target.files, 'restaurantImages', true)}
                  className="hidden"
                  id="restaurant-photos-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('restaurant-photos-upload').click()}
                  disabled={uploadingState.restaurantImages}
                >
                  {uploadingState.restaurantImages ? 'Uploading...' : 'Add Restaurant Photos'}
                </Button>
              </div>
            </div>

            {/* Menu Photos */}
            <div>
              <Label>Menu Photos</Label>
              <p className="text-xs text-gray-500 mb-2">Recommended: Clear, well-lit photos (4:3 ratio), 800x600px minimum</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {menuImages.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Menu ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      onClick={() => removeImage('menuImages', index)}
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
                  onChange={(e) => handleFileUpload(e.target.files, 'menuImages', true)}
                  className="hidden"
                  id="menu-photos-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('menu-photos-upload').click()}
                  disabled={uploadingState.menuImages}
                >
                  {uploadingState.menuImages ? 'Uploading...' : 'Add Menu Photos'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Required Documents
            </CardTitle>
            <p className="text-sm text-gray-600">
              Upload necessary documents for verification
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* PDF Menu */}
            <div>
              <Label>Menu (PDF Format)</Label>
              {formData.pdf_menu_url ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Menu uploaded successfully</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setFormData(prev => ({ ...prev, pdf_menu_url: '' }))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileUpload(e.target.files, 'pdfMenu')}
                    className="hidden"
                    id="pdf-menu-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('pdf-menu-upload').click()}
                    disabled={uploadingState.pdfMenu}
                  >
                    {uploadingState.pdfMenu ? 'Uploading...' : 'Upload Menu PDF'}
                  </Button>
                </div>
              )}
            </div>

            {/* Business Registration */}
            <div>
              <Label>Business Registration Document</Label>
              {formData.business_registration_url ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Business registration uploaded</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setFormData(prev => ({ ...prev, business_registration_url: '' }))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e.target.files, 'businessReg')}
                    className="hidden"
                    id="business-reg-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('business-reg-upload').click()}
                    disabled={uploadingState.businessReg}
                  >
                    {uploadingState.businessReg ? 'Uploading...' : 'Upload Business Registration'}
                  </Button>
                </div>
              )}
            </div>

            {/* Owner Identity */}
            <div>
              <Label>Owner Identity Document</Label>
              {formData.owner_identity_url ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <UserSquare className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Identity document uploaded</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setFormData(prev => ({ ...prev, owner_identity_url: '' }))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(e.target.files, 'ownerId')}
                    className="hidden"
                    id="owner-id-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('owner-id-upload').click()}
                    disabled={uploadingState.ownerId}
                  >
                    {uploadingState.ownerId ? 'Uploading...' : 'Upload Owner ID'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-8">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || !formData.name || !formData.location_id}
            className="bg-[var(--primary-cta)] hover:bg-[var(--primary-cta)]/90 px-8"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Submitting Application...
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
    </div>
  );
}
