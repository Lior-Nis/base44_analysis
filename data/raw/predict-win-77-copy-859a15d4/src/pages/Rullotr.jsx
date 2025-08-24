
import React, { useState, useEffect, useCallback } from 'react';
import { User, RullotrGame, RullotrBet } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from "@/components/ui/label"; // Added this import
import { Disc, Wallet, History, Timer, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WHEEL_SEGMENTS = 20;
const SEGMENT_COLORS = { red: '#ef4444', green: '#22c55e', blue: '#3b82f6'};
const SEGMENTS_CONFIG = Array.from({length: WHEEL_SEGMENTS}, (_, i) => ({
    number: i + 1,
    color: i % 3 === 0 ? 'red' : i % 3 === 1 ? 'green' : 'blue'
}));

const Wheel = ({ rotation }) => (
    <div className="relative w-80 h-80 rounded-full border-8 border-yellow-400 overflow-hidden shadow-2xl">
        <div 
            className="absolute w-full h-full transition-transform duration-[4000ms] ease-out"
            style={{ transform: `rotate(${rotation}deg)` }}
        >
            {SEGMENTS_CONFIG.map((seg, i) => (
                <div 
                    key={i} 
                    className="absolute w-1/2 h-1/2 origin-bottom-right flex items-center justify-end"
                    style={{ 
                        transform: `rotate(${i * (360 / WHEEL_SEGMENTS)}deg)`,
                        backgroundColor: SEGMENT_COLORS[seg.color]
                    }}
                >
                    <span className="transform -rotate-90 text-white font-bold mr-4">{seg.number}</span>
                </div>
            ))}
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-yellow-400"></div>
    </div>
);

export default function RullotrPage() {
    const [user, setUser] = useState(null);
    const [betAmount, setBetAmount] = useState(10);
    const [userBets, setUserBets] = useState([]);
    const [gameState, setGameState] = useState('betting');
    const [game, setGame] = useState(null);
    const [result, setResult] = useState(null);
    const [rotation, setRotation] = useState(0);
    const [history, setHistory] = useState([]);
    const [timeLeft, setTimeLeft] = useState(15);
    
    const startNewRound = useCallback(async () => {
        setGameState('betting');
        setResult(null);
        setUserBets([]);
        setTimeLeft(15);
        const newGame = await RullotrGame.create({ game_number: `RUL-${Date.now()}` });
        setGame(newGame);
    }, []);

    useEffect(() => {
        const init = async () => {
            try {
                const userData = await User.me();
                setUser(userData);
                const recentGames = await RullotrGame.filter({status: "completed"}, "-created_date", 10);
                setHistory(recentGames);
                startNewRound();
            } catch(e) {
                // Handle error, e.g., show a message or redirect to login
                console.error("Initialization failed:", e);
            }
        };
        init();
    }, [startNewRound]);

    useEffect(() => {
        if(gameState !== 'betting' || timeLeft <= 0) {
            if(timeLeft <= 0) spinWheel();
            return;
        }
        const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [gameState, timeLeft]);
    
    const placeBet = async (type, value) => {
        if(gameState !== 'betting' || betAmount <= 0) return;
        if(betAmount > (user?.wallet_balance || 0)) {
            alert("Insufficient balance.");
            return;
        }
        if (!user || !game) {
            alert("User or game not loaded yet. Please wait.");
            return;
        }
        
        try {
            const newBalance = user.wallet_balance - betAmount;
            await User.updateMyUserData({ wallet_balance: newBalance });
            setUser(prev => ({...prev, wallet_balance: newBalance}));

            const newBet = {
                user_id: user.id,
                game_id: game.id,
                bet_type: type,
                bet_value: value.toString(),
                bet_amount: betAmount
            };
            const createdBet = await RullotrBet.create(newBet);
            setUserBets(prev => [...prev, createdBet]);
        } catch (error) {
            console.error("Error placing bet:", error);
            alert("Failed to place bet. Please try again.");
            // Optionally revert balance if bet creation fails
            setUser(prev => ({...prev, wallet_balance: prev.wallet_balance + betAmount}));
        }
    };

    const spinWheel = async () => {
        setGameState('spinning');
        
        // Ensure game is available before proceeding
        if (!game) {
            console.error("No active game to spin for.");
            startNewRound(); // Attempt to start a new round if game is missing
            return;
        }

        const winningSegmentIndex = Math.floor(Math.random() * WHEEL_SEGMENTS);
        const winningSegment = SEGMENTS_CONFIG[winningSegmentIndex];
        
        // Calculate rotation for the wheel
        const currentRotation = rotation; // Get the current wheel rotation
        const baseFullSpins = 5; // Ensure at least 5 full spins
        const segmentAngle = 360 / WHEEL_SEGMENTS;
        const targetAngleWithinSegment = segmentAngle / 2; // Land in the middle of the segment
        const angleToWinSegment = winningSegmentIndex * segmentAngle;
        
        // The total degrees to rotate
        const newTotalRotation = currentRotation + (baseFullSpins * 360) + (360 - angleToWinSegment + targetAngleWithinSegment);

        setRotation(newTotalRotation);

        // Wait for the animation to complete
        await new Promise(resolve => setTimeout(resolve, 4000));

        try {
            await RullotrGame.update(game.id, {
                winning_number: winningSegment.number,
                winning_color: winningSegment.color,
                status: 'completed'
            });

            // Payout logic
            // Fetch all bets for the current game, not just user's
            const allBetsInRound = await RullotrBet.filter({game_id: game.id});
            
            let totalUserWin = 0;
            const payouts = { number: 20, color: 2, parity: 1.5, range: 2 };
            
            let userBetsInCurrentRound = allBetsInRound.filter(bet => bet.user_id === user?.id);
            let userBetAmountsInCurrentRound = userBetsInCurrentRound.reduce((acc, b) => acc + b.bet_amount, 0);

            for(const bet of allBetsInRound) { // Iterate over all bets for this game
                let isWin = false;
                switch(bet.bet_type) {
                    case 'number': isWin = parseInt(bet.bet_value) === winningSegment.number; break;
                    case 'color': isWin = bet.bet_value === winningSegment.color; break;
                    case 'parity': isWin = (winningSegment.number % 2 === 0 && bet.bet_value === 'even') || (winningSegment.number % 2 !== 0 && bet.bet_value === 'odd'); break;
                    case 'range': 
                        const [min, max] = bet.bet_value.split('-').map(Number);
                        isWin = winningSegment.number >= min && winningSegment.number <= max;
                        break;
                    default: break;
                }
                if(isWin) {
                    const winAmount = bet.bet_amount * payouts[bet.bet_type];
                    if (bet.user_id === user?.id) { // Only add to totalUserWin if it's the current user's bet
                        totalUserWin += winAmount;
                    }
                    await RullotrBet.update(bet.id, {status: 'won', win_amount: winAmount});
                } else {
                    await RullotrBet.update(bet.id, {status: 'lost'});
                }
            }
            
            // Update user's wallet balance if they won or lost
            if (user && userBetsInCurrentRound.length > 0) {
                const netChange = totalUserWin - userBetAmountsInCurrentRound;
                const finalBalance = user.wallet_balance + netChange;
                await User.updateMyUserData({ wallet_balance: finalBalance });
                setUser(prev => ({...prev, wallet_balance: finalBalance}));
            }

            setResult({ ...winningSegment, totalWin: totalUserWin });
            setGameState('result');
            // Update history with the result of the completed game
            setHistory(prev => [{number: winningSegment.number, color: winningSegment.color}, ...prev.slice(0, 9)]);
            
            // Start a new round after a delay
            setTimeout(() => startNewRound(), 5000);
        } catch (error) {
            console.error("Error during spin or payout:", error);
            // Even if an error occurs, try to start a new round
            setResult({ ...winningSegment, totalWin: 0, error: true }); // Indicate an error occurred
            setGameState('result');
            setHistory(prev => [{number: winningSegment.number, color: winningSegment.color}, ...prev.slice(0, 9)]);
            setTimeout(() => startNewRound(), 5000);
        }
    };
    
    return (
        <div className="min-h-screen p-4 lg:p-8 bg-slate-900 text-white">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
                {/* Game Area */}
                <div className="flex-grow flex flex-col items-center">
                    <div className="relative flex items-center justify-center my-8">
                        <Wheel rotation={rotation} />
                        <AnimatePresence>
                        {gameState === 'betting' && (
                            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute text-center">
                                <div className="text-6xl font-bold">{timeLeft}</div>
                                <p className="text-gray-300">Place your bets</p>
                            </motion.div>
                        )}
                        {gameState === 'result' && result && (
                            <motion.div initial={{scale:0}} animate={{scale:1}} className="absolute text-center bg-black/50 p-4 rounded-lg">
                                <div className="text-5xl font-bold" style={{color: SEGMENT_COLORS[result.color]}}>{result.number}</div>
                                {result.error ? (
                                    <p className="text-lg text-red-500">An error occurred during payout.</p>
                                ) : result.totalWin > 0 ? (
                                    <p className="text-lg text-green-400">You won ₹{result.totalWin.toFixed(2)}!</p>
                                ): (
                                    <p className="text-lg text-red-500">Better luck next time!</p>
                                )}
                            </motion.div>
                        )}
                        </AnimatePresence>
                    </div>
                    <div className="flex gap-2 mb-4">
                        {history.map((h, i) => (
                           <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{backgroundColor: SEGMENT_COLORS[h.color]}}>{h.number}</div>
                        ))}
                    </div>
                </div>
                {/* Betting Panel */}
                <Card className="w-full lg:w-96 bg-slate-800/50 border-slate-700/50">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Place Bets</span>
                            <span className="text-base text-green-400 flex items-center gap-2"><Wallet size={16}/> ₹{user?.wallet_balance?.toFixed(2) || 0}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div>
                            <Label>Bet Amount</Label>
                            <div className="flex gap-2 mt-1">
                                {[10,50,100,500].map(a => <Button key={a} size="sm" variant={betAmount === a ? "default" : "outline"} onClick={() => setBetAmount(a)}>₹{a}</Button>)}
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                           <Button onClick={() => placeBet('color', 'red')} className="bg-red-500 hover:bg-red-600" disabled={gameState !== 'betting'}>Red (2x)</Button>
                           <Button onClick={() => placeBet('color', 'green')} className="bg-green-500 hover:bg-green-600" disabled={gameState !== 'betting'}>Green (2x)</Button>
                           <Button onClick={() => placeBet('color', 'blue')} className="bg-blue-500 hover:bg-blue-600" disabled={gameState !== 'betting'}>Blue (2x)</Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Button onClick={() => placeBet('parity', 'even')} variant="outline" disabled={gameState !== 'betting'}>Even (1.5x)</Button>
                            <Button onClick={() => placeBet('parity', 'odd')} variant="outline" disabled={gameState !== 'betting'}>Odd (1.5x)</Button>
                            <Button onClick={() => placeBet('range', '1-10')} variant="outline" disabled={gameState !== 'betting'}>1-10 (2x)</Button>
                            <Button onClick={() => placeBet('range', '11-20')} variant="outline" disabled={gameState !== 'betting'}>11-20 (2x)</Button>
                        </div>
                        <div>
                            <Label>Number (20x)</Label>
                            <div className="grid grid-cols-5 gap-1 mt-1">
                                {SEGMENTS_CONFIG.map(s => (
                                    <Button key={s.number} size="sm" variant="outline" onClick={() => placeBet('number', s.number)} disabled={gameState !== 'betting'}>{s.number}</Button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold mb-2 flex items-center gap-2"><Target size={16}/>Your Bets</h3>
                            <div className="space-y-1 text-sm max-h-24 overflow-y-auto">
                                {userBets.length === 0 ? (
                                    <p className="text-gray-400 text-center">No bets placed yet for this round.</p>
                                ) : (
                                    userBets.map((b,i) => (
                                        <div key={i} className="flex justify-between bg-slate-700/50 p-1 rounded">
                                            <span>{b.bet_type === 'number' ? `Num ${b.bet_value}` : b.bet_type === 'color' ? `Color ${b.bet_value}` : `${b.bet_value}`}</span>
                                            <span>₹{b.bet_amount}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
