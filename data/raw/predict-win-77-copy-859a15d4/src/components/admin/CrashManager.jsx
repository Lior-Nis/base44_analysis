import React, { useState, useEffect } from 'react';
import { CrashGame, CrashBet } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Rocket, BarChart } from 'lucide-react';

export default function CrashManager() {
    const [recentGames, setRecentGames] = useState([]);
    const [recentBets, setRecentBets] = useState([]);
    const [stats, setStats] = useState({ avgCrash: 0, totalBets: 0, totalWon: 0 });

    useEffect(() => {
        const fetchData = async () => {
            const games = await CrashGame.list('-created_date', 100);
            setRecentGames(games.slice(0, 10));

            const bets = await CrashBet.list('-created_date', 50);
            setRecentBets(bets);

            if (games.length > 0) {
                const totalCrash = games.reduce((sum, g) => sum + g.crash_point, 0);
                const totalBetsAmount = bets.reduce((sum, b) => sum + b.bet_amount, 0);
                const totalWinAmount = bets.reduce((sum, b) => sum + b.win_amount, 0);
                setStats({
                    avgCrash: (totalCrash / games.length).toFixed(2),
                    totalBets: totalBetsAmount,
                    totalWon: totalWinAmount
                });
            }
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2"><BarChart /> Crash Game Stats</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-700/50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-white">{stats.avgCrash}x</div>
                        <div className="text-gray-400">Avg. Crash Point</div>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-400">₹{stats.totalBets.toFixed(2)}</div>
                        <div className="text-gray-400">Total Bet Amount</div>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-400">₹{stats.totalWon.toFixed(2)}</div>
                        <div className="text-gray-400">Total Won by Players</div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader><CardTitle className="text-white">Recent Game Rounds</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow className="border-slate-600"><TableHead>Game ID</TableHead><TableHead>Crash Point</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {recentGames.map(game => (
                                    <TableRow key={game.id} className="border-slate-600">
                                        <TableCell>{game.game_id.slice(-8)}</TableCell>
                                        <TableCell><Badge className={game.crash_point < 2 ? 'bg-red-500' : 'bg-green-500'}>{game.crash_point}x</Badge></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader><CardTitle className="text-white">Recent Bets</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow className="border-slate-600"><TableHead>User</TableHead><TableHead>Bet</TableHead><TableHead>Cashed Out</TableHead><TableHead>Win</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {recentBets.map(bet => (
                                    <TableRow key={bet.id} className="border-slate-600">
                                        <TableCell>{bet.user_id.slice(-6)}</TableCell>
                                        <TableCell>₹{bet.bet_amount}</TableCell>
                                        <TableCell>{bet.cash_out_at ? `${bet.cash_out_at.toFixed(2)}x` : '-'}</TableCell>
                                        <TableCell className={bet.win_amount > 0 ? 'text-green-400' : 'text-red-400'}>₹{bet.win_amount.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}