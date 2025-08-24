import React, { useState, useEffect } from 'react';
import { User, Tournament, TournamentEntry } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Users,
  Clock,
  DollarSign,
  Star,
  Crown,
  Gamepad2,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function TournamentPage() {
  const [user, setUser] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [myTournaments, setMyTournaments] = useState([]);
  const [featuredTournaments, setFeaturedTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      const allTournaments = await Tournament.list('-start_time');
      setTournaments(allTournaments);

      const featured = allTournaments.filter(t => t.is_featured && t.status !== 'completed');
      setFeaturedTournaments(featured);

      if (userData) {
        const entries = await TournamentEntry.filter({ user_id: userData.id });
        const myTournamentIds = entries.map(e => e.tournament_id);
        const myTournamentsData = allTournaments.filter(t => myTournamentIds.includes(t.id));
        setMyTournaments(myTournamentsData);
      }
    } catch (error) {
      console.error("Error loading tournament data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTournament = async (tournament) => {
    setSelectedTournament(tournament);
    setIsLoading(true);
    try {
      const entries = await TournamentEntry.filter({ tournament_id: tournament.id }, '-score', 100);
      const userIds = entries.map(e => e.user_id);
      if (userIds.length > 0) {
        const users = await User.filter({ id: { in: userIds } });
        const userMap = users.reduce((acc, u) => {
          acc[u.id] = u;
          return acc;
        }, {});
        const leaderboardData = entries.map(entry => ({
          ...entry,
          user: userMap[entry.user_id]
        }));
        setLeaderboard(leaderboardData);
      } else {
        setLeaderboard([]);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setLeaderboard([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinTournament = async (tournament) => {
    if (!user) {
      alert("You must be logged in to join a tournament.");
      return;
    }
    if (user.wallet_balance < tournament.entry_fee) {
      alert("Insufficient balance to join this tournament.");
      return;
    }
    if (!confirm(`This will deduct ₹${tournament.entry_fee} from your wallet. Are you sure you want to join?`)) {
        return;
    }

    setIsJoining(true);
    try {
      // 1. Create Tournament Entry
      await TournamentEntry.create({
        tournament_id: tournament.id,
        user_id: user.id
      });

      // 2. Deduct entry fee
      const newBalance = user.wallet_balance - tournament.entry_fee;
      await User.update(user.id, { wallet_balance: newBalance });

      // 3. Update tournament participants count
      await Tournament.update(tournament.id, {
        current_participants: (tournament.current_participants || 0) + 1
      });

      alert("Successfully joined the tournament!");
      loadData(); // Refresh data
    } catch (error) {
      console.error("Error joining tournament:", error);
      alert("Failed to join tournament. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  const isUserInTournament = (tournamentId) => {
    return myTournaments.some(t => t.id === tournamentId);
  };
  
  const TournamentCard = ({ tournament, isFeatured = false }) => (
    <Card key={tournament.id} className="bg-slate-800/50 border-slate-700/50 hover:border-purple-500/50 transition-all duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-white mb-2">{tournament.tournament_name}</CardTitle>
                <div className="flex gap-2 flex-wrap">
                    <Badge className="bg-purple-500/20 text-purple-300 capitalize">{tournament.tournament_type.replace('_', ' ')}</Badge>
                    <Badge className="bg-green-500/20 text-green-300"><DollarSign className="w-3 h-3 mr-1"/>₹{tournament.prize_pool.toLocaleString()} Prize Pool</Badge>
                    <Badge className="bg-blue-500/20 text-blue-300"><Users className="w-3 h-3 mr-1"/>{tournament.current_participants}/{tournament.max_participants}</Badge>
                </div>
            </div>
            {isFeatured && <Star className="w-5 h-5 text-yellow-400 fill-yellow-400"/>}
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={(tournament.current_participants / tournament.max_participants) * 100} className="mb-4" />
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{tournament.rules}</p>
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-400">
            <p>Starts: {new Date(tournament.start_time).toLocaleString()}</p>
            <p>Entry: <span className="font-bold text-yellow-400">₹{tournament.entry_fee}</span></p>
          </div>
          <div>
            <Button size="sm" onClick={() => handleSelectTournament(tournament)}>View</Button>
            {tournament.status === 'registration_open' && !isUserInTournament(tournament.id) && (
              <Button size="sm" variant="secondary" className="ml-2" onClick={() => handleJoinTournament(tournament)} disabled={isJoining}>
                {isJoining ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Join'}
              </Button>
            )}
             {isUserInTournament(tournament.id) && <Badge className="ml-2 bg-green-600">Joined</Badge>}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 flex items-center justify-center gap-4">
                <Trophy className="w-10 h-10 text-yellow-400"/>
                Tournaments
            </h1>
            <p className="text-xl text-gray-300">Compete against other players for huge prizes!</p>
        </div>

        {selectedTournament ? (
          <div>
            <Button onClick={() => setSelectedTournament(null)} className="mb-4">
              &larr; Back to Tournaments
            </Button>
            <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                    <CardTitle className="text-white text-2xl">{selectedTournament.tournament_name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <h3 className="text-xl text-white mb-2">Leaderboard</h3>
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-white"/> : leaderboard.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-600">
                                        <th className="p-2 text-white">Rank</th>
                                        <th className="p-2 text-white">Player</th>
                                        <th className="p-2 text-white">Score</th>
                                        <th className="p-2 text-white">Winnings</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.map((entry, index) => (
                                        <tr key={entry.id} className="border-b border-slate-700">
                                            <td className="p-2 text-white">{index + 1}</td>
                                            <td className="p-2 text-gray-300">{entry.user?.full_name || 'Player'}</td>
                                            <td className="p-2 text-green-400">{entry.score}</td>
                                            <td className="p-2 text-yellow-400">₹{entry.prize_won?.toLocaleString() || 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <p className="text-gray-400">No players have joined yet.</p>}
                </CardContent>
            </Card>
          </div>
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800 mb-6">
                <TabsTrigger value="all">All Tournaments</TabsTrigger>
                <TabsTrigger value="featured">Featured</TabsTrigger>
                <TabsTrigger value="my-tournaments">My Tournaments</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
                <div className="grid md:grid-cols-2 gap-6">
                    {tournaments.filter(t => t.status !== 'completed').map(t => <TournamentCard tournament={t}/>)}
                </div>
            </TabsContent>
            <TabsContent value="featured">
                <div className="grid md:grid-cols-2 gap-6">
                    {featuredTournaments.map(t => <TournamentCard tournament={t} isFeatured/>)}
                </div>
            </TabsContent>
            <TabsContent value="my-tournaments">
                 <div className="grid md:grid-cols-2 gap-6">
                    {myTournaments.length > 0 ? myTournaments.map(t => <TournamentCard tournament={t}/>) : (
                        <p className="text-gray-400 col-span-2 text-center">You haven't joined any tournaments yet.</p>
                    )}
                </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}