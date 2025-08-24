
import React, { useState, useEffect } from "react";
import { ColourGame, ColourBet, User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings,
  Target,
  TrendingUp,
  Users,
  AlertTriangle,
  Eye,
  Shuffle,
  BarChart,
  Timer,
  DollarSign,
  Shield,
  RefreshCw,
  Loader2,
  Brain // Added Brain icon for AI
} from "lucide-react";

export default function ColorPredictionControl() {
  const [awaitingGames, setAwaitingGames] = useState([]);
  const [gameSettings, setGameSettings] = useState({
    roundDuration: 60,
    showDuration: 10,
    betCutoffTime: 5,
    autoResult: false,
    redMultiplier: 2.0,
    greenMultiplier: 2.0,
    violetMultiplier: 4.5,
    numberMultiplier: 9.0
  });
  const [aiSettings, setAiSettings] = useState({
    enabled: true,
    profitMargin: 20, // Target profit margin %
    riskLevel: 'medium', // low, medium, high
    adaptToPatterns: true,
    maxConsecutiveLosses: 3,
    winRateControl: 0.35, // Overall win rate (35%) - Placeholder, not actively used in current AI logic
    houseFavorBias: 0.7 // 0-1, higher = more house favor in result selection
  });
  const [patternControl, setPatternControl] = useState({
    enablePattern: false,
    redPercent: 40,
    greenPercent: 40,
    violetPercent: 20,
    avoidConsecutive: true,
    maxConsecutive: 3
  });
  const [recentResults, setRecentResults] = useState([]);
  const [liveStats, setLiveStats] = useState({
    totalBets: 0,
    totalAmount: 0,
    redBets: 0, // Sum of amount bet on red
    greenBets: 0, // Sum of amount bet on green
    violetBets: 0, // Sum of amount bet on violet
    numberBets: 0 // Count of number bets
  });
  const [suspiciousUsers, setSuspiciousUsers] = useState([]);
  const [manualResults, setManualResults] = useState({});
  const [lastFetch, setLastFetch] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Only fetch if we haven't fetched in the last 30 seconds
    const now = Date.now();
    if (now - lastFetch > 30000) {
      loadData();
    }
  }, [lastFetch]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Add delays between API calls to avoid rate limiting
      const games = await ColourGame.filter({ status: "awaiting_result" }, '-created_date');
      setAwaitingGames(games);

      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay

      // Load recent results for pattern analysis
      const recent = await ColourGame.filter({ status: "completed" }, '-created_date', 20);
      setRecentResults(recent);

      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay

      // Load live betting stats for current games
      if (games.length > 0) {
        const currentGame = games[0];
        const bets = await ColourBet.filter({ game_id: currentGame.id });

        const stats = {
          totalBets: bets.length,
          totalAmount: bets.reduce((sum, bet) => sum + bet.bet_amount, 0),
          redBets: bets.filter(b => b.bet_type === 'colour' && b.bet_value === 'red').reduce((sum, bet) => sum + bet.bet_amount, 0),
          greenBets: bets.filter(b => b.bet_type === 'colour' && b.bet_value === 'green').reduce((sum, bet) => sum + bet.bet_amount, 0),
          violetBets: bets.filter(b => b.bet_type === 'colour' && b.bet_value === 'violet').reduce((sum, bet) => sum + bet.bet_amount, 0),
          numberBets: bets.filter(b => b.bet_type === 'number').length // Still count for numbers
        };
        setLiveStats(stats);
      } else {
        // Reset live stats if no games awaiting result
        setLiveStats({
          totalBets: 0,
          totalAmount: 0,
          redBets: 0,
          greenBets: 0,
          violetBets: 0,
          numberBets: 0
        });
      }


      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay

      // Detect suspicious betting patterns
      await detectSuspiciousActivity();

      setLastFetch(Date.now());
    } catch (error) {
      console.error("Error loading color prediction data:", error);
      // Don't show error if it's rate limiting
      if (!error.message?.includes('Rate limit')) {
        alert("Error loading data. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const detectSuspiciousActivity = async () => {
    try {
      const users = await User.list();
      const suspicious = [];

      // Process users in batches to avoid rate limiting
      const batchSize = 5;
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);

        for (const user of batch) {
          try {
            const userBets = await ColourBet.filter({ user_id: user.id });
            const recentBets = userBets.filter(bet =>
              new Date(bet.created_date) > new Date(Date.now() - 24 * 60 * 60 * 1000)
            );

            // Check for suspicious patterns
            if (recentBets.length > 50) {
              suspicious.push({
                ...user,
                reason: "High frequency betting",
                riskLevel: "high",
                betCount: recentBets.length
              });
            }

            const winRate = recentBets.length > 0 ?
              (recentBets.filter(b => b.status === 'won').length / recentBets.length) * 100 : 0;

            if (winRate > 80 && recentBets.length > 10) {
              suspicious.push({
                ...user,
                reason: "Unusually high win rate",
                riskLevel: "critical",
                winRate: winRate.toFixed(1)
              });
            }

            // Add delay between user checks
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`Error checking user ${user.id}:`, error);
            // Skip this user if there's an error
            continue;
          }
        }

        // Add delay between batches
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setSuspiciousUsers(suspicious);
    } catch (error) {
      console.error("Error detecting suspicious activity:", error);
    }
  };

  // Helper to get color from number
  const getColorFromNumber = (number) => {
    if ([0, 5].includes(number)) return 'violet';
    if ([1, 3, 7, 9].includes(number)) return 'red';
    return 'green';
  };

  // Helper to get all associated colors from a number (e.g. 0 is green and violet)
  const getColorsFromNumber = (number) => {
    const colors = [];
    if ([1, 3, 7, 9].includes(number) || number === 5) colors.push('red');
    if ([0, 2, 4, 6, 8].includes(number) || number === 0) colors.push('green');
    if ([0, 5].includes(number)) colors.push('violet');
    return colors;
  };

  const generateAIResult = async (gameId) => {
    // Fetch all bets for the current game to get accurate amounts for number bets
    // and overall totalAmount staked, as liveStats are summarized and might not contain all details.
    const currentGameBets = await ColourBet.filter({ game_id: gameId });
    const totalAmountStaked = currentGameBets.reduce((sum, bet) => sum + bet.bet_amount, 0);

    // If no bets at all, return random.
    if (totalAmountStaked === 0) {
      return Math.floor(Math.random() * 10);
    }

    // Recalculate color bets amounts from fetched bets for precision
    const redBetAmount = currentGameBets.filter(b => b.bet_type === 'colour' && b.bet_value === 'red').reduce((sum, bet) => sum + bet.bet_amount, 0);
    const greenBetAmount = currentGameBets.filter(b => b.bet_type === 'colour' && b.bet_value === 'green').reduce((sum, bet) => sum + bet.bet_amount, 0);
    const violetBetAmount = currentGameBets.filter(b => b.bet_type === 'colour' && b.bet_value === 'violet').reduce((sum, bet) => sum + bet.bet_amount, 0);

    // Find the number that gives the most profit (lowest payout) considering ALL bets (colors and numbers)
    let bestProfitNumber = -1;
    let minTotalPayout = Infinity;

    for (let i = 0; i <= 9; i++) {
      const colorsWinningThisNumber = getColorsFromNumber(i);
      let currentNumberPayout = 0;

      if (colorsWinningThisNumber.includes('red')) currentNumberPayout += redBetAmount * gameSettings.redMultiplier;
      if (colorsWinningThisNumber.includes('green')) currentNumberPayout += greenBetAmount * gameSettings.greenMultiplier;
      if (colorsWinningThisNumber.includes('violet')) currentNumberPayout += violetBetAmount * gameSettings.violetMultiplier;

      const numberBetAmountFor_i = currentGameBets.filter(b => b.bet_type === 'number' && parseInt(b.bet_value) === i)
        .reduce((sum, bet) => sum + bet.bet_amount, 0);
      currentNumberPayout += numberBetAmountFor_i * gameSettings.numberMultiplier;

      if (currentNumberPayout < minTotalPayout) {
        minTotalPayout = currentNumberPayout;
        bestProfitNumber = i;
      }
    }

    // Determine the result based on houseFavorBias and target profit
    const houseAdvantage = aiSettings.houseFavorBias;
    const targetNetHouseGain = totalAmountStaked * (aiSettings.profitMargin / 100);

    let finalResultCandidateNumber;

    if (Math.random() < houseAdvantage && (totalAmountStaked - minTotalPayout) >= targetNetHouseGain) {
      // House-favored outcome, if it meets target profit
      finalResultCandidateNumber = bestProfitNumber;
    } else {
      // Balance with user engagement: If house advantage is not applied or profit target not met,
      // pick a number that aligns with a color that is NOT the least profitable for the house.
      // This part tries to provide wins to users more often.
      const potentialColorPayouts = {
        red: redBetAmount * gameSettings.redMultiplier,
        green: greenBetAmount * gameSettings.greenMultiplier,
        violet: violetBetAmount * gameSettings.violetMultiplier
      };

      let selectedColorToMinimizePayout = 'red'; // Color that would yield max profit if it won
      if (potentialColorPayouts.green < potentialColorPayouts.red && potentialColorPayouts.green < potentialColorPayouts.violet) {
        selectedColorToMinimizePayout = 'green';
      } else if (potentialColorPayouts.violet < potentialColorPayouts.red && potentialColorPayouts.violet < potentialColorPayouts.green) {
        selectedColorToMinimizePayout = 'violet';
      }

      const colorOptions = {
        red: [1, 3, 7, 9],
        green: [0, 2, 4, 6, 8],
        violet: [0, 5, 9]
      };

      let engagementColor;
      if (selectedColorToMinimizePayout === 'red') {
        engagementColor = ['green', 'violet'][Math.floor(Math.random() * 2)];
      } else if (selectedColorToMinimizePayout === 'green') {
        engagementColor = ['red', 'violet'][Math.floor(Math.random() * 2)];
      } else { // violet
        engagementColor = ['red', 'green'][Math.floor(Math.random() * 2)];
      }

      // Select a number from the engagement color, if available
      if (colorOptions[engagementColor] && colorOptions[engagementColor].length > 0) {
        finalResultCandidateNumber = colorOptions[engagementColor][Math.floor(Math.random() * colorOptions[engagementColor].length)];
      } else {
        // Fallback if somehow no options, just use the best profit number
        finalResultCandidateNumber = bestProfitNumber;
      }
    }

    // Pattern control: Avoid consecutive same results if enabled
    if (recentResults.length > 0 && aiSettings.maxConsecutiveLosses > 0) {
      const lastResult = recentResults[0].result_number;
      let consecutiveCount = 0;
      for (let i = 0; i < recentResults.length; i++) {
        if (recentResults[i].result_number === lastResult) {
          consecutiveCount++;
        } else {
          break;
        }
      }

      if (consecutiveCount >= aiSettings.maxConsecutiveLosses) {
        // Force a different result than the last one
        let newNumber;
        const allNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        const availableNumbers = allNumbers.filter(n => n !== lastResult);

        if (availableNumbers.length > 0) {
          // Try to pick a profitable alternative from the available numbers
          const alternativeResults = [];
          for (const num of availableNumbers) {
            // Recalculate payout for this alternative number using current game bets
            let altPayout = 0;
            const colorsForAltNum = getColorsFromNumber(num);
            if (colorsForAltNum.includes('red')) altPayout += redBetAmount * gameSettings.redMultiplier;
            if (colorsForAltNum.includes('green')) altPayout += greenBetAmount * gameSettings.greenMultiplier;
            if (colorsForAltNum.includes('violet')) altPayout += violetBetAmount * gameSettings.violetMultiplier;
            const numberBetAmountForAltNum = currentGameBets.filter(b => b.bet_type === 'number' && parseInt(b.bet_value) === num)
              .reduce((sum, bet) => sum + bet.bet_amount, 0);
            altPayout += numberBetAmountForAltNum * gameSettings.numberMultiplier;

            alternativeResults.push({ number: num, payout: altPayout });
          }
          alternativeResults.sort((a, b) => a.payout - b.payout);
          newNumber = alternativeResults[0].number;
        } else {
          // Should theoretically not happen if there are at least two distinct numbers
          newNumber = Math.floor(Math.random() * 10);
        }
        finalResultCandidateNumber = newNumber;
      }
    }

    return finalResultCandidateNumber;
  };

  const generateSmartResult = async (gameId) => {
    if (aiSettings.enabled) {
      return await generateAIResult(gameId);
    }

    // Original smart result logic (if AI is disabled)
    // Here, liveStats.redBets, greenBets, violetBets are still sums of amounts from loadData
    const { redBets, greenBets, violetBets } = liveStats;
    const totalColorBetAmount = redBets + greenBets + violetBets;

    if (totalColorBetAmount === 0) {
      // Random if no bets on colors
      return Math.floor(Math.random() * 10);
    }

    // Smart result generation to favor house based on color amounts
    const redRatio = redBets / totalColorBetAmount;
    const greenRatio = greenBets / totalColorBetAmount;
    const violetRatio = violetBets / totalColorBetAmount;

    // Choose result that minimizes payouts for the most bet color
    if (redRatio > 0.6) {
      // Too many red bets, choose green/violet related numbers
      return [0, 2, 4, 6, 8][Math.floor(Math.random() * 5)]; // Numbers that are green, or green/violet
    } else if (greenRatio > 0.6) {
      // Too many green bets, choose red/violet related numbers
      return [1, 3, 7, 9][Math.floor(Math.random() * 4)]; // Numbers that are red
    } else if (violetRatio > 0.3) { // Violet bets are high value
      // Too many violet bets, choose red/green
      return [1, 2, 3, 4, 6, 7, 8][Math.floor(Math.random() * 7)]; // Numbers that are red or green
    }

    // Default random if no strong bias detected
    return Math.floor(Math.random() * 10);
  };

  const declareResult = async (gameId, resultNumber) => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);

      const resultColor = getColorFromNumber(resultNumber);

      await ColourGame.update(gameId, {
        result_number: resultNumber,
        result_colour: resultColor,
        status: 'completed'
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      // Process all bets for this game
      const gameBets = await ColourBet.filter({ game_id: gameId, status: 'pending' });
      const userUpdates = {};

      for (const bet of gameBets) {
        let winAmount = 0;
        let isWinner = false;

        if (bet.bet_type === 'colour') {
          if (bet.bet_value === 'red' && getColorsFromNumber(resultNumber).includes('red')) {
            isWinner = true;
          } else if (bet.bet_value === 'green' && getColorsFromNumber(resultNumber).includes('green')) {
            isWinner = true;
          } else if (bet.bet_value === 'violet' && getColorsFromNumber(resultNumber).includes('violet')) {
            isWinner = true;
          }
        } else if (bet.bet_type === 'number' && parseInt(bet.bet_value) === resultNumber) {
          isWinner = true;
        }

        if (isWinner) {
          winAmount = bet.potential_win;
        }

        await ColourBet.update(bet.id, {
          status: winAmount > 0 ? 'won' : 'lost',
          actual_win: winAmount
        });

        // Add delay between bet updates
        await new Promise(resolve => setTimeout(resolve, 50));

        if (winAmount > 0) {
          if (!userUpdates[bet.user_id]) {
            const user = await User.get(bet.user_id);
            userUpdates[bet.user_id] = {
              balance: user.wallet_balance || 0,
              winnings: 0
            };
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          userUpdates[bet.user_id].winnings += winAmount;
        }
      }

      // Update user balances
      for (const [userId, userData] of Object.entries(userUpdates)) {
        const newBalance = userData.balance + userData.winnings;
        await User.update(userId, { wallet_balance: newBalance });
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      alert(`Result declared: ${resultNumber} (${resultColor.toUpperCase()})`);

      // Refresh data after processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      loadData();
    } catch (error) {
      console.error("Error declaring result:", error);
      alert("Error declaring result. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };


  if (isLoading) {
    return (
      <div className="text-center p-8">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
        <p className="text-gray-400">Loading AI-powered color prediction control panel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">AI Color Prediction Control</h2>
        <div className="flex gap-2">
          <Badge className={`${aiSettings.enabled ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            AI {aiSettings.enabled ? 'Active' : 'Disabled'}
          </Badge>
          <span className="text-sm text-gray-400">
            Last updated: {new Date(lastFetch).toLocaleTimeString()}
          </span>
          <Button
            onClick={loadData}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="border-slate-600 text-gray-300"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
          <TabsTrigger value="active">Active Games</TabsTrigger>
          <TabsTrigger value="ai-settings">AI Settings</TabsTrigger>
          <TabsTrigger value="stats">Live Stats</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Analysis</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="ai-settings" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                AI Control Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="enable-ai" className="text-white">Enable AI Control</Label>
                <Switch
                  id="enable-ai"
                  checked={aiSettings.enabled}
                  onCheckedChange={(checked) => setAiSettings({ ...aiSettings, enabled: checked })}
                />
              </div>

              <div>
                <Label htmlFor="profit-margin" className="text-white">Target Profit Margin (%)</Label>
                <Input
                  id="profit-margin"
                  type="number"
                  value={aiSettings.profitMargin}
                  onChange={(e) => setAiSettings({ ...aiSettings, profitMargin: Number(e.target.value) })}
                  className="bg-slate-800 border-slate-600 text-white mt-1"
                  min="5"
                  max="50"
                />
              </div>

              <div>
                <Label htmlFor="house-favor-bias" className="text-white">House Favor Bias (0-1)</Label>
                <Input
                  id="house-favor-bias"
                  type="number"
                  step="0.1"
                  value={aiSettings.houseFavorBias}
                  onChange={(e) => setAiSettings({ ...aiSettings, houseFavorBias: Number(e.target.value) })}
                  className="bg-slate-800 border-slate-600 text-white mt-1"
                  min="0"
                  max="1"
                />
                <p className="text-xs text-gray-400 mt-1">Higher = More house-favorable results</p>
              </div>

              <div>
                <Label htmlFor="win-rate-control" className="text-white">Win Rate Control (Target User Win Rate)</Label>
                <Input
                  id="win-rate-control"
                  type="number"
                  step="0.05"
                  value={aiSettings.winRateControl}
                  onChange={(e) => setAiSettings({ ...aiSettings, winRateControl: Number(e.target.value) })}
                  className="bg-slate-800 border-slate-600 text-white mt-1"
                  min="0.1"
                  max="0.8"
                />
                <p className="text-xs text-gray-400 mt-1">Note: This setting is conceptual and not fully implemented in result generation logic currently.</p>
              </div>

              <div>
                <Label htmlFor="max-consecutive-losses" className="text-white">Max Consecutive Same Result (for AI to force change)</Label>
                <Input
                  id="max-consecutive-losses"
                  type="number"
                  value={aiSettings.maxConsecutiveLosses}
                  onChange={(e) => setAiSettings({ ...aiSettings, maxConsecutiveLosses: Number(e.target.value) })}
                  className="bg-slate-800 border-slate-600 text-white mt-1"
                  min="1"
                  max="10"
                />
                <p className="text-xs text-gray-400 mt-1">If the same result appears this many times consecutively, AI will try to pick a different one.</p>
              </div>

              <div>
                <Label htmlFor="risk-level" className="text-white">Risk Level</Label>
                <Select
                  value={aiSettings.riskLevel}
                  onValueChange={(value) => setAiSettings({ ...aiSettings, riskLevel: value })}
                >
                  <SelectTrigger id="risk-level" className="w-full p-2 bg-slate-800 border border-slate-600 text-white rounded mt-1">
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600 text-white">
                    <SelectItem value="low">Low (Conservative)</SelectItem>
                    <SelectItem value="medium">Medium (Balanced)</SelectItem>
                    <SelectItem value="high">High (Aggressive)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400 mt-1">Note: This setting is conceptual and not fully implemented in result generation logic currently.</p>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="adapt-to-patterns" className="text-white">Adapt to User Patterns</Label>
                <Switch
                  id="adapt-to-patterns"
                  checked={aiSettings.adaptToPatterns}
                  onCheckedChange={(checked) => setAiSettings({ ...aiSettings, adaptToPatterns: checked })}
                />
                <p className="text-xs text-gray-400 mt-1 hidden">Not fully implemented.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-red-400" />
                Games Awaiting AI Results ({awaitingGames.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {awaitingGames.length > 0 ? (
                <div className="space-y-4">
                  {awaitingGames.map(game => (
                    <div key={game.id} className="p-4 bg-slate-700/50 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-white font-bold">Game #{game.game_number?.slice(-4)}</h3>
                          <p className="text-gray-400 text-sm">
                            Started: {new Date(game.game_time).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge className="bg-yellow-500/20 text-yellow-300">
                          Awaiting AI Result
                        </Badge>
                      </div>

                      <div className="grid grid-cols-5 gap-2 mb-4">
                        {Array.from({ length: 10 }, (_, i) => (
                          <Button
                            key={i}
                            onClick={async () => await declareResult(game.id, i)}
                            disabled={isProcessing}
                            className={`h-12 text-lg font-bold ${
                              getColorsFromNumber(i).includes('red') && getColorsFromNumber(i).includes('violet') ?
                                'bg-gradient-to-r from-red-600 to-violet-600 hover:from-red-700 hover:to-violet-700' :
                              getColorsFromNumber(i).includes('green') && getColorsFromNumber(i).includes('violet') ?
                                'bg-gradient-to-r from-green-600 to-violet-600 hover:from-green-700 hover:to-violet-700' :
                              getColorsFromNumber(i).includes('red') ?
                                'bg-red-600 hover:bg-red-700' :
                                'bg-green-600 hover:bg-green-700'
                            } text-white`}
                          >
                            {i}
                          </Button>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={async () => {
                            setIsProcessing(true);
                            try {
                              const result = await generateAIResult(game.id);
                              await declareResult(game.id, result);
                            } catch (error) {
                              console.error("Error generating or declaring AI result:", error);
                              alert("Error generating or declaring AI result. Please try again.");
                            } finally {
                              setIsProcessing(false);
                            }
                          }}
                          disabled={isProcessing}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Brain className="w-4 h-4 mr-2" />
                          AI Result
                        </Button>
                        <Button
                          onClick={async () => {
                            setIsProcessing(true);
                            try {
                              const result = await generateSmartResult(game.id);
                              await declareResult(game.id, result);
                            } catch (error) {
                              console.error("Error generating or declaring Smart result:", error);
                              alert("Error generating or declaring Smart result. Please try again.");
                            } finally {
                              setIsProcessing(false);
                            }
                          }}
                          disabled={isProcessing}
                          variant="outline"
                          className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                        >
                          <Shuffle className="w-4 h-4 mr-2" />
                          Smart Result
                        </Button>
                        <Button
                          onClick={async () => {
                            setIsProcessing(true);
                            try {
                              const result = Math.floor(Math.random() * 10);
                              await declareResult(game.id, result);
                            } catch (error) {
                              console.error("Error declaring Random result:", error);
                              alert("Error declaring Random result. Please try again.");
                            } finally {
                              setIsProcessing(false);
                            }
                          }}
                          disabled={isProcessing}
                          variant="outline"
                          className="border-gray-500 text-gray-400 hover:bg-gray-500/10"
                        >
                          Random Result
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Timer className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No games awaiting results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-white">{liveStats.totalBets}</div>
                <div className="text-sm text-gray-400">Total Bets (Count)</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">₹{liveStats.totalAmount.toFixed(2)}</div>
                <div className="text-sm text-gray-400">Total Amount Staked</div>
              </CardContent>
            </Card>
            <Card className="bg-red-500/10 border-red-500/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-400">₹{liveStats.redBets.toFixed(2)}</div>
                <div className="text-sm text-gray-400">Red Bets Amount</div>
              </CardContent>
            </Card>
            <Card className="bg-green-500/10 border-green-500/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">₹{liveStats.greenBets.toFixed(2)}</div>
                <div className="text-sm text-gray-400">Green Bets Amount</div>
              </CardContent>
            </Card>
            <Card className="bg-violet-500/10 border-violet-500/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-violet-400">₹{liveStats.violetBets.toFixed(2)}</div>
                <div className="text-sm text-gray-400">Violet Bets Amount</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart className="w-5 h-5 text-cyan-400" />
                Recent Results Pattern
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {recentResults.map((result, index) => (
                  <div key={result.id} className="flex items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      result.result_colour === 'red' ? 'bg-red-500' :
                      result.result_colour === 'green' ? 'bg-green-500' : 'bg-violet-500'
                    }`}>
                      {result.result_number}
                    </div>
                    {index < recentResults.length - 1 && <span className="text-gray-500">→</span>}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-red-400 font-bold">
                    {recentResults.filter(r => r.result_colour === 'red').length}
                  </div>
                  <div className="text-gray-400">Red Results</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-bold">
                    {recentResults.filter(r => r.result_colour === 'green').length}
                  </div>
                  <div className="text-gray-400">Green Results</div>
                </div>
                <div className="text-center">
                  <div className="text-violet-400 font-bold">
                    {recentResults.filter(r => r.result_colour === 'violet').length}
                  </div>
                  <div className="text-gray-400">Violet Results</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-400" />
                Suspicious Activity ({suspiciousUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {suspiciousUsers.length > 0 ? (
                <div className="space-y-3">
                  {suspiciousUsers.map((user, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                      <div>
                        <div className="text-white font-medium">{user.full_name || user.email}</div>
                        <div className="text-sm text-gray-400">{user.reason}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${
                          user.riskLevel === 'critical' ? 'bg-red-500/20 text-red-300' :
                          user.riskLevel === 'high' ? 'bg-orange-500/20 text-orange-300' :
                          'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {user.riskLevel}
                        </Badge>
                        {user.betCount && (
                          <span className="text-xs text-gray-400">{user.betCount} bets</span>
                        )}
                        {user.winRate && (
                          <span className="text-xs text-gray-400">{user.winRate}% win rate</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No suspicious activity detected</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
