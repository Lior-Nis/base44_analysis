
import React, { useState, useEffect } from 'react';
import { Advertisement, Location, Restaurant } from '@/api/entities';
import { Plus, Edit3, Trash2, Eye, EyeOff, BarChart3, Calendar, DollarSign, Target, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadFile } from '@/api/integrations';
import { LocationCombobox } from '@/components/ui/location-combobox';

const AD_PLACEMENTS = [
  { value: 'homepage_hero', label: 'Homepage Hero' },
  { value: 'homepage_featured', label: 'Homepage Featured Section' },
  { value: 'homepage_trending', label: 'Homepage Trending Section' },
  { value: 'restaurant_list_top', label: 'Restaurant List Top' },
  { value: 'restaurant_list_inline', label: 'Restaurant List Inline' },
  { value: 'restaurant_detail_menu', label: 'Restaurant Detail Menu' },
  { value: 'restaurant_detail_reviews', label: 'Restaurant Detail Reviews' },
  { value: 'profile_sidebar', label: 'Profile Sidebar' },
  { value: 'favorites_top', label: 'Favorites Top' },
  { value: 'footer', label: 'Footer' }
];

const AD_TYPES = [
  { value: 'banner', label: 'Banner' },
  { value: 'card', label: 'Card' },
  { value: 'sponsored_listing', label: 'Sponsored Listing' },
  { value: 'text', label: 'Text' }
];

const AD_STATUS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  { value: 'paused', label: 'Paused', color: 'bg-gray-100 text-gray-800' }
];

export default function AdManagement({ advertisements, onAdsUpdate }) {
  const [showAdForm, setShowAdForm] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [locations, setLocations] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [adForm, setAdForm] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    placement: '',
    ad_type: 'banner',
    target_location_id: '',
    target_cuisine_type: '',
    priority: 1,
    active: true,
    start_date: '',
    end_date: '',
    daily_budget: '',
    total_budget: '',
    advertiser_name: '',
    advertiser_email: '',
    status: 'pending'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [locationData, restaurantData] = await Promise.all([
        Location.list(),
        Restaurant.filter({ status: 'approved' })
      ]);

      // Create enriched location data with display names
      const atolls = locationData.filter(l => l.type === 'atoll');
      const islands = locationData.filter(l => l.type === 'island');
      
      const enrichedLocations = [
        ...atolls.map(atoll => ({ ...atoll, display_name: atoll.name })),
        ...islands.map(island => {
          const parentAtoll = atolls.find(atoll => atoll.id === island.parent_id);
          return {
            ...island,
            display_name: parentAtoll ? `${island.name} (${parentAtoll.name})` : island.name
          };
        })
      ].sort((a, b) => a.display_name.localeCompare(b.display_name));

      setLocations(enrichedLocations);
      setRestaurants(restaurantData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAddAd = () => {
    setEditingAd(null);
    setAdForm({
      title: '',
      description: '',
      image_url: '',
      link_url: '', // Empty by default, making it optional
      placement: '',
      ad_type: 'banner',
      target_location_id: '',
      target_cuisine_type: '',
      priority: 1,
      active: true,
      start_date: '',
      end_date: '',
      daily_budget: '',
      total_budget: '',
      advertiser_name: '',
      advertiser_email: '',
      status: 'pending'
    });
    setShowAdForm(true);
  };

  const handleEditAd = (ad) => {
    setEditingAd(ad);
    setAdForm({
      title: ad.title,
      description: ad.description || '',
      image_url: ad.image_url,
      link_url: ad.link_url || '',
      placement: ad.placement,
      ad_type: ad.ad_type || 'banner',
      target_location_id: ad.target_location_id || '', // Ensure it's an empty string for "All locations"
      target_cuisine_type: ad.target_cuisine_type || '',
      priority: ad.priority || 1,
      active: ad.active,
      start_date: ad.start_date ? new Date(ad.start_date).toISOString().slice(0, 16) : '',
      end_date: ad.end_date ? new Date(ad.end_date).toISOString().slice(0, 16) : '',
      daily_budget: ad.daily_budget || '',
      total_budget: ad.total_budget || '',
      advertiser_name: ad.advertiser_name || '',
      advertiser_email: ad.advertiser_email || '',
      status: ad.status || 'pending'
    });
    setShowAdForm(true);
  };

  const handleDeleteAd = async (adId) => {
    if (window.confirm('Are you sure you want to delete this advertisement?')) {
      try {
        await Advertisement.delete(adId);
        const updatedAds = advertisements.filter(ad => ad.id !== adId);
        onAdsUpdate(updatedAds);
      } catch (error) {
        console.error('Error deleting advertisement:', error);
      }
    }
  };

  const handleToggleActive = async (ad) => {
    try {
      await Advertisement.update(ad.id, { ...ad, active: !ad.active });
      const updatedAds = advertisements.map(a => 
        a.id === ad.id ? { ...a, active: !a.active } : a
      );
      onAdsUpdate(updatedAds);
    } catch (error) {
      console.error('Error toggling advertisement status:', error);
    }
  };

  const handleUpdateStatus = async (ad, newStatus) => {
    try {
      await Advertisement.update(ad.id, { ...ad, status: newStatus });
      const updatedAds = advertisements.map(a => 
        a.id === ad.id ? { ...a, status: newStatus } : a
      );
      onAdsUpdate(updatedAds);
    } catch (error) {
      console.error('Error updating advertisement status:', error);
    }
  };

  const handleImageUpload = async (file) => {
    setUploadingImage(true);
    try {
      const result = await UploadFile({ file });
      setAdForm(prev => ({ ...prev, image_url: result.file_url }));
    } catch (error) {
      console.error('Error uploading image:', error);
    }
    setUploadingImage(false);
  };

  const removeAdImage = () => {
    setAdForm(prev => ({ ...prev, image_url: '' }));
  };

  const handleSubmitAd = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const adData = {
        ...adForm,
        priority: parseInt(adForm.priority),
        daily_budget: adForm.daily_budget ? parseFloat(adForm.daily_budget) : null,
        total_budget: adForm.total_budget ? parseFloat(adForm.total_budget) : null,
        start_date: adForm.start_date || null,
        end_date: adForm.end_date || null,
        link_url: adForm.link_url.trim() || null // Allow empty/null link_url
      };

      if (editingAd) {
        await Advertisement.update(editingAd.id, adData);
        const updatedAds = advertisements.map(ad => 
          ad.id === editingAd.id ? { ...ad, ...adData } : ad
        );
        onAdsUpdate(updatedAds);
      } else {
        const newAd = await Advertisement.create(adData);
        onAdsUpdate([...advertisements, newAd]);
      }

      setShowAdForm(false);
    } catch (error) {
      console.error('Error saving advertisement:', error);
    }
    setIsSubmitting(false);
  };

  const getStatusBadge = (status) => {
    const statusConfig = AD_STATUS.find(s => s.value === status) || AD_STATUS[0];
    return (
      <Badge className={statusConfig.color}>
        {statusConfig.label}
      </Badge>
    );
  };

  const getAdMetrics = () => {
    const totalImpressions = advertisements.reduce((sum, ad) => sum + (ad.impressions || 0), 0);
    const totalClicks = advertisements.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
    const activeAds = advertisements.filter(ad => ad.active && ad.status === 'approved').length;
    const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0;

    return { totalImpressions, totalClicks, activeAds, ctr };
  };

  const metrics = getAdMetrics();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advertisement Management</h2>
          <p className="text-gray-600">Create and manage ad campaigns across the platform</p>
        </div>
        <Button onClick={handleAddAd} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Ad
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Ad List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="placements">Placements</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Metrics Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Total Impressions</span>
                </div>
                <p className="text-2xl font-bold mt-1">{metrics.totalImpressions.toLocaleString()}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">Total Clicks</span>
                </div>
                <p className="text-2xl font-bold mt-1">{metrics.totalClicks.toLocaleString()}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-gray-600">CTR</span>
                </div>
                <p className="text-2xl font-bold mt-1">{metrics.ctr}%</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-gray-600">Active Ads</span>
                </div>
                <p className="text-2xl font-bold mt-1">{metrics.activeAds}</p>
              </CardContent>
            </Card>
          </div>

          {/* Ads List */}
          <div className="space-y-4">
            {advertisements.length > 0 ? (
              advertisements.map((ad) => (
                <Card key={ad.id} className="tropical-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={ad.image_url}
                          alt={ad.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">{ad.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{ad.description}</p>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(ad.status)}
                            <Badge variant="outline">
                              {AD_PLACEMENTS.find(p => p.value === ad.placement)?.label}
                            </Badge>
                            <Badge variant="outline">
                              Priority {ad.priority || 1}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="text-right text-sm text-gray-600 mr-4">
                          <div>{(ad.impressions || 0).toLocaleString()} impressions</div>
                          <div>{(ad.clicks || 0).toLocaleString()} clicks</div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(ad)}
                        >
                          {ad.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                        
                        <Select
                          value={ad.status}
                          onValueChange={(newStatus) => handleUpdateStatus(ad, newStatus)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {AD_STATUS.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAd(ad)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAd(ad.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No advertisements yet</h3>
                  <p className="text-gray-600 mb-6">Create your first ad campaign to get started</p>
                  <Button onClick={handleAddAd} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Ad
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ad Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {AD_PLACEMENTS.map((placement) => {
                  const placementAds = advertisements.filter(ad => ad.placement === placement.value);
                  const placementImpressions = placementAds.reduce((sum, ad) => sum + (ad.impressions || 0), 0);
                  const placementClicks = placementAds.reduce((sum, ad) => sum + (ad.clicks || 0), 0);
                  
                  return (
                    <div key={placement.value} className="border rounded-lg p-4">
                      <h4 className="font-medium text-sm text-gray-900 mb-2">{placement.label}</h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>Ads: {placementAds.length}</div>
                        <div>Impressions: {placementImpressions.toLocaleString()}</div>
                        <div>Clicks: {placementClicks.toLocaleString()}</div>
                        <div>CTR: {placementImpressions > 0 ? ((placementClicks / placementImpressions) * 100).toFixed(2) : 0}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="placements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ad Placement Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {AD_PLACEMENTS.map((placement) => (
                  <div key={placement.value} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{placement.label}</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {placement.value === 'homepage_hero' && 'Large banner at the top of the homepage, high visibility'}
                      {placement.value === 'homepage_featured' && 'Banner above the featured restaurants section'}
                      {placement.value === 'homepage_trending' && 'Small text/banner before trending dishes'}
                      {placement.value === 'restaurant_list_top' && 'Top banner on restaurant listing page'}
                      {placement.value === 'restaurant_list_inline' && 'Sponsored listings mixed with restaurants'}
                      {placement.value === 'restaurant_detail_menu' && 'Small banner on restaurant menu tab'}
                      {placement.value === 'restaurant_detail_reviews' && 'Banner on restaurant reviews tab'}
                      {placement.value === 'profile_sidebar' && 'Text ads on user profile pages'}
                      {placement.value === 'favorites_top' && 'Banner on top of favorites page'}
                      {placement.value === 'footer' && 'Large banner in website footer'}
                    </p>
                    <div className="text-xs text-gray-500">
                      Active ads: {advertisements.filter(ad => ad.placement === placement.value && ad.active).length}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ad Form Dialog */}
      <Dialog open={showAdForm} onOpenChange={setShowAdForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAd ? 'Edit Advertisement' : 'Create New Advertisement'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitAd} className="space-y-6">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Internal Title *</Label>
                <Input
                  id="title"
                  value={adForm.title}
                  onChange={(e) => setAdForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ad title for internal reference only"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This title is only for admin management - not shown to users
                </p>
              </div>
              <div>
                <Label htmlFor="advertiser_name">Advertiser Name</Label>
                <Input
                  id="advertiser_name"
                  value={adForm.advertiser_name}
                  onChange={(e) => setAdForm(prev => ({ ...prev, advertiser_name: e.target.value }))}
                  placeholder="Company/Advertiser name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Internal Notes (Optional)</Label>
              <Textarea
                id="description"
                value={adForm.description}
                onChange={(e) => setAdForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Internal notes about this advertisement"
                rows={2}
              />
              <p className="text-xs text-gray-500 mt-1">
                These notes are for admin use only - not displayed to users
              </p>
            </div>

            <div>
              <Label htmlFor="link_url">Click Destination URL (Optional)</Label>
              <Input
                id="link_url"
                value={adForm.link_url}
                onChange={(e) => setAdForm(prev => ({ ...prev, link_url: e.target.value }))}
                placeholder="https://example.com (leave empty for non-clickable image)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to display image without click functionality
              </p>
            </div>

            {/* Placement and Type */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="placement">Placement *</Label>
                <Select
                  value={adForm.placement}
                  onValueChange={(value) => setAdForm(prev => ({ ...prev, placement: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select placement" />
                  </SelectTrigger>
                  <SelectContent>
                    {AD_PLACEMENTS.map((placement) => (
                      <SelectItem key={placement.value} value={placement.value}>
                        {placement.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ad_type">Ad Type</Label>
                <Select
                  value={adForm.ad_type}
                  onValueChange={(value) => setAdForm(prev => ({ ...prev, ad_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AD_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority (1-10)</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  max="10"
                  value={adForm.priority}
                  onChange={(e) => setAdForm(prev => ({ ...prev, priority: e.target.value }))}
                />
              </div>
            </div>

            {/* Targeting */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="target_location">Target Location (Optional)</Label>
                <LocationCombobox
                  locations={locations}
                  value={adForm.target_location_id}
                  onValueChange={(value) => setAdForm(prev => ({ ...prev, target_location_id: value === 'all' ? '' : value }))}
                  placeholder="All locations"
                  searchPlaceholder="Search locations..."
                />
              </div>
              <div>
                <Label htmlFor="target_cuisine">Target Cuisine (Optional)</Label>
                <Input
                  id="target_cuisine"
                  value={adForm.target_cuisine_type}
                  onChange={(e) => setAdForm(prev => ({ ...prev, target_cuisine_type: e.target.value }))}
                  placeholder="e.g., Maldivian, Italian"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <Label>Advertisement Image *</Label>
              {adForm.image_url ? (
                <div className="mt-2 relative">
                  <img
                    src={adForm.image_url}
                    alt="Ad preview"
                    className="w-full max-w-md h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    onClick={removeAdImage}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="text-sm text-gray-600 mb-4">
                    Upload advertisement image (recommended: 1200x400px for banners)
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])}
                    className="hidden"
                    id="ad-image"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('ad-image').click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? 'Uploading...' : 'Choose Image'}
                  </Button>
                </div>
              )}
            </div>

            {/* Schedule and Budget */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date & Time</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={adForm.start_date}
                  onChange={(e) => setAdForm(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date & Time</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={adForm.end_date}
                  onChange={(e) => setAdForm(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="daily_budget">Daily Budget (MVR)</Label>
                <Input
                  id="daily_budget"
                  type="number"
                  step="0.01"
                  min="0"
                  value={adForm.daily_budget}
                  onChange={(e) => setAdForm(prev => ({ ...prev, daily_budget: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="total_budget">Total Budget (MVR)</Label>
                <Input
                  id="total_budget"
                  type="number"
                  step="0.01"
                  min="0"
                  value={adForm.total_budget}
                  onChange={(e) => setAdForm(prev => ({ ...prev, total_budget: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Status and Active */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={adForm.status}
                    onValueChange={(value) => setAdForm(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AD_STATUS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={adForm.active}
                    onCheckedChange={(checked) => setAdForm(prev => ({ ...prev, active: checked }))}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAdForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !adForm.title || !adForm.image_url || !adForm.placement}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    {editingAd ? 'Update Ad' : 'Create Ad'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
