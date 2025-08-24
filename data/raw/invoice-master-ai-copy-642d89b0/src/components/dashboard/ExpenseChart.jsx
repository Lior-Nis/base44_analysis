import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { format, eachDayOfInterval, startOfDay, differenceInDays } from 'date-fns';

export default function ExpenseChart({ invoices, dateRange, isLoading }) {
  const generateChartData = () => {
    if (!dateRange?.from) {
      // Fallback to last 30 days if no date range
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = startOfDay(new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000));
        return {
          date: format(date, 'MMM d'),
          amount: 0,
          fullDate: date
        };
      });

      invoices.forEach(invoice => {
        const invoiceDate = startOfDay(new Date(invoice.date || invoice.created_date));
        const dayData = last30Days.find(day => 
          day.fullDate.getTime() === invoiceDate.getTime()
        );
        if (dayData) {
          dayData.amount += invoice.total_amount || 0;
        }
      });

      return last30Days.map(({ date, amount }) => ({ date, amount }));
    }

    // Generate data based on selected date range
    const fromDate = dateRange.from;
    const toDate = dateRange.to || dateRange.from;
    const daysDiff = differenceInDays(toDate, fromDate);
    
    // If range is too large (more than 90 days), group by weeks
    if (daysDiff > 90) {
      // Group by weeks
      const weeks = [];
      let currentDate = fromDate;
      
      while (currentDate <= toDate) {
        const weekEnd = new Date(currentDate);
        weekEnd.setDate(weekEnd.getDate() + 6);
        if (weekEnd > toDate) weekEnd.setTime(toDate.getTime());
        
        weeks.push({
          date: format(currentDate, 'MMM d'),
          amount: 0,
          startDate: new Date(currentDate),
          endDate: weekEnd
        });
        
        currentDate = new Date(weekEnd);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      invoices.forEach(invoice => {
        const invoiceDate = startOfDay(new Date(invoice.date || invoice.created_date));
        const weekData = weeks.find(week => 
          invoiceDate >= week.startDate && invoiceDate <= week.endDate
        );
        if (weekData) {
          weekData.amount += invoice.total_amount || 0;
        }
      });
      
      return weeks.map(({ date, amount }) => ({ date, amount }));
    } else {
      // Daily view for smaller ranges
      const daysInRange = eachDayOfInterval({
        start: fromDate,
        end: toDate
      });

      const chartData = daysInRange.map(date => ({
        date: format(date, daysDiff <= 7 ? 'MMM d' : 'M/d'),
        amount: 0,
        fullDate: startOfDay(date)
      }));

      invoices.forEach(invoice => {
        const invoiceDate = startOfDay(new Date(invoice.date || invoice.created_date));
        const dayData = chartData.find(day => 
          day.fullDate.getTime() === invoiceDate.getTime()
        );
        if (dayData) {
          dayData.amount += invoice.total_amount || 0;
        }
      });

      return chartData.map(({ date, amount }) => ({ date, amount }));
    }
  };

  const chartData = generateChartData();
  const totalAmount = chartData.reduce((sum, day) => sum + day.amount, 0);
  const avgDaily = chartData.length > 0 ? totalAmount / chartData.length : 0;
  const maxDay = Math.max(...chartData.map(d => d.amount), 0);

  const getRangeLabel = () => {
    if (!dateRange?.from) return 'Last 30 days';
    
    const fromDate = dateRange.from;
    const toDate = dateRange.to || dateRange.from;
    const daysDiff = differenceInDays(toDate, fromDate);
    
    if (daysDiff === 0) {
      return format(fromDate, 'MMM d, yyyy');
    } else if (daysDiff > 90) {
      return `${format(fromDate, 'MMM d')} - ${format(toDate, 'MMM d, yyyy')} (Weekly)`;
    } else {
      return `${format(fromDate, 'MMM d')} - ${format(toDate, 'MMM d, yyyy')}`;
    }
  };

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-glass-muted animate-pulse">Loading chart...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h3 className="text-glass text-lg font-medium">Expense Trend</h3>
        <div className="text-right">
          <div className="text-2xl font-semibold text-glass">${totalAmount.toFixed(0)}</div>
          <div className="text-sm text-glass-muted">{getRangeLabel()}</div>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.6)' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.6)' }}
              tickFormatter={(value) => `$${value}`}
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '12px',
                backdropFilter: 'blur(20px)'
              }}
              formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']}
              labelFormatter={(label) => `${label}`}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="rgba(255, 255, 255, 0.9)"
              strokeWidth={3}
              dot={{
                fill: 'rgba(255, 255, 255, 1)',
                strokeWidth: 2,
                stroke: 'rgba(0, 0, 0, 0.2)',
                r: 5
              }}
              activeDot={{
                r: 7,
                fill: 'white',
                stroke: 'rgba(0, 0, 0, 0.3)',
                strokeWidth: 2
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-8 pt-4 border-t border-white/10">
        <div>
          <div className="text-glass font-semibold text-lg">${avgDaily.toFixed(0)}</div>
          <div className="text-glass-muted text-sm">
            {chartData.length > 30 ? 'Avg Weekly' : 'Avg Daily'}
          </div>
        </div>
        <div>
          <div className="text-glass font-semibold text-lg">${maxDay.toFixed(0)}</div>
          <div className="text-glass-muted text-sm">
            {chartData.length > 30 ? 'Peak Week' : 'Peak Day'}
          </div>
        </div>
        <div>
          <div className="text-glass font-semibold text-lg">{invoices.length}</div>
          <div className="text-glass-muted text-sm">Total Invoices</div>
        </div>
      </div>
    </div>
  );
}