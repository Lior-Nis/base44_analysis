import React, { useState, useEffect, useCallback } from 'react';
import { User, ParityGame, ParityBet } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitCompareArrows, Wallet, History, Timer, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ParityPage() {
    const [user, setUser] = useState(null);
    const [betAmount, setBetAmount] = useState(10);
    const [gameState, setGameState] = useState('betting');
    const [game, setGame] = useState(null);
    const [result, setResult] = useState(null);
    const [timeLeft, setTimeLeft] = useState(15);
    const [userBets, setUserBets] = useState([]);

    const startNewRound = useCallback(async () => {
        setGameState('betting');
        setResult(null);
        setUserBets([]);
        setTimeLeft(15);

        const newGame = await ParityGame.create({
            game_number: `PAR-${Date.now()}`,
            status: 'betting'
        });
        setGame(newGame);
    }, []);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await User.me();
                setUser(userData);
            } catch (e) {}
        };
        loadUser();
        startNewRound();
    }, [startNewRound]);

    useEffect(() => {
        if (gameState !== 'betting') return;
        if (timeLeft <= 0) {
            finishRound();
            return;
        }
        const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [gameState, timeLeft]);

    const placeBet = async (betType, betValue) => {
        if (gameState !== 'betting' || userBets.some(b => b.bet_type === betType && b.bet_value === betValue)) return;
        if (betAmount > (user?.wallet_balance || 0)) return alert("Insufficient balance.");

        const newBalance = user.wallet_balance - betAmount;
        await User.updateMyUserData({ wallet_balance: newBalance });
        setUser(prev => ({ ...prev, wallet_balance: newBalance }));

        const bet = await ParityBet.create({
            user_id: user.id,
            game_id: game.id,
            bet_type: betType,
            bet_value: betValue,
            bet_amount: betAmount,
        });

        setUserBets(prev => [...prev, bet]);
    };

    const finishRound = async () => {
        setGameState('calculating');
        
        const winningNumber = Math.floor(Math.random() * 10);
        const winningParity = winningNumber % 2 === 0 ? 'even' : 'odd';
        const winningRange = winningNumber <= 4 ? '0-4' : '5-9';

        await ParityGame.update(game.id, {
            status: 'completed',
            result_number: winningNumber,
            result_parity: winningParity,
            result_range: winningRange
        });

        setResult({ number: winningNumber, parity: winningParity, range: winningRange });

        // Payout logic
        let totalWin = 0;
        const betPromises = userBets.map(async bet => {
            let hasWon = false;
            let payoutMultiplier = 0;

            if (bet.bet_type === 'number' && parseInt(bet.bet_value) === winningNumber) {
                hasWon = true;
                payoutMultiplier = 9;
            } else if (bet.bet_type === 'parity' && bet.bet_value === winningParity) {
                hasWon = true;
                payoutMultiplier = 2;
            } else if (bet.bet_type === 'range' && bet.bet_value === winningRange) {
                hasWon = true;
                payoutMultiplier = 2;
            }
            
            const winAmount = hasWon ? bet.bet_amount * payoutMultiplier : 0;
            totalWin += winAmount;

            return ParityBet.update(bet.id, {
                status: hasWon ? 'won' : 'lost',
                win_amount: winAmount
            });
        });
        
        await Promise.all(betPromises);

        if (totalWin > 0) {
            const finalBalance = user.wallet_balance + totalWin;
            await User.updateMyUserData({ wallet_balance: finalBalance });
            setUser(prev => ({ ...prev, wallet_balance: finalBalance }));
        }

        setTimeout(startNewRound, 5000);
    };

    return (
        <div className="min-h-screen p-4 lg:p-8 bg-slate-900 text-white">
            <div className="max-w-4xl mx-auto">
                <Card className="bg-slate-800/50 border-slate-700/50 mb-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <GitCompareArrows className="text-fuchsia-400" /> Parity Game
                        </CardTitle>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-green-400">
                                <Wallet size={20} /> ₹{user?.wallet_balance || 0}
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <div className="text-center mb-6">
                    <div className="text-5xl font-bold">{timeLeft}s</div>
                    <div className="text-gray-400">Time to bet</div>
                </div>

                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="text-center mb-6 p-4 bg-slate-700/50 rounded-lg">
                            <h3 className="text-lg font-bold text-yellow-400">Round #{game.game_number.slice(-4)} Result</h3>
                            <div className="text-8xl font-bold my-4">{result.number}</div>
                            <div className="flex justify-center gap-4">
                                <Badge className="text-lg bg-blue-500">{result.parity}</Badge>
                                <Badge className="text-lg bg-purple-500">{result.range}</Badge>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-6">
                    <Card className="bg-slate-800/50 border-slate-700/50">
                        <CardHeader><CardTitle>Bet on Number (Win 9x)</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-5 gap-3">
                            {Array.from({ length: 10 }, (_, i) => (
                                <Button key={i} onClick={() => placeBet('number', i.toString())} disabled={gameState !== 'betting' || userBets.some(b => b.bet_value === i.toString())} className="h-16 text-xl">{i}</Button>
                            ))}
                        </CardContent>
                    </Card>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="bg-slate-800/50 border-slate-700/50">
                            <CardHeader><CardTitle>Bet on Parity (Win 2x)</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <Button onClick={() => placeBet('parity', 'odd')} disabled={gameState !== 'betting' || userBets.some(b => b.bet_value === 'odd')} className="h-16 text-xl bg-blue-600 hover:bg-blue-700">Odd</Button>
                                <Button onClick={() => placeBet('parity', 'even')} disabled={gameState !== 'betting' || userBets.some(b => b.bet_value === 'even')} className="h-16 text-xl bg-blue-600 hover:bg-blue-700">Even</Button>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-800/50 border-slate-700/50">
                            <CardHeader><CardTitle>Bet on Range (Win 2x)</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <Button onClick={() => placeBet('range', '0-4')} disabled={gameState !== 'betting' || userBets.some(b => b.bet_value === '0-4')} className="h-16 text-xl bg-purple-600 hover:bg-purple-700">0-4</Button>
                                <Button onClick={() => placeBet('range', '5-9')} disabled={gameState !== 'betting' || userBets.some(b => b.bet_value === '5-9')} className="h-16 text-xl bg-purple-600 hover:bg-purple-700">5-9</Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="mt-6">
                    <Input type="number" value={betAmount} onChange={e => setBetAmount(Number(e.target.value))} className="bg-slate-700 border-slate-600 text-center w-40 mx-auto" min="10"/>
                    <p className="text-center text-gray-400 mt-2">Bet Amount (₹)</p>
                </div>
            </div>
        </div>
    );
}