import React, { useState, useEffect } from 'react';
import { Seller, Product, User as UserEntity } from '@/api/entities';
import { Package, Plus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import SellerRegistrationForm from '../components/marketplace/SellerRegistrationForm';
import ProductManagement from '../components/marketplace/ProductManagement';
import SellerSettings from '../components/marketplace/SellerSettings';
import AuthPrompt from '../components/auth/AuthPrompt';

export default function SellerPortal() {
  const [user, setUser] = useState(null);
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [promptLogin, setPromptLogin] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setPromptLogin(false);
    try {
      const currentUser = await UserEntity.me();
      setUser(currentUser);

      // Check if user already has a seller profile
      const sellerData = await Seller.filter({ owner_id: currentUser.id });
      if (sellerData.length > 0) {
        const sellerProfile = sellerData[0];
        setSeller(sellerProfile);

        // Load seller's products
        const sellerProducts = await Product.filter({ seller_id: sellerProfile.id });
        setProducts(sellerProducts);
      }
    } catch (error) {
      console.error('Error loading seller data:', error);
      setPromptLogin(true);
    }
    setIsLoading(false);
  };

  const handleSellerCreated = () => {
    setShowRegistrationForm(false);
    loadData();
  };
  
  const handleSellerUpdate = (updatedSeller) => {
    setSeller(updatedSeller);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--primary-cta)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading seller portal...</p>
        </div>
      </div>
    );
  }

  if (promptLogin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AuthPrompt
          title="Access Seller Portal"
          message="Please sign in to manage your marketplace store or to become a seller."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Seller Portal</h1>
            <p className="text-gray-600 mt-1">Manage your marketplace presence</p>
          </div>
          {seller && (
            <Button asChild className="bg-[var(--primary-cta)] hover:bg-[var(--primary-cta)]/90">
              <Link to={createPageUrl('Marketplace')}>
                <Eye className="w-4 h-4 mr-2" />
                View Marketplace
              </Link>
            </Button>
          )}
        </div>

        {!seller ? (
          // No seller profile - show getting started
          <div className="text-center py-16">
            <div className="max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-[var(--primary-cta)] rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to the Seller Portal
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Start selling your culinary products, ingredients, and handcrafted items to food lovers across the Maldives.
              </p>
              <Button
                size="lg"
                onClick={() => setShowRegistrationForm(true)}
                className="bg-[var(--primary-cta)] hover:bg-[var(--primary-cta)]/90"
              >
                Become a Seller
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {/* Seller Stats */}
            <div className="grid md:grid-cols-1 gap-6 mb-8">
              <Card>
                <CardContent className="p-6 flex items-center gap-4">
                  <Package className="w-8 h-8 text-[var(--primary-cta)]" />
                  <div>
                    <div className="text-2xl font-bold">{products.length}</div>
                    <div className="text-gray-600">Products Listed</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Seller Status */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[var(--primary-cta)] flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {seller.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{seller.name}</h3>
                      <p className="text-gray-600 capitalize">{seller.seller_type.replace('_', ' ')}</p>
                      <Badge
                        variant={seller.status === 'approved' ? 'default' : 'secondary'}
                        className="mt-1"
                      >
                        {seller.status === 'approved' ? '✓ Approved' : 'Pending Approval'}
                      </Badge>
                    </div>
                  </div>
                  <Link to={createPageUrl(`SellerProfile?id=${seller.id}`)}>
                    <Button variant="outline">View Public Profile</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid lg:grid-cols-1 gap-8">
                  {/* Recent Products */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {products.slice(0, 5).map((product) => (
                        <div key={product.id} className="flex items-center justify-between py-3 border-b last:border-0">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.images?.[0] || '/api/placeholder/50/50'}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-600">{product.price} {product.currency || 'MVR'}</p>
                            </div>
                          </div>
                          <Badge
                            variant={product.status === 'approved' ? 'default' : 'secondary'}
                          >
                            {product.status}
                          </Badge>
                        </div>
                      ))}
                       {products.length === 0 && <p className="text-center text-gray-500 py-4">No products listed yet.</p>}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="products">
                <ProductManagement
                  seller={seller}
                  products={products}
                  onProductsUpdate={setProducts}
                />
              </TabsContent>

              <TabsContent value="settings">
                <SellerSettings seller={seller} onUpdate={handleSellerUpdate} />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Registration Form Dialog */}
        <Dialog open={showRegistrationForm} onOpenChange={setShowRegistrationForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Become a Seller</DialogTitle>
            </DialogHeader>
            <SellerRegistrationForm
              onSuccess={handleSellerCreated}
              onCancel={() => setShowRegistrationForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}