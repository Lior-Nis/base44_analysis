
import React, { useState, useEffect } from 'react';
import { Restaurant, Location, User as UserEntity, Advertisement, BlogPost as BlogPostEntity, Poll as PollEntity, Product, Seller, Category, SellerType } from '@/api/entities';
import { Shield, CheckCircle, XCircle, MapPin, Plus, Edit3, Trash2, Eye, LayoutTemplate, Image, FileText, Package, Tag, Users as UsersIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

import AdminStats from '../components/admin/AdminStats';
import RestaurantApproval from '../components/admin/RestaurantApproval';
import LocationManagement from '../components/admin/LocationManagement';
import AdManagement from '../components/admin/AdManagement';
import UserManagement from '../components/admin/UserManagement';
import BlogManagement from '../components/admin/BlogManagement';
import PollManagement from '../components/admin/PollManagement';
// SpecialtyManagement removed as it's being unified under CategoryManagement
import SellerApproval from '../components/admin/SellerApproval';
import SiteContentManagement from '../components/admin/SiteContentManagement';
import HeroManagement from '../components/admin/HeroManagement';
import ProductApproval from '../components/admin/ProductApproval';
import CategoryManagement from '../components/admin/CategoryManagement';
import SellerTypeManagement from '../components/admin/SellerTypeManagement';
import { SendEmail } from '@/api/integrations';


export default function AdminPortal() {
  const [user, setUser] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [locations, setLocations] = useState([]);
  const [advertisements, setAdvertisements] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [polls, setPolls] = useState([]);
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [loadingError, setLoadingError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setLoadingError(null);
    
    try {
      // First check if user is admin
      const currentUser = await UserEntity.me();
      
      if (!currentUser.is_admin) {
        window.location.href = '/';
        return;
      }
      
      setUser(currentUser);

      // Load each dataset independently with error handling
      const dataPromises = [
        Restaurant.list('-created_date', 200).catch(err => { console.error('Failed to load restaurants:', err); return []; }),
        Location.list().catch(err => { console.error('Failed to load locations:', err); return []; }),
        Advertisement.list('-created_date').catch(err => { console.error('Failed to load advertisements:', err); return []; }),
        BlogPostEntity.list('-created_date').catch(err => { console.error('Failed to load blog posts:', err); return []; }),
        PollEntity.list('-created_date').catch(err => { console.error('Failed to load polls:', err); return []; }),
        Product.list('-created_date', 200).catch(err => { console.error('Failed to load products:', err); return []; }),
        Seller.list('-created_date', 200).catch(err => { console.error('Failed to load sellers:', err); return []; })
      ];

      const [restaurantData, locationData, adData, blogData, pollData, productData, sellerData] = await Promise.all(dataPromises);

      setRestaurants(restaurantData);
      setLocations(locationData);
      setAdvertisements(adData);
      setBlogPosts(blogData);
      setPolls(pollData);
      setProducts(productData);
      setSellers(sellerData);
      
    } catch (error) {
      console.error("Failed to load admin data or user is not admin:", error);
      setLoadingError('Failed to load admin data. Some features may not work properly.');
    }
    
    setIsLoading(false);
  };

  const handleRestaurantStatusUpdate = async (restaurantId, newStatus) => {
    try {
      const restaurantToUpdate = restaurants.find(r => r.id === restaurantId);
      if (!restaurantToUpdate) return;
      
      let rejectionReason = null;
      if (newStatus === 'rejected') {
        rejectionReason = prompt("Please provide a reason for rejecting this restaurant application:");
        if (rejectionReason === null) return; // Admin cancelled the prompt
      }
      
      await Restaurant.update(restaurantId, { status: newStatus });
      const updatedRestaurants = restaurants.map(r => 
        r.id === restaurantId ? { ...r, status: newStatus } : r
      );
      setRestaurants(updatedRestaurants);
      
      // Send notification email using Core integration directly
      try {
        const emailContent = getRestaurantEmailContent(newStatus, 'Partner', restaurantToUpdate.name, rejectionReason);
        await SendEmail({
          to: restaurantToUpdate.owner_email,
          subject: emailContent.subject,
          body: emailContent.body,
          from_name: "Dining Guide Team"
        });
      } catch (emailError) {
        console.error("Failed to send restaurant status email:", emailError);
      }

    } catch (error) {
      console.error('Error updating restaurant status:', error);
      alert('Failed to update restaurant status. Please try again.');
    }
  };

  const handleSellerStatusUpdate = async (sellerId, newStatus) => {
    try {
        const sellerToUpdate = sellers.find(s => s.id === sellerId);
        if (!sellerToUpdate) return;

        let rejectionReason = null;
        if (newStatus === 'rejected' || newStatus === 'suspended') {
            const actionText = newStatus === 'rejected' ? 'rejecting' : 'suspending';
            rejectionReason = prompt(`Please provide a reason for ${actionText} this seller:`);
            if (rejectionReason === null) return;
        }

        await Seller.update(sellerId, { status: newStatus });
        const updatedSellers = sellers.map(s =>
            s.id === sellerId ? { ...s, status: newStatus } : s
        );
        setSellers(updatedSellers);

        // Send notification email using Core integration directly
        try {
          const emailContent = getSellerEmailContent(newStatus, 'Partner', sellerToUpdate.name, rejectionReason);
          await SendEmail({
            to: sellerToUpdate.owner_email,
            subject: emailContent.subject,
            body: emailContent.body,
            from_name: "Dining Guide Team"
          });
        } catch (emailError) {
          console.error("Failed to send seller status email:", emailError);
        }
    } catch (error) {
        console.error('Error updating seller status:', error);
        alert('Failed to update seller status. Please try again.');
    }
  };

  // Helper functions for email content
  const getRestaurantEmailContent = (status, name, restaurantName, rejectionReason) => {
    const baseURL = typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'; // Fallback for SSR if needed
    const styles = `
      body { font-family: 'Inter', sans-serif; color: #333; line-height: 1.6; }
      .container { max-width: 600px; margin: 20px auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
      .header { font-size: 24px; font-weight: bold; color: #884C24; margin-bottom: 10px; }
      .button { background-color: #884C24; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
      .highlight { background-color: #f7fafc; border-left: 4px solid #884C24; padding: 15px; margin-top: 15px; }
      .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
    `;

    const htmlWrapper = (content) => `
      <html>
      <head>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
          <style>${styles}</style>
      </head>
      <body>
          <div class="container">
              ${content}
              <div class="footer">
                  Thank you for being a part of the Dining Guide community.<br>
                  This is an automated message. Please do not reply.
              </div>
          </div>
      </body>
      </html>
    `;

    if (status === 'approved') {
      return {
        subject: `Congratulations! Your restaurant "${restaurantName}" is now live!`,
        body: htmlWrapper(`
          <div class="header">You're Approved!</div>
          <p>Hi ${name},</p>
          <p>Great news! Your restaurant, <strong>${restaurantName}</strong>, has been approved and is now live on Dining Guide for all our users to see.</p>
          <div class="highlight">
              <p>Your restaurant is now visible to thousands of potential customers. Ensure your menu is up-to-date and your details are correct to attract more diners!</p>
          </div>
          <p>Log in to your portal to manage your listing, view analytics, and engage with customers.</p>
          <a href="${baseURL}/RestaurantPortal" class="button">Manage Your Restaurant</a>
        `)
      };
    } else if (status === 'rejected') {
      return {
        subject: `Update required for your restaurant application: "${restaurantName}"`,
        body: htmlWrapper(`
          <div class="header">Action Required</div>
          <p>Hi ${name},</p>
          <p>We've reviewed the application for your restaurant, <strong>${restaurantName}</strong>, and it requires some attention before we can approve it.</p>
          <div class="highlight">
              <p><strong>Reason for rejection:</strong></p>
              <p>${rejectionReason || "Please ensure all required documents are uploaded and information is complete. For specific details, please contact our support team."}</p>
          </div>
          <p>You can update your restaurant's information in your portal. If you have questions, feel free to reach out to our support team.</p>
          <a href="${baseURL}/RestaurantPortal" class="button">Update Your Information</a>
        `)
      };
    }
    return { subject: '', body: '' };
  };

  const getSellerEmailContent = (status, name, sellerName, rejectionReason) => {
    const baseURL = typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'; // Fallback for SSR if needed
    const styles = `
      body { font-family: 'Inter', sans-serif; color: #333; line-height: 1.6; }
      .container { max-width: 600px; margin: 20px auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
      .header { font-size: 24px; font-weight: bold; color: #884C24; margin-bottom: 10px; }
      .button { background-color: #884C24; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
      .highlight { background-color: #f7fafc; border-left: 4px solid #884C24; padding: 15px; margin-top: 15px; }
      .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
    `;

    const htmlWrapper = (content) => `
      <html>
      <head>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
          <style>${styles}</style>
      </head>
      <body>
          <div class="container">
              ${content}
              <div class="footer">
                  Thank you for being a part of the Dining Guide community.<br>
                  This is an automated message. Please do not reply.
              </div>
          </div>
      </body>
      </html>
    `;

    if (status === 'approved') {
      return {
        subject: `You're approved to sell on Dining Guide!`,
        body: htmlWrapper(`
          <div class="header">Start Selling!</div>
          <p>Hi ${name},</p>
          <p>Congratulations! Your seller profile, <strong>${sellerName}</strong>, has been approved. You can now start listing your products on the Dining Guide Marketplace.</p>
          <p>Log in to your portal to add your products and manage your store.</p>
          <a href="${baseURL}/SellerPortal" class="button">Manage Your Store</a>
        `)
      };
    } else if (status === 'rejected' || status === 'suspended') {
      return {
        subject: `Update required for your seller application: "${sellerName}"`,
        body: htmlWrapper(`
          <div class="header">Action Required</div>
          <p>Hi ${name},</p>
          <p>We've reviewed your seller application for <strong>${sellerName}</strong>. To move forward, we need a few more details from you.</p>
           <div class="highlight">
              <p><strong>Reason:</strong></p>
              <p>${rejectionReason || "Please ensure your profile information is complete and accurate. For specific details, please contact our support team."}</p>
          </div>
          <p>Please visit your Seller Portal to update your information. Contact support if you need assistance.</p>
          <a href="${baseURL}/SellerPortal" class="button">Update Your Profile</a>
        `)
      };
    }
    return { subject: '', body: '' };
  };

  const handleRestaurantFeatureToggle = async (restaurantId, currentStatus) => {
    try {
      await Restaurant.update(restaurantId, { featured: !currentStatus });
      const updatedRestaurants = restaurants.map(r => 
        r.id === restaurantId ? { ...r, featured: !currentStatus } : r
      );
      setRestaurants(updatedRestaurants);
    } catch (error) {
      console.error('Error updating restaurant feature status:', error);
      alert('Failed to update feature status. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--text-muted)]">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-[var(--brand-primary)] rounded-xl flex items-center justify-center shadow-md">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-dark)]">Admin Portal</h1>
            <p className="text-[var(--text-muted)]">Manage restaurants, locations, and platform content</p>
            {loadingError && (
              <div className="mt-2 text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded">
                {loadingError}
              </div>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="grid grid-cols-12 gap-6">
          <TabsList className="col-span-2 flex flex-col h-auto justify-start bg-white/80 border border-[var(--border-color)]">
            <TabsTrigger value="overview" className="w-full justify-start gap-2"><Eye className="w-4 h-4"/>Overview</TabsTrigger>
            <TabsTrigger value="hero" className="w-full justify-start gap-2"><Image className="w-4 h-4"/>Hero</TabsTrigger>
            <TabsTrigger value="content" className="w-full justify-start gap-2"><FileText className="w-4 h-4"/>Content</TabsTrigger>
            <TabsTrigger value="restaurants" className="w-full justify-start gap-2"><CheckCircle className="w-4 h-4"/>Restaurants</TabsTrigger>
            <TabsTrigger value="sellers" className="w-full justify-start gap-2"><UsersIcon className="w-4 h-4"/>Sellers</TabsTrigger>
            <TabsTrigger value="products" className="w-full justify-start gap-2"><Package className="w-4 h-4"/>Products</TabsTrigger>
            <TabsTrigger value="categories" className="w-full justify-start gap-2"><Tag className="w-4 h-4"/>Categories</TabsTrigger>
            <TabsTrigger value="sellerTypes" className="w-full justify-start gap-2"><UsersIcon className="w-4 h-4"/>Seller Types</TabsTrigger>
            <TabsTrigger value="locations" className="w-full justify-start gap-2"><MapPin className="w-4 h-4"/>Locations</TabsTrigger>
            <TabsTrigger value="ads" className="w-full justify-start gap-2"><LayoutTemplate className="w-4 h-4"/>Advertisements</TabsTrigger>
            <TabsTrigger value="blog" className="w-full justify-start gap-2"><FileText className="w-4 h-4"/>Blog</TabsTrigger>
            <TabsTrigger value="polls" className="w-full justify-start gap-2"><LayoutTemplate className="w-4 h-4"/>Polls</TabsTrigger>
            <TabsTrigger value="users" className="w-full justify-start gap-2"><UsersIcon className="w-4 h-4"/>Users</TabsTrigger>
          </TabsList>

          <div className="col-span-10">
            <TabsContent value="overview">
              <AdminStats 
                restaurants={restaurants}
                locations={locations}
                advertisements={advertisements}
                blogPosts={blogPosts}
                polls={polls}
                sellers={sellers}
              />
            </TabsContent>

            <TabsContent value="restaurants">
              <RestaurantApproval
                restaurants={restaurants}
                onStatusUpdate={handleRestaurantStatusUpdate}
                onFeatureToggle={handleRestaurantFeatureToggle}
              />
            </TabsContent>

            <TabsContent value="locations">
              <LocationManagement
                locations={locations}
                onLocationsUpdate={setLocations}
              />
            </TabsContent>

            <TabsContent value="ads">
              <AdManagement
                advertisements={advertisements}
                onAdsUpdate={setAdvertisements}
              />
            </TabsContent>

            <TabsContent value="blog">
              <BlogManagement
                posts={blogPosts}
                onPostsUpdate={setBlogPosts}
              />
            </TabsContent>

            <TabsContent value="polls">
              <PollManagement
                polls={polls}
                onPollsUpdate={setPolls}
              />
            </TabsContent>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            <TabsContent value="categories">
                <CategoryManagement />
            </TabsContent>
            
            <TabsContent value="sellerTypes">
                <SellerTypeManagement />
            </TabsContent>

            <TabsContent value="sellers">
              <SellerApproval 
                sellers={sellers}
                onStatusUpdate={handleSellerStatusUpdate}
              />
            </TabsContent>
            
            <TabsContent value="products">
              <ProductApproval products={products} onProductsUpdate={setProducts} />
            </TabsContent>

            <TabsContent value="hero">
              <HeroManagement />
            </TabsContent>
            
            <TabsContent value="content">
              <SiteContentManagement />
            </TabsContent>

          </div>
        </Tabs>
      </div>
    </div>
  );
}
