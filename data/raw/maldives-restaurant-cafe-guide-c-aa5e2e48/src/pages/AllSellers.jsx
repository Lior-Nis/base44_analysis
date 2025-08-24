import React, { useState, useEffect } from 'react';
import { Seller, Location, SellerType } from '@/api/entities';
import { Search, Award, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SellerCard from '../components/marketplace/SellerCard';
import AdBanner from '../components/ads/AdBanner';

export default function AllSellersPage() {
  const [sellers, setSellers] = useState([]);
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [sellerTypes, setSellerTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sellerData, locationData, sellerTypeData] = await Promise.all([
        Seller.filter({ status: 'approved' }),
        Location.list(),
        SellerType.list()
      ]);

      const atolls = locationData.filter(l => l.type === 'atoll');
      const islands = locationData.filter(l => l.type === 'island');
      
      const enrichedIslands = islands.map(island => {
        const parentAtoll = atolls.find(atoll => atoll.id === island.parent_id);
        return {
          ...island,
          display_name: parentAtoll ? `${island.name} (${parentAtoll.name})` : island.name
        };
      }).sort((a, b) => a.display_name.localeCompare(b.display_name));

      const enrichedSellers = sellerData.map(seller => {
        const location = enrichedIslands.find(l => l.id === seller.location_id);
        return {
          ...seller,
          location_name: location ? location.display_name : 'Location TBD'
        };
      });
      
      setSellers(enrichedSellers);
      setFilteredSellers(enrichedSellers);
      setLocations(enrichedIslands);
      setSellerTypes(sellerTypeData);

    } catch (error) {
      console.error("Failed to load sellers data:", error);
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    let result = [...sellers];
    
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      result = result.filter(seller => 
        seller.name.toLowerCase().includes(lowercasedQuery) || 
        (seller.bio && seller.bio.toLowerCase().includes(lowercasedQuery))
      );
    }
    
    if (selectedLocation !== 'all') {
      result = result.filter(seller => seller.location_id === selectedLocation);
    }
    
    if (selectedType !== 'all') {
      result = result.filter(seller => seller.seller_type === selectedType);
    }
    
    setFilteredSellers(result);
  }, [searchQuery, selectedLocation, selectedType, sellers]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--primary-cta)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading Sellers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 lg:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-[var(--primary-cta)] rounded-lg flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-[var(--headings-labels)]">
            Our Sellers & Artisans
          </h1>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto mt-3">
            Discover the talented chefs, artisans, and suppliers bringing you the best of Maldivian flavors.
          </p>
        </div>

        <div className="mb-10 p-6 bg-stone-50/70 rounded-lg border border-[var(--border-color)]">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search sellers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 rounded-md"
              />
            </div>
            
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="h-12 rounded-md">
                <SelectValue placeholder="Filter by Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(loc => (
                  <SelectItem key={loc.id} value={loc.id}>{loc.display_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="h-12 rounded-md">
                <SelectValue placeholder="Filter by Seller Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Seller Types</SelectItem>
                {sellerTypes.map(type => (
                  <SelectItem key={type.slug} value={type.slug} className="capitalize">{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredSellers.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSellers.map(seller => (
              <SellerCard key={seller.id} seller={seller} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold font-playfair text-[var(--headings-labels)] mb-2">No sellers found</h3>
            <p className="text-[var(--text-muted)] mb-6">Try adjusting your search or filters.</p>
          </div>
        )}
        
        <div className="mt-16">
            <AdBanner placement="profile_sidebar" format="banner" />
        </div>

      </div>
    </div>
  );
}