import React, { useState, useEffect } from 'react';
import { Seller, Product } from '@/api/entities';
import { Mail, Phone, MapPin, Award } from 'lucide-react';
import ProductCard from '../components/marketplace/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function SellerProfilePage() {
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSellerData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sellerId = urlParams.get('id');

      if (!sellerId) {
        setIsLoading(false);
        return;
      }
      
      try {
        const [sellerData, productData] = await Promise.all([
          Seller.filter({ id: sellerId }),
          Product.filter({ seller_id: sellerId, status: 'approved' })
        ]);
        
        setSeller(sellerData[0]);
        setProducts(productData);

      } catch (error) {
        console.error('Error loading seller data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSellerData();
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading seller profile...</div>;
  }

  if (!seller) {
    return <div className="min-h-screen flex items-center justify-center">Seller not found.</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="relative">
        <img
          src={seller.cover_image || '/api/placeholder/1200/300'}
          alt={`${seller.name} cover`}
          className="w-full h-48 md:h-64 object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Info */}
        <div className="relative -mt-16 md:-mt-24">
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar className="w-32 h-32 border-4 border-white">
              <AvatarImage src={seller.profile_image} alt={seller.name} />
              <AvatarFallback className="text-4xl">{seller.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900">{seller.name}</h1>
              <p className="text-lg text-gray-600 capitalize mt-1">{seller.seller_type.replace('_', ' ')}</p>
              <Badge className="mt-2">{seller.status}</Badge>
              <p className="mt-4 text-gray-700 max-w-2xl">{seller.bio}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4 text-sm text-gray-600">
                {seller.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {seller.location}
                  </div>
                )}
                {seller.contact_email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" /> {seller.contact_email}
                  </div>
                )}
                {seller.contact_phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" /> {seller.contact_phone}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-shrink-0">
                <Button variant="outline">Follow</Button>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Products from {seller.name}</h2>
          {products.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg">
              <p className="text-gray-600">This seller has not listed any products yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}