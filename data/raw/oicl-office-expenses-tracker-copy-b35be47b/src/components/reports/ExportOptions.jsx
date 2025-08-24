import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Database, Cloud } from "lucide-react";
import { format } from "date-fns";

export default function ExportOptions({ coffeeExpenses, agentPayouts, amountRecovered }) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = async (data, filename) => {
    setIsExporting(true);
    try {
      let csvContent = '';
      let headers = [];
      
      if (filename.includes('coffee')) {
        headers = ['Date', 'Morning Amount', 'Evening Amount', 'Total Amount', 'Notes'];
        csvContent = [
          headers.join(','),
          ...data.map(item => [
            item.date,
            item.morning_amount || 0,
            item.evening_amount || 0,
            item.total_amount || 0,
            `"${item.notes || ''}"`
          ].join(','))
        ].join('\n');
      } else if (filename.includes('payouts')) {
        headers = ['Agent Name', 'Policy Number', 'Payout Amount', 'Paid Date', 'Notes'];
        csvContent = [
          headers.join(','),
          ...data.map(item => [
            `"${item.agent_name}"`,
            item.policy_number,
            item.payout_amount,
            item.paid_date,
            `"${item.notes || ''}"`
          ].join(','))
        ].join('\n');
      } else if (filename.includes('recovered')) {
        headers = ['Amount Collected', 'Collection Date', 'Source', 'Notes'];
        csvContent = [
          headers.join(','),
          ...data.map(item => [
            item.amount_collected,
            item.collection_date,
            `"${item.source || ''}"`,
            `"${item.notes || ''}"`
          ].join(','))
        ].join('\n');
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
    setIsExporting(false);
  };

  const exportAllData = async () => {
    setIsExporting(true);
    try {
      const allData = [
        ...coffeeExpenses.map(item => ({ ...item, type: 'Coffee/Tea' })),
        ...agentPayouts.map(item => ({ ...item, type: 'Agent Payout' })),
        ...amountRecovered.map(item => ({ ...item, type: 'Amount Recovered' }))
      ];

      const headers = ['Type', 'Date', 'Amount', 'Description', 'Notes'];
      const csvContent = [
        headers.join(','),
        ...allData.map(item => {
          let date, amount, description;
          
          if (item.type === 'Coffee/Tea') {
            date = item.date;
            amount = item.total_amount;
            description = 'Coffee/Tea Expense';
          } else if (item.type === 'Agent Payout') {
            date = item.paid_date;
            amount = item.payout_amount;
            description = `${item.agent_name} - ${item.policy_number}`;
          } else {
            date = item.collection_date;
            amount = item.amount_collected;
            description = `Recovery${item.source ? ` from ${item.source}` : ''}`;
          }
          
          return [
            item.type,
            date,
            amount,
            `"${description}"`,
            `"${item.notes || ''}"`
          ].join(',');
        })
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `oicl_expenses_all_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting all data:', error);
    }
    setIsExporting(false);
  };

  return (
    <div className="glass-card rounded-3xl">
      <div className="p-6 border-b-2 border-amber-100">
        <h3 className="flex items-center gap-2 text-xl font-bold text-amber-900">
          <Download className="w-6 h-6 text-orange-600" />
          Export & Backup Options
        </h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            onClick={() => exportToCSV(coffeeExpenses, 'coffee_expenses')}
            disabled={isExporting || coffeeExpenses.length === 0}
            className="flex flex-col gap-3 h-24 rounded-2xl border-2 border-amber-200 hover:bg-amber-50 text-amber-900 font-semibold"
          >
            <FileText className="w-6 h-6 text-amber-600" />
            <span>Coffee Data</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => exportToCSV(agentPayouts, 'agent_payouts')}
            disabled={isExporting || agentPayouts.length === 0}
            className="flex flex-col gap-3 h-24 rounded-2xl border-2 border-orange-200 hover:bg-orange-50 text-amber-900 font-semibold"
          >
            <FileText className="w-6 h-6 text-orange-600" />
            <span>Payout Data</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => exportToCSV(amountRecovered, 'amount_recovered')}
            disabled={isExporting || amountRecovered.length === 0}
            className="flex flex-col gap-3 h-24 rounded-2xl border-2 border-green-200 hover:bg-green-50 text-amber-900 font-semibold"
          >
            <FileText className="w-6 h-6 text-green-600" />
            <span>Recovery Data</span>
          </Button>

          <Button
            onClick={exportAllData}
            disabled={isExporting}
            className="flex flex-col gap-3 h-24 rounded-2xl warm-gradient text-white font-bold shadow-lg hover:shadow-orange-300/50"
          >
            {isExporting ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Database className="w-6 h-6" />
            )}
            <span>All Data</span>
          </Button>
        </div>

        <div className="mt-6 p-6 bg-blue-50/80 rounded-2xl border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <Cloud className="w-5 h-5 text-blue-600" />
            <h4 className="font-bold text-blue-900">Cloud Backup</h4>
          </div>
          <p className="text-blue-800 font-medium">
            Your data is automatically backed up to the cloud every time you add or edit entries. 
            Use the export options above for local backups.
          </p>
        </div>
      </div>
    </div>
  );
}