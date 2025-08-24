import React from 'react';
import { IndianRupee, TrendingDown, TrendingUp } from "lucide-react";

export default function BalanceSummaryCard({ outstanding, expenses, recovered }) {
  return (
    <div className="relative w-full p-6 rounded-3xl overflow-hidden primary-gradient shadow-2xl">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/clean-textile.png')] opacity-10"></div>
      <div className="relative z-10 text-white text-center">
        <h2 className="text-lg font-medium text-white/80 mb-2">Outstanding Balance</h2>
        <div className="flex items-center justify-center text-3xl font-bold mb-6">
          <IndianRupee className="w-7 h-7 -mr-1" />
          <span>{outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        
        <div className="flex justify-around items-center text-sm">
          <div className="flex flex-col items-center">
            <div className="text-white/70 mb-1.5 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4" />
              <span className="font-medium">Total Expenses</span>
            </div>
            <div className="font-bold text-base">
              ₹{expenses.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="h-10 w-px bg-white/30"></div>
          <div className="flex flex-col items-center">
            <div className="text-white/70 mb-1.5 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">Total Recovered</span>
            </div>
            <div className="font-bold text-base">
              ₹{recovered.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}