import React, { useState, useEffect } from 'react';
import { User, FootballMatch, FootballBet } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Users, Clock, DollarSign, Shield, Info, BarChart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function FootballPage() {
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState([]);
  const [myBets, setMyBets] = useState([]);
  const [betAmount, setBetAmount] = useState('');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      
      const upcomingMatches = await FootballMatch.filter({ status: "upcoming" }, 'match_date');
      setMatches(upcomingMatches);

      if (userData) {
        const userBets = await FootballBet.filter({ user_id: userData.id }, '-created_date');
        setMyBets(userBets);
      }
    } catch (error) {
      console.error("Error loading football data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const placeBet = async () => {
    if (!user) return alert("Please login to place a bet.");
    if (!selectedMatch || !prediction || !betAmount || Number(betAmount) <= 0) {
      return alert("Please select a match, prediction, and enter a valid bet amount.");
    }
    if (user.wallet_balance < Number(betAmount)) {
      return alert("Insufficient wallet balance.");
    }

    try {
      const odds = 2.5; // Example odds
      const potentialWin = Number(betAmount) * odds;

      await FootballBet.create({
        user_id: user.id,
        match_id: selectedMatch.id,
        prediction: prediction,
        bet_amount: Number(betAmount),
        odds: odds,
        potential_win: potentialWin
      });

      const newBalance = user.wallet_balance - Number(betAmount);
      await User.updateMyUserData({ wallet_balance: newBalance });

      alert("Bet placed successfully!");
      setBetAmount('');
      setSelectedMatch(null);
      setPrediction(null);
      loadData();
    } catch (error) {
      console.error("Error placing bet:", error);
      alert("Failed to place bet. Please try again.");
    }
  };

  const MatchCard = ({ match }) => (
    <Card className="bg-slate-800/50 border-slate-700/50 hover:border-sky-500/50 transition-all">
      <CardHeader>
        <CardTitle className="text-white text-lg">{match.match_name}</CardTitle>
        <Badge variant="outline" className="text-sky-300 border-sky-500/30 w-fit">{match.league}</Badge>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="text-center">
            <div className="text-2xl mb-1">⚽</div>
            <div className="text-white font-bold">{match.team_a}</div>
          </div>
          <div className="text-gray-400 font-bold text-xl">VS</div>
          <div className="text-center">
            <div className="text-2xl mb-1">⚽</div>
            <div className="text-white font-bold">{match.team_b}</div>
          </div>
        </div>
        <div className="text-xs text-gray-400 flex items-center justify-center gap-2 mb-4">
          <Clock className="w-3 h-3" />
          <span>{new Date(match.match_date).toLocaleString()}</span>
        </div>
        <Button className="w-full bg-sky-600 hover:bg-sky-700" onClick={() => { setSelectedMatch(match); setPrediction(null); }}>
          Place Bet
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-600/20 to-blue-600/20 border border-sky-500/30 rounded-full px-4 py-2 mb-6">
            <Trophy className="w-5 h-5 text-sky-400" />
            <span className="text-sm text-gray-300">Football Betting</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
            The Beautiful Game
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Bet on your favorite football teams and win big.
          </p>
        </div>

        <Tabs defaultValue="matches" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
            <TabsTrigger value="matches">Upcoming Matches</TabsTrigger>
            <TabsTrigger value="my-bets">My Bets</TabsTrigger>
            <TabsTrigger value="results">Match Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="matches">
            {selectedMatch ? (
              <Card className="bg-slate-800/50 border-sky-500/50">
                <CardHeader>
                  <CardTitle className="text-white">Place Bet on: {selectedMatch.match_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300">Choose your prediction:</p>
                  <div className="grid grid-cols-3 gap-4">
                    <Button variant={prediction === selectedMatch.team_a ? 'default' : 'outline'} className={prediction === selectedMatch.team_a ? 'bg-green-600' : 'border-slate-600'} onClick={() => setPrediction(selectedMatch.team_a)}>{selectedMatch.team_a} Wins</Button>
                    <Button variant={prediction === 'draw' ? 'default' : 'outline'} className={prediction === 'draw' ? 'bg-yellow-600' : 'border-slate-600'} onClick={() => setPrediction('draw')}>Draw</Button>
                    <Button variant={prediction === selectedMatch.team_b ? 'default' : 'outline'} className={prediction === selectedMatch.team_b ? 'bg-blue-600' : 'border-slate-600'} onClick={() => setPrediction(selectedMatch.team_b)}>{selectedMatch.team_b} Wins</Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <Input 
                      type="number" 
                      placeholder="Bet Amount" 
                      value={betAmount} 
                      onChange={e => setBetAmount(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Button onClick={placeBet} className="bg-sky-600 hover:bg-sky-700">Submit Bet</Button>
                  </div>
                   <Button variant="link" onClick={() => setSelectedMatch(null)}>Back to matches</Button>
                </CardContent>
              </Card>
            ) : (
              isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
                </div>
              ) : matches.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matches.map(match => <MatchCard key={match.id} match={match} />)}
                </div>
              ) : (
                <p className="text-center text-gray-400 py-12">No upcoming football matches available.</p>
              )
            )}
          </TabsContent>

          <TabsContent value="my-bets">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {myBets.length > 0 ? myBets.map(bet => (
                    <div key={bet.id} className="p-4 bg-slate-700/50 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="text-white font-semibold">Match ID: ...{bet.match_id.slice(-6)}</p>
                        <p className="text-gray-300">Prediction: {bet.prediction}</p>
                        <p className="text-sm text-gray-400">Bet: ₹{bet.bet_amount}</p>
                      </div>
                      <Badge className={
                        bet.status === 'won' ? 'bg-green-500' :
                        bet.status === 'lost' ? 'bg-red-500' : 'bg-yellow-500'
                      }>{bet.status}</Badge>
                    </div>
                  )) : <p className="text-center text-gray-400">You haven't placed any football bets yet.</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="results">
             <p className="text-center text-gray-400 py-12">Match results will be displayed here once completed.</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}