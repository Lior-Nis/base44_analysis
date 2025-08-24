import React, { useState, useEffect } from 'react';
import { SellerSpecialty } from '@/api/entities';
import { Plus, Edit3, Trash2, Tag, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function SpecialtyManagement() {
  const [specialties, setSpecialties] = useState([]);
  const [showSpecialtyForm, setShowSpecialtyForm] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [specialtyForm, setSpecialtyForm] = useState({
    name: '',
    description: '',
    category: 'ingredients',
    active: true,
    sort_order: 0
  });

  useEffect(() => {
    loadSpecialties();
  }, []);

  const loadSpecialties = async () => {
    setIsLoading(true);
    try {
      const data = await SellerSpecialty.list('sort_order');
      setSpecialties(data);
    } catch (error) {
      console.error('Error loading specialties:', error);
      setSpecialties([]);
    }
    setIsLoading(false);
  };

  const handleAddSpecialty = () => {
    setEditingSpecialty(null);
    setSpecialtyForm({
      name: '',
      description: '',
      category: 'ingredients',
      active: true,
      sort_order: specialties.length
    });
    setShowSpecialtyForm(true);
  };

  const handleEditSpecialty = (specialty) => {
    setEditingSpecialty(specialty);
    setSpecialtyForm({
      name: specialty.name,
      description: specialty.description || '',
      category: specialty.category,
      active: specialty.active,
      sort_order: specialty.sort_order || 0
    });
    setShowSpecialtyForm(true);
  };

  const handleDeleteSpecialty = async (specialtyId) => {
    if (window.confirm('Are you sure you want to delete this specialty? This action cannot be undone.')) {
      try {
        await SellerSpecialty.delete(specialtyId);
        const updatedSpecialties = specialties.filter(s => s.id !== specialtyId);
        setSpecialties(updatedSpecialties);
      } catch (error) {
        console.error('Error deleting specialty:', error);
        alert('Failed to delete specialty. Please try again.');
      }
    }
  };

  const handleSubmitSpecialty = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const specialtyData = {
        ...specialtyForm,
        sort_order: parseInt(specialtyForm.sort_order) || 0
      };

      if (editingSpecialty) {
        await SellerSpecialty.update(editingSpecialty.id, specialtyData);
        const updatedSpecialties = specialties.map(s => 
          s.id === editingSpecialty.id ? { ...s, ...specialtyData } : s
        );
        setSpecialties(updatedSpecialties);
      } else {
        const newSpecialty = await SellerSpecialty.create(specialtyData);
        setSpecialties([...specialties, newSpecialty]);
      }

      setShowSpecialtyForm(false);
    } catch (error) {
      console.error('Error saving specialty:', error);
      alert('Failed to save specialty. Please try again.');
    }
    setIsSubmitting(false);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'ingredients': return 'bg-green-100 text-green-800';
      case 'cookware': return 'bg-blue-100 text-blue-800';
      case 'crafts': return 'bg-purple-100 text-purple-800';
      case 'services': return 'bg-orange-100 text-orange-800';
      case 'food_products': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'ingredients': return 'Ingredients & Spices';
      case 'cookware': return 'Traditional Cookware';
      case 'crafts': return 'Handcrafted Items';
      case 'services': return 'Services';
      case 'food_products': return 'Food Products';
      default: return category;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Specialty Management</h2>
        </div>
        <div className="text-center py-16">
          <div className="w-12 h-12 border-4 border-[var(--primary-cta)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading specialties...</p>
        </div>
      </div>
    );
  }

  const categorizedSpecialties = specialties.reduce((acc, specialty) => {
    const category = specialty.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(specialty);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Seller Specialties & Services</h2>
          <p className="text-gray-600">Manage available specialties for seller registration</p>
        </div>
        <Button onClick={handleAddSpecialty} className="bg-[var(--primary-cta)] hover:bg-[var(--primary-cta)]/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Specialty
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{specialties.length}</div>
            <div className="text-gray-600">Total Specialties</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {specialties.filter(s => s.active).length}
            </div>
            <div className="text-gray-600">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-600 mb-2">
              {Object.keys(categorizedSpecialties).length}
            </div>
            <div className="text-gray-600">Categories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {specialties.filter(s => !s.active).length}
            </div>
            <div className="text-gray-600">Inactive</div>
          </CardContent>
        </Card>
      </div>

      {/* Specialties by Category */}
      {Object.entries(categorizedSpecialties).map(([category, categorySpecialties]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              {getCategoryLabel(category)} ({categorySpecialties.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorySpecialties.map((specialty) => (
                <div key={specialty.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{specialty.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={specialty.active ? 'default' : 'secondary'}>
                        {specialty.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  {specialty.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {specialty.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <Badge className={getCategoryColor(specialty.category)}>
                      {getCategoryLabel(specialty.category)}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditSpecialty(specialty)}
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteSpecialty(specialty.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {specialties.length === 0 && (
        <Card>
          <CardContent className="text-center py-16">
            <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No specialties yet</h3>
            <p className="text-gray-500 mb-6">Create your first specialty option for sellers</p>
            <Button onClick={handleAddSpecialty} className="bg-[var(--primary-cta)] hover:bg-[var(--primary-cta)]/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Specialty
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Specialty Form Dialog */}
      <Dialog open={showSpecialtyForm} onOpenChange={setShowSpecialtyForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSpecialty ? 'Edit Specialty' : 'Add New Specialty'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitSpecialty} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="specialty-name">Specialty Name *</Label>
                <Input
                  id="specialty-name"
                  value={specialtyForm.name}
                  onChange={(e) => setSpecialtyForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Traditional Maldivian Ingredients"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={specialtyForm.category}
                  onValueChange={(value) => setSpecialtyForm(prev => ({ ...prev, category: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ingredients">Ingredients & Spices</SelectItem>
                    <SelectItem value="cookware">Traditional Cookware</SelectItem>
                    <SelectItem value="crafts">Handcrafted Items</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="food_products">Food Products</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={specialtyForm.description}
                onChange={(e) => setSpecialtyForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of what this specialty includes"
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sort-order">Sort Order</Label>
                <Input
                  id="sort-order"
                  type="number"
                  value={specialtyForm.sort_order}
                  onChange={(e) => setSpecialtyForm(prev => ({ ...prev, sort_order: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Active Status</Label>
                  <p className="text-sm text-gray-600">Available for seller selection</p>
                </div>
                <Switch
                  checked={specialtyForm.active}
                  onCheckedChange={(checked) => setSpecialtyForm(prev => ({ ...prev, active: checked }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSpecialtyForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !specialtyForm.name || !specialtyForm.category}
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
                    {editingSpecialty ? 'Update Specialty' : 'Add Specialty'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}