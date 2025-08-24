
import React, { useState, useEffect } from "react";
import { CoffeeExpense, AgentPayout, AmountRecovered } from "@/api/entities";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Coffee, 
  Users, 
  AlertTriangle,
  TrendingUp
} from "lucide-react";
import { format, isWeekend, eachDayOfInterval, subDays } from "date-fns";

import BalanceSummaryCard from "../components/dashboard/BalanceSummaryCard";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import MissedEntries from "../components/dashboard/MissedEntries";
import StatCard from "../components/dashboard/StatCard"; // Added this import
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
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

  const calculateTotals = () => {
    const totalCoffeeExpenses = coffeeExpenses.reduce((sum, expense) => sum + (expense.total_amount || 0), 0);
    const totalAgentPayouts = agentPayouts.reduce((sum, payout) => sum + (payout.payout_amount || 0), 0);
    const totalExpenses = totalCoffeeExpenses + totalAgentPayouts;
    const totalRecovered = amountRecovered.reduce((sum, recovery) => sum + (recovery.amount_collected || 0), 0);
    const outstandingAmount = totalExpenses - totalRecovered;

    return {
      totalCoffeeExpenses,
      totalAgentPayouts,
      totalExpenses,
      totalRecovered,
      outstandingAmount
    };
  };

  const getMissedCoffeeEntries = () => {
    const last14Days = eachDayOfInterval({
      start: subDays(new Date(), 14),
      end: subDays(new Date(), 1)
    }).filter(date => !isWeekend(date));

    const entryDates = new Set(coffeeExpenses.map(expense => expense.date));
    
    return last14Days.filter(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return !entryDates.has(dateStr);
    });
  };

  const totals = calculateTotals();
  const missedEntries = getMissedCoffeeEntries();

  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        <div className="h-48 card-style rounded-3xl animate-pulse"></div>
        <div className="h-32 card-style rounded-3xl animate-pulse"></div>
        <div className="h-64 card-style rounded-3xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Balance Summary Card */}
      <BalanceSummaryCard 
        outstanding={totals.outstandingAmount}
        expenses={totals.totalExpenses}
        recovered={totals.totalRecovered}
      />

      {/* Missed Entries Alert */}
      {missedEntries.length > 0 && (
        <Alert className="card-style border-amber-300 bg-amber-50/80">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertDescription className="text-amber-800 font-medium">
            <strong>Missing coffee entries:</strong> {missedEntries.length} day(s) in last 2 weeks.
          </AlertDescription>
        </Alert>
      )}

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatCard 
          title="Coffee Expenses"
          icon={Coffee}
          amount={totals.totalCoffeeExpenses}
          count={coffeeExpenses.length}
          iconBgClass="bg-cyan-600 shadow-cyan-200"
          textColorClass="text-cyan-900"
        />
        <StatCard 
          title="Agent Payouts"
          icon={Users}
          amount={totals.totalAgentPayouts}
          count={agentPayouts.length}
          iconBgClass="bg-blue-600 shadow-blue-200"
          textColorClass="text-blue-900"
        />
        <StatCard 
          title="Amount Recovered"
          icon={TrendingUp}
          amount={totals.totalRecovered}
          count={amountRecovered.length}
          iconBgClass="bg-green-600 shadow-green-200"
          textColorClass="text-green-900"
        />
      </div>

      {/* Recent Transactions */}
      <RecentTransactions 
        coffeeExpenses={coffeeExpenses.slice(0, 5)}
        agentPayouts={agentPayouts.slice(0, 5)}
        amountRecovered={amountRecovered.slice(0, 5)}
      />

      {/* Missing Entries Component */}
      <MissedEntries missedEntries={missedEntries} />
    </div>
  );
}
