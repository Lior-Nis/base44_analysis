import React, { useState, useEffect, useRef } from 'react';
import { User, ScratchCardGame } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Star, Gift } from 'lucide-react';

const symbols = {
    1: { icon: '🍒', prize: 2 },
    2: { icon: '🍋', prize: 5 },
    3: { icon: '🔔', prize: 10 },
    4: { icon: '💎', prize: 25 },
    5: { icon: '👑', prize: 50 },
    6: { icon: '💰', prize: 100 }
};

const ScratchCell = ({ symbol, revealed, onScratch }) => (
    <div className="w-24 h-24 relative cursor-pointer" onClick={onScratch}>
        <div className={`absolute inset-0 bg-slate-400 rounded-lg transition-opacity duration-500 ${revealed ? 'opacity-0' : 'opacity-100'}`} />
        <div className="w-full h-full flex items-center justify-center text-5xl bg-slate-700 rounded-lg">{symbols[symbol].icon}</div>
    </div>
);

export default function ScratchCardPage() {
    const [user, setUser] = useState(null);
    const [grid, setGrid] = useState([]);
    const [revealed, setRevealed] = useState([]);
    const [gameState, setGameState] = useState('start'); // start, playing, finished
    const [winAmount, setWinAmount] = useState(0);
    const CARD_PRICE = 20;

    useEffect(() => { User.me().then(setUser); }, []);

    const buyCard = async () => {
        if (user.wallet_balance < CARD_PRICE) {
            alert("Not enough funds!");
            return;
        }
        await User.updateMyUserData({ wallet_balance: user.wallet_balance - CARD_PRICE });
        setUser(prev => ({ ...prev, wallet_balance: prev.wallet_balance - CARD_PRICE }));

        // Backend should handle this logic
        let newGrid = Array(9).fill(0).map(() => Math.floor(Math.random() * 3) + 1); // Less likely to win
        if (Math.random() < 0.2) { // 20% win chance
            const winningSymbol = Math.floor(Math.random() * 6) + 1;
            newGrid[0] = winningSymbol;
            newGrid[1] = winningSymbol;
            newGrid[2] = winningSymbol;
            newGrid = newGrid.sort(() => Math.random() - 0.5);
        }
        setGrid(newGrid);
        setRevealed(Array(9).fill(false));
        setWinAmount(0);
        setGameState('playing');
    };

    const handleScratch = (index) => {
        const newRevealed = [...revealed];
        newRevealed[index] = true;
        setRevealed(newRevealed);

        if (newRevealed.every(r => r)) {
            checkWin(grid);
        }
    };
    
    const revealAll = () => {
        setRevealed(Array(9).fill(true));
        checkWin(grid);
    };

    const checkWin = async (currentGrid) => {
        const counts = {};
        currentGrid.forEach(s => counts[s] = (counts[s] || 0) + 1);
        let winningSymbol = null;
        for (const symbol in counts) {
            if (counts[symbol] >= 3) {
                winningSymbol = symbol;
                break;
            }
        }

        if (winningSymbol) {
            const prize = symbols[winningSymbol].prize * (CARD_PRICE / 10);
            setWinAmount(prize);
            await User.updateMyUserData({ wallet_balance: user.wallet_balance + prize - CARD_PRICE});
            setUser(prev => ({...prev, wallet_balance: prev.wallet_balance + prize}));
        }
        setGameState('finished');
    };

    return (
        <div className="min-h-screen p-4 lg:p-8 bg-purple-900 text-white flex items-center justify-center">
            <Card className="w-full max-w-md bg-purple-800/50 border-purple-700">
                <CardHeader className="text-center">
                    <CardTitle className="text-4xl text-yellow-300 flex items-center justify-center gap-2"><Star /> Scratch & Win</CardTitle>
                    <p className="text-gray-300">Balance: ₹{user?.wallet_balance || 0}</p>
                </CardHeader>
                <CardContent>
                    <div className="my-6 p-4 bg-slate-900/50 rounded-lg">
                        <div className="grid grid-cols-3 gap-2">
                            {gameState === 'start' && [...Array(9)].map((_, i) => <div key={i} className="w-24 h-24 bg-slate-600 rounded-lg"/>)}
                            {gameState !== 'start' && grid.map((symbol, i) => (
                                <ScratchCell key={i} symbol={symbol} revealed={revealed[i]} onScratch={() => handleScratch(i)} />
                            ))}
                        </div>
                    </div>
                    
                    {gameState === 'start' && (
                        <Button onClick={buyCard} className="w-full h-16 text-xl bg-green-600">Buy Card (₹{CARD_PRICE})</Button>
                    )}

                    {gameState === 'playing' && (
                        <Button onClick={revealAll} className="w-full h-16 text-xl bg-yellow-500">Reveal All</Button>
                    )}

                    {gameState === 'finished' && (
                        <div className="text-center space-y-4">
                            {winAmount > 0 ? (
                                <p className="text-3xl font-bold text-green-400">You Won ₹{winAmount}!</p>
                            ) : (
                                <p className="text-2xl font-bold text-red-500">Better Luck Next Time!</p>
                            )}
                            <Button onClick={buyCard} className="w-full h-16 text-xl bg-green-600">Buy New Card (₹{CARD_PRICE})</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}