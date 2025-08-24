import React, { useState, useEffect, useCallback } from 'react';
import { User, InOutGame, InOutBet } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Wallet, History, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InOutPage() {
    const [user, setUser] = useState(null);
    const [currentGame, setCurrentGame] = useState(null);
    const [gameHistory, setGameHistory] = useState([]);
    const [userBets, setUserBets] = useState([]);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        loadData();
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    if (currentGame) {
                        finishCurrentGame();
                    }
                    return 30;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const loadData = async () => {
        const userData = await User.me();
        setUser(userData);
        
        let activeGame = await InOutGame.filter({ status: 'betting' });
        if (activeGame.length === 0) {
            activeGame = await InOutGame.create({
                game_number: `IO${Date.now()}`,
                status: 'betting'
            });
            setCurrentGame(activeGame);
        } else {
            setCurrentGame(activeGame[0]);
        }
        
        const recentGames = await InOutGame.filter({ status: 'completed' }, '-created_date', 10);
        setGameHistory(recentGames);
    };

    const finishCurrentGame = async () => {
        if (!currentGame) return;
        
        setIsProcessing(true);
        const resultNumber = Math.floor(Math.random() * 10);
        const resultZone = (resultNumber >= 3 && resultNumber <= 6) ? 'in' : 'out';
        
        await InOutGame.update(currentGame.id, {
            result_number: resultNumber,
            result_zone: resultZone,
            status: 'completed'
        });

        // Process bets
        const bets = await InOutBet.filter({ game_id: currentGame.id, status: 'pending' });
        for (const bet of bets) {
            const won = bet.bet_on === resultZone;
            const winAmount = won ? bet.bet_amount * 1.9 : 0;
            
            await InOutBet.update(bet.id, {
                status: won ? 'won' : 'lost',
                win_amount: winAmount
            });

            if (won && bet.user_id === user.id) {
                const newBalance = user.wallet_balance + winAmount;
                await User.updateMyUserData({ wallet_balance: newBalance });
                setUser(prev => ({ ...prev, wallet_balance: newBalance }));
            }
        }

        // Create new game
        const newGame = await InOutGame.create({
            game_number: `IO${Date.now()}`,
            status: 'betting'
        });
        setCurrentGame(newGame);
        setUserBets([]);
        setIsProcessing(false);
        loadData();
    };

    const placeBet = async (betOn) => {
        if (!currentGame || !user || isProcessing || timeLeft <= 5) return;
        if (user.wallet_balance < 10) return alert("Insufficient balance!");
        if (userBets.some(b => b.bet_on === betOn)) return alert("You already bet on this option!");

        setIsProcessing(true);
        const newBalance = user.wallet_balance - 10;
        await User.updateMyUserData({ wallet_balance: newBalance });
        setUser(prev => ({ ...prev, wallet_balance: newBalance }));

        const bet = await InOutBet.create({
            user_id: user.id,
            game_id: currentGame.id,
            bet_on: betOn,
            bet_amount: 10
        });

        setUserBets(prev => [...prev, bet]);
        setIsProcessing(false);
    };

    return (
        <div className="min-h-screen p-4 lg:p-8 bg-slate-900 text-white">
            <div className="max-w-4xl mx-auto">
                <Card className="bg-slate-800/50 border-slate-700/50 mb-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Target className="text-violet-400" />
                            In-Out Game
                        </CardTitle>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-green-400">
                                <Wallet size={20} />
                                ₹{user?.wallet_balance || 0}
                            </div>
                            <div className="flex items-center gap-2 text-blue-400">
                                <Timer size={20} />
                                {timeLeft}s
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card className="bg-slate-800/50 border-slate-700/50 mb-6">
                            <CardContent className="p-6">
                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-bold text-white mb-2">Predict the Zone</h3>
                                    <p className="text-gray-400">Will the number be IN (3-6) or OUT (0-2, 7-9)?</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <Button
                                        onClick={() => placeBet('in')}
                                        disabled={isProcessing || timeLeft <= 5 || userBets.some(b => b.bet_on === 'in')}
                                        className="h-20 bg-green-600 hover:bg-green-700 text-white text-xl font-bold"
                                    >
                                        IN (3-6)
                                        <div className="text-sm opacity-75">1.9x payout</div>
                                    </Button>
                                    <Button
                                        onClick={() => placeBet('out')}
                                        disabled={isProcessing || timeLeft <= 5 || userBets.some(b => b.bet_on === 'out')}
                                        className="h-20 bg-red-600 hover:bg-red-700 text-white text-xl font-bold"
                                    >
                                        OUT (0-2, 7-9)
                                        <div className="text-sm opacity-75">1.9x payout</div>
                                    </Button>
                                </div>

                                {userBets.length > 0 && (
                                    <div className="bg-slate-700/50 rounded-lg p-4">
                                        <h4 className="text-white font-semibold mb-2">Your Bets:</h4>
                                        {userBets.map(bet => (
                                            <div key={bet.id} className="flex justify-between items-center">
                                                <span className="text-white capitalize">{bet.bet_on}</span>
                                                <Badge variant="outline" className="border-yellow-400/30 text-yellow-300">
                                                    ₹{bet.bet_amount}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700/50">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <History className="text-blue-400" />
                                    Number Layout
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-10 gap-2">
                                    {Array.from({length: 10}, (_, i) => (
                                        <div key={i} className={`h-12 rounded-lg flex items-center justify-center text-white font-bold ${
                                            (i >= 3 && i <= 6) ? 'bg-green-600' : 'bg-red-600'
                                        }`}>
                                            {i}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-center mt-4 gap-8">
                                    <div className="text-center">
                                        <div className="w-8 h-8 bg-green-600 rounded-full mx-auto mb-1"></div>
                                        <div className="text-sm text-gray-400">IN Zone</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-8 h-8 bg-red-600 rounded-full mx-auto mb-1"></div>
                                        <div className="text-sm text-gray-400">OUT Zone</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card className="bg-slate-800/50 border-slate-700/50">
                            <CardHeader>
                                <CardTitle className="text-white">Recent Results</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {gameHistory.map((game) => (
                                        <div key={game.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                                    game.result_zone === 'in' ? 'bg-green-600' : 'bg-red-600'
                                                }`}>
                                                    {game.result_number}
                                                </div>
                                            </div>
                                            <Badge className={`${
                                                game.result_zone === 'in' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                                            }`}>
                                                {game.result_zone.toUpperCase()}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}