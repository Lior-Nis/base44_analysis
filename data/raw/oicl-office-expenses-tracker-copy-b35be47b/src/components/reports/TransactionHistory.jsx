
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Edit, 
  Trash2, 
  Coffee, 
  Users, 
  TrendingUp,
  Calendar,
  IndianRupee
} from "lucide-react";
import { format } from "date-fns";
import { CoffeeExpense, AgentPayout, AmountRecovered } from "@/api/entities";
import { useToast } from "@/components/ui/use-toast";

import EditTransactionDialog from "./EditTransactionDialog";

export default function TransactionHistory({ transactions, type, onDataChange }) {
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
  const { toast } = useToast();

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
  };

  const handleDelete = async (transaction) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setIsDeleting(transaction.id);
      try {
        if (type === 'coffee') {
          await CoffeeExpense.delete(transaction.id);
        } else if (type === 'payout') {
          await AgentPayout.delete(transaction.id);
        } else if (type === 'recovery') {
          await AmountRecovered.delete(transaction.id);
        }
        
        toast({
          title: "Deleted!",
          description: "Transaction deleted successfully",
          className: "bg-green-100 border-green-200 text-green-800"
        });
        
        onDataChange();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete transaction",
          variant: "destructive"
        });
      }
      setIsDeleting(null);
    }
  };

  const handleEditSubmit = async (updatedData) => {
    try {
      if (type === 'coffee') {
        const totalAmount = (updatedData.morning_amount || 0) + (updatedData.evening_amount || 0);
        await CoffeeExpense.update(editingTransaction.id, {
          ...updatedData,
          total_amount: totalAmount
        });
      } else if (type === 'payout') {
        await AgentPayout.update(editingTransaction.id, updatedData);
      } else if (type === 'recovery') {
        await AmountRecovered.update(editingTransaction.id, updatedData);
      }
      
      toast({
        title: "Updated!",
        description: "Transaction updated successfully",
        className: "bg-green-100 border-green-200 text-green-800"
      });
      
      setEditingTransaction(null);
      onDataChange();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update transaction",
        variant: "destructive"
      });
    }
  };

  const getTransactionDate = (transaction) => {
    return transaction.date || transaction.paid_date || transaction.collection_date;
  };

  const getTransactionAmount = (transaction) => {
    return transaction.total_amount || transaction.payout_amount || transaction.amount_collected;
  };

  const renderTransactionDetails = (transaction) => {
    switch (type) {
      case 'coffee':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Coffee className="w-5 h-5 text-cyan-700" />
              <span className="font-semibold text-slate-800">Coffee/Tea Expense</span>
            </div>
            <div className="text-sm text-slate-600 space-y-1 pl-7">
              {transaction.morning_amount > 0 && (
                <div>Morning: ₹{Number(transaction.morning_amount).toFixed(2)}</div>
              )}
              {transaction.evening_amount > 0 && (
                <div>Evening: ₹{Number(transaction.evening_amount).toFixed(2)}</div>
              )}
            </div>
          </div>
        );
      case 'payout':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-700" />
              <span className="font-semibold text-slate-800">{transaction.agent_name}</span>
            </div>
            <div className="text-sm text-slate-600 pl-7">
              Policy: {transaction.policy_number}
            </div>
          </div>
        );
      case 'recovery':
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-700" />
              <span className="font-semibold text-slate-800">Amount Recovered</span>
            </div>
            {transaction.source && (
              <div className="text-sm text-slate-600 pl-7">
                Source: {transaction.source}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-sky-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Calendar className="w-10 h-10 text-sky-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">No transactions yet</h3>
        <p className="text-slate-500">Add your first entry to see transaction history</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div 
            key={transaction.id}
            className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-white/60 rounded-2xl border-2 border-sky-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300"
          >
            <div className="flex-1 mb-3 md:mb-0">
              {renderTransactionDetails(transaction)}
              <div className="flex items-center gap-2 mt-2 pl-7">
                <Calendar className="w-4 h-4 text-slate-400" />
                {(() => {
                  const dateStr = getTransactionDate(transaction);
                  if (!dateStr) return <span className="text-sm text-red-500 font-medium">No Date</span>;
                  const date = new Date(dateStr);
                  if (isNaN(date.getTime())) {
                    return <span className="text-sm text-red-500 font-medium">Invalid Date</span>;
                  }
                  return (
                    <span className="text-sm text-slate-500 font-medium">
                      {format(date, 'MMM dd, yyyy')}
                    </span>
                  );
                })()}
              </div>
              {transaction.notes && (
                <p className="text-sm text-slate-600 mt-2 italic pl-7">
                  "{transaction.notes}"
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-3 self-end md:self-center">
              <div className="text-right">
                <div className="font-bold text-lg text-slate-800">
                  ₹{Number(getTransactionAmount(transaction) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
              
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(transaction)}
                  className="h-9 w-9 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full"
                >
                  <Edit className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(transaction)}
                  disabled={isDeleting === transaction.id}
                  className="h-9 w-9 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full"
                >
                  {isDeleting === transaction.id ? (
                    <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingTransaction && (
        <EditTransactionDialog
          transaction={editingTransaction}
          type={type}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditingTransaction(null)}
        />
      )}
    </>
  );
}
