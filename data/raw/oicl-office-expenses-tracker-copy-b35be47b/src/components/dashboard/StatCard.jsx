import React from 'react';

export default function StatCard({ icon: Icon, title, amount, count, iconBgClass, textColorClass }) {
  return (
    <div className="card-style p-4 flex flex-col justify-between h-full">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-xl shadow-md ${iconBgClass}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className={`font-semibold text-base ${textColorClass}`}>{title}</h3>
      </div>
      <div className="mt-4 text-right">
        <p className={`text-2xl font-bold ${textColorClass}`}>
          ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </p>
        <p className={`text-xs font-medium opacity-80 ${textColorClass}`}>
          {count} total entries
        </p>
      </div>
    </div>
  );
}