
import React, { useState, useEffect } from 'react';
import { User, KenoGame } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

export default function KenoPage() {
  const [user, setUser] = useState(null);
  const [bet, setBet] = useState(10);
  const [pickedNumbers, setPickedNumbers] = useState([]);
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [hits, setHits] = useState(0);
  const [gameState, setGameState] = useState('picking'); // picking, drawing, result
  const [message, setMessage] = useState('Pick up to 10 numbers.');

  useEffect(() => { User.me().then(setUser); }, []);

  const toggleNumber = (num) => {
    if (gameState !== 'picking') return;
    if (pickedNumbers.includes(num)) {
      setPickedNumbers(pickedNumbers.filter(n => n !== num));
    } else if (pickedNumbers.length < 10) {
      setPickedNumbers([...pickedNumbers, num]);
    }
  };

  const handlePlay = async () => {
    if (pickedNumbers.length === 0) {
      setMessage('You must pick at least one number.');
      return;
    }
    if (user.wallet_balance < bet) {
      setMessage('Insufficient funds.');
      return;
    }

    setGameState('drawing');
    setMessage('Drawing numbers...');
    setDrawnNumbers([]);
    
    const allNumbers = Array.from({length: 80}, (_, i) => i + 1);
    allNumbers.sort(() => Math.random() - 0.5);
    const winningNumbers = allNumbers.slice(0, 20);

    // Animate drawing
    for (let i = 0; i < 20; i++) {
      await new Promise(res => setTimeout(res, 100));
      setDrawnNumbers(prev => [...prev, winningNumbers[i]]);
    }
    
    const userHits = pickedNumbers.filter(n => winningNumbers.includes(n)).length;
    setHits(userHits);
    
    const winMultiplier = getKenoPayout(pickedNumbers.length, userHits);
    const winAmount = bet * winMultiplier;
    
    await KenoGame.create({
      user_id: user.id, bet_amount: bet, picked_numbers: pickedNumbers,
      drawn_numbers: winningNumbers, matches: userHits, win_amount: winAmount
    });
    
    const newBalance = user.wallet_balance - bet + winAmount;
    await User.updateMyUserData({ wallet_balance: newBalance });
    setUser(prev => ({...prev, wallet_balance: newBalance}));

    if (winAmount > 0) setMessage(`You matched ${userHits} numbers and won ₹${winAmount}!`);
    else setMessage(`You matched ${userHits} numbers. No win.`);
    
    setGameState('result');
  };

  const getKenoPayout = (pickedCount, hitCount) => {
    // Simplified payout table
    const payouts = {
      1: { 1: 2 },
      2: { 2: 10 },
      3: { 2: 2, 3: 20 },
      4: { 2: 1, 3: 5, 4: 50 },
      5: { 3: 2, 4: 10, 5: 100 },
      6: { 3: 1, 4: 5, 5: 50, 6: 200 },
      7: { 4: 2, 5: 20, 6: 100, 7: 500 },
      8: { 5: 10, 6: 50, 7: 200, 8: 1000 },
      9: { 5: 5, 6: 20, 7: 100, 8: 500, 9: 2000 },
      10: { 5: 2, 6: 10, 7: 50, 8: 200, 9: 1000, 10: 5000 },
    };
    return payouts[pickedCount]?.[hitCount] || 0;
  };

  const resetGame = () => {
    setGameState('picking');
    setPickedNumbers([]);
    setDrawnNumbers([]);
    setMessage('Pick up to 10 numbers.');
  }

  const numberGrid = Array.from({length: 80}, (_, i) => i + 1);

  return (
    <div className="min-h-screen p-4 lg:p-8 bg-indigo-900 bg-cover" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')"}}>
      <div className="max-w-4xl mx-auto">
        <Card className="bg-black/40 border-yellow-400/30 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-serif text-yellow-300">Keno</CardTitle>
            <p className="text-gray-300">Pick your lucky numbers and win big!</p>
            <div className="mt-2 text-lg">Wallet: <span className="font-bold text-green-400">₹{user?.wallet_balance.toFixed(2)}</span></div>
          </CardHeader>
          <CardContent>
            {/* Keno Board */}
            <div className="grid grid-cols-10 gap-2 bg-indigo-800/50 p-4 rounded-lg">
              {numberGrid.map(num => {
                const isPicked = pickedNumbers.includes(num);
                const isDrawn = drawnNumbers.includes(num);
                const isHit = isPicked && isDrawn;
                let bgClass = 'bg-slate-700 hover:bg-slate-600';
                if(isPicked) bgClass = 'bg-blue-600';
                if(isDrawn) bgClass = 'bg-yellow-500 animate-pulse';
                if(isHit) bgClass = 'bg-green-500 animate-bounce';

                return (
                  <button key={num} onClick={() => toggleNumber(num)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${bgClass}`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            {/* Message & Controls */}
            <div className="text-center text-2xl font-bold my-4 text-yellow-200 h-8">{message}</div>
            <div className="flex flex-col items-center gap-4 mt-6">
              <div className="flex items-center gap-2">
                <Label>Bet Amount:</Label>
                <Input type="number" value={bet} onChange={e => setBet(Number(e.target.value))} className="w-24 bg-slate-800 border-slate-600" />
                <Badge variant="secondary">Picks: {pickedNumbers.length}/10</Badge>
                {gameState === 'result' && <Badge variant="destructive">Hits: {hits}</Badge>}
              </div>

              {gameState === 'picking' && <Button onClick={handlePlay} disabled={pickedNumbers.length === 0} className="bg-green-600 hover:bg-green-700 px-12 py-6 text-xl">Play</Button>}
              {gameState === 'drawing' && <div className="text-xl text-yellow-300">Drawing...</div>}
              {gameState === 'result' && <Button onClick={resetGame} className="bg-blue-600 hover:bg-blue-700 px-12 py-6 text-xl">Play Again</Button>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
