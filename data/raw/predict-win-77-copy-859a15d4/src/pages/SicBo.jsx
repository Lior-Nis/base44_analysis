import React, { useState, useEffect } from 'react';
import { User, SicBoGame, SicBoBet } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dices, DollarSign } from 'lucide-react';

const Dice = ({ value }) => (
  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-4xl font-bold text-slate-800 border-4 border-slate-300 shadow-inner">
    {value}
  </div>
);

export default function SicBoPage() {
  const [user, setUser] = useState(null);
  const [betAmount, setBetAmount] = useState(10);
  const [bets, setBets] = useState({}); // e.g., { small: 10, sum_8: 20 }
  const [dice, setDice] = useState([1, 2, 3]);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    User.me().then(setUser);
  }, []);

  const placeBet = (betType, betValue) => {
    const key = betValue ? `${betType}_${betValue}` : betType;
    setBets(prev => ({ ...prev, [key]: (prev[key] || 0) + betAmount }));
  };

  const handleRoll = async () => {
    setIsLoading(true);
    setResult(null);

    const totalBet = Object.values(bets).reduce((sum, amount) => sum + amount, 0);
    if (totalBet === 0) {
      alert("Please place a bet.");
      setIsLoading(false);
      return;
    }
    if (user.wallet_balance < totalBet) {
      alert("Insufficient funds.");
      setIsLoading(false);
      return;
    }

    // Deduct total bet
    const newBalance = user.wallet_balance - totalBet;
    await User.updateMyUserData({ wallet_balance: newBalance });
    setUser(prev => ({ ...prev, wallet_balance: newBalance }));

    // Simulate dice roll
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const d3 = Math.floor(Math.random() * 6) + 1;
    setDice([d1, d2, d3]);
    
    // TODO: In a real app, this logic would be on the backend
    const sum = d1 + d2 + d3;
    const isTriple = d1 === d2 && d2 === d3;
    let totalWin = 0;

    // Calculate winnings
    for (const [key, amount] of Object.entries(bets)) {
      const [type, value] = key.split('_');
      let win = 0;
      if (type === 'small' && !isTriple && sum >= 4 && sum <= 10) win = amount * 2;
      if (type === 'big' && !isTriple && sum >= 11 && sum <= 17) win = amount * 2;
      if (type === 'sum' && sum === parseInt(value)) win = amount * 8; // simplified odds
      // Add more win conditions here...

      totalWin += win;
    }

    setResult({ sum, isTriple, totalWin });

    if (totalWin > 0) {
      const finalBalance = newBalance + totalWin;
      await User.updateMyUserData({ wallet_balance: finalBalance });
      setUser(prev => ({ ...prev, wallet_balance: finalBalance }));
    }

    setBets({});
    setIsLoading(false);
  };
  
  return (
    <div className="min-h-screen p-4 lg:p-8 bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold text-yellow-400 flex items-center justify-center gap-3">
              <Dices /> Sic Bo
            </CardTitle>
            <p className="text-gray-400">Balance: ₹{user?.wallet_balance || 0}</p>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center gap-4 h-24 my-8">
              <Dice value={dice[0]} />
              <Dice value={dice[1]} />
              <Dice value={dice[2]} />
            </div>

            {result && (
              <div className="text-center my-4 p-4 bg-slate-700/50 rounded-lg">
                <p className="text-2xl">Total: {result.sum}</p>
                {result.isTriple && <p className="text-yellow-400">TRIPLE!</p>}
                <p className={`text-2xl font-bold ${result.totalWin > 0 ? 'text-green-400' : 'text-red-500'}`}>
                  {result.totalWin > 0 ? `You Won ₹${result.totalWin}` : 'You Lost'}
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={() => placeBet('small')} className="h-24 text-2xl bg-blue-600 hover:bg-blue-700">Small <br/> (4-10)</Button>
                <Button onClick={() => placeBet('big')} className="h-24 text-2xl bg-red-600 hover:bg-red-700">Big <br/> (11-17)</Button>
              </div>
              <p className="text-center text-sm text-gray-400">Total Sum Bets</p>
              <div className="grid grid-cols-7 gap-2">
                {[...Array(14)].map((_, i) => {
                  const sum = i + 4;
                  return <Button key={sum} onClick={() => placeBet('sum', sum)} variant="outline">{sum}</Button>
                })}
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center p-4 bg-slate-900 rounded-lg">
              <div>
                <span className="text-gray-400">Bet Amount:</span>
                <Input type="number" value={betAmount} onChange={e => setBetAmount(Number(e.target.value))} className="w-24 ml-2 bg-slate-700" />
              </div>
              <div className="text-right">
                <p>Total Bet: <span className="font-bold text-yellow-400">₹{Object.values(bets).reduce((s, a) => s + a, 0)}</span></p>
              </div>
              <Button onClick={handleRoll} disabled={isLoading} size="lg" className="bg-green-600 hover:bg-green-700 text-lg font-bold">
                <Dices className="mr-2"/>
                {isLoading ? "Rolling..." : "Roll Dice"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}