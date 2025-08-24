
import React, { useState, useEffect } from 'react';
import { Product, ProductReview, Seller } from '@/api/entities';
import { Star, Heart, Phone, Mail, MapPin, Package, Award, Clock, Shield, Eye, Globe, Instagram, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showSellerContact, setShowSellerContact] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (productId) {
      loadProduct(productId);
    }
  }, []);

  const loadProduct = async (productId) => {
    setIsLoading(true);
    try {
      // Step 1: Fetch the main product data first, as other fetches depend on it.
      const productData = await Product.filter({ id: productId });
      
      if (productData.length === 0) {
        console.error('Product not found');
        setProduct(null);
        setIsLoading(false);
        return;
      }

      const prod = productData[0];
      setProduct(prod);

      // Step 2: Fire-and-forget the view count update. We don't need to wait for it.
      Product.update(prod.id, { views: (prod.views || 0) + 1 })
          .catch(updateError => console.warn('Could not update view count:', updateError));

      // Step 3: Concurrently fetch all related data (reviews and seller).
      const dataPromises = [
        // Promise for reviews
        ProductReview.filter({ product_id: productId }, '-created_date').catch(err => {
          console.warn('Could not load reviews:', err);
          return []; // Return empty array on failure
        }),

        // Promise for seller
        prod.seller_id
          ? Seller.filter({ id: prod.seller_id }).catch(err => {
              // This is a data integrity issue, not a critical app error.
              // Log a specific warning and return an empty array to let the page render.
              console.warn(`Data issue: Seller with ID '${prod.seller_id}' not found for Product '${prod.name}'. The seller may have been deleted.`);
              return []; // Return empty array on failure
            })
          : Promise.resolve([]), // Resolve immediately if no seller_id
      ];

      const [reviewsResult, sellerResult] = await Promise.all(dataPromises);

      setReviews(reviewsResult);

      if (sellerResult && sellerResult.length > 0) {
        setSeller(sellerResult[0]);
      } else {
        // No need to log here, as the specific warning is now handled within the catch block of Seller.filter
        setSeller(null);
      }

    } catch (error) {
      console.error('Error loading product page:', error);
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSeller = () => {
    setShowSellerContact(true);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--primary-cta)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Product Not Found</h3>
          <p className="text-gray-500">The product you're looking for doesn't exist.</p>
          <div className="mt-4">
            <Link to={createPageUrl('Marketplace')}>
              <Button className="bg-[var(--primary-cta)] hover:bg-[var(--primary-cta)]/90">
                Back to Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-4 md:mb-8">
          <Link to={createPageUrl('Marketplace')} className="hover:text-[var(--primary-cta)]">
            Marketplace
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--text-body)]">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-12 mb-8 md:mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-xl overflow-hidden shadow-lg">
              <img
                src={product.images?.[selectedImageIndex] || product.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=600&fit=crop'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 ${
                      index === selectedImageIndex ? 'border-[var(--primary-cta)]' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {product.new_arrival && (
                  <Badge className="bg-green-100 text-green-800">New Arrival</Badge>
                )}
                {product.chef_recommended && (
                  <Badge className="bg-purple-100 text-purple-800">
                    <Award className="w-3 h-3 mr-1" />
                    Chef's Pick
                  </Badge>
                )}
                {product.maldivian_classic && (
                  <Badge className="bg-blue-100 text-blue-800">Maldivian Classic</Badge>
                )}
                {product.organic && (
                  <Badge className="bg-green-100 text-green-800">Organic</Badge>
                )}
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{product.views || 0} views</span>
                </div>
                {product.average_rating > 0 && (
                  <div className="flex items-center gap-1">
                    {renderStars(Math.round(product.average_rating))}
                    <span className="ml-1">({reviews.length} reviews)</span>
                  </div>
                )}
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-[var(--primary-cta)]">
                  {product.price} {product.currency}
                </span>
                {product.weight && (
                  <span className="text-gray-600">/ {product.weight}</span>
                )}
              </div>

              <p className="text-gray-700 mb-6">{product.description}</p>
            </div>

            {/* Contact Actions */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <Button
                  onClick={handleContactSeller}
                  className="flex-1 bg-[var(--primary-cta)] hover:bg-[var(--primary-cta)]/90"
                  disabled={!seller}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {seller ? 'Contact Seller' : 'Seller Info Unavailable'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsFavorited(!isFavorited)}
                  className="px-4"
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>

              {showSellerContact && seller && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-blue-900 mb-3">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      {seller.contact_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-blue-600" />
                          <a href={`tel:${seller.contact_phone}`} className="text-blue-600 hover:underline">
                            {seller.contact_phone}
                          </a>
                        </div>
                      )}
                      {seller.contact_email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-blue-600" />
                          <a href={`mailto:${seller.contact_email}`} className="text-blue-600 hover:underline">
                            {seller.contact_email}
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {showSellerContact && !seller && (
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-yellow-900 mb-2">Contact Information</h4>
                    <p className="text-sm text-yellow-800">
                      Seller contact information is currently unavailable. Please try again later.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Category</p>
                <p className="font-medium capitalize">{product.category?.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-gray-600">Stock</p>
                <p className="font-medium">
                  {product.stock_quantity > 0 ? `${product.stock_quantity} available` : 'Out of stock'}
                </p>
              </div>
              {product.origin_island && (
                <div>
                  <p className="text-gray-600">Origin</p>
                  <p className="font-medium">{product.origin_island}</p>
                </div>
              )}
              {product.preparation_time && (
                <div>
                  <p className="text-gray-600">Preparation Time</p>
                  <p className="font-medium">{product.preparation_time}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seller Info */}
        {seller && (
          <Card className="mb-8 md:mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Seller Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    {seller.profile_image ? (
                      <img src={seller.profile_image} alt={seller.name} className="w-full h-full object-cover" />
                    ) : (
                      <AvatarFallback className="bg-[var(--primary-cta)] text-white text-lg">
                        {seller.name.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{seller.name}</h3>
                    <p className="text-gray-600 capitalize">{seller.seller_type.replace('_', ' ')}</p>
                    <p className="text-sm text-gray-500">{seller.location}</p>
                  </div>
                </div>
                
                <div className="flex-1">
                  <p className="text-gray-700 mb-4">{seller.bio}</p>
                  
                  {seller.social_media && (
                    <div className="flex gap-3">
                      {seller.social_media.website && (
                        <a href={seller.social_media.website} target="_blank" rel="noopener noreferrer">
                          <Globe className="w-5 h-5 text-gray-600 hover:text-[var(--primary-cta)]" />
                        </a>
                      )}
                      {seller.social_media.instagram && (
                        <a href={seller.social_media.instagram} target="_blank" rel="noopener noreferrer">
                          <Instagram className="w-5 h-5 text-gray-600 hover:text-[var(--primary-cta)]" />
                        </a>
                      )}
                      {seller.social_media.facebook && (
                        <a href={seller.social_media.facebook} target="_blank" rel="noopener noreferrer">
                          <Facebook className="w-5 h-5 text-gray-600 hover:text-[var(--primary-cta)]" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row md:flex-col gap-2">
                  <Link to={createPageUrl(`SellerProfile?id=${seller.id}`)}>
                    <Button variant="outline" className="w-full">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Product Details Tabs */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Product Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Weight/Size:</span>
                        <span>{product.weight || 'Not specified'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Origin:</span>
                        <span>{product.origin_island || 'Maldives'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shelf Life:</span>
                        <span>{product.shelf_life || 'See packaging'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Halal Certified:</span>
                        <span>{product.halal_certified ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {product.ingredients_list && product.ingredients_list.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Ingredients</h3>
                      <div className="text-sm text-gray-700">
                        {product.ingredients_list.join(', ')}
                      </div>
                    </div>
                  )}
                </div>
                
                {product.usage_instructions && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Usage Instructions</h3>
                    <p className="text-sm text-gray-700">{product.usage_instructions}</p>
                  </div>
                )}
                
                {product.storage_instructions && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Storage Instructions</h3>
                    <p className="text-sm text-gray-700">{product.storage_instructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="p-6">
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-6 last:border-b-0">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarFallback>{review.user_name?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">{review.user_name || 'Anonymous'}</span>
                              <div className="flex">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                            {review.title && (
                              <h4 className="font-medium mb-1">{review.title}</h4>
                            )}
                            <p className="text-gray-700">{review.comment}</p>
                            {review.verified_purchase && (
                              <Badge variant="outline" className="mt-2">
                                <Shield className="w-3 h-3 mr-1" />
                                Verified Purchase
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="shipping" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3">Delivery Options</h3>
                    {product.delivery_options && product.delivery_options.length > 0 ? (
                      <div className="space-y-2">
                        {product.delivery_options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-[var(--primary-cta)] rounded-full"></div>
                            <span className="capitalize">{option.replace('_', ' ')}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">Contact seller for delivery options</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Preparation Time</h3>
                    <p className="text-gray-700">{product.preparation_time || 'Contact seller for details'}</p>
                  </div>
                  
                  {product.delivery_cost && (
                    <div>
                      <h3 className="font-semibold mb-3">Delivery Cost</h3>
                      <p className="text-gray-700">{product.delivery_cost} {product.currency}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
