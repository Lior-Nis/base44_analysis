import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, X } from "lucide-react";

export default function EditTransactionDialog({ transaction, type, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(() => {
    switch (type) {
      case 'coffee':
        return {
          date: transaction.date,
          morning_amount: transaction.morning_amount || '',
          evening_amount: transaction.evening_amount || '',
          notes: transaction.notes || ''
        };
      case 'payout':
        return {
          agent_name: transaction.agent_name,
          policy_number: transaction.policy_number,
          payout_amount: transaction.payout_amount,
          paid_date: transaction.paid_date,
          notes: transaction.notes || ''
        };
      case 'recovery':
        return {
          amount_collected: transaction.amount_collected,
          collection_date: transaction.collection_date,
          source: transaction.source || '',
          notes: transaction.notes || ''
        };
      default:
        return {};
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const processedData = { ...formData };
    if (type === 'coffee') {
      processedData.morning_amount = parseFloat(processedData.morning_amount) || 0;
      processedData.evening_amount = parseFloat(processedData.evening_amount) || 0;
    } else if (type === 'payout') {
      processedData.payout_amount = parseFloat(processedData.payout_amount);
    } else if (type === 'recovery') {
      processedData.amount_collected = parseFloat(processedData.amount_collected);
    }
    
    onSubmit(processedData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderFormFields = () => {
    switch (type) {
      case 'coffee':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="rounded-2xl"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="morning_amount">Morning Amount (₹)</Label>
                <Input
                  id="morning_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.morning_amount}
                  onChange={(e) => handleInputChange('morning_amount', e.target.value)}
                  className="rounded-2xl"
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="evening_amount">Evening Amount (₹)</Label>
                <Input
                  id="evening_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.evening_amount}
                  onChange={(e) => handleInputChange('evening_amount', e.target.value)}
                  className="rounded-2xl"
                  placeholder="0.00"
                />
              </div>
            </div>
          </>
        );
        
      case 'payout':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="agent_name">Agent Name</Label>
              <Input
                id="agent_name"
                value={formData.agent_name}
                onChange={(e) => handleInputChange('agent_name', e.target.value)}
                className="rounded-2xl"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="policy_number">Policy Number</Label>
              <Input
                id="policy_number"
                value={formData.policy_number}
                onChange={(e) => handleInputChange('policy_number', e.target.value)}
                className="rounded-2xl"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payout_amount">Payout Amount (₹)</Label>
                <Input
                  id="payout_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.payout_amount}
                  onChange={(e) => handleInputChange('payout_amount', e.target.value)}
                  className="rounded-2xl"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paid_date">Paid Date</Label>
                <Input
                  id="paid_date"
                  type="date"
                  value={formData.paid_date}
                  onChange={(e) => handleInputChange('paid_date', e.target.value)}
                  className="rounded-2xl"
                  required
                />
              </div>
            </div>
          </>
        );
        
      case 'recovery':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount_collected">Amount Collected (₹)</Label>
                <Input
                  id="amount_collected"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount_collected}
                  onChange={(e) => handleInputChange('amount_collected', e.target.value)}
                  className="rounded-2xl"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="collection_date">Collection Date</Label>
                <Input
                  id="collection_date"
                  type="date"
                  value={formData.collection_date}
                  onChange={(e) => handleInputChange('collection_date', e.target.value)}
                  className="rounded-2xl"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => handleInputChange('source', e.target.value)}
                className="rounded-2xl"
                placeholder="Source of recovery"
              />
            </div>
          </>
        );
        
      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderFormFields()}
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="rounded-2xl resize-none"
              placeholder="Any additional details..."
              rows={3}
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 rounded-2xl"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 rounded-2xl"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}