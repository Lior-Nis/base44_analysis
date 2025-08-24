import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, FileText, IndianRupee, Calendar, Plus } from "lucide-react";
import { format } from "date-fns";

export default function AgentPayoutForm({ onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    agent_name: '',
    policy_number: '',
    payout_amount: '',
    paid_date: format(new Date(), 'yyyy-MM-dd'),
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      payout_amount: parseFloat(formData.payout_amount)
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="agent_name" className="text-amber-900 font-semibold flex items-center gap-2 text-base">
          <User className="w-5 h-5 text-orange-600" />
          Agent Name
        </Label>
        <Input
          id="agent_name"
          type="text"
          value={formData.agent_name}
          onChange={(e) => handleInputChange('agent_name', e.target.value)}
          className="rounded-2xl h-12 bg-white/90 border-2 border-amber-200 text-amber-900 focus:border-orange-400 focus:ring-orange-400 font-medium"
          placeholder="Enter agent name"
          required
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="policy_number" className="text-amber-900 font-semibold flex items-center gap-2 text-base">
          <FileText className="w-5 h-5 text-red-600" />
          Policy Number
        </Label>
        <Input
          id="policy_number"
          type="text"
          value={formData.policy_number}
          onChange={(e) => handleInputChange('policy_number', e.target.value)}
          className="rounded-2xl h-12 bg-white/90 border-2 border-amber-200 text-amber-900 focus:border-red-400 focus:ring-red-400 font-medium"
          placeholder="Enter policy number"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="payout_amount" className="text-amber-900 font-semibold flex items-center gap-2 text-base">
            <IndianRupee className="w-5 h-5 text-green-600" />
            Payout Amount (₹)
          </Label>
          <Input
            id="payout_amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.payout_amount}
            onChange={(e) => handleInputChange('payout_amount', e.target.value)}
            className="rounded-2xl h-12 bg-white/90 border-2 border-amber-200 text-amber-900 focus:border-green-400 focus:ring-green-400 font-medium"
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="paid_date" className="text-amber-900 font-semibold flex items-center gap-2 text-base">
            <Calendar className="w-5 h-5 text-blue-600" />
            Paid Date
          </Label>
          <Input
            id="paid_date"
            type="date"
            value={formData.paid_date}
            onChange={(e) => handleInputChange('paid_date', e.target.value)}
            className="rounded-2xl h-12 bg-white/90 border-2 border-amber-200 text-amber-900 focus:border-blue-400 focus:ring-blue-400 font-medium"
            required
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="notes" className="text-amber-900 font-semibold text-base">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          className="rounded-2xl bg-white/90 border-2 border-amber-200 text-amber-900 focus:border-orange-400 focus:ring-orange-400 resize-none font-medium"
          placeholder="Any additional details..."
          rows={4}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || !formData.agent_name || !formData.policy_number || !formData.payout_amount}
        className="w-full warm-gradient hover:shadow-lg text-white font-bold py-4 h-14 rounded-2xl shadow-md hover:shadow-orange-300/50 transition-all duration-300 text-lg"
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Adding Payout...
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <Plus className="w-6 h-6" />
            Add Agent Payout
          </div>
        )}
      </Button>
    </form>
  );
}