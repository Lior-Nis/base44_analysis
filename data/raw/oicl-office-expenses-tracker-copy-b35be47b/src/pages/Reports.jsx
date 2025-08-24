
import React, { useState, useEffect } from "react";
import { CoffeeExpense, AgentPayout, AmountRecovered } from "@/api/entities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Coffee, 
  Users, 
  TrendingUp,
  FileText
} from "lucide-react";

import TransactionHistory from "../components/reports/TransactionHistory";
import ExportOptions from "../components/reports/ExportOptions";

export default function Reports() {
  const [coffeeExpenses, setCoffeeExpenses] = useState([]);
  const [agentPayouts, setAgentPayouts] = useState([]);
  const [amountRecovered, setAmountRecovered] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [coffee, payouts, recovered] = await Promise.all([
        CoffeeExpense.list('-date'),
        AgentPayout.list('-paid_date'),  
        AmountRecovered.list('-collection_date')
      ]);
      setCoffeeExpenses(coffee);
      setAgentPayouts(payouts);
      setAmountRecovered(recovered);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  };

  const refreshData = () => {
    loadData();
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        <div className="h-48 glass-card rounded-3xl animate-pulse" />
        <div className="h-96 glass-card rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Reports & History</h1>
        <p className="text-slate-600">View transaction history and export data</p>
      </div>

      {/* Export Section */}
      <ExportOptions 
        coffeeExpenses={coffeeExpenses}
        agentPayouts={agentPayouts}
        amountRecovered={amountRecovered}
      />

      {/* Transaction History Tabs */}
      <div className="card-style">
        <div className="p-6 border-b-2 border-sky-100">
          <h3 className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <FileText className="w-6 h-6 text-blue-600" />
            Transaction History
          </h3>
        </div>
        <div className="p-6">
          <Tabs defaultValue="coffee" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-sky-100 rounded-2xl p-2 mb-6">
              <TabsTrigger 
                value="coffee" 
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md text-slate-600 font-semibold"
              >
                <Coffee className="w-5 h-5 mr-2" />
                Coffee/Tea
              </TabsTrigger>
              <TabsTrigger 
                value="payouts"
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md text-slate-600 font-semibold"
              >
                <Users className="w-5 h-5 mr-2" />
                Payouts
              </TabsTrigger>
              <TabsTrigger 
                value="recovered"
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md text-slate-600 font-semibold"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Recovered
              </TabsTrigger>
            </TabsList>

            <TabsContent value="coffee" className="mt-6">
              <TransactionHistory 
                transactions={coffeeExpenses}
                type="coffee"
                onDataChange={refreshData}
              />
            </TabsContent>

            <TabsContent value="payouts" className="mt-6">
              <TransactionHistory 
                transactions={agentPayouts}
                type="payout"
                onDataChange={refreshData}
              />
            </TabsContent>

            <TabsContent value="recovered" className="mt-6">
              <TransactionHistory 
                transactions={amountRecovered}
                type="recovery"
                onDataChange={refreshData}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
