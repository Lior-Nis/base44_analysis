import React, { useState, useEffect } from 'react';
import { SellerType } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function SellerTypeManagement() {
  const [sellerTypes, setSellerTypes] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentType, setCurrentType] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '' });

  useEffect(() => {
    loadSellerTypes();
  }, []);

  const loadSellerTypes = async () => {
    const data = await SellerType.list();
    setSellerTypes(data);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };
    if (name === 'name' && !currentType) {
      newFormData.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }
    setFormData(newFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentType) {
      await SellerType.update(currentType.id, formData);
    } else {
      await SellerType.create(formData);
    }
    await loadSellerTypes();
    setIsFormOpen(false);
    setCurrentType(null);
  };

  const handleEdit = (type) => {
    setCurrentType(type);
    setFormData({ name: type.name, slug: type.slug });
    setIsFormOpen(true);
  };
  
  const handleAddNew = () => {
    setCurrentType(null);
    setFormData({ name: '', slug: '' });
    setIsFormOpen(true);
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this seller type? This could affect existing sellers.')) {
      await SellerType.delete(id);
      await loadSellerTypes();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Seller Type Management</CardTitle>
        <Button onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2" /> Add New Seller Type
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sellerTypes.map((type) => (
            <div key={type.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-md">
              <div>
                <p className="font-medium">{type.name}</p>
                <p className="text-sm text-gray-500">{type.slug}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(type)}><Edit className="w-4 h-4 mr-1" /> Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(type.id)}><Trash2 className="w-4 h-4 mr-1" /> Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentType ? 'Edit Seller Type' : 'Add New Seller Type'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
              <Label htmlFor="name">Seller Type Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" value={formData.slug} onChange={handleInputChange} required disabled={!!currentType} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}