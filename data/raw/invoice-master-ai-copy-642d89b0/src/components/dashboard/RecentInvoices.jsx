import React from 'react';
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

const categoryColors = {
  office_supplies: "bg-blue-500/20 text-blue-200 border-blue-400/30",
  travel: "bg-purple-500/20 text-purple-200 border-purple-400/30",
  utilities: "bg-green-500/20 text-green-200 border-green-400/30",
  software_subscriptions: "bg-yellow-500/20 text-yellow-200 border-yellow-400/30",
  hardware: "bg-red-500/20 text-red-200 border-red-400/30",
  professional_services: "bg-indigo-500/20 text-indigo-200 border-indigo-400/30",
  marketing: "bg-pink-500/20 text-pink-200 border-pink-400/30",
  rent: "bg-orange-500/20 text-orange-200 border-orange-400/30",
  insurance: "bg-cyan-500/20 text-cyan-200 border-cyan-400/30",
  other: "bg-gray-500/20 text-gray-200 border-gray-400/30"
};

const statusColors = {
  pending: "bg-yellow-500/20 text-yellow-200 border-yellow-400/30",
  paid: "bg-green-500/20 text-green-200 border-green-400/30",
  overdue: "bg-red-500/20 text-red-200 border-red-400/30",
  cancelled: "bg-gray-500/20 text-gray-200 border-gray-400/30"
};

export default function RecentInvoices({ invoices, isLoading }) {
  if (isLoading) {
    return (
      <div className="glass-light rounded-2xl p-6">
        <h3 className="text-glass text-lg font-medium mb-6">Recent Invoices</h3>
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse flex justify-between items-center py-3">
              <div className="space-y-2">
                <div className="h-4 bg-white/20 rounded w-32"></div>
                <div className="h-3 bg-white/10 rounded w-24"></div>
              </div>
              <div className="h-4 bg-white/20 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-light rounded-2xl p-6">
      <h3 className="text-glass text-lg font-medium mb-6">Recent Invoices</h3>
      <div className="space-y-4">
        {invoices.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-glass-muted">No invoices yet</div>
            <div className="text-glass-muted text-sm mt-1">Upload your first invoice to get started</div>
          </div>
        ) : (
          invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-glass font-medium">{invoice.vendor}</span>
                  {invoice.file_url && (
                    <a
                      href={invoice.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-glass-muted hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-glass-muted text-sm">
                    {format(new Date(invoice.date || invoice.created_date), "MMM d, yyyy")}
                  </span>
                  {invoice.category && (
                    <Badge className={`text-xs ${categoryColors[invoice.category]} border`}>
                      {invoice.category.replace(/_/g, ' ')}
                    </Badge>
                  )}
                  {invoice.status && (
                    <Badge className={`text-xs ${statusColors[invoice.status]} border`}>
                      {invoice.status}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-glass font-semibold">
                ${(invoice.total_amount || 0).toFixed(2)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}