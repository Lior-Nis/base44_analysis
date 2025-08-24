import React, { useState, useEffect } from 'react';
import { User, PenaltyGame } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Wallet, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PenaltyPage() {
    const [user, setUser] = useState(null);
    const [gameState, setGameState] = useState('setup');
    const [betAmount, setBetAmount] = useState(10);
    const [game, setGame] = useState(null);
    const [message, setMessage] = useState('');

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
        
        const newGame = await PenaltyGame.create({
            user_id: user.id,
            bet_amount: betAmount,
        });
        setGame(newGame);
        setGameState('playing');
        setMessage('Game started! Take your penalty shots!');
    };

    const takeShot = async () => {
        if (!game || game.shots_taken >= 5) return;

        const isGoal = Math.random() > 0.3; // 70% chance to score
        const newShotsTaken = game.shots_taken + 1;
        const newGoalsScored = game.goals_scored + (isGoal ? 1 : 0);
        
        const updatedGame = {
            ...game,
            shots_taken: newShotsTaken,
            goals_scored: newGoalsScored
        };

        if (newShotsTaken >= 5) {
            // Game finished
            const winAmount = newGoalsScored * (betAmount * 0.4); // 40% return per goal
            updatedGame.win_amount = winAmount;
            updatedGame.status = 'completed';
            
            await PenaltyGame.update(game.id, updatedGame);
            
            if (winAmount > 0) {
                const newBalance = user.wallet_balance + winAmount;
                await User.updateMyUserData({ wallet_balance: newBalance });
                setUser(prev => ({ ...prev, wallet_balance: newBalance }));
            }
            
            setMessage(`Game finished! You scored ${newGoalsScored}/5 goals and won ₹${winAmount.toFixed(2)}!`);
            setGameState('finished');
        } else {
            await PenaltyGame.update(game.id, updatedGame);
            setMessage(isGoal ? 'GOAL! Great shot!' : 'Missed! Keep trying!');
        }
        
        setGame(updatedGame);
    };

    const resetGame = () => {
        setGameState('setup');
        setGame(null);
        setMessage('');
    };

    return (
        <div className="min-h-screen p-4 lg:p-8 bg-slate-900 text-white">
            <div className="max-w-md mx-auto">
                <Card className="bg-slate-800/50 border-slate-700/50 mb-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="text-green-400" /> Penalty Unlimited
                        </CardTitle>
                        <div className="flex items-center gap-2 text-green-400">
                            <Wallet size={20} /> ₹{user?.wallet_balance || 0}
                        </div>
                    </CardHeader>
                </Card>

                {gameState === 'setup' ? (
                    <Card className="bg-slate-800/50 border-slate-700/50 p-6">
                        <div className="text-center mb-4">
                            <h2 className="text-xl font-bold text-white mb-2">Start Penalty Shootout</h2>
                            <p className="text-gray-400">Take 5 penalty shots. Earn money for each goal!</p>
                        </div>
                        
                        <div className="mb-4">
                            <label className="block text-white mb-2">Bet Amount</label>
                            <Input
                                type="number"
                                min="5"
                                max={user?.wallet_balance || 0}
                                value={betAmount}
                                onChange={(e) => setBetAmount(Number(e.target.value))}
                                className="bg-slate-700 border-slate-600 text-white"
                            />
                        </div>
                        
                        <Button 
                            onClick={startGame}
                            disabled={!user || user.wallet_balance < betAmount}
                            className="w-full bg-green-600 hover:bg-green-700"
                        >
                            Start Game (₹{betAmount})
                        </Button>
                    </Card>
                ) : (
                    <Card className="bg-slate-800/50 border-slate-700/50 p-6">
                        <div className="text-center mb-4">
                            <div className="flex justify-around text-center mb-4">
                                <div>
                                    <div className="text-2xl font-bold text-green-400">{game?.goals_scored || 0}</div>
                                    <div className="text-sm text-gray-400">Goals</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-blue-400">{game?.shots_taken || 0}/5</div>
                                    <div className="text-sm text-gray-400">Shots</div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full h-48 bg-green-800/30 border-2 border-dashed border-white rounded-lg my-4 flex items-end justify-center relative">
                            <div className="w-40 h-20 border-2 border-white absolute top-0"></div>
                            <Zap className="w-12 h-12 text-white z-10 mb-4"/>
                        </div>
                        
                        {message && (
                            <div className="text-center text-yellow-400 mb-4 font-semibold">
                                {message}
                            </div>
                        )}

                        {gameState === 'playing' ? (
                            <Button 
                                onClick={takeShot}
                                disabled={game?.shots_taken >= 5}
                                className="w-full bg-blue-600 hover:bg-blue-700 mb-2"
                            >
                                Take Shot
                            </Button>
                        ) : (
                            <Button onClick={resetGame} className="w-full bg-purple-600 hover:bg-purple-700">
                                Play Again
                            </Button>
                        )}
                    </Card>
                )}
            </div>
        </div>
    );
}