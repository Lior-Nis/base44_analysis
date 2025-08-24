
import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { FileText, DollarSign, TrendingUp, Calendar, ArrowUpRight } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";

import ExpenseChart from "../components/dashboard/ExpenseChart";
import RecentInvoices from "../components/dashboard/RecentInvoices";
import CategoryBreakdown from "../components/dashboard/CategoryBreakdown";
import DateRangeSelector from "../components/dashboard/DateRangeSelector";

export default function Dashboard() {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => base44.entities.Invoice.list("-created_date"),
    initialData: [],
  });

  const defaultDateRange = {
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  };

  const [dateRange, setDateRange] = useState(defaultDateRange);

  const allTimeDateRange = useMemo(() => {
    if (!invoices || invoices.length === 0) {
      return defaultDateRange;
    }
    const dates = invoices.map(i => new Date(i.date || i.created_date));
    const minDate = new Date(Math.min.apply(null, dates));
    const maxDate = new Date(Math.max.apply(null, dates));
    return { from: startOfDay(minDate), to: endOfDay(maxDate) };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    if (!dateRange?.from) return invoices;
    return invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.date || invoice.created_date);
      const from = dateRange.from;
      const to = dateRange.to || dateRange.from; // If only 'from' is selected, use it as 'to'
      return invoiceDate >= from && invoiceDate <= to;
    });
  }, [invoices, dateRange]);

  const totalForRange = filteredInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const pendingInvoices = filteredInvoices.filter(inv => inv.status === 'pending').length;

  const handleReset = () => {
    setDateRange(allTimeDateRange);
  };
  
  return (
    <div className="p-10 font-light">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-extralight text-glass mb-2">Welcome back</h1>
        <p className="text-glass-muted text-sm font-light">Here's what's happening with your expenses</p>
        
        <div className="flex gap-12 mt-6">
          <div className="text-glass-dim">
            <div className="text-sm font-light">Total Invoices (in range)</div>
            <div className="text-2xl font-light mt-1">{filteredInvoices.length}</div>
          </div>
          <div className="text-glass-dim">
            <div className="text-sm font-light">Total Amount (in range)</div>
            <div className="text-2xl font-light mt-1">${totalForRange.toFixed(0)}</div>
          </div>
          <div className="text-glass-dim">
            <div className="text-sm font-light">Pending (in range)</div>
            <div className="text-2xl font-light mt-1">{pendingInvoices}</div>
          </div>
        </div>
      </div>

      {/* Date Range Selector */}
      <DateRangeSelector
        date={dateRange}
        setDate={setDateRange}
        onReset={handleReset}
        className="mb-8"
      />

      {/* Chart Section */}
      <div className="glass-light rounded-2xl p-8 mb-8">
        <ExpenseChart invoices={filteredInvoices} dateRange={dateRange} isLoading={isLoading} />
      </div>

      {/* Bottom Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        <RecentInvoices invoices={filteredInvoices.slice(0, 5)} isLoading={isLoading} />
        <CategoryBreakdown invoices={filteredInvoices} isLoading={isLoading} />
      </div>
    </div>
  );
}
