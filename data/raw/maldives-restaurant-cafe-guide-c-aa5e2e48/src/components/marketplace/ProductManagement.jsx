
import React, { useState, useEffect } from 'react';
import { Product, Category } from '@/api/entities';
import { Plus, Edit3, Trash2, Save, X, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { UploadFile } from '@/api/integrations';
import { CategoryCombobox } from '@/components/ui/CategoryCombobox';

// ProductForm component for adding/editing products
const ProductForm = ({ seller, product, onSuccess }) => {
  const [formData, setFormData] = useState(
    product ? {
      // Initialize with existing product data if editing
      name: product.name || '',
      description: product.description || '',
      price: product.price !== undefined ? product.price : '', // Use empty string for number inputs to avoid "0" default
      category: product.category || '',
      unit_of_measurement: product.unit_of_measurement || '', // Added unit_of_measurement
      images: product.images || [],
      status: product.status || 'pending',
      seller_id: seller.id
    } : {
      // Default values for new product
      name: '',
      description: '',
      price: '',
      category: '',
      unit_of_measurement: '', // Added unit_of_measurement
      images: [],
      status: 'pending',
      seller_id: seller.id,
      seller_type: seller.seller_type
    }
  );
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await Category.list();
      setCategories(cats);
      // Set default category if adding new product and categories are loaded, and no category is selected yet
      if (!product && cats.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: cats[0].slug }));
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    setIsUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(file => UploadFile({ file }));
      const results = await Promise.all(uploadPromises);
      const urls = results.map(res => res.file_url);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...urls]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
    }
    setIsUploadingImages(false);
  };
  
  const handleRemoveImage = (urlToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== urlToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Prepare data for submission, converting numbers
      const dataToSave = {
        ...formData,
        price: parseFloat(formData.price),
        seller_id: seller.id,
        status: formData.status || 'pending'
      };

      let resultProduct;
      if (product) {
        // When updating, merge the original product's fields with the form's editable fields
        // Note: stock_quantity is removed from dataToSave, implying it's not managed by this form
        resultProduct = await Product.update(product.id, { ...product, ...dataToSave });
      } else {
        resultProduct = await Product.create(dataToSave);
      }
      onSuccess(resultProduct); // Pass the created/updated product back
    } catch (error) {
      console.error("Failed to save product", error);
      // TODO: Add user-friendly error message display
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Product Name</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price (MVR)</Label>
          <Input id="price" type="number" name="price" value={formData.price} onChange={handleInputChange} required />
        </div>
        <div>
          <Label htmlFor="unit_of_measurement">Unit of Measurement</Label>
          <Input 
            id="unit_of_measurement" 
            name="unit_of_measurement" 
            value={formData.unit_of_measurement} 
            onChange={handleInputChange} 
            placeholder="e.g., kg, pieces, bottles"
            required 
          />
        </div>
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <CategoryCombobox
          categories={categories}
          value={formData.category}
          onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
        />
      </div>
      <div>
        <Label htmlFor="image-upload-product-form">Images</Label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleImageUpload(e.target.files)}
          className="hidden"
          id="image-upload-product-form"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById('image-upload-product-form').click()}
          disabled={isUploadingImages}
        >
          {isUploadingImages ? 'Uploading...' : 'Add Images'}
        </Button>
        <div className="flex flex-wrap gap-2 mt-2">
            {formData.images.map(url => (
              <div key={url} className="relative">
                <img src={url} alt="Product" className="w-20 h-20 object-cover rounded" />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 p-1 h-6 w-6 rounded-full"
                  onClick={() => handleRemoveImage(url)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
        </div>
      </div>
      <div className="flex justify-end gap-4">
        <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess(null)} // Pass null to signify cancellation
        >
            Cancel
        </Button>
        <Button
            type="submit"
            disabled={isSubmitting || isUploadingImages}
            className="bg-[var(--primary-cta)] hover:bg-[var(--primary-cta)]/90"
        >
            {isSubmitting ? (
                <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                </>
            ) : (
                <>
                    <Save className="w-4 h-4 mr-2" />
                    {product ? 'Update Product' : 'Add Product'}
                </>
            )}
        </Button>
      </div>
    </form>
  );
};


export default function ProductManagement({ seller, products, onProductsUpdate }) {
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const resetForm = () => {
    setEditingProduct(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDelete = async (productId) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await Product.delete(productId);
        const updatedProducts = products.filter(p => p.id !== productId);
        onProductsUpdate(updatedProducts);
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleProductFormSuccess = (productData) => {
    setShowProductForm(false);
    setEditingProduct(null); // Clear editingProduct state

    if (productData) { // Only update if productData is provided (not a cancel)
      let newProductsList;
      if (productData.id && products.some(p => p.id === productData.id)) { // Check if it's an update
        newProductsList = products.map(p =>
          p.id === productData.id ? productData : p
        );
      } else { // It's a new product
        newProductsList = [productData, ...products];
      }
      onProductsUpdate(newProductsList);
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

  // Only show add product button if seller is approved
  if (seller?.status !== 'approved') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-yellow-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          {seller?.status === 'pending' ? 'Approval Pending' : 'Account Not Approved'}
        </h3>
        <p className="text-gray-500">
          {seller?.status === 'pending' 
            ? 'Your seller account is pending approval. You can add products once approved.'
            : 'Your seller account needs to be approved before you can list products.'
          }
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Your Products</h3>
        <Button
          onClick={() => {
            resetForm();
            setShowProductForm(true);
          }}
          className="bg-[var(--primary-cta)] hover:bg-[var(--primary-cta)]/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="group">
            <div className="relative">
              <img
                src={product.images?.[0] || '/api/placeholder/300/200'}
                alt={product.name}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleEdit(product)}
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(product.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold line-clamp-1">{product.name}</h4>
                <Badge className={getStatusColor(product.status)}>
                  {product.status}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {product.short_description || product.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--primary-cta)]">
                  {product.price} {product.currency}
                </span>
                <span className="text-sm text-gray-500">
                  {/* Stock quantity is displayed from existing product data, not managed by form */}
                  Stock: {product.stock_quantity}
                </span>
              </div>
              
              {product.featured && (
                <Badge className="mt-2 bg-orange-100 text-orange-800">
                  Featured
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No products yet</h3>
          <p className="text-gray-500 mb-4">Start by adding your first product to the marketplace</p>
          <Button
            onClick={() => {
              resetForm();
              setShowProductForm(true);
            }}
            className="bg-[var(--primary-cta)] hover:bg-[var(--primary-cta)]/90"
          >
            Add Your First Product
          </Button>
        </div>
      )}

      {/* Product Form Dialog */}
      <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            seller={seller}
            product={editingProduct}
            onSuccess={handleProductFormSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
