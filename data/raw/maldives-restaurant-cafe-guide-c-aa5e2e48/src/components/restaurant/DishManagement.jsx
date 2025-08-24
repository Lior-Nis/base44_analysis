
import React, { useState } from 'react';
import { Dish } from '@/api/entities';
import { Plus, Edit3, Trash2, Upload, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UploadFile } from '@/api/integrations';

// DISH_CATEGORIES constant removed as its content is now hardcoded in the Select component

export default function DishManagement({ restaurant, dishes, onDishesUpdate }) {
  const [showDishForm, setShowDishForm] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dishForm, setDishForm] = useState({
    name: '',
    price: '',
    currency: 'MVR',
    category: '',
    description: '',
    image_url: '',
    ingredients: '',
    is_vegetarian: false,
    is_spicy: false
  });

  const handleAddDish = () => {
    setEditingDish(null);
    setDishForm({
      name: '',
      price: '',
      currency: 'MVR',
      category: '',
      description: '',
      image_url: '',
      ingredients: '',
      is_vegetarian: false,
      is_spicy: false
    });
    setShowDishForm(true);
  };

  const handleEditDish = (dish) => {
    setEditingDish(dish);
    setDishForm({
      name: dish.name,
      price: dish.price.toString(),
      currency: dish.currency || 'MVR',
      category: dish.category,
      description: dish.description || '',
      image_url: dish.image_url || '',
      ingredients: dish.ingredients?.join(', ') || '',
      is_vegetarian: dish.is_vegetarian || false,
      is_spicy: dish.is_spicy || false
    });
    setShowDishForm(true);
  };

  const handleDeleteDish = async (dishId) => {
    if (window.confirm('Are you sure you want to delete this dish?')) {
      try {
        await Dish.delete(dishId);
        const updatedDishes = dishes.filter(d => d.id !== dishId);
        onDishesUpdate(updatedDishes);
      } catch (error) {
        console.error('Error deleting dish:', error);
      }
    }
  };

  const handleImageUpload = async (file) => {
    setUploadingImage(true);
    try {
      const result = await UploadFile({ file });
      setDishForm(prev => ({ ...prev, image_url: result.file_url }));
    } catch (error) {
      console.error('Error uploading image:', error);
    }
    setUploadingImage(false);
  };

  const removeImage = () => {
    setDishForm(prev => ({ ...prev, image_url: '' }));
  };

  const handleSubmitDish = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dishData = {
        ...dishForm,
        restaurant_id: restaurant.id,
        price: parseFloat(dishForm.price),
        ingredients: dishForm.ingredients.split(',').map(i => i.trim()).filter(Boolean)
      };

      if (editingDish) {
        await Dish.update(editingDish.id, dishData);
        const updatedDishes = dishes.map(d => 
          d.id === editingDish.id ? { ...d, ...dishData } : d
        );
        onDishesUpdate(updatedDishes);
      } else {
        const newDish = await Dish.create(dishData);
        onDishesUpdate([...dishes, newDish]);
      }

      setShowDishForm(false);
    } catch (error) {
      console.error('Error saving dish:', error);
    }
    setIsSubmitting(false);
  };

  const groupedDishes = dishes.reduce((acc, dish) => {
    const category = dish.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(dish);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Menu Management</h2>
          <p className="text-gray-600">Add and manage your restaurant's dishes</p>
        </div>
        <Button onClick={handleAddDish} className="coral-gradient text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Dish
        </Button>
      </div>

      {/* Dishes List */}
      {Object.keys(groupedDishes).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedDishes).map(([category, categoryDishes]) => (
            <Card key={category} className="tropical-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {category}
                  <Badge variant="outline">{categoryDishes.length} items</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryDishes.map((dish) => (
                    <div key={dish.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        {dish.image_url && (
                          <img
                            src={dish.image_url}
                            alt={dish.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">{dish.name}</h4>
                          <p className="text-sm text-gray-600 line-clamp-1">{dish.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-semibold text-green-600">
                              {dish.price} {dish.currency || 'MVR'}
                            </span>
                            {dish.is_vegetarian && (
                              <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                                Vegetarian
                              </Badge>
                            )}
                            {dish.is_spicy && (
                              <Badge variant="outline" className="text-red-600 border-red-600 text-xs">
                                Spicy
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditDish(dish)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteDish(dish.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-500">
              <Plus className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No dishes added yet</h3>
              <p className="mb-6">Start building your menu by adding your first dish</p>
              <Button onClick={handleAddDish} className="coral-gradient text-white">
                Add Your First Dish
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dish Form Dialog */}
      <Dialog open={showDishForm} onOpenChange={setShowDishForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDish ? 'Edit Dish' : 'Add New Dish'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmitDish} className="space-y-6">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dish-name">Dish Name *</Label>
                <Input
                  id="dish-name"
                  value={dishForm.name}
                  onChange={(e) => setDishForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter dish name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={dishForm.category}
                  onValueChange={(value) => setDishForm(prev => ({ ...prev, category: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="appetizer">Appetizer</SelectItem>
                    <SelectItem value="soup">Soup</SelectItem>
                    <SelectItem value="salad">Salad</SelectItem>
                    <SelectItem value="main_course">Main Course</SelectItem>
                    <SelectItem value="seafood">Seafood</SelectItem>
                    <SelectItem value="meat">Meat</SelectItem>
                    <SelectItem value="poultry">Poultry</SelectItem>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="pasta">Pasta</SelectItem>
                    <SelectItem value="rice">Rice Dishes</SelectItem>
                    <SelectItem value="noodles">Noodles</SelectItem>
                    <SelectItem value="curry">Curry</SelectItem>
                    <SelectItem value="grilled">Grilled</SelectItem>
                    <SelectItem value="fried">Fried</SelectItem>
                    <SelectItem value="dessert">Dessert</SelectItem>
                    <SelectItem value="ice_cream">Ice Cream</SelectItem>
                    <SelectItem value="beverage">Beverage</SelectItem>
                    <SelectItem value="juice">Fresh Juice</SelectItem>
                    <SelectItem value="coffee">Coffee</SelectItem>
                    <SelectItem value="tea">Tea</SelectItem>
                    <SelectItem value="smoothie">Smoothie</SelectItem>
                    <SelectItem value="maldivian_traditional">Traditional Maldivian</SelectItem>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                    <SelectItem value="other">Other</SelectItem> {/* Added 'Other' category */}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={dishForm.description}
                onChange={(e) => setDishForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the dish, preparation method, or special ingredients"
                rows={3}
              />
            </div>

            {/* Price */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={dishForm.price}
                  onChange={(e) => setDishForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={dishForm.currency}
                  onValueChange={(value) => setDishForm(prev => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MVR">MVR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <Label htmlFor="ingredients">Ingredients</Label>
              <Input
                id="ingredients"
                value={dishForm.ingredients}
                onChange={(e) => setDishForm(prev => ({ ...prev, ingredients: e.target.value }))}
                placeholder="Comma-separated list of ingredients"
              />
            </div>

            {/* Image Upload */}
            <div>
              <Label>Dish Image</Label>
              <div className="mt-2">
                {dishForm.image_url ? (
                  <div className="relative">
                    <img
                      src={dishForm.image_url}
                      alt="Dish preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      onClick={removeImage}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <div className="text-sm text-gray-600 mb-4">
                      Upload a photo of your dish
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])}
                      className="hidden"
                      id="dish-image"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('dish-image').click()}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? 'Uploading...' : 'Choose Image'}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Vegetarian</Label>
                  <p className="text-sm text-gray-600">Mark if this dish is vegetarian</p>
                </div>
                <Switch
                  checked={dishForm.is_vegetarian}
                  onCheckedChange={(checked) => setDishForm(prev => ({ ...prev, is_vegetarian: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Spicy</Label>
                  <p className="text-sm text-gray-600">Mark if this dish is spicy</p>
                </div>
                <Switch
                  checked={dishForm.is_spicy}
                  onCheckedChange={(checked) => setDishForm(prev => ({ ...prev, is_spicy: checked }))}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDishForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !dishForm.name || !dishForm.price || !dishForm.category}
                className="ocean-gradient text-white"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editingDish ? 'Update Dish' : 'Add Dish'}
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
