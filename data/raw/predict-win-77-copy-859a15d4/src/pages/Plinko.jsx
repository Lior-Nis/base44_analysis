import React, { useState, useEffect } from 'react';
import { User, PlinkoGame } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Droplets, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

const PlinkoPyramid = ({ rows = 8 }) => {
    return (
        <div className="relative flex flex-col items-center">
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex" style={{ marginLeft: `${i*1}rem`, marginRight: `${i*1}rem`}}>
            {Array.from({ length: i + 2 }).map((_, j) => (
                <div key={j} className="w-4 h-4 bg-gray-500 rounded-full m-2"></div>
            ))}
            </div>
        ))}
        </div>
    );
};

const MULTIPLIERS = {
    low: [10, 5, 2, 1.1, 1, 1.1, 2, 5, 10],
    medium: [20, 8, 3, 1.5, 0.5, 1.5, 3, 8, 20],
    high: [100, 25, 5, 1, 0.2, 1, 5, 25, 100],
};

export default function PlinkoPage() {
    const [user, setUser] = useState(null);
    const [betAmount, setBetAmount] = useState(10);
    const [risk, setRisk] = useState('medium');
    const [lastWin, setLastWin] = useState(null);
    const [isDropping, setIsDropping] = useState(false);

    useEffect(() => {
        const loadUser = async () => { try { const u = await User.me(); setUser(u); } catch(e) {} };
        loadUser();
    }, []);

    const handleDrop = async () => {
        if (isDropping) return;
        if (betAmount > (user?.wallet_balance || 0)) return alert("Insufficient balance.");
        
        setIsDropping(true);
        const newBalance = user.wallet_balance - betAmount;
        await User.updateMyUserData({ wallet_balance: newBalance });
        setUser(prev => ({ ...prev, wallet_balance: newBalance }));

        // Simulate drop
        let path = [];
        let position = Math.floor(MULTIPLIERS[risk].length / 2);
        for(let i=0; i<Object.keys(MULTIPLIERS).length; i++){
            const direction = Math.random() > 0.5 ? 1 : -1;
            position += direction;
            path.push(position);
        }
        position = Math.max(0, Math.min(MULTIPLIERS[risk].length - 1, position));

        const multiplier = MULTIPLIERS[risk][position];
        const winAmount = betAmount * multiplier;
        
        await PlinkoGame.create({
            user_id: user.id,
            bet_amount: betAmount,
            risk_level: risk,
            path,
            multiplier,
            win_amount: winAmount
        });

        if (winAmount > 0) {
            const finalBalance = newBalance + winAmount;
            await User.updateMyUserData({ wallet_balance: finalBalance });
            setUser(prev => ({...prev, wallet_balance: finalBalance }));
        }

        setLastWin(winAmount);
        setIsDropping(false);
    };

    return (
        <div className="min-h-screen p-4 lg:p-8 bg-slate-900 text-white flex items-center justify-center">
            <div className="w-full max-w-lg">
                <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader className="text-center">
                        <CardTitle className="flex items-center justify-center gap-2 text-3xl"><Droplets/> Plinko</CardTitle>
                        <p className="text-green-400 flex justify-center items-center gap-2"><Wallet size={16}/> ₹{user?.wallet_balance || 0}</p>
                    </CardHeader>
                    <CardContent>
                        <div className="relative mb-4">
                            <PlinkoPyramid />
                            {lastWin !== null && (
                                <motion.div initial={{opacity: 0, y: -50}} animate={{opacity: 1, y: 0}} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                                    <p className="text-4xl font-bold text-yellow-400">₹{lastWin.toFixed(2)}</p>
                                </motion.div>
                            )}
                        </div>
                        <div className="flex justify-center gap-2 mb-4">
                            {Object.keys(MULTIPLIERS).map(r => <Button key={r} onClick={() => setRisk(r)} variant={risk === r ? 'default' : 'outline'} className="capitalize">{r}</Button>)}
                        </div>
                        <div className="flex justify-center items-center gap-2 mb-4">
                            <span>Bet: ₹</span>
                            <Input type="number" value={betAmount} onChange={e => setBetAmount(parseInt(e.target.value))} className="w-24 bg-slate-700 border-slate-600"/>
                        </div>
                        <Button onClick={handleDrop} disabled={isDropping} className="w-full h-12 text-xl bg-purple-600 hover:bg-purple-700">
                            {isDropping ? 'Dropping...' : 'Drop'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}