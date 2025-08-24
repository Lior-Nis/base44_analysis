
import React, { useState, useEffect, useCallback } from 'react';
import { User, CrashGame, CrashBet } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, Wallet, History, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Label } from "@/components/ui/label";

// --- Helper Functions & Components ---

// Simple hash to generate a crash point from a game ID. In a real app, this would use a provably fair system.
const getCrashPointFromGameId = (gameId) => {
    let hash = 0;
    for (let i = 0; i < gameId.length; i++) {
        const char = gameId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; 
    }
    const n = Math.abs(hash);
    const e = 2 ** 32;
    const h = n % e;
    
    // This formula creates a distribution where lower multipliers are more common.
    // 99% of outcomes will be < 100x. The house edge is created by the 1% instant crash chance.
    if (h % 100 === 0) return 1.00; // 1% chance of instant crash
    return Math.floor(100 * e / (e - h)) / 100;
};

const GameScreen = ({ multiplier, gameState }) => {
    const rocketPath = {
        initial: { x: -100, y: 100, rotate: -45, opacity: 0 },
        betting: { x: -100, y: 100, rotate: -45, opacity: 1 },
        running: (mult) => ({
            x: mult * 20 - 100,
            y: 100 - mult * 10,
            rotate: -45 + mult * 2,
            transition: { duration: 0.2, ease: "linear" }
        }),
        crashed: {
            x: '110vw',
            y: '-50vh',
            rotate: 0,
            opacity: 0,
            transition: { duration: 1, ease: "easeIn" }
        }
    }

    return (
        <div className="relative w-full h-64 lg:h-96 bg-slate-900/50 rounded-lg overflow-hidden border-2 border-purple-500/20 mb-6">
            {/* Stars background */}
            {[...Array(50)].map((_, i) => (
                <div key={i} className="absolute bg-white rounded-full" style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: `${Math.random() * 2 + 1}px`,
                    height: `${Math.random() * 2 + 1}px`,
                    opacity: Math.random()
                }} />
            ))}
            
            <motion.div variants={rocketPath} initial="initial" animate={gameState} custom={multiplier} className="absolute text-5xl">
                <Rocket />
            </motion.div>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <AnimatePresence>
                    {gameState === 'crashed' ? (
                         <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="text-5xl font-bold text-red-500">
                             CRASHED @ {multiplier.toFixed(2)}x
                         </motion.div>
                    ) : (
                        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="text-6xl font-bold text-white">
                            {multiplier.toFixed(2)}x
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// --- Main Component ---
export default function SkyBlastPage() {
    const [user, setUser] = useState(null);
    const [gameState, setGameState] = useState('betting'); // betting, running, crashed
    const [game, setGame] = useState(null);
    const [betAmount, setBetAmount] = useState(10);
    const [multiplier, setMultiplier] = useState(1.00);
    const [bet, setBet] = useState(null);
    const [history, setHistory] = useState([]);

    const startNewRound = useCallback(async () => {
        setMultiplier(1.00);
        setBet(null);
        setGameState('betting');
        
        const gameId = `CRASH-${Date.now()}`;
        const crashPoint = getCrashPointFromGameId(gameId);

        const newGame = await CrashGame.create({ game_id: gameId, crash_point: crashPoint });
        setGame(newGame);
        
        const recentGames = await CrashGame.filter({status: 'crashed'}, '-created_date', 5);
        setHistory(recentGames);

        // Countdown to start
        setTimeout(() => {
            setGameState('running');
        }, 5000); // 5s betting window
    }, []);

    useEffect(() => {
        const loadUser = async () => { try { const u = await User.me(); setUser(u); } catch(e) {} };
        loadUser();
        startNewRound();
    }, [startNewRound]);

    useEffect(() => {
        if (gameState !== 'running') return;
        
        const crashPoint = game.crash_point;
        
        const interval = setInterval(() => {
            setMultiplier(prev => {
                const nextMultiplier = prev + (0.01 * Math.pow(1.05, prev)); // Exponential growth
                if (nextMultiplier >= crashPoint) {
                    clearInterval(interval);
                    handleCrash(crashPoint);
                    return crashPoint;
                }
                return nextMultiplier;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [gameState, game]);
    
    const handleCrash = async (crashPoint) => {
        setGameState('crashed');
        await CrashGame.update(game.id, { status: 'crashed' });

        if (bet && !bet.cashed_out) {
            await CrashBet.update(bet.id, { win_amount: 0 }); // Mark as lost
        }

        setTimeout(startNewRound, 3000);
    };

    const handlePlaceBet = async () => {
        if (!user || betAmount <= 0 || user.wallet_balance < betAmount) {
            return alert("Invalid bet amount or insufficient balance.");
        }

        const newBalance = user.wallet_balance - betAmount;
        await User.updateMyUserData({ wallet_balance: newBalance });
        setUser(prev => ({...prev, wallet_balance: newBalance}));

        const newBet = await CrashBet.create({
            user_id: user.id,
            game_id: game.id,
            bet_amount: betAmount
        });
        setBet({...newBet, cashed_out: false});
    };

    const handleCashOut = async () => {
        if (!bet || bet.cashed_out) return;

        const winAmount = bet.bet_amount * multiplier;
        const newBalance = user.wallet_balance + winAmount;

        await User.updateMyUserData({ wallet_balance: newBalance });
        setUser(prev => ({...prev, wallet_balance: newBalance}));
        
        await CrashBet.update(bet.id, {
            cash_out_at: multiplier,
            win_amount: winAmount
        });

        setBet(prev => ({...prev, cashed_out: true, winAmount }));
    };

    const renderButton = () => {
        if (gameState === 'betting') {
            if (bet) {
                return <Button disabled className="w-full h-16 text-xl">Waiting for next round...</Button>;
            }
            return <Button onClick={handlePlaceBet} className="w-full h-16 text-xl bg-blue-600 hover:bg-blue-700">Place Bet (₹{betAmount})</Button>;
        }

        if (gameState === 'running') {
            if (!bet) {
                 return <Button disabled className="w-full h-16 text-xl">--</Button>;
            }
            if (bet.cashed_out) {
                return <Button disabled className="w-full h-16 text-xl bg-gray-500">Cashed Out @ {bet.cash_out_at.toFixed(2)}x (+₹{bet.winAmount.toFixed(2)})</Button>;
            }
            return <Button onClick={handleCashOut} className="w-full h-16 text-xl bg-green-600 hover:bg-green-700">Cash Out (₹{(bet.bet_amount * multiplier).toFixed(2)})</Button>;
        }

        return <Button disabled className="w-full h-16 text-xl bg-red-600">Crashed</Button>;
    }

    return (
        <div className="min-h-screen p-4 lg:p-8">
            <div className="max-w-5xl mx-auto">
                <Card className="bg-slate-800/50 border-slate-700/50 mb-6 text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2 text-3xl">
                           <Rocket /> SkyBlast: Crash & Cash
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-around items-center">
                         <div className="flex items-center gap-2 text-green-400"><Wallet size={20}/> ₹{user?.wallet_balance?.toFixed(2) || '0.00'}</div>
                         {gameState === 'betting' && <Badge className="bg-blue-500/20 text-blue-300">Betting open...</Badge>}
                         {gameState === 'running' && <Badge className="bg-green-500/20 text-green-300">Rocket is flying!</Badge>}
                         {gameState === 'crashed' && <Badge className="bg-red-500/20 text-red-300">Round Over</Badge>}
                    </CardContent>
                </Card>

                <GameScreen multiplier={multiplier} gameState={gameState} />
                
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-4">
                        <Card className="bg-slate-800/50 border-slate-700/50">
                            <CardHeader><CardTitle className="text-white">Bet Controls</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-gray-300">Bet Amount</Label>
                                    <Input 
                                        type="number" 
                                        value={betAmount} 
                                        onChange={e => setBetAmount(Number(e.target.value))} 
                                        disabled={!!bet}
                                        className="bg-slate-700 border-slate-600 text-white mt-2"
                                    />
                                </div>
                                {renderButton()}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <Card className="bg-slate-800/50 border-slate-700/50">
                           <CardHeader><CardTitle className="text-white flex items-center gap-2"><History/> Crash History</CardTitle></CardHeader>
                           <CardContent>
                               <div className="flex gap-2 flex-wrap">
                                   {history.map(g => (
                                       <Badge key={g.id} className={`text-lg ${g.crash_point < 2 ? 'bg-red-500/80' : g.crash_point < 10 ? 'bg-blue-500/80' : 'bg-yellow-500/80'}`}>
                                           {g.crash_point.toFixed(2)}x
                                       </Badge>
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
