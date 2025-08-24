
import React, { useState, useEffect } from 'react';
import { User, BaccaratGame } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Spade, Heart, Diamond, Club } from 'lucide-react';

const cardRanks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const cardSuits = ['S', 'H', 'D', 'C'];

const CardComponent = ({ card }) => {
  if (!card) return <div className="w-20 h-28 bg-red-800 rounded-lg border-2 border-red-900" />;
  const rank = card.slice(0, -1);
  const suit = card.slice(-1);
  const suitIcons = { S: <Spade />, H: <Heart />, D: <Diamond />, C: <Club /> };
  const suitColor = ['H', 'D'].includes(suit) ? 'text-red-500' : 'text-white';

  return (
    <div className={`w-20 h-28 bg-slate-700 rounded-lg p-2 flex flex-col justify-between border-2 border-slate-600 shadow-lg ${suitColor}`}>
      <div className="text-xl font-bold">{rank === 'T' ? '10' : rank}</div>
      <div className="text-xl self-center">{suitIcons[suit]}</div>
    </div>
  );
};

export default function BaccaratPage() {
  const [user, setUser] = useState(null);
  const [betAmount, setBetAmount] = useState(10);
  const [betOn, setBetOn] = useState(null); // 'player', 'banker', 'tie'
  const [game, setGame] = useState(null);
  const [message, setMessage] = useState('Place your bet on Player, Banker, or Tie.');

  useEffect(() => {
    User.me().then(setUser);
  }, []);

  const getCardValue = (card) => {
    const rank = card.slice(0, -1);
    if (['T', 'J', 'Q', 'K'].includes(rank)) return 0;
    if (rank === 'A') return 1;
    return parseInt(rank);
  };

  const calculateScore = (hand) => {
    return hand.reduce((acc, card) => acc + getCardValue(card), 0) % 10;
  };

  const placeBet = async (choice) => {
    if (!user) {
        setMessage("Please log in to place a bet.");
        return;
    }
    if (user.wallet_balance < betAmount) {
      setMessage("Insufficient funds.");
      return;
    }
    if (betAmount <= 0) {
        setMessage("Bet amount must be greater than 0.");
        return;
    }

    setBetOn(choice);
    setMessage(`Bet placed on ${choice}. Dealing cards...`);
    
    let deck = [];
    for (const suit of cardSuits) for (const rank of cardRanks) deck.push(rank + suit);
    deck = deck.sort(() => Math.random() - 0.5);

    let playerHand = [deck.pop(), deck.pop()];
    let bankerHand = [deck.pop(), deck.pop()];

    let playerScore = calculateScore(playerHand);
    let bankerScore = calculateScore(bankerHand);
    
    // Baccarat third card rules
    if (playerScore <= 5) playerHand.push(deck.pop());
    playerScore = calculateScore(playerHand);

    const playerThirdCardValue = playerHand.length === 3 ? getCardValue(playerHand[2]) : null;
    
    // Banker's third card rules
    // (Rules based on player's third card, or if player stood)
    if (bankerScore <= 2) {
        bankerHand.push(deck.pop());
    } else if (bankerScore === 3 && playerThirdCardValue !== 8) {
        bankerHand.push(deck.pop());
    } else if (bankerScore === 4 && [2,3,4,5,6,7].includes(playerThirdCardValue)) {
        bankerHand.push(deck.pop());
    } else if (bankerScore === 5 && [4,5,6,7].includes(playerThirdCardValue)) {
        bankerHand.push(deck.pop());
    } else if (bankerScore === 6 && [6,7].includes(playerThirdCardValue)) {
        bankerHand.push(deck.pop());
    }
    
    bankerScore = calculateScore(bankerHand);

    let result;
    if (playerScore > bankerScore) result = 'player';
    else if (bankerScore > playerScore) result = 'banker';
    else result = 'tie';

    let winAmount = -betAmount;
    if (result === choice) {
      if (result === 'tie') winAmount = betAmount * 8;
      else if (result === 'banker') winAmount = betAmount * 0.95; // 5% commission
      else winAmount = betAmount;
    }

    const newGame = {
      player_hand: playerHand,
      banker_hand: bankerHand,
      result,
      bet_on: choice,
      bet_amount: betAmount,
      win_amount: winAmount > 0 ? winAmount : 0,
      status: 'completed'
    };
    
    setGame(newGame);

    const newBalance = user.wallet_balance + winAmount;
    await User.updateMyUserData({ wallet_balance: newBalance });
    setUser(prev => ({ ...prev, wallet_balance: newBalance }));
    
    await BaccaratGame.create({ ...newGame, user_id: user.id });

    if(winAmount > 0) setMessage(`You won ₹${winAmount.toFixed(2)}!`);
    else setMessage(`You lost. The winner was ${result}.`);
  };

  return (
    <div className="min-h-screen p-4 lg:p-8 bg-red-900 bg-cover bg-center" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/felt.png')"}}>
      <div className="max-w-5xl mx-auto">
        <Card className="bg-black/40 border-yellow-400/30 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-serif text-yellow-300">Baccarat</CardTitle>
            <p className="text-gray-300">The elegant high-stakes card game.</p>
            <div className="mt-2 text-lg">Wallet: <span className="font-bold text-green-400">₹{user?.wallet_balance.toFixed(2)}</span></div>
          </CardHeader>
          <CardContent>
            {/* Game Table */}
            <div className="bg-red-800/70 rounded-xl p-6 min-h-[400px] flex flex-col justify-around border-4 border-yellow-800/50">
              {/* Banker's Hand */}
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Banker ({game ? calculateScore(game.banker_hand) : '?'})</h3>
                <div className="flex justify-center gap-4">
                  {game ? game.banker_hand.map((c, i) => <CardComponent key={i} card={c} />) : <><CardComponent /><CardComponent /></>}
                </div>
              </div>
              
              <div className="text-center text-3xl font-bold my-4 text-yellow-200 h-8">
                {message}
              </div>

              {/* Player's Hand */}
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">Player ({game ? calculateScore(game.player_hand) : '?'})</h3>
                <div className="flex justify-center gap-4">
                  {game ? game.player_hand.map((c, i) => <CardComponent key={i} card={c} />) : <><CardComponent /><CardComponent /></>}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-6">
              <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2">
                      <Label htmlFor="bet-amount" className="text-white text-lg">Bet Amount:</Label>
                      <Input 
                        id="bet-amount" 
                        type="number" 
                        value={betAmount} 
                        onChange={e => setBetAmount(Number(e.target.value))} 
                        className="w-32 bg-slate-800 border-slate-600 text-white"
                        min="1"
                      />
                  </div>
                <div className="flex justify-center gap-4">
                    <Button onClick={() => placeBet('player')} disabled={!!game || !user} className="bg-blue-600 hover:bg-blue-700 px-8 py-5 text-lg">Bet on Player (1:1)</Button>
                    <Button onClick={() => placeBet('banker')} disabled={!!game || !user} className="bg-red-600 hover:bg-red-700 px-8 py-5 text-lg">Bet on Banker (1:0.95)</Button>
                    <Button onClick={() => placeBet('tie')} disabled={!!game || !user} className="bg-green-600 hover:bg-green-700 px-8 py-5 text-lg">Bet on Tie (8:1)</Button>
                </div>
                {game && <Button onClick={() => { setGame(null); setBetOn(null); setMessage('Place your bet on Player, Banker, or Tie.'); }} className="mt-4 px-8 py-5 text-lg bg-yellow-600 hover:bg-yellow-700">Play Again</Button>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
