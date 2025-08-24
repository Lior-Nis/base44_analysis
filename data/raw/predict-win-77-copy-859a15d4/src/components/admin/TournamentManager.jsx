import React, { useState, useEffect } from 'react';
import { Tournament, TournamentEntry, User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  Plus,
  Users,
  DollarSign,
  Calendar,
  Settings,
  BarChart,
  Crown,
  Target,
  Gamepad2,
  Gift,
  Star,
  Play,
  Pause,
  Square
} from 'lucide-react';

export default function TournamentManager() {
  const [tournaments, setTournaments] = useState([]);
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState({
    totalTournaments: 0,
    activeTournaments: 0,
    totalPrizePool: 0,
    totalParticipants: 0
  });
  const [newTournament, setNewTournament] = useState({
    tournament_name: '',
    tournament_type: 'color_prediction',
    entry_fee: 50,
    max_participants: 100,
    prize_pool: 4500,
    start_time: '',
    end_time: '',
    duration_minutes: 60,
    rules: '',
    min_level: 1,
    is_featured: false
  });

  const tournamentTypes = [
    { value: 'color_prediction', label: 'Color Prediction', icon: Target },
    { value: 'slots', label: 'Slot Tournament', icon: Gamepad2 },
    { value: 'blackjack', label: 'Blackjack Tournament', icon: Trophy },
    { value: 'poker', label: 'Poker Tournament', icon: Crown },
    { value: 'mixed_games', label: 'Mixed Games', icon: Star },
    { value: 'lottery', label: 'Lottery Tournament', icon: Gift }
  ];

  const prizeDistributions = {
    small: { 1: 70, 2: 20, 3: 10 }, // Top 3 winners
    medium: { 1: 50, 2: 25, 3: 15, 4: 10 }, // Top 4 winners
    large: { 1: 40, 2: 25, 3: 15, 4: 10, 5: 5, 6: 5 } // Top 6 winners
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Load tournaments
    const allTournaments = await Tournament.list('-created_date');
    setTournaments(allTournaments);

    // Load entries
    const allEntries = await TournamentEntry.list('-entry_time', 100);
    setEntries(allEntries);

    // Calculate stats
    const activeTournaments = allTournaments.filter(t => 
      ['registration_open', 'in_progress'].includes(t.status)
    ).length;
    
    const totalPrizePool = allTournaments.reduce((sum, t) => sum + (t.prize_pool || 0), 0);
    const totalParticipants = allTournaments.reduce((sum, t) => sum + (t.current_participants || 0), 0);

    setStats({
      totalTournaments: allTournaments.length,
      activeTournaments,
      totalPrizePool,
      totalParticipants
    });
  };

  const createTournament = async () => {
    if (!newTournament.tournament_name || !newTournament.start_time || !newTournament.end_time) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const user = await User.me();
      
      // Calculate prize distribution
      const distributionSize = newTournament.max_participants <= 50 ? 'small' : 
                              newTournament.max_participants <= 200 ? 'medium' : 'large';
      
      await Tournament.create({
        ...newTournament,
        prize_distribution: prizeDistributions[distributionSize],
        created_by: user.id,
        status: 'registration_open',
        start_time: new Date(newTournament.start_time).toISOString(),
        end_time: new Date(newTournament.end_time).toISOString()
      });

      alert('Tournament created successfully!');
      setNewTournament({
        tournament_name: '',
        tournament_type: 'color_prediction',
        entry_fee: 50,
        max_participants: 100,
        prize_pool: 4500,
        start_time: '',
        end_time: '',
        duration_minutes: 60,
        rules: '',
        min_level: 1,
        is_featured: false
      });
      loadData();
    } catch (error) {
      console.error('Error creating tournament:', error);
      alert('Failed to create tournament');
    }
  };

  const updateTournamentStatus = async (tournamentId, newStatus) => {
    try {
      await Tournament.update(tournamentId, { status: newStatus });
      
      if (newStatus === 'completed') {
        // Process tournament completion and distribute prizes
        await processTournamentCompletion(tournamentId);
      }
      
      alert(`Tournament status updated to ${newStatus}`);
      loadData();
    } catch (error) {
      console.error('Error updating tournament:', error);
      alert('Failed to update tournament status');
    }
  };

  const processTournamentCompletion = async (tournamentId) => {
    try {
      const tournament = await Tournament.get(tournamentId);
      const tournamentEntries = await TournamentEntry.filter({ tournament_id: tournamentId });
      
      // Sort entries by score (descending)
      const sortedEntries = tournamentEntries.sort((a, b) => b.score - a.score);
      
      // Distribute prizes based on prize distribution
      const prizeDistribution = tournament.prize_distribution;
      const prizePool = tournament.prize_pool;
      
      for (let i = 0; i < sortedEntries.length; i++) {
        const entry = sortedEntries[i];
        const rank = i + 1;
        const prizePercentage = prizeDistribution[rank] || 0;
        const prizeAmount = (prizePool * prizePercentage) / 100;
        
        // Update entry with rank and prize
        await TournamentEntry.update(entry.id, {
          rank: rank,
          prize_won: prizeAmount,
          status: 'completed'
        });
        
        // Credit prize to user wallet if they won something
        if (prizeAmount > 0) {
          const user = await User.get(entry.user_id);
          const newBalance = (user.wallet_balance || 0) + prizeAmount;
          await User.update(entry.user_id, { wallet_balance: newBalance });
        }
      }
    } catch (error) {
      console.error('Error processing tournament completion:', error);
    }
  };

  const toggleFeatured = async (tournamentId, currentFeatured) => {
    try {
      await Tournament.update(tournamentId, { is_featured: !currentFeatured });
      loadData();
    } catch (error) {
      console.error('Error toggling featured status:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      upcoming: 'bg-blue-500/20 text-blue-300',
      registration_open: 'bg-green-500/20 text-green-300',
      in_progress: 'bg-yellow-500/20 text-yellow-300',
      completed: 'bg-gray-500/20 text-gray-300',
      cancelled: 'bg-red-500/20 text-red-300'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Tournament Management System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-4 bg-slate-700">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
              <TabsTrigger value="participants">Participants</TabsTrigger>
              <TabsTrigger value="create">Create Tournament</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-700/50">
                  <CardContent className="p-4 text-center">
                    <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                    <div className="text-2xl font-bold text-white">{stats.totalTournaments}</div>
                    <div className="text-gray-400 text-sm">Total Tournaments</div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-700/50">
                  <CardContent className="p-4 text-center">
                    <Play className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    <div className="text-2xl font-bold text-white">{stats.activeTournaments}</div>
                    <div className="text-gray-400 text-sm">Active Tournaments</div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-700/50">
                  <CardContent className="p-4 text-center">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    <div className="text-2xl font-bold text-white">₹{stats.totalPrizePool.toLocaleString()}</div>
                    <div className="text-gray-400 text-sm">Total Prize Pool</div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-700/50">
                  <CardContent className="p-4 text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                    <div className="text-2xl font-bold text-white">{stats.totalParticipants}</div>
                    <div className="text-gray-400 text-sm">Total Participants</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Tournament
                    </Button>
                    <Button variant="outline" className="border-slate-600 text-gray-300">
                      <BarChart className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tournaments">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-600">
                    <TableHead className="text-white">Tournament</TableHead>
                    <TableHead className="text-white">Type</TableHead>
                    <TableHead className="text-white">Prize Pool</TableHead>
                    <TableHead className="text-white">Participants</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Featured</TableHead>
                    <TableHead className="text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tournaments.map((tournament) => (
                    <TableRow key={tournament.id} className="border-slate-600">
                      <TableCell>
                        <div>
                          <div className="text-white font-medium">{tournament.tournament_name}</div>
                          <div className="text-gray-400 text-sm">
                            {new Date(tournament.start_time).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300 capitalize">
                        {tournament.tournament_type.replace('_', ' ')}
                      </TableCell>
                      <TableCell className="text-green-400 font-bold">
                        ₹{tournament.prize_pool.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-blue-400">
                        {tournament.current_participants}/{tournament.max_participants}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(tournament.status)}>
                          {tournament.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={tournament.is_featured}
                          onCheckedChange={() => toggleFeatured(tournament.id, tournament.is_featured)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {tournament.status === 'registration_open' && (
                            <Button
                              size="sm"
                              onClick={() => updateTournamentStatus(tournament.id, 'in_progress')}
                              className="bg-yellow-600 hover:bg-yellow-700"
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                          {tournament.status === 'in_progress' && (
                            <Button
                              size="sm"
                              onClick={() => updateTournamentStatus(tournament.id, 'completed')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Square className="w-4 h-4" />
                            </Button>
                          )}
                          {['registration_open', 'in_progress'].includes(tournament.status) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateTournamentStatus(tournament.id, 'cancelled')}
                              className="border-red-500 text-red-400 hover:bg-red-500/10"
                            >
                              <Pause className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="participants">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-600">
                    <TableHead className="text-white">User</TableHead>
                    <TableHead className="text-white">Tournament</TableHead>
                    <TableHead className="text-white">Score</TableHead>
                    <TableHead className="text-white">Games Played</TableHead>
                    <TableHead className="text-white">Rank</TableHead>
                    <TableHead className="text-white">Prize Won</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.slice(0, 50).map((entry) => {
                    const tournament = tournaments.find(t => t.id === entry.tournament_id);
                    return (
                      <TableRow key={entry.id} className="border-slate-600">
                        <TableCell className="text-white">
                          {entry.user_id.slice(-8)}...
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {tournament?.tournament_name || 'Unknown'}
                        </TableCell>
                        <TableCell className="text-yellow-400 font-bold">
                          {entry.score}
                        </TableCell>
                        <TableCell className="text-blue-400">
                          {entry.games_played}
                        </TableCell>
                        <TableCell className="text-white">
                          #{entry.rank || 'TBD'}
                        </TableCell>
                        <TableCell className="text-green-400">
                          ₹{entry.prize_won || 0}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            entry.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                            entry.status === 'active' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-gray-500/20 text-gray-300'
                          }>
                            {entry.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="create" className="space-y-6">
              <Card className="bg-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Create New Tournament</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Tournament Name</Label>
                      <Input
                        value={newTournament.tournament_name}
                        onChange={(e) => setNewTournament({...newTournament, tournament_name: e.target.value})}
                        placeholder="e.g., Weekend Color Championship"
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Tournament Type</Label>
                      <Select
                        value={newTournament.tournament_type}
                        onValueChange={(value) => setNewTournament({...newTournament, tournament_type: value})}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {tournamentTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-white">Entry Fee (₹)</Label>
                      <Input
                        type="number"
                        value={newTournament.entry_fee}
                        onChange={(e) => setNewTournament({...newTournament, entry_fee: Number(e.target.value)})}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Max Participants</Label>
                      <Input
                        type="number"
                        value={newTournament.max_participants}
                        onChange={(e) => setNewTournament({...newTournament, max_participants: Number(e.target.value)})}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Prize Pool (₹)</Label>
                      <Input
                        type="number"
                        value={newTournament.prize_pool}
                        onChange={(e) => setNewTournament({...newTournament, prize_pool: Number(e.target.value)})}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Start Time</Label>
                      <Input
                        type="datetime-local"
                        value={newTournament.start_time}
                        onChange={(e) => setNewTournament({...newTournament, start_time: e.target.value})}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white">End Time</Label>
                      <Input
                        type="datetime-local"
                        value={newTournament.end_time}
                        onChange={(e) => setNewTournament({...newTournament, end_time: e.target.value})}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-white">Tournament Rules</Label>
                    <Textarea
                      value={newTournament.rules}
                      onChange={(e) => setNewTournament({...newTournament, rules: e.target.value})}
                      placeholder="Describe tournament rules and objectives..."
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <Label className="text-white">Min Level</Label>
                        <Input
                          type="number"
                          value={newTournament.min_level}
                          onChange={(e) => setNewTournament({...newTournament, min_level: Number(e.target.value)})}
                          className="bg-slate-800 border-slate-600 text-white w-20"
                          min="1"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-white">Featured Tournament</Label>
                        <Switch
                          checked={newTournament.is_featured}
                          onCheckedChange={(checked) => setNewTournament({...newTournament, is_featured: checked})}
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={createTournament}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Tournament
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