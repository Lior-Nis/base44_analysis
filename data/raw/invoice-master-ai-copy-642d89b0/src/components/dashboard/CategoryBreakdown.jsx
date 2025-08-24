import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = [
  '#60A5FA', '#F472B6', '#34D399', '#FBBF24', '#F87171',
  '#A78BFA', '#FB7185', '#38BDF8', '#4ADE80', '#FACC15'
];

export default function CategoryBreakdown({ invoices, isLoading }) {
  const getCategoryData = () => {
    const categoryTotals = {};
    invoices.forEach(invoice => {
      const category = invoice.category || 'other';
      categoryTotals[category] = (categoryTotals[category] || 0) + (invoice.total_amount || 0);
    });

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        name: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: amount,
        percentage: ((amount / invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0)) * 100)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  };

  const categoryData = getCategoryData();

  if (isLoading) {
    return (
      <div className="glass-light rounded-2xl p-6">
        <h3 className="text-glass text-lg font-medium mb-6">Category Breakdown</h3>
        <div className="animate-pulse">
          <div className="h-48 bg-white/10 rounded-xl mb-4"></div>
          <div className="space-y-2">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 bg-white/20 rounded w-20"></div>
                <div className="h-3 bg-white/20 rounded w-12"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (categoryData.length === 0) {
    return (
      <div className="glass-light rounded-2xl p-6">
        <h3 className="text-glass text-lg font-medium mb-6">Category Breakdown</h3>
        <div className="text-center py-8">
          <div className="text-glass-muted">No data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-light rounded-2xl p-6">
      <h3 className="text-glass text-lg font-medium mb-6">Category Breakdown</h3>
      
      <div className="h-48 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              outerRadius={60}
              innerRadius={30}
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: 'none',
                borderRadius: '12px',
                color: 'white'
              }}
              formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        {categoryData.map((category, index) => (
          <div key={category.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-glass-dim text-sm">{category.name}</span>
            </div>
            <div className="text-right">
              <div className="text-glass font-medium text-sm">${category.value.toFixed(0)}</div>
              <div className="text-glass-muted text-xs">{category.percentage.toFixed(1)}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}