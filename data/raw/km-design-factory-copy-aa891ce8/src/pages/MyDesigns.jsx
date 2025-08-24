
import React, { useState, useEffect } from 'react';
import { CustomJewelry } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Plus, Image, Clock, DollarSign, LogIn } from "lucide-react";
import { format } from 'date-fns';

const metalColors = {
  yellow_gold: 'from-yellow-400 to-yellow-600',
  white_gold: 'from-gray-200 to-gray-400',
  rose_gold: 'from-rose-300 to-rose-500',
  platinum: 'from-slate-300 to-slate-500',
  sterling_silver: 'from-gray-100 to-gray-300',
  titanium: 'from-gray-400 to-gray-600',
  gold_plated_stainless_steel: 'from-yellow-300 to-yellow-500',
  stainless_steel: 'from-gray-300 to-gray-500'
};

const gemstoneColors = {
  diamond: 'text-blue-100',
  ruby: 'text-red-400',
  sapphire: 'text-blue-400',
  emerald: 'text-green-400',
  pearl: 'text-gray-100',
  amethyst: 'text-purple-400',
  topaz: 'text-yellow-300',
  opal: 'text-pink-300',
  garnet: 'text-red-300',
  none: 'text-gray-400',
  moissanite: 'text-teal-200'
};

export default function MyDesigns() {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserAndDesigns();
  }, []);

  const loadUserAndDesigns = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      const data = await CustomJewelry.list('-created_date');
      setDesigns(data);
    } catch (error) {
      console.error('Error loading data:', error);
      setUser(null);
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    try {
      await User.loginWithRedirect(window.location.href);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center kiss-gradient">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading your designs...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center kiss-gradient">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8">
            <div className="w-16 h-16 mx-auto mb-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <LogIn className="w-8 h-8 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Please log in to view your custom jewelry designs and submissions.
            </p>
            <Button 
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold py-3"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Login with Google
            </Button>
            <p className="text-xs text-gray-400 mt-4">
              Secure authentication powered by Google
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 kiss-gradient">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Designs</h1>
            <p className="text-gray-300">Your custom jewelry collection</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-green-400 text-sm font-medium">Logged in as {user.full_name || user.email}</span>
            </div>
          </div>
          <Link to={createPageUrl('CustomizeJewelry')}>
            <Button className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold">
              <Plus className="w-5 h-5 mr-2" />
              New Design
            </Button>
          </Link>
        </div>

        {/* Designs Grid */}
        {designs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center">
              <Image className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No designs yet</h3>
            <p className="text-gray-400 mb-6">Start creating your first custom jewelry piece</p>
            <Link to={createPageUrl('CustomizeJewelry')}>
              <Button className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold">
                Create Your First Design
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {designs.map((design) => (
              <Card key={design.id} className="bg-white/10 backdrop-blur-sm border-white/20 overflow-hidden hover:bg-white/15 transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-white text-lg">{design.design_name}</CardTitle>
                    <div className="flex flex-wrap gap-1">
                      {(design.jewelry_types || (design.jewelry_type ? [design.jewelry_type] : [])).map((type, index) => (
                        <Badge key={index} className="bg-yellow-500/20 text-yellow-300 text-xs">
                          {type?.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Contact Info Summary */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="text-xs text-gray-600 space-y-1">
                      <div><strong>Contact:</strong> {design.contact_name}</div>
                      <div><strong>Email:</strong> {design.contact_email}</div>
                      <div><strong>Phone:</strong> {design.contact_phone}</div>
                      <div><strong>Preferred:</strong> {design.preferred_contact_method}</div>
                    </div>
                  </div>

                  {/* Design Image */}
                  {design.logo_image_url && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-black/20">
                      <img 
                        src={design.logo_image_url} 
                        alt={design.design_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Materials and Quantity */}
                  <div className="space-y-2">
                    {design.quantity && design.quantity > 1 && (
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 font-bold">Qty:</span>
                        <span className="text-gray-200 text-sm">
                          {design.quantity} pieces
                        </span>
                        {design.quantity >= 25 && (
                          <Badge className="bg-green-500/20 text-green-300 text-xs">
                            Bulk Order
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${metalColors[design.metal_type] || 'from-gray-400 to-gray-600'}`} />
                      <span className="text-gray-200 text-sm">
                        {design.metal_type?.replace('_', ' ')} {design.metal_karat}
                      </span>
                    </div>
                    
                    {design.gemstone_type && design.gemstone_type !== 'none' && (
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${gemstoneColors[design.gemstone_type]} font-bold text-xs flex items-center justify-center`}>
                          ◊
                        </div>
                        <span className="text-gray-200 text-sm">
                          {design.gemstone_size} {design.gemstone_type}
                        </span>
                      </div>
                    )}

                    {design.chain_style && (
                      <div className="flex items-center gap-2">
                        <span className="text-blue-400">○-○-○</span>
                        <span className="text-gray-200 text-sm">
                          {design.chain_style} chain, {design.chain_length}"
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Price and Date */}
                  <div className="flex justify-between items-center pt-3 border-t border-white/10">
                    <div className="flex flex-col items-start gap-1 text-yellow-400">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span className="font-bold">
                          {design.total_estimated_price 
                            ? `$${design.total_estimated_price}` 
                            : design.estimated_price 
                              ? `$${design.estimated_price}` 
                              : 'Quote pending'
                          }
                        </span>
                      </div>
                      {design.quantity > 1 && design.total_estimated_price && (
                        <span className="text-xs text-gray-400 ml-5">
                          (${Math.round(design.total_estimated_price / design.quantity)} each)
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                      <Clock className="w-3 h-3" />
                      {format(new Date(design.created_date), 'MMM d')}
                    </div>
                  </div>

                  {/* Special Instructions Preview */}
                  {design.special_instructions && (
                    <div className="p-3 bg-black/20 rounded-lg">
                      <p className="text-gray-300 text-xs font-semibold mb-1">Special Instructions:</p>
                      <p className="text-gray-300 text-xs leading-relaxed">
                        {design.special_instructions.length > 100 
                          ? `${design.special_instructions.substring(0, 100)}...`
                          : design.special_instructions
                        }
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
