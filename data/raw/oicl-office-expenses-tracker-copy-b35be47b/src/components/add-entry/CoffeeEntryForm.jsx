
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Coffee, Sun, Moon, Plus } from "lucide-react";
import { format } from "date-fns";

export default function CoffeeEntryForm({ onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    morning_amount: '',
    evening_amount: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      morning_amount: parseFloat(formData.morning_amount) || 0,
      evening_amount: parseFloat(formData.evening_amount) || 0
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="date" className="text-slate-700 font-semibold text-base">Date</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => handleInputChange('date', e.target.value)}
          className="rounded-2xl h-12 bg-white/90 border-2 border-sky-200 text-slate-800 focus:border-blue-400 focus:ring-blue-400 font-medium"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="morning" className="text-slate-700 font-semibold flex items-center gap-2 text-base">
            <Sun className="w-5 h-5 text-amber-500" />
            Morning Amount (₹)
          </Label>
          <Input
            id="morning"
            type="number"
            step="0.01"
            min="0"
            value={formData.morning_amount}
            onChange={(e) => handleInputChange('morning_amount', e.target.value)}
            className="rounded-2xl h-12 bg-white/90 border-2 border-sky-200 text-slate-800 focus:border-amber-400 focus:ring-amber-400 font-medium"
            placeholder="0.00"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="evening" className="text-slate-700 font-semibold flex items-center gap-2 text-base">
            <Moon className="w-5 h-5 text-indigo-500" />
            Evening Amount (₹)
          </Label>
          <Input
            id="evening"
            type="number"
            step="0.01"
            min="0"
            value={formData.evening_amount}
            onChange={(e) => handleInputChange('evening_amount', e.target.value)}
            className="rounded-2xl h-12 bg-white/90 border-2 border-sky-200 text-slate-800 focus:border-indigo-400 focus:ring-indigo-400 font-medium"
            placeholder="0.00"  
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="notes" className="text-slate-700 font-semibold text-base">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          className="rounded-2xl bg-white/90 border-2 border-sky-200 text-slate-800 focus:border-blue-400 focus:ring-blue-400 resize-none font-medium"
          placeholder="Any additional details..."
          rows={4}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || (!formData.morning_amount && !formData.evening_amount)}
        className="w-full primary-gradient hover:shadow-lg text-white font-bold py-4 h-14 rounded-2xl shadow-md hover:shadow-blue-300/50 transition-all duration-300 text-lg"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Adding Entry...
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <Plus className="w-6 h-6" />
            Add Coffee Entry
          </div>
        )}
      </Button>
    </form>
  );
}
