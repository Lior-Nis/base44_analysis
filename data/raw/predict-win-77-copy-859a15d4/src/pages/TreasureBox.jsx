import React, { useState, useEffect } from 'react';
import { User, TreasureBoxGame } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Gem, Bomb, DollarSign } from 'lucide-react';

const GRID_SIZE = 9;
const MULTIPLIER_INCREMENT = 0.25;

export default function TreasureBoxPage() {
    const [user, setUser] = useState(null);
    const [betAmount, setBetAmount] = useState(10);
    const [gameState, setGameState] = useState('betting'); // betting, playing, busted
    const [grid, setGrid] = useState([]);
    const [openedCount, setOpenedCount] = useState(0);
    const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
    const [gameId, setGameId] = useState(null);

    useEffect(() => {
        User.me().then(setUser).catch(() => {});
    }, []);

    const startGame = async () => {
        if (!user || user.wallet_balance < betAmount) {
            alert('Insufficient balance.');
            return;
        }

        const newBalance = user.wallet_balance - betAmount;
        await User.updateMyUserData({ wallet_balance: newBalance });
        setUser(prev => ({...prev, wallet_balance: newBalance}));

        const bustIndex = Math.floor(Math.random() * GRID_SIZE);
        setGrid(Array.from({ length: GRID_SIZE }, (_, i) => ({
            isBust: i === bustIndex,
            isOpened: false
        })));
        
        const newGame = await TreasureBoxGame.create({
            user_id: user.id,
            bet_amount: betAmount,
            grid_size: GRID_SIZE,
            bust_box_index: bustIndex
        });
        setGameId(newGame.id);

        setOpenedCount(0);
        setCurrentMultiplier(1.0);
        setGameState('playing');
    };

    const openBox = async (index) => {
        if (gameState !== 'playing' || grid[index].isOpened) return;

        const newGrid = [...grid];
        newGrid[index].isOpened = true;

        if (newGrid[index].isBust) {
            setGameState('busted');
            await TreasureBoxGame.update(gameId, { status: 'busted', opened_boxes: [...grid.filter(b=>b.isOpened).map((_,i)=>i), index] });
        } else {
            const newOpenedCount = openedCount + 1;
            const newMultiplier = 1.0 + newOpenedCount * MULTIPLIER_INCREMENT;
            setOpenedCount(newOpenedCount);
            setCurrentMultiplier(newMultiplier);
            await TreasureBoxGame.update(gameId, { opened_boxes: [...grid.filter(b=>b.isOpened).map((_,i)=>i), index], current_multiplier: newMultiplier });
        }
        setGrid(newGrid);
    };

    const cashOut = async () => {
        const winAmount = betAmount * currentMultiplier;
        const newBalance = user.wallet_balance + winAmount;

        await User.updateMyUserData({ wallet_balance: newBalance });
        setUser(prev => ({...prev, wallet_balance: newBalance}));

        await TreasureBoxGame.update(gameId, {
            status: 'cashed_out',
            win_amount: winAmount
        });

        setGameState('betting');
    };

    const resetGame = () => {
        setGameState('betting');
    };

    return (
        <div className="min-h-screen p-4 lg:p-8 flex items-center justify-center">
            <Card className="w-full max-w-md bg-slate-800/50 border-slate-700/50 text-white">
                <CardHeader>
                    <CardTitle className="text-center text-3xl font-bold flex items-center justify-center gap-2">
                        <Gem className="w-8 h-8 text-pink-400" />
                        Treasure Box
                    </CardTitle>
                    <p className="text-center text-gray-400">Open boxes, avoid the bomb, and win big!</p>
                </CardHeader>
                <CardContent>
                    {gameState === 'betting' || gameState === 'busted' ? (
                        <div className="text-center">
                            {gameState === 'busted' && (
                                <div className="mb-4 p-4 bg-red-500/20 text-red-400 rounded-lg">
                                    <h3 className="text-xl font-bold">BOOM! You hit the bomb.</h3>
                                    <p>Better luck next time.</p>
                                </div>
                            )}
                            <div className="flex items-center justify-center gap-2 my-4">
                                <DollarSign className="w-6 h-6 text-green-400" />
                                <input
                                    type="number"
                                    value={betAmount}
                                    onChange={(e) => setBetAmount(Number(e.target.value))}
                                    className="w-32 bg-slate-800 border-slate-600 text-center text-lg rounded-md p-2"
                                />
                            </div>
                            <Button onClick={gameState === 'betting' ? startGame : resetGame} size="lg" className="w-full bg-pink-600 hover:bg-pink-700">
                                {gameState === 'betting' ? 'Start Game' : 'Play Again'}
                            </Button>
                        </div>
                    ) : (
                        <div>
                            <div className="mb-4 p-4 bg-slate-700/50 rounded-lg text-center">
                                <p>Current Multiplier</p>
                                <p className="text-3xl font-bold text-yellow-400">{currentMultiplier.toFixed(2)}x</p>
                                <p className="text-green-400">Potential Win: ₹{(betAmount * currentMultiplier).toFixed(2)}</p>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {grid.map((box, index) => (
                                    <button
                                        key={index}
                                        onClick={() => openBox(index)}
                                        disabled={box.isOpened}
                                        className="h-24 bg-slate-700 rounded-lg flex items-center justify-center text-4xl transition-transform hover:scale-105"
                                    >
                                        <AnimatePresence>
                                            {box.isOpened && (
                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                                    {box.isBust ? <Bomb className="text-red-500" /> : <Gem className="text-green-400" />}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </button>
                                ))}
                            </div>
                            <Button onClick={cashOut} size="lg" className="w-full bg-green-600 hover:bg-green-700">
                                Cash Out ₹{(betAmount * currentMultiplier).toFixed(2)}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}