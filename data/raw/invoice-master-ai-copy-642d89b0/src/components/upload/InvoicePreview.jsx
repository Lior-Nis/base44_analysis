import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Save, X, Plus, Trash2 } from "lucide-react";

const CATEGORIES = [
  "office_supplies", "travel", "utilities", "software_subscriptions", 
  "hardware", "professional_services", "marketing", "rent", 
  "insurance", "maintenance", "telecommunications", "training", 
  "shipping", "meals_entertainment", "other"
];

const STATUS_OPTIONS = ["pending", "paid", "overdue", "cancelled"];

export default function InvoicePreview({ extractedData, onSave, onCancel }) {
  const [editedData, setEditedData] = useState({
    ...extractedData,
    items: extractedData.items || [{ description: '', quantity: 1, unit_price: 0, total: 0 }]
  });

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...editedData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].total = (newItems[index].quantity || 0) * (newItems[index].unit_price || 0);
    }

    setEditedData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const addNewItem = () => {
    setEditedData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unit_price: 0, total: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (editedData.items.length > 1) {
      setEditedData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const calculateTotal = () => {
    return editedData.items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
  };

  return (
    <Card className="glass-light border-0 rounded-2xl">
      <CardHeader className="pb-6">
        <CardTitle className="text-glass text-xl font-medium">Review Invoice Details</CardTitle>
        <p className="text-glass-muted text-sm">Please verify and edit the extracted information</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-glass-dim">Vendor</Label>
            <Input
              value={editedData.vendor || ''}
              onChange={(e) => handleInputChange('vendor', e.target.value)}
              className="glass-darker border-0 text-white placeholder-glass-muted rounded-xl"
              placeholder="Vendor name"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-glass-dim">Invoice Number</Label>
            <Input
              value={editedData.invoice_number || ''}
              onChange={(e) => handleInputChange('invoice_number', e.target.value)}
              className="glass-darker border-0 text-white placeholder-glass-muted rounded-xl"
              placeholder="Invoice #"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-glass-dim">Date</Label>
            <Input
              type="date"
              value={editedData.date || ''}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="glass-darker border-0 text-white rounded-xl"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-glass-dim">Status</Label>
            <Select
              value={editedData.status || 'pending'}
              onValueChange={(value) => handleInputChange('status', value)}
            >
              <SelectTrigger className="glass-darker border-0 text-white rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    <Badge className="text-xs">
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-glass-dim">Category</Label>
            <Select
              value={editedData.category || ''}
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger className="glass-darker border-0 text-white rounded-xl">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-glass-dim">Currency</Label>
            <Input
              value={editedData.currency || 'USD'}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              className="glass-darker border-0 text-white placeholder-glass-muted rounded-xl"
              placeholder="USD"
            />
          </div>
        </div>

        {/* Invoice Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-glass-dim text-base">Invoice Items</Label>
            <Button
              onClick={addNewItem}
              variant="ghost"
              size="sm"
              className="glass-darker hover:glass-hover text-white rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
          
          <div className="space-y-3">
            {editedData.items.map((item, index) => (
              <div key={index} className="glass-darker rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="text-glass-dim text-sm">Item {index + 1}</h4>
                  {editedData.items.length > 1 && (
                    <Button
                      onClick={() => removeItem(index)}
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <Input
                      value={item.description || ''}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="Item description"
                      className="glass-light border-0 text-white placeholder-glass-muted rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.quantity || ''}
                      onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                      placeholder="Qty"
                      className="glass-light border-0 text-white placeholder-glass-muted rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price || ''}
                      onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      placeholder="Price"
                      className="glass-light border-0 text-white placeholder-glass-muted rounded-lg text-sm"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <div className="text-glass font-medium">
                    Total: ${(item.total || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Amount */}
        <div className="glass-darker rounded-xl p-6">
          <div className="flex justify-between items-center text-xl">
            <span className="text-glass-dim font-medium">Total Amount:</span>
            <span className="text-glass font-bold">${calculateTotal().toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6">
          <Button
            onClick={onCancel}
            variant="ghost"
            className="glass-darker hover:glass-hover text-white rounded-xl px-6"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={() => onSave({ ...editedData, total_amount: calculateTotal() })}
            className="glass-darker hover:glass-hover text-white rounded-xl px-6"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Invoice
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}