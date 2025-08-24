import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, Calendar, IndianRupee, Plus } from "lucide-react";
import { format } from "date-fns";

export default function RecoveryForm({ onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    amount_collected: '',
    collection_date: format(new Date(), 'yyyy-MM-dd'),
    source: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount_collected: parseFloat(formData.amount_collected)
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="amount_collected" className="text-amber-900 font-semibold flex items-center gap-2 text-base">
            <IndianRupee className="w-5 h-5 text-green-600" />
            Amount Collected (₹)
          </Label>
          <Input
            id="amount_collected"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount_collected}
            onChange={(e) => handleInputChange('amount_collected', e.target.value)}
            className="rounded-2xl h-12 bg-white/90 border-2 border-amber-200 text-amber-900 focus:border-green-400 focus:ring-green-400 font-medium"
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="collection_date" className="text-amber-900 font-semibold flex items-center gap-2 text-base">
            <Calendar className="w-5 h-5 text-blue-600" />
            Collection Date
          </Label>
          <Input
            id="collection_date"
            type="date"
            value={formData.collection_date}
            onChange={(e) => handleInputChange('collection_date', e.target.value)}
            className="rounded-2xl h-12 bg-white/90 border-2 border-amber-200 text-amber-900 focus:border-blue-400 focus:ring-blue-400 font-medium"
            required
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="source" className="text-amber-900 font-semibold text-base">Source (Optional)</Label>
        <Input
          id="source"
          type="text"
          value={formData.source}
          onChange={(e) => handleInputChange('source', e.target.value)}
          className="rounded-2xl h-12 bg-white/90 border-2 border-amber-200 text-amber-900 focus:border-green-400 focus:ring-green-400 font-medium"
          placeholder="e.g., Agent refund, expense reimbursement"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="notes" className="text-amber-900 font-semibold text-base">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          className="rounded-2xl bg-white/90 border-2 border-amber-200 text-amber-900 focus:border-green-400 focus:ring-green-400 resize-none font-medium"
          placeholder="Any additional details..."
          rows={4}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || !formData.amount_collected}
        className="w-full warm-gradient hover:shadow-lg text-white font-bold py-4 h-14 rounded-2xl shadow-md hover:shadow-orange-300/50 transition-all duration-300 text-lg"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Adding Recovery...
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <Plus className="w-6 h-6" />
            Add Recovery Entry
          </div>
        )}
      </Button>
    </form>
  );
}