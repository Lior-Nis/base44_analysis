
import React, { useState, useEffect } from 'react';
import { User, VideoPokerGame } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Spade, Heart, Diamond, Club } from 'lucide-react';

const cardRanks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const cardSuits = ['S', 'H', 'D', 'C'];
const paytable = {
  'Royal Flush': 800, 'Straight Flush': 50, 'Four of a Kind': 25,
  'Full House': 9, 'Flush': 6, 'Straight': 4, 'Three of a Kind': 3,
  'Two Pair': 2, 'Jacks or Better': 1,
};

const CardComponent = ({ card, onHold, isHeld }) => {
  const rank = card.slice(0, -1);
  const suit = card.slice(-1);
  const suitIcons = { S: <Spade />, H: <Heart />, D: <Diamond />, C: <Club /> };
  const suitColor = ['H', 'D'].includes(suit) ? 'text-red-500' : 'text-white';

  return (
    <div className={`relative w-28 h-40 bg-slate-700 rounded-lg p-2 flex flex-col justify-between border-4 shadow-lg cursor-pointer transition-all ${isHeld ? 'border-yellow-400 -translate-y-2' : 'border-slate-600'}`} onClick={onHold}>
      <div className={`text-3xl font-bold ${suitColor}`}>{rank === 'T' ? '10' : rank}</div>
      <div className={`text-3xl self-center ${suitColor}`}>{suitIcons[suit]}</div>
      {isHeld && <div className="absolute top-1 right-1 text-yellow-300 font-bold text-sm">HELD</div>}
    </div>
  );
};

export default function VideoPokerPage() {
  const [user, setUser] = useState(null);
  const [bet, setBet] = useState(5);
  const [hand, setHand] = useState(Array(5).fill(''));
  const [held, setHeld] = useState(Array(5).fill(false));
  const [gameState, setGameState] = useState('deal'); // deal, draw, result
  const [message, setMessage] = useState('Set your bet and deal.');
  const [deck, setDeck] = useState([]);

  useEffect(() => { User.me().then(setUser); createNewDeck(); }, []);

  const createNewDeck = () => {
    let newDeck = [];
    for (const suit of cardSuits) for (const rank of cardRanks) newDeck.push(rank + suit);
    setDeck(newDeck.sort(() => Math.random() - 0.5));
  };
  
  const handleDeal = async () => {
    if (user.wallet_balance < bet) {
      setMessage('Insufficient funds.');
      return;
    }
    
    let currentDeck = deck;
    if (currentDeck.length < 5) {
      currentDeck = [...cardSuits.flatMap(s => cardRanks.map(r => r + s))].sort(() => Math.random() - 0.5);
    }
    
    const newHand = currentDeck.slice(0, 5);
    setHand(newHand);
    setDeck(currentDeck.slice(5));
    setHeld(Array(5).fill(false));
    setGameState('draw');
    setMessage('Hold cards and draw.');
  };

  const handleDraw = async () => {
    let currentDeck = deck;
    const newHand = [...hand];
    for (let i = 0; i < 5; i++) {
      if (!held[i]) {
        newHand[i] = currentDeck.pop();
      }
    }
    setHand(newHand);
    setDeck(currentDeck);
    
    const [resultHand, multiplier] = evaluateHand(newHand);
    const winAmount = multiplier * bet;
    
    setMessage(resultHand ? `${resultHand}! You win ${winAmount}!` : 'No win. Try again.');

    const newBalance = user.wallet_balance - bet + winAmount;
    await User.updateMyUserData({ wallet_balance: newBalance });
    setUser(prev => ({...prev, wallet_balance: newBalance}));

    await VideoPokerGame.create({
      user_id: user.id, bet_amount: bet, initial_hand: hand, final_hand: newHand,
      result_hand: resultHand || 'Nothing', win_amount: winAmount,
    });
    setGameState('result');
  };

  const evaluateHand = (h) => {
    const ranks = h.map(c => cardRanks.indexOf(c[0])).sort((a,b) => a-b);
    const suits = h.map(c => c[1]);
    const isFlush = new Set(suits).size === 1;
    const isStraight = ranks.every((rank, i) => i === 0 || rank === ranks[i-1] + 1) || JSON.stringify(ranks) === JSON.stringify([0,1,2,3,12]); // Ace-low straight
    const rankCounts = ranks.reduce((acc, rank) => { acc[rank] = (acc[rank] || 0) + 1; return acc; }, {});
    const counts = Object.values(rankCounts).sort((a,b) => b-a);

    if (isStraight && isFlush && ranks[4] === 12 && ranks[0] === 8) return ['Royal Flush', paytable['Royal Flush']];
    if (isStraight && isFlush) return ['Straight Flush', paytable['Straight Flush']];
    if (counts[0] === 4) return ['Four of a Kind', paytable['Four of a Kind']];
    if (counts[0] === 3 && counts[1] === 2) return ['Full House', paytable['Full House']];
    if (isFlush) return ['Flush', paytable['Flush']];
    if (isStraight) return ['Straight', paytable['Straight']];
    if (counts[0] === 3) return ['Three of a Kind', paytable['Three of a Kind']];
    if (counts[0] === 2 && counts[1] === 2) return ['Two Pair', paytable['Two Pair']];
    if (counts[0] === 2 && Object.keys(rankCounts).some(r => r >= 9 && rankCounts[r] === 2)) return ['Jacks or Better', paytable['Jacks or Better']];

    return ['Nothing', 0];
  };

  const toggleHold = (index) => {
    if (gameState !== 'draw') return;
    const newHeld = [...held];
    newHeld[index] = !newHeld[index];
    setHeld(newHeld);
  };

  return (
    <div className="min-h-screen p-4 lg:p-8 bg-blue-900 bg-cover" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')"}}>
      <div className="max-w-4xl mx-auto">
        <Card className="bg-black/40 border-yellow-400/30 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-serif text-yellow-300">Video Poker</CardTitle>
            <p className="text-gray-300">Jacks or Better - Make the best 5-card hand!</p>
            <div className="mt-2 text-lg">Wallet: <span className="font-bold text-green-400">₹{user?.wallet_balance.toFixed(2)}</span></div>
          </CardHeader>
          <CardContent>
            {/* Paytable */}
            <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-center bg-slate-800/50 p-2 rounded-lg mb-4">
              {Object.entries(paytable).map(([hand, mult]) => <div key={hand}><span className="text-yellow-300">{hand}:</span> {mult}x</div>)}
            </div>

            {/* Cards */}
            <div className="flex justify-center gap-4 my-8">
              {hand.map((card, i) => card ? <CardComponent key={i} card={card} onHold={() => toggleHold(i)} isHeld={held[i]} /> : <div key={i} className="w-28 h-40 bg-blue-800 rounded-lg border-2 border-blue-900"/>)}
            </div>

            {/* Message & Controls */}
            <div className="text-center text-2xl font-bold my-4 text-yellow-200 h-8">{message}</div>
            <div className="flex flex-col items-center gap-4 mt-6">
              <div className="flex items-center gap-2">
                  <Label>Bet Amount (Coins):</Label>
                  <Input type="number" value={bet} onChange={e => setBet(Number(e.target.value))} className="w-24 bg-slate-800 border-slate-600" min="1" max="5"/>
              </div>
              {gameState === 'deal' && <Button onClick={handleDeal} className="bg-green-600 hover:bg-green-700 px-12 py-6 text-xl">Deal</Button>}
              {gameState === 'draw' && <Button onClick={handleDraw} className="bg-blue-600 hover:bg-blue-700 px-12 py-6 text-xl">Draw</Button>}
              {gameState === 'result' && <Button onClick={handleDeal} className="bg-green-600 hover:bg-green-700 px-12 py-6 text-xl">Deal Again</Button>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
