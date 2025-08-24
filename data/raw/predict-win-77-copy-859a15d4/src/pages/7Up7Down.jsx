
import React, { useState, useEffect, useCallback } from 'react';
import { User, SevenUpSevenDownGame, SevenUpSevenDownBet } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dices, Wallet, History, Timer, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DiceFace = ({ value }) => {
    const dots = Array.from({ length: value }, (_, i) => i);
    return (
        <div className="w-16 h-16 bg-white rounded-lg p-2 grid grid-cols-3 grid-rows-3 shadow-lg">
            {dots.map(i => <div key={i} className={`dot-${value}-${i} w-3 h-3 bg-black rounded-full`}></div>)}
            <style jsx>{`
                .dot-1-0 { grid-area: 2 / 2; }
                .dot-2-0 { grid-area: 1 / 1; } .dot-2-1 { grid-area: 3 / 3; }
                .dot-3-0 { grid-area: 1 / 1; } .dot-3-1 { grid-area: 2 / 2; } .dot-3-2 { grid-area: 3 / 3; }
                .dot-4-0, .dot-4-1 { grid-area: 1 / 1; } .dot-4-2, .dot-4-3 { grid-area: 3 / 3; } .dot-4-0 { align-self: start; justify-self: start; } .dot-4-1 { align-self: start; justify-self: end; grid-column: 3; } .dot-4-2 { align-self: end; justify-self: start; } .dot-4-3 { align-self: end; justify-self: end; }
                .dot-5-0 { grid-area: 1 / 1; } .dot-5-1 { grid-area: 1 / 3; } .dot-5-2 { grid-area: 2 / 2; } .dot-5-3 { grid-area: 3 / 1; } .dot-5-4 { grid-area: 3 / 3; }
                .dot-6-0, .dot-6-1, .dot-6-2 { grid-area: 1 / 1; } .dot-6-3, .dot-6-4, .dot-6-5 { grid-area: 3 / 1; } .dot-6-0, .dot-6-3 { grid-column: 1; } .dot-6-1, .dot-6-4 { grid-column: 2; } .dot-6-2, .dot-6-5 { grid-column: 3; }
            `}</style>
        </div>
    );
};

export default function SevenUpSevenDownPage() {
    const [user, setUser] = useState(null);
    const [betAmount, setBetAmount] = useState(10);
    const [gameState, setGameState] = useState('betting');
    const [game, setGame] = useState(null);
    const [result, setResult] = useState(null);
    const [userBet, setUserBet] = useState(null);
    const [history, setHistory] = useState([]);
    const [timeLeft, setTimeLeft] = useState(10);

    const startNewRound = useCallback(async () => {
        setGameState('betting');
        setResult(null);
        setUserBet(null);
        setTimeLeft(10);
        const newGame = await SevenUpSevenDownGame.create({ game_number: `7ud-${Date.now()}` });
        setGame(newGame);
    }, []);

    useEffect(() => {
        const init = async () => {
            try {
                const userData = await User.me();
                setUser(userData);
                const recentGames = await SevenUpSevenDownGame.filter({status: "completed"}, "-created_date", 5);
                setHistory(recentGames);
                startNewRound();
            } catch (e) {
                console.error(e);
            }
        };
        init();
    }, [startNewRound]);
    
    useEffect(() => {
        if (gameState !== 'betting' || timeLeft <= 0) {
            if(timeLeft <= 0) rollDice();
            return;
        }
        const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [gameState, timeLeft]);

    const placeBet = async (choice) => {
        if (gameState !== 'betting' || userBet) return;
        if (betAmount > (user?.wallet_balance || 0)) return alert("Insufficient balance.");

        const newBalance = user.wallet_balance - betAmount;
        await User.updateMyUserData({ wallet_balance: newBalance });
        setUser(prev => ({...prev, wallet_balance: newBalance}));

        await SevenUpSevenDownBet.create({
            user_id: user.id,
            game_id: game.id,
            bet_on: choice,
            bet_amount: betAmount,
        });
        setUserBet({bet_on: choice, bet_amount: betAmount});
    };

    const rollDice = async () => {
        setGameState('rolling');
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const total = d1 + d2;
        let outcome;
        if (total < 7) outcome = '7down';
        else if (total > 7) outcome = '7up';
        else outcome = '7';

        await SevenUpSevenDownGame.update(game.id, {
            dice1_result: d1,
            dice2_result: d2,
            total_sum: total,
            outcome: outcome,
            status: 'completed'
        });

        const playerBet = await SevenUpSevenDownBet.filter({game_id: game.id, user_id: user.id});
        let winAmount = 0;
        if (playerBet.length > 0 && playerBet[0].bet_on === outcome) {
            const multiplier = outcome === '7' ? 3 : 2;
            winAmount = playerBet[0].bet_amount * multiplier;
            await SevenUpSevenDownBet.update(playerBet[0].id, {status: 'won', win_amount: winAmount});
            const newBalance = user.wallet_balance - playerBet[0].bet_amount + winAmount;
            await User.updateMyUserData({wallet_balance: newBalance});
            setUser(prev => ({...prev, wallet_balance: newBalance}));
        } else if (playerBet.length > 0) {
            await SevenUpSevenDownBet.update(playerBet[0].id, {status: 'lost'});
        }

        setTimeout(() => {
            setResult({ d1, d2, total, outcome, winAmount });
            setGameState('result');
            setHistory(prev => [{total_sum: total, outcome, id: Date.now()}, ...prev.slice(0,4)]);
            setTimeout(() => startNewRound(), 5000);
        }, 2000);
    };

    const getOutcomeColor = (outcome) => {
        if(outcome === '7down') return 'bg-cyan-500';
        if(outcome === '7up') return 'bg-blue-500';
        return 'bg-green-500';
    }

    return (
        <div className="min-h-screen p-4 lg:p-8 bg-slate-900 text-white">
            <div className="max-w-4xl mx-auto">
                <Card className="bg-slate-800/50 border-slate-700/50 mb-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Dices className="text-cyan-400" />
                            7Up 7Down
                        </CardTitle>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-green-400">
                                <Wallet size={20} />
                                <span>₹{user?.wallet_balance?.toFixed(2) || 0}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <History size={20} />
                                <span>History</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="text-center">
                        <div className="flex justify-center gap-2 mb-4">
                            {history.map((h, i) => (
                                <Badge key={h.id || i} className={`${getOutcomeColor(h.outcome)} text-sm`}>{h.total_sum}</Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                
                <div className="relative h-64 flex items-center justify-center">
                    <AnimatePresence>
                    {gameState === 'betting' && (
                        <motion.div initial={{opacity:0, scale:0.5}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.5}} className="absolute text-center">
                             <div className="text-6xl font-bold text-yellow-400">{timeLeft}</div>
                             <p className="text-gray-300">Place your bet!</p>
                        </motion.div>
                    )}
                    {(gameState === 'rolling' || gameState === 'result') && result && (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex gap-8">
                            <DiceFace value={result.d1} />
                            <DiceFace value={result.d2} />
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>

                <AnimatePresence>
                {gameState === 'result' && result && (
                    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="text-center my-4">
                        <h2 className="text-3xl font-bold">Total: {result.total}</h2>
                        {result.winAmount > 0 ? (
                            <p className="text-2xl text-green-400">You won ₹{result.winAmount}!</p>
                        ) : (
                            userBet && <p className="text-2xl text-red-500">You lost!</p>
                        )}
                    </motion.div>
                )}
                </AnimatePresence>

                <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardContent className="p-6">
                        <div className="flex justify-center gap-4 mb-4">
                            {[10, 50, 100, 500].map(amount => (
                                <Button key={amount} variant={betAmount === amount ? "default" : "outline"} onClick={() => setBetAmount(amount)}>₹{amount}</Button>
                            ))}
                            <Input type="number" value={betAmount} onChange={e => setBetAmount(Number(e.target.value))} className="w-24 bg-slate-700" />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <Button onClick={() => placeBet('7down')} disabled={gameState !== 'betting' || !!userBet} className="h-20 text-xl bg-cyan-600 hover:bg-cyan-700">7 Down <br/> (2x)</Button>
                            <Button onClick={() => placeBet('7')} disabled={gameState !== 'betting' || !!userBet} className="h-20 text-xl bg-green-600 hover:bg-green-700">Lucky 7 <br/> (3x)</Button>
                            <Button onClick={() => placeBet('7up')} disabled={gameState !== 'betting' || !!userBet} className="h-20 text-xl bg-blue-600 hover:bg-blue-700">7 Up <br/> (2x)</Button>
                        </div>
                         {userBet && <p className="text-center mt-4 text-yellow-300">You bet ₹{userBet.bet_amount} on {userBet.bet_on}.</p>}
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
