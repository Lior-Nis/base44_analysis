import React, { useState, useEffect } from "react";
import { User, WithdrawRequest } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, ArrowUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function WithdrawManager({ onAction }) {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    const withdrawRequests = await WithdrawRequest.filter({ status: "pending" }, '-created_date');
    setRequests(withdrawRequests);
    setIsLoading(false);
  };

  const handleAction = async (request, newStatus) => {
    if (!confirm(`Are you sure you want to mark this request as ${newStatus}?`)) return;

    try {
      await WithdrawRequest.update(request.id, { status: newStatus });
      
      if (newStatus === 'paid') {
        const requestUser = await User.get(request.user_id);
        const newBalance = (requestUser.wallet_balance || 0) - request.amount;
        const newTotalWithdrawn = (requestUser.total_withdrawn || 0) + request.amount;
        await User.update(request.user_id, { 
          wallet_balance: newBalance,
          total_withdrawn: newTotalWithdrawn 
        });
      }
      
      alert(`Request has been marked as ${newStatus}.`);
      fetchRequests();
      onAction();
    } catch (error) {
      console.error(`Error updating request:`, error);
      alert("An error occurred.");
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <ArrowUp className="text-red-400" />
          Manage Withdrawal Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700">
              <TableHead className="text-white">User ID</TableHead>
              <TableHead className="text-white">Amount</TableHead>
              <TableHead className="text-white">UPI ID</TableHead>
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
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell className="flex gap-2"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : requests.length > 0 ? (
              requests.map((req) => (
                <TableRow key={req.id} className="border-slate-700">
                  <TableCell className="text-gray-300">{req.user_id.slice(0, 8)}...</TableCell>
                  <TableCell className="font-medium text-red-400">₹{req.amount}</TableCell>
                  <TableCell className="text-white">{req.upi_id}</TableCell>
                  <TableCell className="text-gray-400">{new Date(req.created_date).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="icon" variant="outline" className="bg-green-500/10 border-green-500 text-green-400 hover:bg-green-500/20 h-8 w-8" onClick={() => handleAction(req, 'paid')}>
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
                  No pending withdrawal requests.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}