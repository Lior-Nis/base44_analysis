
import React, { useState } from 'react';
import { CheckCircle, XCircle, Eye, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import RestaurantDetailView from './RestaurantDetailView';

export default function RestaurantApproval({ restaurants, onStatusUpdate, onFeatureToggle }) {
  const pendingRestaurants = restaurants.filter(r => r.status === 'pending');
  const approvedRestaurants = restaurants.filter(r => r.status === 'approved');
  const rejectedRestaurants = restaurants.filter(r => r.status === 'rejected');
  
  const RestaurantRow = ({ restaurant }) => (
    <div className="flex justify-between items-center p-4 border rounded-lg bg-white">
      <div>
        <h3 className="font-medium">{restaurant.name}</h3>
        <p className="text-sm text-gray-500">{restaurant.cuisine_type}</p>
      </div>
      <div className="flex items-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm"><Eye className="w-4 h-4 mr-1" /> View</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Restaurant Details: {restaurant.name}</DialogTitle>
            </DialogHeader>
            <RestaurantDetailView restaurant={restaurant} />
          </DialogContent>
        </Dialog>
        {restaurant.status === 'pending' && (
          <>
            <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50 hover:text-green-700" onClick={() => onStatusUpdate(restaurant.id, 'approved')}>
              <CheckCircle className="w-4 h-4 mr-1" /> Approve
            </Button>
            <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => onStatusUpdate(restaurant.id, 'rejected')}>
              <XCircle className="w-4 h-4 mr-1" /> Reject
            </Button>
          </>
        )}
        {restaurant.status === 'approved' && (
           <Button 
             size="sm" 
             variant={restaurant.featured ? "default" : "outline"}
             className="text-yellow-600" 
             onClick={() => onFeatureToggle(restaurant.id, restaurant.featured)}
           >
             <Star className="w-4 h-4 mr-1" /> {restaurant.featured ? 'Unfeature' : 'Feature'}
           </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Pending Approval ({pendingRestaurants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRestaurants.length > 0 ? (
            <div className="space-y-4">
              {pendingRestaurants.map(r => <RestaurantRow key={r.id} restaurant={r} />)}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No restaurants pending approval.</p>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             <CheckCircle className="w-5 h-5 text-green-500" />
             Approved Restaurants ({approvedRestaurants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {approvedRestaurants.length > 0 ? (
            <div className="space-y-4">
              {approvedRestaurants.map(r => <RestaurantRow key={r.id} restaurant={r} />)}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No approved restaurants yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            Rejected Restaurants ({rejectedRestaurants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rejectedRestaurants.length > 0 ? (
            <div className="space-y-4">
              {rejectedRestaurants.map(r => <RestaurantRow key={r.id} restaurant={r} />)}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No rejected restaurants.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
