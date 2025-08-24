import React, { useState, useEffect } from "react";
import { User, DepositRequest } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, ArrowDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DepositManager({ onAction }) {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    const depositRequests = await DepositRequest.filter({ status: "pending" }, '-created_date');
    setRequests(depositRequests);
    setIsLoading(false);
  };

  const handleAction = async (request, newStatus) => {
    if (!confirm(`Are you sure you want to ${newStatus === 'approved' ? 'approve' : 'reject'} this request?`)) return;

    try {
      await DepositRequest.update(request.id, { status: newStatus });
      
      if (newStatus === 'approved') {
        const requestUser = await User.get(request.user_id);
        const newBalance = (requestUser.wallet_balance || 0) + request.amount;
        const newTotalDeposited = (requestUser.total_deposited || 0) + request.amount;
        await User.update(request.user_id, { 
          wallet_balance: newBalance,
          total_deposited: newTotalDeposited 
        });
      }
      
      alert(`Request has been ${newStatus}.`);
      fetchRequests(); // Refresh list
      onAction(); // Refresh stats in parent
    } catch (error) {
      console.error(`Error ${newStatus === 'approved' ? 'approving' : 'rejecting'} request:`, error);
      alert("An error occurred.");
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <ArrowDown className="text-green-400" />
          Manage Deposit Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-white">User ID</TableHead>
              <TableHead className="text-white">Amount</TableHead>
              <TableHead className="text-white">Note</TableHead>
              <TableHead className="text-white">Date</TableHead>
              <TableHead className="text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <TableRow key={i} className="border-slate-700">
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell className="flex gap-2"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : requests.length > 0 ? (
              requests.map((req) => (
                <TableRow key={req.id} className="border-slate-700">
                  <TableCell className="text-gray-300">{req.user_id.slice(0, 8)}...</TableCell>
                  <TableCell className="font-medium text-green-400">₹{req.amount}</TableCell>
                  <TableCell><Badge variant="outline">{req.unique_note}</Badge></TableCell>
                  <TableCell className="text-gray-400">{new Date(req.created_date).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="icon" variant="outline" className="bg-green-500/10 border-green-500 text-green-400 hover:bg-green-500/20 h-8 w-8" onClick={() => handleAction(req, 'approved')}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="bg-red-500/10 border-red-500 text-red-400 hover:bg-red-500/20 h-8 w-8" onClick={() => handleAction(req, 'rejected')}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="5" className="text-center text-gray-400 py-8">
                  No pending deposit requests.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}