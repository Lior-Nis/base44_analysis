import React, { useState, useEffect, useCallback } from 'react';
import { User, CarRouletteGame, CarRouletteBet } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car, Wallet, Timer } from 'lucide-react';
import { motion } from 'framer-motion';

const BRANDS = [ "Toyota", "Ford", "BMW", "Mercedes", "Honda", "Audi" ];
const COLORS = { "Toyota": "red", "Ford": "blue", "BMW": "black", "Mercedes": "silver", "Honda": "white", "Audi": "gray" };

export default function CarRoulettePage() {
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
        const newGame = await CarRouletteGame.create({ game_number: `CR-${Date.now()}`, status: 'betting' });
        setGame(newGame);
    }, []);

    useEffect(() => {
        const loadUser = async () => { try { const u = await User.me(); setUser(u); } catch(e) {} };
        loadUser();
        startNewRound();
    }, [startNewRound]);

    useEffect(() => {
        if (gameState !== 'betting' || timeLeft <= 0) {
            if (timeLeft <= 0 && gameState === 'betting') finishRound();
            return;
        }
        const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        return () => clearTimeout(timer);
    }, [gameState, timeLeft]);

    const placeBet = async (type, value) => {
        if (gameState !== 'betting') return;
        if (betAmount > (user?.wallet_balance || 0)) return alert("Insufficient balance.");
        
        const newBalance = user.wallet_balance - betAmount;
        await User.updateMyUserData({ wallet_balance: newBalance });
        setUser(prev => ({ ...prev, wallet_balance: newBalance }));
        setUserBets(prev => ([...prev, {type, value, amount: betAmount}]));
    };

    const finishRound = async () => {
        setGameState('spinning');
        const winning_brand = BRANDS[Math.floor(Math.random() * BRANDS.length)];
        const winning_color = COLORS[winning_brand];

        await CarRouletteGame.update(game.id, { winning_brand, winning_color, status: 'completed' });
        
        let totalWin = 0;
        for (const bet of userBets) {
            const betRecord = await CarRouletteBet.create({
                user_id: user.id,
                game_id: game.id,
                bet_type: bet.type,
                bet_value: bet.value,
                bet_amount: bet.amount
            });

            let isWin = false;
            let payoutRate = 0;
            if (bet.type === 'brand' && bet.value === winning_brand) { isWin = true; payoutRate = BRANDS.length; }
            if (bet.type === 'color' && bet.value === winning_color) { isWin = true; payoutRate = 3; }

            if (isWin) {
                const winAmount = bet.amount * payoutRate;
                totalWin += winAmount;
                await CarRouletteBet.update(betRecord.id, { status: 'won', win_amount: winAmount });
            } else {
                await CarRouletteBet.update(betRecord.id, { status: 'lost' });
            }
        }

        if (totalWin > 0) {
            const finalBalance = user.wallet_balance - userBets.reduce((sum, b) => sum + b.amount, 0) + totalWin;
            await User.updateMyUserData({ wallet_balance: finalBalance });
        }
        
        setResult({ winning_brand, winning_color });
        setTimeout(startNewRound, 5000);
    };

    return (
        <div className="min-h-screen p-4 lg:p-8 bg-slate-900 text-white">
            <div className="max-w-4xl mx-auto">
                <Card className="bg-slate-800/50 border-slate-700/50 mb-6 text-center">
                    <CardHeader><CardTitle className="flex items-center justify-center gap-2 text-3xl"><Car /> Car Roulette</CardTitle></CardHeader>
                    <CardContent className="flex justify-around items-center">
                        <div className="flex items-center gap-2 text-green-400"><Wallet size={20}/> ₹{user?.wallet_balance || 0}</div>
                        {gameState === 'betting' && <div className="flex items-center gap-2 text-yellow-400"><Timer size={20}/> {timeLeft}s</div>}
                    </CardContent>
                </Card>
                
                <div className="grid grid-cols-3 grid-rows-2 gap-4 mb-8 h-64">
                {BRANDS.map(brand => (
                    <motion.div key={brand} animate={{ scale: result?.winning_brand === brand ? 1.1 : 1, transition: { duration: 0.5 } }} className={`flex items-center justify-center rounded-lg border-4 ${result?.winning_brand === brand ? 'border-yellow-400 bg-yellow-400/20' : 'border-transparent'}`}>
                        <span className="text-2xl font-bold">{brand}</span>
                    </motion.div>
                ))}
                </div>

                <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <span className="text-lg">Bet: ₹</span>
                            <Input type="number" value={betAmount} onChange={e => setBetAmount(parseInt(e.target.value))} className="w-24 bg-slate-700 border-slate-600"/>
                        </div>
                        <div className="mb-4">
                            <h4 className="text-center mb-2 font-bold">Bet on Brand (6x Payout)</h4>
                            <div className="grid grid-cols-3 gap-2">
                                {BRANDS.map(brand => <Button key={brand} onClick={() => placeBet('brand', brand)} disabled={gameState !== 'betting'}>{brand}</Button>)}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-center mb-2 font-bold">Bet on Color (3x Payout)</h4>
                            <div className="grid grid-cols-3 gap-2">
                                {Object.values(COLORS).filter((v,i,a) => a.indexOf(v) === i).map(color => <Button key={color} onClick={() => placeBet('color', color)} disabled={gameState !== 'betting'} style={{textTransform: 'capitalize'}}>{color}</Button>)}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}