
import React, { useState, useEffect } from 'react';
import { Restaurant, Location, Advertisement, Dish } from '@/api/entities';
import { Search, Filter, X, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LocationCombobox } from '@/components/ui/location-combobox';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import AdBanner from '../components/ads/AdBanner';
import SponsoredListing from '../components/ads/SponsoredListing';
import InteractiveMap from '../components/map/InteractiveMap';


export default function AllRestaurantsPage() {
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [locations, setLocations] = useState([]);
  const [sponsoredAds, setSponsoredAds] = useState([]);
  const [allDishes, setAllDishes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    loadData();
    
    // Check if there's a search query in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const searchFromUrl = urlParams.get('search');
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl);
    }
  }, []);

  useEffect(() => {
    let tempRestaurants = [...allRestaurants];

    // Filter by search query (restaurant name, cuisine, OR dish name)
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      
      // Find restaurant IDs from dishes that match the search query
      const matchingDishRestaurantIds = allDishes
        .filter(dish => dish.name.toLowerCase().includes(lowerQuery))
        .map(dish => dish.restaurant_id);
      
      const restaurantIdsFromDishes = new Set(matchingDishRestaurantIds);

      tempRestaurants = tempRestaurants.filter(r =>
        r.name.toLowerCase().includes(lowerQuery) ||
        r.cuisine_type.toLowerCase().includes(lowerQuery) ||
        restaurantIdsFromDishes.has(r.id)
      );
    }

    // Filter by location
    if (selectedLocation !== 'all') {
      tempRestaurants = tempRestaurants.filter(r => r.location_id === selectedLocation);
    }

    setFilteredRestaurants(tempRestaurants);
  }, [searchQuery, selectedLocation, allRestaurants, allDishes]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [restaurantData, locationData, adData, dishData] = await Promise.all([
        Restaurant.filter({ status: 'approved' }, '-created_date', 100).catch(err => { console.error("Failed to load restaurants", err); return []; }), // Limit initial load
        Location.list().catch(err => { console.error("Failed to load locations", err); return []; }),
        Advertisement.filter({
          placement: 'restaurant_list_inline',
          active: true,
          status: 'approved'
        }, '-priority').catch(err => { console.error("Failed to load sponsored ads", err); return []; }),
        Dish.list(undefined, 500).catch(err => { console.error("Failed to load dishes", err); return []; }) // Limit dish load
      ]);

      // Create enriched location data with display names, excluding atolls from the selectable list
      const atolls = locationData.filter(l => l.type === 'atoll');
      const islands = locationData.filter(l => l.type === 'island');
      
      const enrichedIslands = islands.map(island => {
        const parentAtoll = atolls.find(atoll => atoll.id === island.parent_id);
        return {
          ...island,
          display_name: parentAtoll ? `${island.name} (${parentAtoll.name})` : island.name
        };
      });
      
      const allLocations = enrichedIslands.sort((a, b) => a.display_name.localeCompare(b.display_name));


      // Enrich restaurant data with the new display_name for location_name
      const enrichedRestaurantData = restaurantData.map(r => {
        const location = allLocations.find(l => l.id === r.location_id);
        return {
          ...r,
          location_name: location ? location.display_name : 'Unknown Location'
        };
      });

      setAllRestaurants(enrichedRestaurantData);
      setFilteredRestaurants(enrichedRestaurantData);
      setLocations(allLocations);
      setSponsoredAds(adData);
      setAllDishes(dishData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  };

  const handleClearFilters = () => {
      setSearchQuery('');
      setSelectedLocation('all');
  };

  const handleAdClick = async (ad) => {
    // Ad click tracking is removed due to DB issues
    // try {
    //   await Advertisement.update(ad.id, {
    //     ...ad,
    //     clicks: (ad.clicks || 0) + 1
    //   });
    // } catch (error) {
    //   console.error('Error tracking ad click:', error);
    // }
  };

  // Insert sponsored listings every 6 restaurants
  const getDisplayItems = () => {
    const items = [];
    let adIndex = 0;

    filteredRestaurants.forEach((restaurant, index) => {
      items.push({ type: 'restaurant', data: restaurant });

      // Insert sponsored ad every 6 restaurants
      if ((index + 1) % 6 === 0 && adIndex < sponsoredAds.length) {
        const ad = sponsoredAds[adIndex];
        // Try to find a restaurant that matches the ad
        const sponsoredRestaurant = allRestaurants.find(r =>
          r.id === ad.target_restaurant_id ||
          r.cuisine_type === ad.target_cuisine_type ||
          r.location_id === ad.target_location_id
        ) || allRestaurants.find(r => r.featured);

        if (sponsoredRestaurant) {
          items.push({
            type: 'sponsored',
            data: sponsoredRestaurant,
            ad: ad
          });
          adIndex++;
        }
      }
    });

    return items;
  };

  return (
    <div className="py-12 lg:py-16 bg-white">
      {/* Top Banner Ad */}
      <div className="mb-8">
        <AdBanner
          placement="restaurant_list_top"
          className="h-32 lg:h-48"
          format="banner"
          targetLocation={selectedLocation !== 'all' ? selectedLocation : null}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-[var(--headings-labels)]">Explore Restaurants</h1>
          <p className="text-lg text-[var(--text-muted)] mt-3">Find your perfect dining spot in the Maldives.</p>
        </div>

        {/* Filters */}
        <div className="mb-10 p-6 bg-stone-50/70 rounded-lg border border-[var(--border-color)]">
          <div className="grid md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="search"
                  placeholder="Search by restaurant, cuisine, or dish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-base rounded-md bg-white border-[var(--border-color)]"
                />
              </div>
            </div>
            {/* Replaced Select with LocationCombobox */}
            <LocationCombobox
              locations={locations}
              value={selectedLocation}
              onValueChange={setSelectedLocation}
              placeholder="Filter by Location"
              searchPlaceholder="Search islands or atolls..."
              className="h-12"
            />
          </div>
        </div>

        {/* Add Map View Toggle */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant={showMap ? "outline" : "default"}
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              {showMap ? 'Hide Map' : 'Show Map'}
            </Button>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Map View */}
        {showMap && (
          <div className="mb-8 rounded-lg overflow-hidden soft-shadow">
            <InteractiveMap
              restaurants={filteredRestaurants}
              height="500px" // Increased height for better view
              initialZoom={7}
            />
          </div>
        )}

        {isLoading ? (
          <div className="text-center text-[var(--text-muted)]">Loading restaurants...</div>
        ) : filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {getDisplayItems().map((item, index) => (
              item.type === 'sponsored' ? (
                <SponsoredListing
                  key={`sponsored-${item.ad.id}-${index}`}
                  restaurant={item.data}
                  ad={item.ad}
                  onAdClick={handleAdClick}
                />
              ) : (
                <RestaurantCard
                  key={`restaurant-${item.data.id}`}
                  restaurant={item.data}
                />
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold font-playfair text-[var(--headings-labels)] mb-3">No Restaurants Found</h3>
            <p className="text-[var(--text-muted)] mb-6 max-w-md mx-auto">
              Try adjusting your search or filters.
            </p>
            <Button onClick={handleClearFilters} className="cta-button">
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
