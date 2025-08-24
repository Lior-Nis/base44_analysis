import React, { useState, useEffect } from 'react';
import { User, SpinWinGame } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, History, RotateCw, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const segments = [
    { value: 0.5, label: '0.5x', color: '#718096' },
    { value: 1.5, label: '1.5x', color: '#48BB78' },
    { value: 0, label: 'Lose', color: '#E53E3E' },
    { value: 2, label: '2x', color: '#38B2AC' },
    { value: 0.5, label: '0.5x', color: '#718096' },
    { value: 5, label: '5x', color: '#D69E2E' },
    { value: 0, label: 'Lose', color: '#E53E3E' },
    { value: 1.5, label: '1.5x', color: '#48BB78' },
    { value: 10, label: '10x', color: '#805AD5' },
    { value: 0.5, label: '0.5x', color: '#718096' },
    { value: 2, label: '2x', color: '#38B2AC' },
    { value: 0, label: 'Lose', color: '#E53E3E' },
];

export default function SpinToWinPage() {
    const [user, setUser] = useState(null);
    const [betAmount, setBetAmount] = useState(10);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const userData = await User.me();
                setUser(userData);
                const pastSpins = await SpinWinGame.filter({user_id: userData.id}, '-created_date', 5);
                setHistory(pastSpins);
            } catch (e) {}
        };
        loadData();
    }, []);

    const handleSpin = async () => {
        if (isSpinning || !user) return;
        if (betAmount > user.wallet_balance) return alert("Insufficient balance.");

        setIsSpinning(true);
        setResult(null);
        
        const newBalance = user.wallet_balance - betAmount;
        await User.updateMyUserData({ wallet_balance: newBalance });
        setUser(prev => ({ ...prev, wallet_balance: newBalance }));

        const winningIndex = Math.floor(Math.random() * segments.length);
        const winningSegment = segments[winningIndex];
        const extraRounds = Math.floor(Math.random() * 3) + 3;
        const finalRotation = (extraRounds * 360) + (winningIndex * (360 / segments.length)) - rotation % 360;
        
        setRotation(rotation + finalRotation);

        setTimeout(async () => {
            const winAmount = betAmount * winningSegment.value;
            setResult(winningSegment);
            
            if (winAmount > 0) {
                const finalBalance = newBalance + winAmount;
                await User.updateMyUserData({ wallet_balance: finalBalance });
                setUser(prev => ({...prev, wallet_balance: finalBalance}));
            }

            const spinRecord = await SpinWinGame.create({
                user_id: user.id,
                bet_amount: betAmount,
                result_segment: winningSegment.label,
                win_amount: winAmount
            });
            
            setHistory(prev => [spinRecord, ...prev.slice(0, 4)]);
            setIsSpinning(false);
        }, 4000);
    };

    const segmentAngle = 360 / segments.length;

    return (
        <div className="min-h-screen p-4 lg:p-8 bg-slate-900 text-white">
            <div className="max-w-4xl mx-auto">
                <Card className="bg-slate-800/50 border-slate-700/50 mb-6">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <RotateCw className="text-lime-400" /> Spin & Win
                        </CardTitle>
                        <div className="flex items-center gap-2 text-green-400">
                            <Wallet size={20} /> ₹{user?.wallet_balance || 0}
                        </div>
                    </CardHeader>
                </Card>
                
                <div className="relative w-96 h-96 mx-auto my-8">
                    <div 
                        className="absolute w-full h-full rounded-full transition-transform duration-[4000ms] ease-out"
                        style={{ transform: `rotate(${rotation}deg)` }}
                    >
                        {segments.map((segment, i) => (
                            <div 
                                key={i}
                                className="absolute w-1/2 h-1/2 origin-bottom-right"
                                style={{
                                    transform: `rotate(${i * segmentAngle}deg)`,
                                    clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 0)`
                                }}
                            >
                                <div className="w-full h-full flex items-center justify-start pl-4 text-white font-bold" style={{ backgroundColor: segment.color, transform: 'rotate(15deg)' }}>
                                    <span>{segment.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white border-4 border-slate-400"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-b-yellow-400"></div>
                </div>

                {result && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center my-4">
                        <h2 className="text-3xl font-bold">You landed on <span style={{color: result.color}}>{result.label}</span>!</h2>
                        <p className="text-xl">You won ₹{betAmount * result.value}</p>
                    </motion.div>
                )}

                <div className="text-center space-y-4">
                     <div>
                        <label className="text-gray-400">Bet Amount (₹)</label>
                        <Input type="number" value={betAmount} onChange={e => setBetAmount(Number(e.target.value))} className="bg-slate-700 border-slate-600 text-center w-40 mx-auto mt-2" min="10"/>
                    </div>
                    <Button onClick={handleSpin} disabled={isSpinning} size="lg" className="w-64 h-16 text-2xl bg-gradient-to-r from-lime-500 to-green-600 hover:opacity-90">
                        {isSpinning ? 'Spinning...' : 'SPIN'}
                    </Button>
                </div>

                <Card className="bg-slate-800/50 border-slate-700/50 mt-8">
                    <CardHeader><CardTitle className="flex items-center gap-2"><History /> Recent Spins</CardTitle></CardHeader>
                    <CardContent>
                        {history.map(spin => (
                            <div key={spin.id} className="flex justify-between items-center p-2 border-b border-slate-700">
                                <div>Bet: <span className="font-bold">₹{spin.bet_amount}</span></div>
                                <div>Result: <span className="font-bold">{spin.result_segment}</span></div>
                                <div className={spin.win_amount > 0 ? "text-green-400" : "text-red-400"}>Win: <span className="font-bold">₹{spin.win_amount}</span></div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}