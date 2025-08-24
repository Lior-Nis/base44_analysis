
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { CricketMatch, CricketBet } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion"; // Added framer-motion for animations
import {
  Trophy,
  Calendar,
  Target,
  Users,
  Clock,
  Star,
  TrendingUp,
  Zap,
  CircleDollarSign, // New icon
  Info, // New icon
  ChevronRight, // New icon
  ShieldCheck, // New icon
  RefreshCw, // New icon
  Loader2, // New icon
  ListVideo, // New icon
} from "lucide-react";

export default function CricketPage() {
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [betAmount, setBetAmount] = useState(50);
  const [userBets, setUserBets] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Used for general loading/bet placing
  const [betType, setBetType] = useState('match_winner'); // New state for bet type
  const [selectedTeam, setSelectedTeam] = useState(null); // New state for selected team

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      // Load matches
      const upcomingMatches = await CricketMatch.filter({ status: 'upcoming' }, '-match_date');
      const liveMatches = await CricketMatch.filter({ status: 'live' }, '-match_date');
      setMatches([...liveMatches, ...upcomingMatches]);

      // Load user's bets
      const bets = await CricketBet.filter({ user_id: userData.id }, '-created_date');
      setUserBets(bets);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const getBetOdds = (type) => { // Renamed param to type to avoid conflict with betType state
    const odds = {
      'match_winner': 2.0,
      'toss_winner': 1.8,
      'man_of_match': 3.5 // Kept this for potential future use or display
    };
    return odds[type] || 2.0;
  };

  const handlePlaceBet = async () => {
    if (!user) {
      alert("Please login to place a bet.");
      return;
    }
    if (!selectedMatch || !selectedTeam) {
      alert("Please select a team to bet on.");
      return;
    }
    if (betAmount < 10) { // Changed condition to match the min bet amount input
      alert("Please enter a valid bet amount (minimum ₹10).");
      return;
    }
    if (user.wallet_balance < betAmount) {
      alert("Insufficient wallet balance!");
      return;
    }

    setIsLoading(true);
    try {
      const odds = getBetOdds(betType);
      const potentialWin = betAmount * odds;

      // Optimistic UI update for wallet balance
      const newBalance = user.wallet_balance - betAmount;
      await User.updateMyUserData({ wallet_balance: newBalance });
      setUser(prev => ({...prev, wallet_balance: newBalance}));

      await CricketBet.create({
        user_id: user.id,
        match_id: selectedMatch.id,
        bet_type: betType,
        prediction: selectedTeam,
        bet_amount: betAmount,
        odds: odds,
        potential_win: potentialWin,
      });

      alert(`Bet placed successfully! Potential win: ₹${potentialWin}`);
      setSelectedMatch(null); // Go back to match list
      setSelectedTeam(null); // Reset selected team
      setBetAmount(50); // Reset bet amount
      setBetType('match_winner'); // Reset bet type
      loadData(); // Reload data to get updated user bets and possibly match status
    } catch (error) {
      console.error("Error placing bet:", error);
      alert("Failed to place bet. Please try again.");
      loadData(); // Reload data to correct state in case of backend failure
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Cricket Predictions</h1>
          <p className="text-gray-300">Predict match outcomes and win big rewards</p>
        </div>

        <Tabs defaultValue="matches" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
            <TabsTrigger value="matches" className="text-white data-[state=active]:bg-blue-600">
              <Trophy className="w-4 h-4 mr-2" />
              Matches
            </TabsTrigger>
            <TabsTrigger value="mybets" className="text-white data-[state=active]:bg-purple-600">
              <Target className="w-4 h-4 mr-2" />
              My Bets
            </TabsTrigger>
            <TabsTrigger value="results" className="text-white data-[state=active]:bg-green-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              Results
            </TabsTrigger>
          </TabsList>

          {/* Matches Tab */}
          <TabsContent value="matches">
            {selectedMatch ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardHeader>
                    <button
                      onClick={() => {
                        setSelectedMatch(null);
                        setSelectedTeam(null); // Reset team when going back
                        setBetType('match_winner'); // Reset bet type when going back
                      }}
                      className="text-gray-400 hover:text-white mb-2 text-sm flex items-center"
                    >
                      &larr; Back to Matches
                    </button>
                    <CardTitle className="text-white text-2xl">{selectedMatch.match_name}</CardTitle>
                    <p className="text-gray-300">{selectedMatch.team_a} <span className="font-bold text-gray-400">VS</span> {selectedMatch.team_b}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedMatch.match_date).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={betType} onValueChange={setBetType} className="mb-4">
                      <TabsList className="grid w-full grid-cols-2 bg-slate-700">
                        <TabsTrigger
                          value="match_winner"
                          className="text-white data-[state=active]:bg-blue-600"
                          onClick={() => setSelectedTeam(null)} // Reset team when changing bet type
                        >
                          Match Winner <Badge className="ml-2 bg-green-500/20 text-green-300 border-green-500/30">{getBetOdds('match_winner')}x</Badge>
                        </TabsTrigger>
                        <TabsTrigger
                          value="toss_winner"
                          className="text-white data-[state=active]:bg-purple-600"
                          onClick={() => setSelectedTeam(null)} // Reset team when changing bet type
                        >
                          Toss Winner <Badge className="ml-2 bg-yellow-500/20 text-yellow-300 border-yellow-500/30">{getBetOdds('toss_winner')}x</Badge>
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <p className="text-center text-lg font-semibold mb-4 text-white">Select Your Prediction</p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {[selectedMatch.team_a, selectedMatch.team_b].map((team) => (
                        <Button
                          key={team}
                          onClick={() => setSelectedTeam(team)}
                          variant={selectedTeam === team ? "default" : "outline"}
                          className={`h-16 text-lg ${
                            selectedTeam === team
                              ? "bg-green-600 hover:bg-green-700"
                              : "border-slate-600 hover:bg-slate-700 text-gray-300"
                          }`}
                          disabled={selectedMatch.status === 'live'} // Cannot bet on live matches
                        >
                          {team}
                        </Button>
                      ))}
                    </div>

                    {/* Bet Amount Selector */}
                    <Card className="bg-slate-700/50 border-slate-600/50 mb-4">
                      <CardHeader className="py-3">
                        <CardTitle className="text-white flex items-center gap-2 text-base">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          Set Bet Amount
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex gap-2 mb-4">
                          {[50, 100, 200, 500].map(amount => (
                            <Button
                              key={amount}
                              variant={betAmount === amount ? "default" : "outline"}
                              onClick={() => setBetAmount(amount)}
                              className={betAmount === amount ? "bg-purple-600 hover:bg-purple-700" : "border-slate-600 text-gray-300 hover:bg-slate-600"}
                            >
                              ₹{amount}
                            </Button>
                          ))}
                        </div>
                        <Input
                          type="number"
                          min="10"
                          value={betAmount}
                          onChange={(e) => setBetAmount(Number(e.target.value))}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="Enter custom amount (min ₹10)"
                        />
                      </CardContent>
                    </Card>

                    {selectedMatch.status === 'live' ? (
                      <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <div className="flex items-center gap-2 text-red-300 text-sm">
                          <Clock className="w-4 h-4" />
                          Match is live! Betting is closed for this match.
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={handlePlaceBet}
                        className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold"
                        disabled={isLoading || !selectedTeam || betAmount < 10}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Placing Bet...
                          </>
                        ) : (
                          `Place Bet: ₹${betAmount} (Potential Win: ₹${(betAmount * getBetOdds(betType)).toFixed(0)})`
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.length > 0 ? (
                  matches.map((match) => (
                    <Card
                      key={match.id}
                      className="bg-slate-800/50 border-slate-700/50 overflow-hidden cursor-pointer hover:bg-slate-700/50 transition-colors duration-200"
                      onClick={() => setSelectedMatch(match)}
                    >
                      <CardContent className="p-0">
                        <div className={`h-1 bg-gradient-to-r ${
                          match.status === 'live' ? 'from-red-500 to-orange-500 animate-pulse' : 'from-blue-500 to-purple-500'
                        }`} />
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-white mb-1">{match.match_name}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Calendar className="w-4 h-4" />
                                {new Date(match.match_date).toLocaleDateString('en-IN', {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                            <Badge className={
                              match.status === 'live'
                                ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            }>
                              {match.status === 'live' && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />}
                              {match.status}
                            </Badge>
                          </div>

                          {/* Teams */}
                          <div className="flex items-center justify-center gap-8 mb-6">
                            <div className="text-center">
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-2">
                                <Users className="w-8 h-8 text-white" />
                              </div>
                              <div className="font-bold text-white">{match.team_a}</div>
                            </div>
                            <div className="text-2xl font-bold text-gray-400">VS</div>
                            <div className="text-center">
                              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-2">
                                <Users className="w-8 h-8 text-white" />
                              </div>
                              <div className="font-bold text-white">{match.team_b}</div>
                            </div>
                          </div>
                          <div className="flex justify-center">
                            <Button variant="outline" className="text-white border-slate-600 hover:bg-slate-700/50">
                                Select Match to Bet <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="bg-slate-800/50 border-slate-700/50 col-span-full">
                    <CardContent className="p-12 text-center">
                      <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                      <h3 className="text-xl font-bold text-white mb-2">No Matches Available</h3>
                      <p className="text-gray-400">Check back later for upcoming cricket matches!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* My Bets Tab */}
          <TabsContent value="mybets">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  My Cricket Bets
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userBets.length > 0 ? (
                  <div className="space-y-4">
                    {userBets.map((bet) => {
                      const match = matches.find(m => m.id === bet.match_id);
                      return (
                        <div key={bet.id} className="p-4 bg-slate-700/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-white font-medium">
                              {match?.match_name || 'Match'}
                            </div>
                            <Badge className={
                              bet.status === 'won' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                              bet.status === 'lost' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                              'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                            }>
                              {bet.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-300 space-y-1">
                            <div>Bet Type: <span className="text-white">{bet.bet_type.replace('_', ' ')}</span></div>
                            <div>Prediction: <span className="text-white">{bet.prediction}</span></div>
                            <div>Amount: <span className="text-white">₹{bet.bet_amount}</span></div>
                            <div>Potential Win: <span className="text-green-400">₹{bet.potential_win}</span></div>
                            {bet.actual_win > 0 && (
                              <div>Won: <span className="text-green-400 font-bold">₹{bet.actual_win}</span></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No bets placed yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Match Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-400">
                  <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Match results will appear here after matches are completed</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
