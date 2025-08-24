import React, { useState, useEffect } from 'react';
import { User, CoinFlipBet } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, History } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HedsOrTelsPage() {
  const [user, setUser] = useState(null);
  const [betAmount, setBetAmount] = useState(10);
  const [choice, setChoice] = useState(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState(null);
  const [recentBets, setRecentBets] = useState([]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      const bets = await CoinFlipBet.filter({ user_id: userData.id }, '-created_date', 5);
      setRecentBets(bets);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleFlip = async (playerChoice) => {
    if (betAmount < 1) {
      alert("Bet amount must be at least ₹1.");
      return;
    }
    if (user.wallet_balance < betAmount) {
      alert("Insufficient balance.");
      return;
    }

    setIsFlipping(true);
    setResult(null);
    setChoice(playerChoice);

    const newBalance = user.wallet_balance - betAmount;
    await User.updateMyUserData({ wallet_balance: newBalance });
    setUser(prev => ({ ...prev, wallet_balance: newBalance }));
    
    const flipResult = Math.random() < 0.5 ? 'heads' : 'tails';
    const outcome = playerChoice === flipResult ? 'win' : 'loss';
    const winAmount = outcome === 'win' ? betAmount * 1.95 : 0;
    
    setTimeout(async () => {
      setResult(flipResult);

      if (outcome === 'win') {
        const finalBalance = newBalance + winAmount;
        await User.updateMyUserData({ wallet_balance: finalBalance });
        setUser(prev => ({ ...prev, wallet_balance: finalBalance }));
      }

      const betRecord = await CoinFlipBet.create({
        user_id: user.id,
        bet_amount: betAmount,
        choice: playerChoice,
        result: flipResult,
        outcome: outcome,
        win_amount: winAmount
      });
      setRecentBets(prev => [betRecord, ...prev.slice(0, 4)]);
      
      setIsFlipping(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="bg-slate-800/50 border-slate-700/50 text-white">
          <CardHeader className="text-center">
            <Coins className="w-12 h-12 mx-auto text-yellow-400 mb-4" />
            <CardTitle className="text-4xl font-bold">Heds or Tels</CardTitle>
            <p className="text-gray-400">Guess the coin flip to win 1.95x your bet!</p>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Game Arena */}
              <div className="flex flex-col items-center justify-center h-80 bg-slate-900/50 rounded-lg p-8 border border-purple-500/20">
                <motion.div
                  key={result}
                  animate={{ rotateY: isFlipping ? 1080 : 0 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="w-32 h-32 rounded-full flex items-center justify-center text-3xl font-bold border-4"
                  style={{
                    background: result ? (result === 'heads' ? 'linear-gradient(to right, #fde047, #fbbf24)' : 'linear-gradient(to right, #9ca3af, #6b7280)') : 'linear-gradient(to right, #4f46e5, #7c3aed)',
                    borderColor: result ? (result === 'heads' ? '#ca8a04' : '#4b5563') : '#312e81'
                  }}
                >
                  {result ? result.toUpperCase() : '?'}
                </motion.div>
                {result && !isFlipping && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    className={`mt-4 text-2xl font-bold ${choice === result ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {choice === result ? `You Won ₹${(betAmount * 1.95).toFixed(2)}!` : 'You Lost!'}
                  </motion.div>
                )}
              </div>

              {/* Controls */}
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-slate-700/50">
                  <p className="text-sm text-gray-400">Your Balance</p>
                  <p className="text-2xl font-bold text-green-400">₹{user?.wallet_balance?.toFixed(2) || '0.00'}</p>
                </div>

                <div>
                  <label className="text-gray-400">Bet Amount</label>
                  <Input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    min="1"
                    className="bg-slate-700 border-slate-600 text-white mt-2"
                  />
                  <div className="flex gap-2 mt-2">
                    {[10, 50, 100, 500].map(amount => (
                      <Button key={amount} size="sm" variant="outline" className="border-slate-600 text-gray-300" onClick={() => setBetAmount(amount)}>₹{amount}</Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={() => handleFlip('heads')} disabled={isFlipping} className="h-16 text-xl bg-yellow-500 hover:bg-yellow-600 text-black">HEADS</Button>
                  <Button onClick={() => handleFlip('tails')} disabled={isFlipping} className="h-16 text-xl bg-gray-500 hover:bg-gray-600 text-white">TAILS</Button>
                </div>
              </div>
            </div>

            {/* Recent Bets */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-blue-400" />
                Your Recent Flips
              </h3>
              <div className="space-y-2">
                {recentBets.map(bet => (
                  <div key={bet.id} className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg text-sm">
                    <div>
                      <span className="text-gray-400">Bet: </span><span className="font-bold">₹{bet.bet_amount}</span>
                      <span className="text-gray-400"> | Chose: </span><span className="font-bold capitalize">{bet.choice}</span>
                      <span className="text-gray-400"> | Result: </span><span className="font-bold capitalize">{bet.result}</span>
                    </div>
                    <Badge className={bet.outcome === 'win' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>
                      {bet.outcome === 'win' ? `+₹${bet.win_amount.toFixed(2)}` : `-₹${bet.bet_amount}`}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}