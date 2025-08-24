import React, { useState, useEffect } from "react";
import { User, DepositRequest, WithdrawRequest, Referral } from "@/api/entities";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ArrowDown, ArrowUp, Gift, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    totalReferrals: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const now = Date.now();
    if (now - lastFetch > 30000) {
      fetchStats();
    }
  }, [lastFetch]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Add longer delays and retry logic
      const users = await retryApiCall(() => User.list());
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const deposits = await retryApiCall(() => DepositRequest.filter({ status: "pending" }));
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const withdrawals = await retryApiCall(() => WithdrawRequest.filter({ status: "pending" }));
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const referrals = await retryApiCall(() => Referral.list());
      
      setStats({
        totalUsers: users.length,
        pendingDeposits: deposits.length,
        pendingWithdrawals: withdrawals.length,
        totalReferrals: referrals.length,
      });
      
      setLastFetch(Date.now());
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError("Failed to load statistics. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const retryApiCall = async (apiCall, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await apiCall();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1))); // Exponential backoff
      }
    }
  };

  const statCards = [
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-400" },
    { title: "Pending Deposits", value: stats.pendingDeposits, icon: ArrowDown, color: "text-green-400" },
    { title: "Pending Withdrawals", value: stats.pendingWithdrawals, icon: ArrowUp, color: "text-red-400" },
    { title: "Total Referrals", value: stats.totalReferrals, icon: Gift, color: "text-yellow-400" },
  ];

  if (error) {
    return (
      <Alert className="border-red-500/30 bg-red-500/10">
        <AlertCircle className="h-4 w-4 text-red-400" />
        <AlertDescription className="text-red-300">
          {error}
          <Button 
            onClick={fetchStats}
            variant="outline"
            size="sm"
            className="ml-4 border-red-500 text-red-400 hover:bg-red-500/10"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i} className="bg-slate-800/50 border-slate-700/50 p-6">
            <Skeleton className="h-8 w-8 mb-4 rounded-full" />
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => (
        <Card key={index} className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <card.icon className={`w-8 h-8 mb-4 ${card.color}`} />
            <div className="text-3xl font-bold text-white">{card.value}</div>
            <p className="text-sm text-gray-400">{card.title}</p>
          </CardContent>
        </Card>
      ))}
      <div className="col-span-full">
        <button 
          onClick={fetchStats}
          className="text-sm text-gray-400 hover:text-white transition-colors"
          disabled={isLoading}
        >
          Last updated: {new Date(lastFetch).toLocaleTimeString()} - Click to refresh
        </button>
      </div>
    </div>
  );
}