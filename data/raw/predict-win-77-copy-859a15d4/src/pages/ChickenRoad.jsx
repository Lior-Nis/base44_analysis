import React, { useState, useEffect } from 'react';
import { User, ChickenRoadGame } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Egg, Car, Wallet, Trophy, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChickenRoadPage() {
    const [user, setUser] = useState(null);
    const [gameState, setGameState] = useState('setup'); // setup, playing, finished
    const [betAmount, setBetAmount] = useState(10);
    const [game, setGame] = useState(null);
    const [message, setMessage] = useState('');
    const [isMoving, setIsMoving] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            try {
                setUser(await User.me());
            } catch (e) {}
        };
        loadUser();
    }, []);

    const startGame = async () => {
        if (!user || user.wallet_balance < betAmount) {
            return alert("Insufficient balance or user not loaded.");
        }
        
        const newBalance = user.wallet_balance - betAmount;
        await User.updateMyUserData({ wallet_balance: newBalance });
        setUser(prev => ({ ...prev, wallet_balance: newBalance }));
        
        const newGame = await ChickenRoadGame.create({
            user_id: user.id,
            bet_amount: betAmount,
        });
        setGame(newGame);
        setGameState('playing');
        setMessage('Game started! Cross the road to find eggs.');
    };

    const crossRoad = async () => {
        if (isMoving || !game || game.status !== 'active') return;
        setIsMoving(true);

        const success = Math.random() > 0.4; // 60% chance to succeed
        let updatedGame;

        if (success) {
            const eggsFound = Math.random() > 0.7 ? 2 : 1; // 30% chance for 2 eggs
            updatedGame = await ChickenRoadGame.update(game.id, {
                distance_covered: game.distance_covered + 1,
                eggs_collected: game.eggs_collected + eggsFound,
            });
            setMessage(`Success! You crossed and found ${eggsFound} egg(s).`);
        } else {
            updatedGame = await ChickenRoadGame.update(game.id, {
                tries_left: game.tries_left - 1,
            });
            setMessage('Oh no, a car! You lost a life.');
            if (updatedGame.tries_left <= 0) {
                endGame(updatedGame, true);
                return;
            }
        }
        setGame(updatedGame);
        setIsMoving(false);
    };

    const endGame = async (finalGame, failed = false) => {
        setGameState('finished');
        if (failed) {
            setMessage(`Game over! You ran out of lives. You collected ${finalGame.eggs_collected} eggs.`);
            await ChickenRoadGame.update(finalGame.id, { status: 'completed', win_amount: 0 });
            return;
        }

        const winAmount = finalGame.eggs_collected * 2; // Each egg is worth ₹2
        await ChickenRoadGame.update(finalGame.id, {
            status: 'completed',
            win_amount: winAmount
        });

        if (winAmount > 0) {
            const newBalance = user.wallet_balance + winAmount;
            await User.updateMyUserData({ wallet_balance: newBalance });
            setUser(prev => ({...prev, wallet_balance: newBalance}));
        }
        
        setMessage(`You cashed out with ${finalGame.eggs_collected} eggs, winning ₹${winAmount}!`);
    };

    return (
        <div className="min-h-screen p-4 lg:p-8 bg-slate-900 text-white">
            <div className="max-w-md mx-auto">
                <Card className="bg-slate-800/50 border-slate-700/50 mb-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Egg className="text-orange-400" /> Chicken Road
                        </CardTitle>
                        <div className="flex items-center gap-2 text-green-400">
                            <Wallet size={20} /> ₹{user?.wallet_balance || 0}
                        </div>
                    </CardHeader>
                </Card>

                {gameState === 'setup' ? (
                    <Card className="bg-slate-800/50 border-slate-700/50 text-center p-6">
                        <h2 className="text-2xl font-bold mb-4">Ready to Cross?</h2>
                        <div className="mb-4">
                            <label className="text-gray-400 block mb-2">Bet Amount (₹)</label>
                            <Input type="number" value={betAmount} onChange={e => setBetAmount(Number(e.target.value))} className="bg-slate-700 border-slate-600 w-40 mx-auto" />
                        </div>
                        <Button onClick={startGame} size="lg" className="w-full bg-orange-500 hover:bg-orange-600">Start Game</Button>
                    </Card>
                ) : (
                    <Card className="bg-slate-800/50 border-slate-700/50 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <Trophy className="text-yellow-400 inline-block mr-2" />
                                <span className="text-2xl font-bold">{game?.distance_covered || 0}</span>
                                <span className="text-gray-400">m</span>
                            </div>
                            <div>
                                <Egg className="text-white inline-block mr-2" />
                                <span className="text-2xl font-bold">{game?.eggs_collected || 0}</span>
                            </div>
                            <div className="flex items-center">
                                <Heart className="text-red-500 inline-block mr-2" />
                                <span className="text-2xl font-bold">{game?.tries_left || 0}</span>
                            </div>
                        </div>

                        <div className="h-40 bg-gray-600 rounded-lg my-4 flex items-center justify-center relative overflow-hidden">
                            <AnimatePresence>
                            {isMoving && (
                                <motion.div 
                                    initial={{ x: -200 }} animate={{ x: 200 }} exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="absolute"
                                >
                                    <Car className="w-16 h-16 text-red-400" />
                                </motion.div>
                            )}
                            </AnimatePresence>
                             <Egg className="w-12 h-12 text-white z-10" />
                        </div>
                        
                        {message && <p className="text-center text-yellow-300 my-4">{message}</p>}

                        {gameState === 'playing' ? (
                            <div className="grid grid-cols-2 gap-4">
                                <Button onClick={crossRoad} disabled={isMoving} className="bg-green-600 hover:bg-green-700 h-16 text-lg">Cross Road</Button>
                                <Button onClick={() => endGame(game)} disabled={isMoving} variant="outline" className="h-16 text-lg">Cash Out</Button>
                            </div>
                        ) : (
                             <Button onClick={() => setGameState('setup')} size="lg" className="w-full bg-orange-500 hover:bg-orange-600">Play Again</Button>
                        )}
                    </Card>
                )}
            </div>
        </div>
    );
}