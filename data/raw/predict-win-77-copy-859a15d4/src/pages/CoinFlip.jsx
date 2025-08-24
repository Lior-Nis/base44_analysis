import React, { useState, useEffect } from 'react';
import { User, CoinFlipBet } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Wallet, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CoinFlipPage() {
    const [user, setUser] = useState(null);
    const [betAmount, setBetAmount] = useState(10);
    const [gameState, setGameState] = useState('ready'); // ready, flipping, result
    const [userChoice, setUserChoice] = useState('');
    const [result, setResult] = useState('');
    const [isWinner, setIsWinner] = useState(false);
    const [recentGames, setRecentGames] = useState([]);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await User.me();
                setUser(userData);
                const recent = await CoinFlipBet.filter({ user_id: userData.id }, '-created_date', 10);
                setRecentGames(recent);
            } catch (e) {
                console.error("Error loading user:", e);
            }
        };
        loadUser();
    }, []);

    const playGame = async (choice) => {
        if (!user || user.wallet_balance < betAmount) {
            return alert("Insufficient balance!");
        }

        setUserChoice(choice);
        setGameState('flipping');

        // Deduct bet amount
        const newBalance = user.wallet_balance - betAmount;
        await User.updateMyUserData({ wallet_balance: newBalance });
        setUser(prev => ({ ...prev, wallet_balance: newBalance }));

        // Simulate coin flip after 2 seconds
        setTimeout(async () => {
            const flipResult = Math.random() < 0.5 ? 'heads' : 'tails';
            const won = choice === flipResult;
            const winAmount = won ? betAmount * 2 : 0;

            setResult(flipResult);
            setIsWinner(won);
            setGameState('result');

            // Create bet record
            const bet = await CoinFlipBet.create({
                user_id: user.id,
                bet_amount: betAmount,
                choice: choice,
                result: flipResult,
                outcome: won ? 'win' : 'loss',
                win_amount: winAmount
            });

            // Update balance if won
            if (won) {
                const finalBalance = newBalance + winAmount;
                await User.updateMyUserData({ wallet_balance: finalBalance });
                setUser(prev => ({ ...prev, wallet_balance: finalBalance }));
            }

            // Update recent games
            const recent = await CoinFlipBet.filter({ user_id: user.id }, '-created_date', 10);
            setRecentGames(recent);
        }, 2000);
    };

    const resetGame = () => {
        setGameState('ready');
        setUserChoice('');
        setResult('');
        setIsWinner(false);
    };

    return (
        <div className="min-h-screen p-4 lg:p-8 bg-slate-900 text-white">
            <div className="max-w-4xl mx-auto">
                <Card className="bg-slate-800/50 border-slate-700/50 mb-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Coins className="text-yellow-400" />
                            Coin Flip Game
                        </CardTitle>
                        <div className="flex items-center gap-2 text-green-400">
                            <Wallet size={20} />
                            ₹{user?.wallet_balance || 0}
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card className="bg-slate-800/50 border-slate-700/50">
                            <CardContent className="p-8 text-center">
                                <h3 className="text-2xl font-bold text-white mb-6">Choose Heads or Tails</h3>
                                
                                {gameState === 'ready' && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        <div className="mb-6">
                                            <label className="block text-white mb-2 text-lg">Bet Amount</label>
                                            <Input
                                                type="number"
                                                min="5"
                                                max={user?.wallet_balance || 0}
                                                value={betAmount}
                                                onChange={(e) => setBetAmount(Number(e.target.value))}
                                                className="bg-slate-700 border-slate-600 text-white text-center text-xl w-32 mx-auto"
                                            />
                                            <div className="text-sm text-gray-400 mt-2">Potential win: ₹{betAmount * 2}</div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <Button
                                                onClick={() => playGame('heads')}
                                                className="h-32 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-2xl font-bold"
                                            >
                                                <div>
                                                    <div className="text-4xl mb-2">👑</div>
                                                    <div>HEADS</div>
                                                </div>
                                            </Button>
                                            <Button
                                                onClick={() => playGame('tails')}
                                                className="h-32 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white text-2xl font-bold"
                                            >
                                                <div>
                                                    <div className="text-4xl mb-2">🪙</div>
                                                    <div>TAILS</div>
                                                </div>
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                {gameState === 'flipping' && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-6"
                                    >
                                        <div className="text-xl text-white mb-6">You chose: <span className="text-yellow-400 capitalize font-bold">{userChoice}</span></div>
                                        <motion.div
                                            animate={{ rotateY: [0, 180, 360, 540, 720] }}
                                            transition={{ duration: 2, ease: "easeOut" }}
                                            className="w-32 h-32 mx-auto bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-6xl"
                                        >
                                            🪙
                                        </motion.div>
                                        <div className="text-xl text-blue-400 animate-pulse">Coin is flipping...</div>
                                    </motion.div>
                                )}

                                {gameState === 'result' && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-6"
                                    >
                                        <div className="text-xl text-white">You chose: <span className="text-yellow-400 capitalize font-bold">{userChoice}</span></div>
                                        <div className="w-32 h-32 mx-auto bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-6xl">
                                            {result === 'heads' ? '👑' : '🪙'}
                                        </div>
                                        <div className="text-2xl font-bold text-white">Result: <span className="capitalize">{result}</span></div>
                                        
                                        {isWinner ? (
                                            <div className="space-y-4">
                                                <div className="text-3xl font-bold text-green-400">🎉 YOU WON! 🎉</div>
                                                <div className="text-xl text-white">You won ₹{betAmount * 2}!</div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="text-3xl font-bold text-red-400">😢 YOU LOST</div>
                                                <div className="text-xl text-white">Better luck next time!</div>
                                            </div>
                                        )}

                                        <Button
                                            onClick={resetGame}
                                            className="bg-purple-600 hover:bg-purple-700 text-white text-xl px-8 py-4"
                                        >
                                            Play Again
                                        </Button>
                                    </motion.div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        <Card className="bg-slate-800/50 border-slate-700/50">
                            <CardHeader>
                                <CardTitle className="text-white">Recent Games</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {recentGames.slice(0, 10).map((game) => (
                                        <div key={game.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                                            <div>
                                                <div className="text-white font-medium">₹{game.bet_amount}</div>
                                                <div className="text-sm text-gray-400 capitalize">{game.choice} vs {game.result}</div>
                                            </div>
                                            <Badge className={
                                                game.outcome === 'win' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                                'bg-red-500/20 text-red-300 border-red-500/30'
                                            }>
                                                {game.outcome === 'win' ? `+₹${game.win_amount}` : '-₹' + game.bet_amount}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700/50 mt-6">
                            <CardHeader>
                                <CardTitle className="text-white">How to Play</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-gray-400 space-y-2">
                                    <p>1. Set your bet amount</p>
                                    <p>2. Choose Heads or Tails</p>
                                    <p>3. If you guess correctly, win 2x your bet!</p>
                                    <p>4. 50/50 chance - pure luck!</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}