
import React, { useState } from "react";
import { CoffeeExpense, AgentPayout, AmountRecovered } from "@/api/entities";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Coffee,
  Users,
  TrendingUp
} from "lucide-react";

import CoffeeEntryForm from "../components/add-entry/CoffeeEntryForm";
import AgentPayoutForm from "../components/add-entry/AgentPayoutForm";
import RecoveryForm from "../components/add-entry/RecoveryForm";

export default function AddEntry() {
  const [selectedType, setSelectedType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const entryTypes = [
    {
      id: "coffee",
      title: "Coffee / Tea Expense",
      icon: Coffee
    },
    {
      id: "payout",
      title: "Agent Payout",
      icon: Users
    },
    {
      id: "recovery",
      title: "Amount Recovered",
      icon: TrendingUp
    }
  ];

  const handleCoffeeSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const totalAmount = (data.morning_amount || 0) + (data.evening_amount || 0);
      await CoffeeExpense.create({ ...data, total_amount: totalAmount });
      toast({
        title: "Success!",
        description: "Coffee expense recorded successfully",
        className: "bg-green-100 border-green-200 text-green-800"
      });
      setSelectedType("");
    } catch (error) {
      toast({ title: "Error", description: "Failed to add coffee entry", variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handlePayoutSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await AgentPayout.create(data);
      toast({
        title: "Success!",
        description: "Agent payout recorded successfully",
        className: "bg-green-100 border-green-200 text-green-800"
      });
      setSelectedType("");
    } catch (error) {
      toast({ title: "Error", description: "Failed to add agent payout", variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handleRecoverySubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await AmountRecovered.create(data);
      toast({
        title: "Success!",
        description: "Amount recovery recorded successfully",
        className: "bg-green-100 border-green-200 text-green-800"
      });
      setSelectedType("");
    } catch (error) {
      toast({ title: "Error", description: "Failed to add recovery entry", variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const renderForm = () => {
    switch (selectedType) {
      case "coffee":
        return <CoffeeEntryForm onSubmit={handleCoffeeSubmit} isSubmitting={isSubmitting} />;
      case "payout":
        return <AgentPayoutForm onSubmit={handlePayoutSubmit} isSubmitting={isSubmitting} />;
      case "recovery":
        return <RecoveryForm onSubmit={handleRecoverySubmit} isSubmitting={isSubmitting} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Add New Entry</h1>
        <p className="text-current/70">Select an entry type to begin</p>
      </div>

      <div className="card-style p-6 space-y-6">
        <div>
          <label className="text-base font-semibold mb-3 block">Entry Type</label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full h-12 rounded-2xl bg-white/90 border-2 text-current text-lg font-medium hover:border-current/30 focus:border-current/50 transition-colors">
              <SelectValue placeholder="Select an entry type..." />
            </SelectTrigger>
            <SelectContent className="bg-white/95 backdrop-blur border-2 rounded-xl">
              {entryTypes.map(type => {
                const Icon = type.icon;
                return (
                  <SelectItem
                    key={type.id}
                    value={type.id}
                    className="text-lg py-4 hover:bg-current/10 focus:bg-current/10 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-6 h-6 text-current" />
                      <span className="font-medium">{type.title}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {selectedType && (
          <div className="pt-6 border-t-2 border-current/10">
            {renderForm()}
          </div>
        )}
      </div>
    </div>
  );
}
