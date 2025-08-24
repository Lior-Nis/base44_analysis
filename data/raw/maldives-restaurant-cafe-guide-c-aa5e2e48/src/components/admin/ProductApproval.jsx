import React, { useState } from 'react';
import { Product } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Star, Trash2 } from 'lucide-react';

export default function ProductApproval({ products, onProductsUpdate }) {

  const handleUpdate = async (product, updates) => {
    try {
      const updatedProduct = await Product.update(product.id, { ...product, ...updates });
      onProductsUpdate(prev => prev.map(p => p.id === product.id ? updatedProduct : p));
    } catch (error) {
      console.error(`Error updating product ${product.id}:`, error);
    }
  };
  
  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to permanently delete this product?')) {
      try {
        await Product.delete(productId);
        onProductsUpdate(prev => prev.filter(p => p.id !== productId));
      } catch (error) {
        console.error(`Error deleting product ${productId}:`, error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <h2 className="text-2xl font-bold">Product Management</h2>
        {products.map(product => (
          <div key={product.id} className="border p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={product.images?.[0] || '/api/placeholder/80/80'} alt={product.name} className="w-20 h-20 rounded-md object-cover" />
              <div>
                <h3 className="font-bold">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.price} {product.currency}</p>
                <div className="flex items-center gap-2 mt-2">
                    <Badge className={getStatusColor(product.status)}>{product.status}</Badge>
                    {product.featured && <Badge className="bg-blue-100 text-blue-800">Featured</Badge>}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleUpdate(product, { status: 'approved' })}><CheckCircle className="w-4 h-4 mr-2"/>Approve</Button>
              <Button size="sm" variant="outline" onClick={() => handleUpdate(product, { status: 'rejected' })}><XCircle className="w-4 h-4 mr-2"/>Reject</Button>
              <Button size="sm" variant="outline" onClick={() => handleUpdate(product, { featured: !product.featured })}><Star className="w-4 h-4 mr-2"/>{product.featured ? 'Unfeature' : 'Feature'}</Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}><Trash2 className="w-4 h-4"/></Button>
            </div>
          </div>
        ))}
         {products.length === 0 && <p className="text-center text-gray-500 py-8">No products found.</p>}
      </CardContent>
    </Card>
  );
}