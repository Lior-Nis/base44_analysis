import React, { useState, useEffect } from 'react';
import { LotteryDraw, LotteryTicket, User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Trophy,
  Clock,
  Ticket,
  DollarSign,
  Users,
  Play,
  Settings,
  BarChart,
  Brain,
  Target,
  TrendingUp
} from 'lucide-react';

export default function LotteryManager() {
  const [draws, setDraws] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [newDraw, setNewDraw] = useState({
    draw_time: '',
    jackpot_amount: 100000
  });
  const [stats, setStats] = useState({
    totalDraws: 0,
    totalTickets: 0,
    totalSales: 0,
    totalWinnings: 0
  });
  const [aiSettings, setAiSettings] = useState({
    enabled: true,
    profitMargin: 15, // Target profit margin %
    maxJackpotWinners: 1, // Max jackpot winners per draw
    winRateControl: 0.3, // Overall win rate (30%)
    adaptiveOdds: true,
    riskLevel: 'medium' // low, medium, high
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Load draws
    const allDraws = await LotteryDraw.list('-draw_time');
    setDraws(allDraws);

    // Load recent tickets
    const recentTickets = await LotteryTicket.list('-created_date', 100);
    setTickets(recentTickets);

    // Calculate stats
    const totalTickets = recentTickets.length;
    const totalSales = recentTickets.reduce((sum, t) => sum + t.ticket_price, 0);
    const totalWinnings = recentTickets.reduce((sum, t) => sum + (t.win_amount || 0), 0);

    setStats({
      totalDraws: allDraws.length,
      totalTickets,
      totalSales,
      totalWinnings
    });
  };

  const createDraw = async () => {
    if (!newDraw.draw_time || !newDraw.jackpot_amount) {
      alert('Please fill all fields');
      return;
    }

    const drawNumber = `DRAW${Date.now()}`;
    await LotteryDraw.create({
      draw_number: drawNumber,
      draw_time: new Date(newDraw.draw_time).toISOString(),
      jackpot_amount: Number(newDraw.jackpot_amount),
      status: 'active'
    });

    alert('Draw created successfully!');
    setNewDraw({ draw_time: '', jackpot_amount: 100000 });
    loadData();
  };

  const conductAIDraw = async (drawId) => {
    if (!confirm('Are you sure? AI will optimize this draw for profitability.')) {
      return;
    }

    try {
      // Get all tickets for this draw
      const drawTickets = await LotteryTicket.filter({ draw_id: drawId });
      const draw = await LotteryDraw.get(drawId);
      
      if (drawTickets.length === 0) {
        alert('No tickets sold for this draw!');
        return;
      }

      // AI Analysis
      const totalSales = drawTickets.reduce((sum, t) => sum + t.ticket_price, 0);
      const targetProfit = totalSales * (aiSettings.profitMargin / 100);
      const maxPayout = totalSales - targetProfit;

      // Analyze ticket patterns
      const numberCounts = {};
      drawTickets.forEach(ticket => {
        ticket.selected_numbers.forEach(num => {
          numberCounts[num] = (numberCounts[num] || 0) + 1;
        });
      });

      // AI-Generated winning numbers (avoid most popular)
      const popularNumbers = Object.entries(numberCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20)
        .map(([num]) => parseInt(num));

      const winningNumbers = generateAINumbers(popularNumbers, aiSettings);
      const bonusNumber = Math.floor(Math.random() * 49) + 1;

      // Update draw with AI results
      await LotteryDraw.update(drawId, {
        winning_numbers: winningNumbers,
        bonus_number: bonusNumber,
        status: 'drawn'
      });

      // Process tickets with AI optimization
      const prizeBreakdown = await processTicketsWithAI(drawTickets, winningNumbers, maxPayout, aiSettings);

      // Update draw with final results
      await LotteryDraw.update(drawId, {
        status: 'completed',
        prize_breakdown: prizeBreakdown
      });

      alert('AI Draw completed successfully! Optimized for maximum profitability.');
      loadData();

    } catch (error) {
      console.error('Error conducting AI draw:', error);
      alert('Error conducting draw. Please try again.');
    }
  };

  const generateAINumbers = (popularNumbers, settings) => {
    const numbers = [];
    const availableNumbers = [...Array(49)].map((_, i) => i + 1);
    
    // Remove most popular numbers based on risk level
    const avoidCount = {
      'low': Math.floor(popularNumbers.length * 0.3),
      'medium': Math.floor(popularNumbers.length * 0.6),
      'high': Math.floor(popularNumbers.length * 0.8)
    }[settings.riskLevel];

    const numbersToAvoid = popularNumbers.slice(0, avoidCount);
    const safeNumbers = availableNumbers.filter(n => !numbersToAvoid.includes(n));

    // Generate 6 winning numbers, preferring less popular ones
    while (numbers.length < 6) {
      const pool = numbers.length < 4 ? safeNumbers : availableNumbers;
      const randomIndex = Math.floor(Math.random() * pool.length);
      const number = pool[randomIndex];
      
      if (!numbers.includes(number)) {
        numbers.push(number);
      }
    }

    return numbers.sort((a, b) => a - b);
  };

  const processTicketsWithAI = async (tickets, winningNumbers, maxPayout, settings) => {
    const prizeBreakdown = {
      tier1: { count: 0, amount: 0 }, // 6 matches
      tier2: { count: 0, amount: 10000 }, // 5 matches
      tier3: { count: 0, amount: 1000 }, // 4 matches
      tier4: { count: 0, amount: 100 } // 3 matches
    };

    let totalPayout = 0;

    for (const ticket of tickets) {
      const matches = ticket.selected_numbers.filter(num =>
        winningNumbers.includes(num)
      ).length;

      let winAmount = 0;
      let prizeTier = '';

      if (matches === 6) {
        prizeTier = 'tier1';
        prizeBreakdown.tier1.count++;
      } else if (matches === 5) {
        winAmount = 10000;
        prizeTier = 'tier2';
        prizeBreakdown.tier2.count++;
      } else if (matches === 4) {
        winAmount = 1000;
        prizeTier = 'tier3';
        prizeBreakdown.tier3.count++;
      } else if (matches === 3) {
        winAmount = 100;
        prizeTier = 'tier4';
        prizeBreakdown.tier4.count++;
      }

      // AI Payout Control - reduce winnings if exceeding budget
      if (totalPayout + winAmount > maxPayout && winAmount > 0) {
        winAmount = Math.max(0, maxPayout - totalPayout);
      }

      totalPayout += winAmount;

      // Update ticket
      await LotteryTicket.update(ticket.id, {
        matches: matches,
        prize_tier: prizeTier,
        win_amount: winAmount,
        status: winAmount > 0 ? 'winner' : 'loser'
      });

      // Credit winnings to user (except jackpot)
      if (winAmount > 0 && matches < 6) {
        const user = await User.get(ticket.user_id);
        const newBalance = (user.wallet_balance || 0) + winAmount;
        await User.update(ticket.user_id, { wallet_balance: newBalance });
      }

      await new Promise(resolve => setTimeout(resolve, 50)); // Rate limiting
    }

    // Handle jackpot with AI control
    if (prizeBreakdown.tier1.count > 0) {
      const remainingBudget = maxPayout - totalPayout;
      const jackpotPerWinner = Math.max(50000, remainingBudget / prizeBreakdown.tier1.count);

      const jackpotTickets = await LotteryTicket.filter({
        draw_id: tickets[0].draw_id,
        prize_tier: 'tier1'
      });

      for (const ticket of jackpotTickets) {
        await LotteryTicket.update(ticket.id, { win_amount: jackpotPerWinner });
        const user = await User.get(ticket.user_id);
        const newBalance = (user.wallet_balance || 0) + jackpotPerWinner;
        await User.update(ticket.user_id, { wallet_balance: newBalance });
      }

      prizeBreakdown.tier1.amount = jackpotPerWinner;
    }

    return prizeBreakdown;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            AI-Powered Lottery Management System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="stats">
            <TabsList className="grid w-full grid-cols-5 bg-slate-700">
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="draws">Draws</TabsTrigger>
              <TabsTrigger value="tickets">Tickets</TabsTrigger>
              <TabsTrigger value="ai-settings">AI Settings</TabsTrigger>
              <TabsTrigger value="create">Create Draw</TabsTrigger>
            </TabsList>

            <TabsContent value="ai-settings" className="space-y-6">
              <Card className="bg-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-400" />
                    AI Control Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Enable AI Control</Label>
                    <Switch
                      checked={aiSettings.enabled}
                      onCheckedChange={(checked) => setAiSettings({...aiSettings, enabled: checked})}
                    />
                  </div>
                  
                  <div>
                    <Label className="text-white">Target Profit Margin (%)</Label>
                    <Input
                      type="number"
                      value={aiSettings.profitMargin}
                      onChange={(e) => setAiSettings({...aiSettings, profitMargin: Number(e.target.value)})}
                      className="bg-slate-800 border-slate-600 text-white mt-1"
                      min="5"
                      max="50"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Max Jackpot Winners per Draw</Label>
                    <Input
                      type="number"
                      value={aiSettings.maxJackpotWinners}
                      onChange={(e) => setAiSettings({...aiSettings, maxJackpotWinners: Number(e.target.value)})}
                      className="bg-slate-800 border-slate-600 text-white mt-1"
                      min="0"
                      max="5"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Overall Win Rate Control</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={aiSettings.winRateControl}
                      onChange={(e) => setAiSettings({...aiSettings, winRateControl: Number(e.target.value)})}
                      className="bg-slate-800 border-slate-600 text-white mt-1"
                      min="0.1"
                      max="0.8"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Risk Level</Label>
                    <select
                      value={aiSettings.riskLevel}
                      onChange={(e) => setAiSettings({...aiSettings, riskLevel: e.target.value})}
                      className="w-full p-2 bg-slate-800 border border-slate-600 text-white rounded mt-1"
                    >
                      <option value="low">Low (Conservative)</option>
                      <option value="medium">Medium (Balanced)</option>
                      <option value="high">High (Aggressive)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-white">Adaptive Odds</Label>
                    <Switch
                      checked={aiSettings.adaptiveOdds}
                      onCheckedChange={(checked) => setAiSettings({...aiSettings, adaptiveOdds: checked})}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-700/50">
                  <CardContent className="p-4 text-center">
                    <BarChart className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                    <div className="text-2xl font-bold text-white">{stats.totalDraws}</div>
                    <div className="text-gray-400 text-sm">Total Draws</div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-700/50">
                  <CardContent className="p-4 text-center">
                    <Ticket className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    <div className="text-2xl font-bold text-white">{stats.totalTickets}</div>
                    <div className="text-gray-400 text-sm">Tickets Sold</div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-700/50">
                  <CardContent className="p-4 text-center">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                    <div className="text-2xl font-bold text-white">₹{stats.totalSales.toLocaleString()}</div>
                    <div className="text-gray-400 text-sm">Total Sales</div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-700/50">
                  <CardContent className="p-4 text-center">
                    <Trophy className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                    <div className="text-2xl font-bold text-white">₹{stats.totalWinnings.toLocaleString()}</div>
                    <div className="text-gray-400 text-sm">Total Winnings</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">AI Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-400">
                        {((stats.totalSales - stats.totalWinnings) / Math.max(stats.totalSales, 1) * 100).toFixed(1)}%
                      </div>
                      <div className="text-gray-400 text-sm">Profit Margin</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-400">
                        {(stats.totalWinnings / Math.max(stats.totalTickets, 1)).toFixed(0)}
                      </div>
                      <div className="text-gray-400 text-sm">Avg Win per Ticket</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-400">
                        {aiSettings.enabled ? 'Active' : 'Disabled'}
                      </div>
                      <div className="text-gray-400 text-sm">AI Status</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="draws">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-600">
                    <TableHead className="text-white">Draw Number</TableHead>
                    <TableHead className="text-white">Draw Time</TableHead>
                    <TableHead className="text-white">Jackpot</TableHead>
                    <TableHead className="text-white">Tickets</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Winning Numbers</TableHead>
                    <TableHead className="text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {draws.map((draw) => (
                    <TableRow key={draw.id} className="border-slate-600">
                      <TableCell className="text-white">{draw.draw_number}</TableCell>
                      <TableCell className="text-gray-300">
                        {new Date(draw.draw_time).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-yellow-400">₹{draw.jackpot_amount?.toLocaleString()}</TableCell>
                      <TableCell className="text-blue-400">{draw.total_tickets || 0}</TableCell>
                      <TableCell>
                        <Badge className={
                          draw.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                          draw.status === 'drawn' ? 'bg-blue-500/20 text-blue-300' :
                          draw.status === 'active' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-gray-500/20 text-gray-300'
                        }>
                          {draw.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">
                        {draw.winning_numbers ? (
                          <div className="flex gap-1">
                            {draw.winning_numbers.map((num, idx) => (
                              <span key={idx} className="w-6 h-6 bg-yellow-500 text-black rounded-full text-xs flex items-center justify-center">
                                {num}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {draw.status === 'active' && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => conductAIDraw(draw.id)}
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <Brain className="w-4 h-4 mr-1" />
                              AI Draw
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Keep existing tickets and create tabs */}
            <TabsContent value="tickets">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-600">
                    <TableHead className="text-white">Ticket #</TableHead>
                    <TableHead className="text-white">User</TableHead>
                    <TableHead className="text-white">Numbers</TableHead>
                    <TableHead className="text-white">Price</TableHead>
                    <TableHead className="text-white">Matches</TableHead>
                    <TableHead className="text-white">Winnings</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.slice(0, 50).map((ticket) => (
                    <TableRow key={ticket.id} className="border-slate-600">
                      <TableCell className="text-white">{ticket.ticket_number?.slice(-8)}</TableCell>
                      <TableCell className="text-gray-300">{ticket.user_id?.slice(-6)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {ticket.selected_numbers?.map((num, idx) => (
                            <span key={idx} className="w-6 h-6 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center">
                              {num}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-yellow-400">₹{ticket.ticket_price}</TableCell>
                      <TableCell className="text-blue-400">{ticket.matches || 0}</TableCell>
                      <TableCell className="text-green-400">₹{ticket.win_amount || 0}</TableCell>
                      <TableCell>
                        <Badge className={
                          ticket.status === 'winner' ? 'bg-green-500/20 text-green-300' :
                          ticket.status === 'loser' ? 'bg-red-500/20 text-red-300' :
                          'bg-gray-500/20 text-gray-300'
                        }>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="create" className="space-y-6">
              <Card className="bg-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Create New Lottery Draw</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-white">Draw Time</Label>
                    <Input
                      type="datetime-local"
                      value={newDraw.draw_time}
                      onChange={(e) => setNewDraw({...newDraw, draw_time: e.target.value})}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Jackpot Amount (₹)</Label>
                    <Input
                      type="number"
                      value={newDraw.jackpot_amount}
                      onChange={(e) => setNewDraw({...newDraw, jackpot_amount: Number(e.target.value)})}
                      className="bg-slate-800 border-slate-600 text-white"
                      min="10000"
                      step="10000"
                    />
                  </div>
                  <Button
                    onClick={createDraw}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Create Draw
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}