import React, { useState, useEffect, useCallback } from 'react';
import { User, DiceGame, DiceBet } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dices, Wallet, History, Timer, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DiceFace = ({ value }) => {
    const dots = [];
    const positions = [
        [], // 0
        [[50, 50]], // 1
        [[25, 25], [75, 75]], // 2
        [[25, 25], [50, 50], [75, 75]], // 3
        [[25, 25], [25, 75], [75, 25], [75, 75]], // 4
        [[25, 25], [25, 75], [50, 50], [75, 25], [75, 75]], // 5
        [[25, 25], [25, 75], [50, 25], [50, 75], [75, 25], [75, 75]] // 6
    ];

    if (value > 0 && value <= 6) {
        dots.push(...positions[value].map((pos, i) => (
            <div key={i} className="absolute w-4 h-4 bg-black rounded-full" style={{ top: `calc(${pos[1]}% - 8px)`, left: `calc(${pos[0]}% - 8px)` }}></div>
        )));
    }

    return <div className="relative w-20 h-20 bg-white rounded-lg shadow-lg">{dots}</div>;
};

export default function DiceRollPage() {
    const [user, setUser] = useState(null);
    const [betAmount, setBetAmount] = useState(10);
    const [gameState, setGameState] = useState('betting');
    const [game, setGame] = useState(null);
    const [result, setResult] = useState(null);
    const [timeLeft, setTimeLeft] = useState(15);
    const [userBets, setUserBets] = useState([]); // Array of bet_on_sum values

    const startNewRound = useCallback(async () => {
        setGameState('betting');
        setResult(null);
        setUserBets([]);
        setTimeLeft(15);
        const newGame = await DiceGame.create({ game_number: `DICE-${Date.now()}` });
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

    const placeBet = async (sumValue) => {
        if (gameState !== 'betting' || userBets.includes(sumValue)) return;
        if (betAmount > (user?.wallet_balance || 0)) return alert("Insufficient balance.");

        const newBalance = user.wallet_balance - betAmount;
        await User.updateMyUserData({ wallet_balance: newBalance });
        setUser(prev => ({ ...prev, wallet_balance: newBalance }));

        await DiceBet.create({
            user_id: user.id,
            game_id: game.id,
            bet_on_sum: sumValue,
            bet_amount: betAmount,
        });

        setUserBets(prev => [...prev, sumValue]);
    };

    const finishRound = async () => {
        setGameState('calculating');
        
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const totalSum = dice1 + dice2;

        await DiceGame.update(game.id, {
            status: 'completed',
            dice1_result: dice1,
            dice2_result: dice2,
            total_sum: totalSum
        });

        setResult({ dice1, dice2, totalSum });

        const allBets = await DiceBet.filter({ game_id: game.id });
        const winningBets = allBets.filter(b => b.bet_on_sum === totalSum);
        
        let totalPayout = 0;
        const payoutMultiplier = 10; 

        const betPromises = winningBets.map(async bet => {
            const winAmount = bet.bet_amount * payoutMultiplier;
            totalPayout += winAmount;
            return DiceBet.update(bet.id, { status: 'won', win_amount: winAmount });
        });
        
        await Promise.all(betPromises);

        if (totalPayout > 0) {
            const userWallets = {};
            for(const bet of winningBets) {
                if(!userWallets[bet.user_id]) {
                    const winnerUser = await User.get(bet.user_id);
                    userWallets[bet.user_id] = { balance: winnerUser.wallet_balance, payout: 0 };
                }
                userWallets[bet.user_id].payout += bet.win_amount;
            }

            for (const userId in userWallets) {
                await User.update(userId, { wallet_balance: userWallets[userId].balance + userWallets[userId].payout });
            }
        }
        
        const losingBets = allBets.filter(b => b.bet_on_sum !== totalSum);
        await Promise.all(losingBets.map(b => DiceBet.update(b.id, {status: 'lost'})));
        
        // Refresh local user data after payouts
        if (winningBets.some(b => b.user_id === user?.id)) {
            const updatedUser = await User.me();
            setUser(updatedUser);
        }

        setTimeout(startNewRound, 5000);
    };
    
    const betOptions = Array.from({length: 11}, (_, i) => i + 2); // Sums from 2 to 12

    return (
        <div className="min-h-screen p-4 lg:p-8 bg-slate-900 text-white">
            <div className="max-w-4xl mx-auto">
                <Card className="bg-slate-800/50 border-slate-700/50 mb-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Dices className="text-amber-400" /> Dice Roll
                        </CardTitle>
                        <div className="flex items-center gap-2 text-green-400">
                            <Wallet size={20} /> ₹{user?.wallet_balance || 0}
                        </div>
                    </CardHeader>
                </Card>

                <div className="text-center mb-6">
                    <div className="text-5xl font-bold">{timeLeft}s</div>
                    <div className="text-gray-400">Place your bet on the sum</div>
                </div>

                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="text-center mb-6 p-4 bg-slate-700/50 rounded-lg">
                            <h3 className="text-lg font-bold text-yellow-400">Round #{game.game_number.slice(-4)} Result</h3>
                            <div className="flex justify-center items-center gap-6 my-4">
                                <DiceFace value={result.dice1} />
                                <div className="text-4xl font-bold">+</div>
                                <DiceFace value={result.dice2} />
                            </div>
                            <div className="text-2xl">Total Sum: <span className="font-bold text-amber-400 text-4xl">{result.totalSum}</span></div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader><CardTitle>Bet on Dice Sum (Win 10x)</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-4 md:grid-cols-6 gap-3">
                        {betOptions.map(sum => (
                            <Button key={sum} onClick={() => placeBet(sum)} disabled={gameState !== 'betting' || userBets.includes(sum)} className="h-16 text-xl bg-amber-600 hover:bg-amber-700">
                                {sum}
                            </Button>
                        ))}
                    </CardContent>
                </Card>
                
                <div className="mt-6">
                    <Input type="number" value={betAmount} onChange={e => setBetAmount(Number(e.target.value))} className="bg-slate-700 border-slate-600 text-center w-40 mx-auto" min="10"/>
                    <p className="text-center text-gray-400 mt-2">Bet Amount (₹)</p>
                </div>
            </div>
        </div>
    );
}