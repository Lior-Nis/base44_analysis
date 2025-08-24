import React, { useState, useEffect } from "react";
import { User, ColourGame, ColourBet, CricketMatch, CricketBet, FootballMatch, FootballBet } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Gamepad2, Trophy, Loader2, RefreshCw } from "lucide-react";
import ColorPredictionControl from "./ColorPredictionControl";

export default function GameManager() {
  // Cricket Game State
  const [cricketMatches, setCricketMatches] = useState([]);
  const [newCricketMatch, setNewCricketMatch] = useState({ match_name: '', team_a: '', team_b: '', match_date: '' });
  const [isLoadingCricket, setIsLoadingCricket] = useState(true);

  // Football Game State
  const [footballMatches, setFootballMatches] = useState([]);
  const [newFootballMatch, setNewFootballMatch] = useState({ match_name: '', league: '', team_a: '', team_b: '', match_date: '' });
  const [isLoadingFootball, setIsLoadingFootball] = useState(true);

  // General state
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchCricketMatches();
    fetchFootballMatches();
  }, []);

  const fetchCricketMatches = async () => {
    setIsLoadingCricket(true);
    try {
      const matches = await CricketMatch.filter({ status: "upcoming" }, 'match_date');
      setCricketMatches(matches);
    } catch (error) {
      console.error("Error fetching cricket matches:", error);
    } finally {
      setIsLoadingCricket(false);
    }
  }

  const fetchFootballMatches = async () => {
    setIsLoadingFootball(true);
    try {
      const matches = await FootballMatch.filter({ status: "upcoming" }, 'match_date');
      setFootballMatches(matches);
    } catch (error) {
      console.error("Error fetching football matches:", error);
    } finally {
      setIsLoadingFootball(false);
    }
  }

  const handleCreateCricketMatch = async () => {
    if (!newCricketMatch.match_name || !newCricketMatch.team_a || !newCricketMatch.team_b || !newCricketMatch.match_date) {
      return alert("Please fill all fields for the cricket match.");
    }
    try {
      await CricketMatch.create({ ...newCricketMatch, match_date: new Date(newCricketMatch.match_date).toISOString() });
      alert("Cricket match created!");
      setNewCricketMatch({ match_name: '', team_a: '', team_b: '', match_date: '' });
      fetchCricketMatches();
    } catch (error) {
      console.error("Error creating cricket match:", error);
      alert("Error creating cricket match.");
    }
  }

  const handleCreateFootballMatch = async () => {
    if (!newFootballMatch.match_name || !newFootballMatch.league || !newFootballMatch.team_a || !newFootballMatch.team_b || !newFootballMatch.match_date) {
      return alert("Please fill all fields for the football match.");
    }
    try {
      await FootballMatch.create({ ...newFootballMatch, match_date: new Date(newFootballMatch.match_date).toISOString() });
      alert("Football match created!");
      setNewFootballMatch({ match_name: '', league: '', team_a: '', team_b: '', match_date: '' });
      fetchFootballMatches();
    } catch (error) {
      console.error("Error creating football match:", error);
      alert("Error creating football match.");
    }
  }
  
  const handleUpdateCricketMatch = async (matchId, winner) => {
    if (!winner) return alert("Please select a winner.");
    
    setIsProcessing(true);
    try {
      await CricketMatch.update(matchId, { winner: winner, status: 'completed' });
      
      const bets = await CricketBet.filter({ match_id: matchId, status: 'pending', bet_type: 'match_winner' });
      const userUpdates = {};

      for (const bet of bets) {
        let winAmount = 0;
        if (bet.prediction === winner) {
          winAmount = bet.bet_amount * (bet.odds || 2.0);
        }
        await CricketBet.update(bet.id, { status: winAmount > 0 ? 'won' : 'lost', actual_win: winAmount });

        if (winAmount > 0) {
          if (!userUpdates[bet.user_id]) {
            const user = await User.get(bet.user_id);
            userUpdates[bet.user_id] = user.wallet_balance || 0;
          }
          userUpdates[bet.user_id] += winAmount;
        }
      }
      
      for (const [userId, newBalance] of Object.entries(userUpdates)) {
        await User.update(userId, { wallet_balance: newBalance });
      }
      
      alert("Match winner declared and payouts processed!");
      fetchCricketMatches();
    } catch (error) {
      console.error("Error declaring winner:", error);
      alert("Error processing match result.");
    } finally {
      setIsProcessing(false);
    }
  }

  const handleDeclareTossWinner = async (matchId, tossWinner) => {
    if (!tossWinner) return alert("Please select a toss winner.");

    setIsProcessing(true);
    try {
      await CricketMatch.update(matchId, { toss_winner: tossWinner });

      const bets = await CricketBet.filter({ match_id: matchId, status: 'pending', bet_type: 'toss_winner' });
      const userUpdates = {};

      for (const bet of bets) {
        let winAmount = 0;
        if (bet.prediction === tossWinner) {
          winAmount = bet.bet_amount * 1.9;
        }

        await CricketBet.update(bet.id, { status: winAmount > 0 ? 'won' : 'lost', actual_win: winAmount });
        
        if (winAmount > 0) {
          if (!userUpdates[bet.user_id]) {
            const user = await User.get(bet.user_id);
            userUpdates[bet.user_id] = user.wallet_balance || 0;
          }
          userUpdates[bet.user_id] += winAmount;
        }
      }
      
      for (const [userId, newBalance] of Object.entries(userUpdates)) {
        await User.update(userId, { wallet_balance: newBalance });
      }

      alert("Toss winner declared and payouts processed!");
      fetchCricketMatches();
    } catch(error) {
      console.error("Error declaring toss winner", error);
      alert("Error processing toss result.");
    } finally {
      setIsProcessing(false);
    }
  }

  const handleUpdateFootballMatch = async (matchId, winner) => {
    if (!winner) return alert("Please select a winner.");
    
    setIsProcessing(true);
    try {
      await FootballMatch.update(matchId, { winner: winner, status: 'completed' });
      
      const bets = await FootballBet.filter({ match_id: matchId, status: 'pending' });
      const userUpdates = {};

      for (const bet of bets) {
        let winAmount = 0;
        if (bet.prediction === winner) {
          winAmount = bet.bet_amount * (bet.odds || 2.5);
        }
        await FootballBet.update(bet.id, { status: winAmount > 0 ? 'won' : 'lost', actual_win: winAmount });
        
        if (winAmount > 0) {
          if (!userUpdates[bet.user_id]) {
            const user = await User.get(bet.user_id);
            userUpdates[bet.user_id] = user.wallet_balance || 0;
          }
          userUpdates[bet.user_id] += winAmount;
        }
      }
      
      for (const [userId, newBalance] of Object.entries(userUpdates)) {
        await User.update(userId, { wallet_balance: newBalance });
      }
      
      alert("Football match winner declared and payouts processed!");
      fetchFootballMatches();
    } catch (error) {
      console.error("Error declaring football winner:", error);
      alert("Error processing football match result.");
    } finally {
      setIsProcessing(false);
    }
  }

  const refreshAll = () => {
    fetchCricketMatches();
    fetchFootballMatches();
  }

  const isLoading = isLoadingCricket || isLoadingFootball;

  return (
    <Card className="bg-slate-800/50 border-slate-700/50">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center gap-2">
            <Gamepad2 className="text-purple-400" />
            Game Management
          </CardTitle>
          <Button onClick={refreshAll} variant="outline" size="sm" disabled={isLoading || isProcessing} className="border-slate-600 text-gray-300">
            {isLoading || isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span className="ml-2">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="colors">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
            <TabsTrigger value="colors">Color Prediction</TabsTrigger>
            <TabsTrigger value="cricket">Cricket</TabsTrigger>
            <TabsTrigger value="football">Football</TabsTrigger>
          </TabsList>
          
          <TabsContent value="colors" className="mt-4">
            <ColorPredictionControl />
          </TabsContent>
          
          <TabsContent value="cricket" className="mt-4">
            {isLoadingCricket ? (
              <div className="flex justify-center items-center h-40"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>
            ) : (
              <div className="space-y-6">
                <Card className="bg-slate-700/50 border-slate-600/50">
                  <CardHeader><CardTitle className="text-white">Create Cricket Match</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <Input placeholder="Match Name (e.g., IPL: MI vs CSK)" value={newCricketMatch.match_name} onChange={(e) => setNewCricketMatch({ ...newCricketMatch, match_name: e.target.value })} className="bg-slate-700 border-slate-600 text-white" />
                    <div className="grid grid-cols-2 gap-4">
                       <Input placeholder="Team A" value={newCricketMatch.team_a} onChange={(e) => setNewCricketMatch({ ...newCricketMatch, team_a: e.target.value })} className="bg-slate-700 border-slate-600 text-white" />
                      <Input placeholder="Team B" value={newCricketMatch.team_b} onChange={(e) => setNewCricketMatch({ ...newCricketMatch, team_b: e.target.value })} className="bg-slate-700 border-slate-600 text-white" />
                    </div>
                    <Input type="datetime-local" value={newCricketMatch.match_date} onChange={(e) => setNewCricketMatch({ ...newCricketMatch, match_date: e.target.value })} className="bg-slate-700 border-slate-600 text-white" />
                    <Button onClick={handleCreateCricketMatch} className="w-full bg-blue-600 hover:bg-blue-700">Create Match</Button>
                  </CardContent>
                </Card>
                <Card className="bg-slate-700/50 border-slate-600/50">
                  <CardHeader><CardTitle className="text-white">Upcoming Cricket Matches</CardTitle></CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader><TableRow className="border-slate-600"><TableHead className="text-white">Match</TableHead><TableHead className="text-white">Date</TableHead><TableHead className="text-white" colSpan={2}>Actions</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {cricketMatches.length > 0 ? cricketMatches.map((match) => (
                          <TableRow key={match.id} className="border-slate-600">
                            <TableCell className="text-gray-300">{match.match_name}</TableCell>
                            <TableCell className="text-gray-400">{new Date(match.match_date).toLocaleString()}</TableCell>
                            <TableCell>
                              <Select onValueChange={(value) => handleUpdateCricketMatch(match.id, value)} disabled={isProcessing}><SelectTrigger className="w-40 bg-slate-800 border-slate-600 text-white"><SelectValue placeholder="Match Winner" /></SelectTrigger><SelectContent className="bg-slate-800 text-white"><SelectItem value={match.team_a}>{match.team_a}</SelectItem><SelectItem value={match.team_b}>{match.team_b}</SelectItem></SelectContent></Select>
                            </TableCell>
                            <TableCell>
                              <Select onValueChange={(value) => handleDeclareTossWinner(match.id, value)} disabled={isProcessing || !!match.toss_winner}><SelectTrigger className="w-40 bg-slate-800 border-slate-600 text-white"><SelectValue placeholder={match.toss_winner || "Toss Winner"} /></SelectTrigger><SelectContent className="bg-slate-800 text-white"><SelectItem value={match.team_a}>{match.team_a}</SelectItem><SelectItem value={match.team_b}>{match.team_b}</SelectItem></SelectContent></Select>
                            </TableCell>
                          </TableRow>
                        )) : <TableRow><TableCell colSpan={4} className="text-center text-gray-400 py-4">No upcoming cricket matches.</TableCell></TableRow>}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
          <TabsContent value="football" className="mt-4">
             {isLoadingFootball ? (
              <div className="flex justify-center items-center h-40"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>
            ) : (
              <div className="space-y-6">
                <Card className="bg-slate-700/50 border-slate-600/50">
                  <CardHeader><CardTitle className="text-white">Create Football Match</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <Input placeholder="Match Name (e.g., Premier League: Team A vs Team B)" value={newFootballMatch.match_name} onChange={(e) => setNewFootballMatch({ ...newFootballMatch, match_name: e.target.value })} className="bg-slate-700 border-slate-600 text-white" />
                    <Input placeholder="League" value={newFootballMatch.league} onChange={(e) => setNewFootballMatch({ ...newFootballMatch, league: e.target.value })} className="bg-slate-700 border-slate-600 text-white" />
                    <div className="grid grid-cols-2 gap-4">
                       <Input placeholder="Team A" value={newFootballMatch.team_a} onChange={(e) => setNewFootballMatch({ ...newFootballMatch, team_a: e.target.value })} className="bg-slate-700 border-slate-600 text-white" />
                      <Input placeholder="Team B" value={newFootballMatch.team_b} onChange={(e) => setNewFootballMatch({ ...newFootballMatch, team_b: e.target.value })} className="bg-slate-700 border-slate-600 text-white" />
                    </div>
                    <Input type="datetime-local" value={newFootballMatch.match_date} onChange={(e) => setNewFootballMatch({ ...newFootballMatch, match_date: e.target.value })} className="bg-slate-700 border-slate-600 text-white" />
                    <Button onClick={handleCreateFootballMatch} className="w-full bg-sky-600 hover:bg-sky-700">Create Football Match</Button>
                  </CardContent>
                </Card>
                 <Card className="bg-slate-700/50 border-slate-600/50">
                  <CardHeader><CardTitle className="text-white">Upcoming Football Matches</CardTitle></CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader><TableRow className="border-slate-600"><TableHead className="text-white">Match</TableHead><TableHead className="text-white">Date</TableHead><TableHead className="text-white">Actions</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {footballMatches.length > 0 ? footballMatches.map((match) => (
                          <TableRow key={match.id} className="border-slate-600">
                            <TableCell className="text-gray-300">{match.match_name}</TableCell>
                            <TableCell className="text-gray-400">{new Date(match.match_date).toLocaleString()}</TableCell>
                            <TableCell>
                              <Select onValueChange={(value) => handleUpdateFootballMatch(match.id, value)} disabled={isProcessing}><SelectTrigger className="w-48 bg-slate-800 border-slate-600 text-white"><SelectValue placeholder="Set Winner" /></SelectTrigger><SelectContent className="bg-slate-800 text-white"><SelectItem value={match.team_a}>{match.team_a}</SelectItem><SelectItem value={match.team_b}>{match.team_b}</SelectItem><SelectItem value="draw">Draw</SelectItem></SelectContent></Select>
                            </TableCell>
                          </TableRow>
                        )) : <TableRow><TableCell colSpan={3} className="text-center text-gray-400 py-4">No upcoming football matches.</TableCell></TableRow>}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}