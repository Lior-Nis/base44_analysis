import React, { useState } from 'react';
import { User, JhandiMundaGame } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, DollarSign, Crown, Heart, Spade, Club, Diamond } from 'lucide-react';

const symbols = [
  { name: 'spade', icon: Spade, color: 'text-gray-400' },
  { name: 'club', icon: Club, color: 'text-green-400' },
  { name: 'diamond', icon: Diamond, color: 'text-blue-400' },
  { name: 'heart', icon: Heart, color: 'text-red-400' },
  { name: 'crown', icon: Crown, color: 'text-yellow-400' },
  { name: 'flag', icon: Dices, color: 'text-orange-400' }, // Using Dices for Flag
];

export default function JhandiMundaPage() {
  const [user, setUser] = useState(null);
  const [betAmount, setBetAmount] = useState(10);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [diceResults, setDiceResults] = useState([]);
  const [result, setResult] = useState(null);
  const [isRolling, setIsRolling] = useState(false);

  React.useEffect(() => {
    User.me().then(setUser).catch(() => setUser(null));
  }, []);

  const handleRoll = async () => {
    if (!user) return alert('Please log in to play.');
    if (!selectedSymbol) return alert('Please select a symbol to bet on.');
    if (betAmount <= 0) return alert('Please enter a valid bet amount.');
    if (user.wallet_balance < betAmount) return alert('Insufficient balance.');

    setIsRolling(true);
    setResult(null);

    // Deduct bet amount
    const newBalance = user.wallet_balance - betAmount;
    await User.updateMyUserData({ wallet_balance: newBalance });
    setUser(prev => ({...prev, wallet_balance: newBalance}));

    // Simulate dice roll
    const newDiceResults = Array.from({ length: 6 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
    
    setTimeout(() => {
        setDiceResults(newDiceResults);

        const counts = newDiceResults.reduce((acc, die) => {
            acc[die.name] = (acc[die.name] || 0) + 1;
            return acc;
        }, {});

        const winCount = counts[selectedSymbol] || 0;
        let winAmount = 0;

        if (winCount > 0) {
            winAmount = betAmount + (betAmount * winCount);
            const finalBalance = newBalance + winAmount;
            User.updateMyUserData({ wallet_balance: finalBalance });
            setUser(prev => ({...prev, wallet_balance: finalBalance}));
            setResult({ outcome: 'win', amount: winAmount });
        } else {
            setResult({ outcome: 'loss', amount: 0 });
        }

        JhandiMundaGame.create({
            user_id: user.id,
            bet_amount: betAmount,
            bet_on_symbol: selectedSymbol,
            dice_results: newDiceResults.map(d => d.name),
            winning_symbol: winCount > 0 ? selectedSymbol : 'none',
            win_amount: winAmount
        });

        setIsRolling(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen p-4 lg:p-8 flex items-center justify-center">
      <Card className="w-full max-w-2xl bg-slate-800/50 border-slate-700/50 text-white">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold flex items-center justify-center gap-2">
            <Dices className="w-8 h-8 text-yellow-400" />
            Jhandi Munda
          </CardTitle>
          <p className="text-center text-gray-400">Bet on the symbol that will appear the most!</p>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-slate-700/50 rounded-lg text-center">
            <h3 className="text-lg font-semibold">Your Bet</h3>
            <div className="flex items-center justify-center gap-2 my-2">
                <DollarSign className="w-6 h-6 text-green-400"/>
                <Input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    className="w-32 bg-slate-800 border-slate-600 text-center text-lg"
                />
            </div>
             <p className="text-xs text-gray-400">Wallet: ₹{user?.wallet_balance?.toFixed(2) || 0}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-center text-lg font-semibold mb-4">Choose Your Symbol</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {symbols.map(symbol => {
                const SymbolIcon = symbol.icon;
                return (
                  <button
                    key={symbol.name}
                    onClick={() => setSelectedSymbol(symbol.name)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      selectedSymbol === symbol.name
                        ? 'border-yellow-400 bg-yellow-400/20'
                        : 'border-slate-600 bg-slate-700/50 hover:bg-slate-700'
                    }`}
                  >
                    <SymbolIcon className={`w-12 h-12 mx-auto ${symbol.color}`} />
                    <p className="mt-2 text-sm capitalize">{symbol.name}</p>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="text-center mb-6">
            <Button onClick={handleRoll} disabled={isRolling || !selectedSymbol} size="lg" className="bg-green-600 hover:bg-green-700 w-full">
              {isRolling ? 'Rolling...' : 'Roll Dice'}
            </Button>
          </div>

          <AnimatePresence>
            {diceResults.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-slate-900/50 rounded-lg"
                >
                    <h3 className="text-center text-lg font-semibold mb-4">Results</h3>
                    <div className="flex justify-center gap-4 flex-wrap">
                    {diceResults.map((die, index) => {
                        const DieIcon = die.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ scale: 0, rotate: 180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: index * 0.1, type: 'spring' }}
                                className="w-16 h-16 bg-white rounded-lg flex items-center justify-center"
                            >
                                <DieIcon className={`w-10 h-10 ${die.color}`} />
                            </motion.div>
                        )
                    })}
                    </div>
                </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {result && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`mt-6 p-4 rounded-lg text-center font-bold text-lg ${
                        result.outcome === 'win' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}
                >
                    {result.outcome === 'win' ? `You Won ₹${result.amount.toFixed(2)}!` : 'You Lost! Better luck next time.'}
                </motion.div>
            )}
          </AnimatePresence>

        </CardContent>
      </Card>
    </div>
  );
}