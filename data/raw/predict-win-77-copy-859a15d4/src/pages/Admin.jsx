
import React, { useState, useEffect } from "react";
import { User, DepositRequest, WithdrawRequest } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle }
from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Shield, KeyRound, Lock, User as UserIcon, ArrowDown, ArrowUp, Gamepad2, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminStats from "../components/admin/AdminStats";
import DepositManager from "../components/admin/DepositManager";
import WithdrawManager from "../components/admin/WithdrawManager";
import UserManager from "../components/admin/UserManager";
import GameManager from "../components/admin/GameManager";
import SlotManager from "../components/admin/SlotManager";
import ArcadeManager from "../components/admin/ArcadeManager";
import ReferralManager from "../components/admin/ReferralManager";
import CrashManager from "../components/admin/CrashManager";
import ChatManager from "../components/admin/ChatManager";
import LotteryManager from "../components/admin/LotteryManager";
import TournamentManager from "../components/admin/TournamentManager"; // New import for TournamentManager
import BalanceManager from "../components/admin/BalanceManager"; // New import for BalanceManager
import QuizManager from "../components/admin/QuizManager"; // New import for QuizManager

const ADMIN_LOCK_ID = "1256";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [key, setKey] = useState(0); // Used to force re-renders
  const [lastRefresh, setLastRefresh] = useState(Date.now()); // New state for last refresh time

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (e) {
        setUser(null);
      }
    };
    checkUser();
  }, []);

  const handleUnlock = () => {
    if (password === ADMIN_LOCK_ID) {
      setIsUnlocked(true);
      setError('');
    } else {
      setError("Incorrect Lock ID. Please try again.");
    }
  };
  
  const refreshData = () => {
    const now = Date.now();
    // Only refresh if at least 30 seconds (30000 ms) have passed since last refresh
    if (now - lastRefresh > 30000) {
      setKey(prevKey => prevKey + 1);
      setLastRefresh(now);
    } else {
      alert("Please wait before refreshing again to avoid rate limits (30 seconds cooldown).");
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        Loading...
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <Shield className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="text-gray-400 mt-2">You do not have permission to view this page.</p>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <Card className="w-full max-w-sm bg-slate-800/50 border-slate-700/50 text-white">
          <CardHeader className="text-center">
            <Lock className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
            <CardTitle className="text-2xl">Admin Panel Locked</CardTitle>
            <p className="text-gray-400 text-sm">Enter Lock ID to continue</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
                placeholder="****"
                className="bg-slate-700 border-slate-600 pl-10"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button onClick={handleUnlock} className="w-full bg-yellow-600 hover:bg-yellow-700">
              Unlock
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold flex items-center gap-3">
            <Shield className="w-8 h-8 text-yellow-400" />
            Advanced Admin Control Center
          </h1>
          <p className="text-gray-400 mt-1">Complete control over color prediction games and platform management.</p>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
            <span>Last refresh: {new Date(lastRefresh).toLocaleTimeString()}</span>
            <Button 
              onClick={refreshData}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh Data
            </Button>
          </div>
        </div>
        
        <AdminStats key={`stats-${key}`} />
        
        <Tabs defaultValue="games" className="mt-8">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 lg:grid-cols-13 bg-slate-800/50">
            <TabsTrigger value="games">Game Control</TabsTrigger>
            <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
            <TabsTrigger value="balance">💰 Balance</TabsTrigger>
            <TabsTrigger value="deposits">Deposits</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="slots">Slot Games</TabsTrigger>
            <TabsTrigger value="arcade">Arcade</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="crash">Crash Games</TabsTrigger>
            <TabsTrigger value="lottery">Lottery</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>
          <TabsContent value="games" className="mt-6">
            <GameManager key={`games-${key}`} />
          </TabsContent>
          <TabsContent value="tournaments" className="mt-6">
            <TournamentManager key={`tournaments-${key}`} />
          </TabsContent>
          <TabsContent value="balance" className="mt-6">
            <BalanceManager key={`balance-${key}`} />
          </TabsContent>
          <TabsContent value="deposits" className="mt-6">
            <DepositManager key={`deposits-${key}`} onAction={refreshData} />
          </TabsContent>
          <TabsContent value="withdrawals" className="mt-6">
            <WithdrawManager key={`withdrawals-${key}`} onAction={refreshData} />
          </TabsContent>
          <TabsContent value="users" className="mt-6">
            <UserManager key={`users-${key}`} />
          </TabsContent>
          <TabsContent value="slots" className="mt-6">
            <SlotManager key={`slots-${key}`} />
          </TabsContent>
           <TabsContent value="arcade" className="mt-6">
            <ArcadeManager key={`arcade-${key}`} />
          </TabsContent>
          <TabsContent value="quiz" className="mt-6">
            <QuizManager key={`quiz-${key}`} />
          </TabsContent>
           <TabsContent value="referrals" className="mt-6">
            <ReferralManager key={`referrals-${key}`} />
          </TabsContent>
           <TabsContent value="crash" className="mt-6">
            <CrashManager key={`crash-${key}`} />
          </TabsContent>
          <TabsContent value="lottery" className="mt-6">
            <LotteryManager key={`lottery-${key}`} />
          </TabsContent>
          <TabsContent value="support" className="mt-6">
            <ChatManager key={`support-${key}`} adminUser={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
