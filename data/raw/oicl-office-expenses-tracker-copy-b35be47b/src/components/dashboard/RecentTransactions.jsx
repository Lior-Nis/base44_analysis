
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Coffee, Users, TrendingUp, Calendar } from "lucide-react";
import { format, isValid } from "date-fns";

export default function RecentTransactions({ coffeeExpenses, agentPayouts, amountRecovered }) {
  const safeGetDate = (transaction) => {
    const dateStr = transaction.date || transaction.paid_date || transaction.collection_date;
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isValid(date) ? date : null;
  };

  const allTransactions = [
    ...coffeeExpenses.map(item => ({ ...item, type: 'coffee' })),
    ...agentPayouts.map(item => ({ ...item, type: 'payout' })),
    ...amountRecovered.map(item => ({ ...item, type: 'recovery' }))
  ].sort((a, b) => {
    const dateA = safeGetDate(a);
    const dateB = safeGetDate(b);
    if (!dateA && !dateB) return 0; // Both invalid/missing, maintain original relative order
    if (!dateA) return 1; // 'a' is invalid, 'b' is valid, push 'a' to end
    if (!dateB) return -1; // 'b' is invalid, 'a' is valid, push 'b' to end
    return dateB.getTime() - dateA.getTime(); // Compare valid dates
  }).slice(0, 8);

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'coffee': return { Icon: Coffee, color: 'text-cyan-700', bg: 'bg-cyan-100' };
      case 'payout': return { Icon: Users, color: 'text-blue-700', bg: 'bg-blue-100' };
      case 'recovery': return { Icon: TrendingUp, color: 'text-green-700', bg: 'bg-green-100' };
      default: return { Icon: Calendar, color: 'text-slate-700', bg: 'bg-slate-100' };
    }
  };
  
  const getTransactionAmount = (transaction) => {
    switch (transaction.type) {
      case 'coffee': return transaction.total_amount;
      case 'payout': return transaction.payout_amount;
      case 'recovery': return transaction.amount_collected;
      default: return 0;
    }
  };

  const getTransactionDate = (transaction) => {
    return transaction.date || transaction.paid_date || transaction.collection_date;
  };

  const getTransactionTitle = (transaction) => {
    switch (transaction.type) {
      case 'coffee': return 'Coffee/Tea';
      case 'payout': return transaction.agent_name;
      case 'recovery': return 'Amount Recovered';
      default: return 'Transaction';
    }
  };

  return (
    <div className="card-style">
      <div className="p-6 border-b-2 border-sky-100">
        <h3 className="flex items-center gap-2 text-xl font-bold text-slate-800">
          <Calendar className="w-6 h-6 text-blue-600" />
          Recent Activity
        </h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {allTransactions.map((transaction, index) => {
            const { Icon, color, bg } = getTransactionIcon(transaction.type);
            const date = safeGetDate(transaction);
            
            return (
              <div 
                key={index}
                className="flex items-center justify-between p-4 bg-white/60 rounded-2xl border border-sky-100 hover:shadow-md hover:border-blue-200 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 ${bg} rounded-2xl`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-lg">
                      {getTransactionTitle(transaction)}
                    </p>
                    {date ? (
                      <p className="text-sm text-slate-500 font-medium">
                        {format(date, 'MMM dd, yyyy')}
                      </p>
                    ) : (
                      <p className="text-sm text-red-500 font-medium">Invalid Date</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xl text-slate-900">
                    ₹{getTransactionAmount(transaction)?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                   <Badge variant="outline" className={`font-semibold text-xs ${color} border-current`}>
                    {transaction.type === 'coffee' && 'Coffee'}
                    {transaction.type === 'payout' && 'Payout'}  
                    {transaction.type === 'recovery' && 'Recovery'}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
