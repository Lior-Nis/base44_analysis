
import React, { useState, useEffect } from 'react';
import { CustomJewelry } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image, Clock, DollarSign, Search, Filter, Users } from "lucide-react";
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

export default function AllDesigns() {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMetal, setFilterMetal] = useState('all');
  const [sortBy, setSortBy] = useState('-created_date');

  useEffect(() => {
    loadUserAndDesigns();
  }, []);

  const loadUserAndDesigns = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      if (currentUser.role === 'admin') {
        const data = await CustomJewelry.list(sortBy);
        setDesigns(data);
      } else {
        // Non-admin users should be redirected or see empty state
        setDesigns([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const filteredDesigns = designs.filter(design => {
    const matchesSearch = !searchTerm || 
      design.design_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      design.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      design.contact_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMetal = filterMetal === 'all' || design.metal_type === filterMetal;
    
    return matchesSearch && matchesMetal;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center kiss-gradient">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading designs...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center kiss-gradient">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center">
            <Users className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Admin Access Required</h3>
          <p className="text-gray-400 mb-6">This page is restricted to administrators only.</p>
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
            <h1 className="text-4xl font-bold text-white mb-2">All Design Submissions</h1>
            <p className="text-gray-300">Admin dashboard - All customer designs</p>
          </div>
          <Badge className="bg-red-500/20 text-red-300 px-4 py-2">
            Admin Access
          </Badge>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 space-y-4 lg:space-y-0 lg:flex lg:gap-4 lg:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or design..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterMetal}
              onChange={(e) => setFilterMetal(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
            >
              <option value="all">All Metals</option>
              <option value="yellow_gold">Yellow Gold</option>
              <option value="white_gold">White Gold</option>
              <option value="rose_gold">Rose Gold</option>
              <option value="platinum">Platinum</option>
              <option value="sterling_silver">Sterling Silver</option>
              <option value="titanium">Titanium</option>
              <option value="stainless_steel">Stainless Steel</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
            >
              <option value="-created_date">Newest First</option>
              <option value="created_date">Oldest First</option>
              <option value="-total_estimated_price">Highest Value</option>
              <option value="total_estimated_price">Lowest Value</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Total Submissions</p>
                  <p className="text-2xl font-bold text-white">{designs.length}</p>
                </div>
                <Users className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Total Est. Value</p>
                  <p className="text-2xl font-bold text-white">
                    ${designs.reduce((sum, d) => sum + (d.total_estimated_price || 0), 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Avg. Order Value</p>
                  <p className="text-2xl font-bold text-white">
                    ${designs.length > 0 ? Math.round(designs.reduce((sum, d) => sum + (d.total_estimated_price || 0), 0) / designs.length) : 0}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Designs Grid */}
        {filteredDesigns.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center">
              <Image className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No designs found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDesigns.map((design) => (
              <Card key={design.id} className="bg-white/10 backdrop-blur-sm border-white/20 overflow-hidden hover:bg-white/15 transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-white text-lg">{design.design_name}</CardTitle>
                    <div className="flex flex-wrap gap-1">
                      {(design.jewelry_types || []).map((type, index) => (
                        <Badge key={index} className="bg-yellow-500/20 text-yellow-300 text-xs">
                          {type?.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="text-xs text-gray-300 space-y-1">
                      <div><strong>Name:</strong> {design.contact_name}</div>
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

                  {/* Materials and Specs */}
                  <div className="space-y-2">
                    {design.quantity && design.quantity > 1 && (
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 font-bold">Qty:</span>
                        <span className="text-gray-200 text-sm">{design.quantity} pieces</span>
                        {design.quantity >= 25 && (
                          <Badge className="bg-green-500/20 text-green-300 text-xs">Bulk</Badge>
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
                          ${design.total_estimated_price || design.estimated_price || 0}
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

                  {/* Special Instructions */}
                  {design.special_instructions && (
                    <div className="p-3 bg-black/20 rounded-lg">
                      <p className="text-gray-300 text-xs font-semibold mb-1">Special Instructions:</p>
                      <p className="text-gray-300 text-xs leading-relaxed">
                        {design.special_instructions}
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
