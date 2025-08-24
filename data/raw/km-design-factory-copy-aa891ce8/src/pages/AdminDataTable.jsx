import React, { useState, useEffect } from 'react';
import { CustomJewelry } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Filter, Users, Eye, EyeOff } from "lucide-react";
import { format } from 'date-fns';

export default function AdminDataTable() {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('created_date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showAllColumns, setShowAllColumns] = useState(false);

  useEffect(() => {
    loadUserAndDesigns();
  }, []);

  const loadUserAndDesigns = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      if (currentUser.role === 'admin') {
        const data = await CustomJewelry.list('-created_date');
        setDesigns(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedAndFilteredData = () => {
    let filtered = designs.filter(design => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        design.design_name?.toLowerCase().includes(search) ||
        design.contact_name?.toLowerCase().includes(search) ||
        design.contact_email?.toLowerCase().includes(search) ||
        design.contact_phone?.includes(search) ||
        design.metal_type?.toLowerCase().includes(search) ||
        design.jewelry_types?.some(type => type.toLowerCase().includes(search))
      );
    });

    return filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'jewelry_types') {
        aVal = a[sortField]?.join(', ') || '';
        bVal = b[sortField]?.join(', ') || '';
      }
      
      if (sortField === 'created_date') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const exportToCSV = () => {
    const data = getSortedAndFilteredData();
    const headers = [
      'Design Name', 'Contact Name', 'Email', 'Phone', 'Preferred Contact',
      'Jewelry Types', 'Metal Type', 'Metal Karat', 'Gemstone Type', 'Gemstone Size',
      'Chain Style', 'Chain Length', 'Chain Thickness', 'Closure Type',
      'Quantity', 'Unit Price', 'Total Price', 'Special Instructions', 'Created Date'
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(design => [
        `"${design.design_name || ''}"`,
        `"${design.contact_name || ''}"`,
        `"${design.contact_email || ''}"`,
        `"${design.contact_phone || ''}"`,
        `"${design.preferred_contact_method || ''}"`,
        `"${(design.jewelry_types || []).join(', ')}"`,
        `"${design.metal_type || ''}"`,
        `"${design.metal_karat || ''}"`,
        `"${design.gemstone_type || ''}"`,
        `"${design.gemstone_size || ''}"`,
        `"${design.chain_style || ''}"`,
        `"${design.chain_length || ''}"`,
        `"${design.chain_thickness || ''}"`,
        `"${design.closure_type || ''}"`,
        `"${design.quantity || ''}"`,
        `"${design.estimated_price || ''}"`,
        `"${design.total_estimated_price || ''}"`,
        `"${(design.special_instructions || '').replace(/"/g, '""')}"`,
        `"${format(new Date(design.created_date), 'yyyy-MM-dd HH:mm')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `jewelry-designs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center kiss-gradient">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading data...</p>
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

  const filteredData = getSortedAndFilteredData();

  return (
    <div className="min-h-screen p-6 kiss-gradient">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Design Data Table</h1>
            <p className="text-gray-300">Complete spreadsheet view of all submissions</p>
          </div>
          <Badge className="bg-red-500/20 text-red-300 px-4 py-2">
            Admin Only
          </Badge>
        </div>

        {/* Controls */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search designs, names, emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowAllColumns(!showAllColumns)}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {showAllColumns ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showAllColumns ? 'Hide Details' : 'Show All'}
                </Button>
                
                <Button
                  onClick={exportToCSV}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-300">
              Showing {filteredData.length} of {designs.length} submissions
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="bg-white border border-gray-200 shadow-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th 
                      className="px-4 py-3 text-left font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('created_date')}
                    >
                      Date {sortField === 'created_date' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-4 py-3 text-left font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('design_name')}
                    >
                      Design Name {sortField === 'design_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-4 py-3 text-left font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('contact_name')}
                    >
                      Contact Name {sortField === 'contact_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">Phone</th>
                    {showAllColumns && (
                      <>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">Preferred Contact</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">Image</th>
                      </>
                    )}
                    <th className="px-4 py-3 text-left font-medium text-gray-900">Jewelry Types</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900">Metal</th>
                    {showAllColumns && (
                      <>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">Gemstone</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-900">Chain</th>
                      </>
                    )}
                    <th 
                      className="px-4 py-3 text-left font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('quantity')}
                    >
                      Qty {sortField === 'quantity' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-4 py-3 text-left font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('total_estimated_price')}
                    >
                      Total Price {sortField === 'total_estimated_price' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    {showAllColumns && (
                      <th className="px-4 py-3 text-left font-medium text-gray-900">Special Instructions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((design, index) => (
                    <tr key={design.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-gray-900">
                        {format(new Date(design.created_date), 'MM/dd/yy')}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {design.design_name}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {design.contact_name}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        <a href={`mailto:${design.contact_email}`} className="text-blue-600 hover:underline">
                          {design.contact_email}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        <a href={`tel:${design.contact_phone}`} className="text-blue-600 hover:underline">
                          {design.contact_phone}
                        </a>
                      </td>
                      {showAllColumns && (
                        <>
                          <td className="px-4 py-3 text-gray-900">
                            <Badge variant="outline">{design.preferred_contact_method}</Badge>
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            {design.logo_image_url ? (
                              <a href={design.logo_image_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                View Image
                              </a>
                            ) : (
                              <span className="text-gray-400">None</span>
                            )}
                          </td>
                        </>
                      )}
                      <td className="px-4 py-3 text-gray-900">
                        <div className="flex flex-wrap gap-1">
                          {(design.jewelry_types || []).map((type, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {type.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        <div className="text-xs">
                          <div>{design.metal_type?.replace('_', ' ')}</div>
                          {design.metal_karat && (
                            <div className="text-gray-500">{design.metal_karat}</div>
                          )}
                        </div>
                      </td>
                      {showAllColumns && (
                        <>
                          <td className="px-4 py-3 text-gray-900">
                            {design.gemstone_type && design.gemstone_type !== 'none' ? (
                              <div className="text-xs">
                                <div>{design.gemstone_size}</div>
                                <div>{design.gemstone_type}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">None</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            {design.chain_style ? (
                              <div className="text-xs">
                                <div>{design.chain_style}</div>
                                <div>{design.chain_length}"</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">None</span>
                            )}
                          </td>
                        </>
                      )}
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {design.quantity}
                        {design.quantity >= 25 && (
                          <Badge className="ml-1 bg-green-100 text-green-800 text-xs">Bulk</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-bold">
                        ${design.total_estimated_price || design.estimated_price || 0}
                      </td>
                      {showAllColumns && (
                        <td className="px-4 py-3 text-gray-900 max-w-xs">
                          {design.special_instructions ? (
                            <div className="text-xs line-clamp-3">
                              {design.special_instructions}
                            </div>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center">
              <Filter className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No data found</h3>
            <p className="text-gray-400">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}