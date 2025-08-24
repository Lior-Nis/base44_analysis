
import React, { useState, useEffect } from 'react';
import { User, BlackjackGame } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Spade, Heart, Diamond, Club, Crown } from 'lucide-react';

const cardRanks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const cardSuits = ['S', 'H', 'D', 'C'];

const CardComponent = ({ card, hidden }) => {
  if (hidden) {
    return <div className="w-24 h-36 bg-red-800 rounded-lg border-2 border-red-900 flex items-center justify-center"><Crown className="w-10 h-10 text-yellow-300" /></div>;
  }
  const rank = card.slice(0, -1);
  const suit = card.slice(-1);
  const suitIcons = { S: <Spade />, H: <Heart />, D: <Diamond />, C: <Club /> };
  const suitColor = ['H', 'D'].includes(suit) ? 'text-red-500' : 'text-white';

  return (
    <div className={`w-24 h-36 bg-slate-700 rounded-lg p-2 flex flex-col justify-between border-2 border-slate-600 shadow-lg ${suitColor}`}>
      <div className="text-2xl font-bold">{rank === 'T' ? '10' : rank}</div>
      <div className="text-2xl self-center">{suitIcons[suit]}</div>
      <div className="text-2xl font-bold self-end transform rotate-180">{rank === 'T' ? '10' : rank}</div>
    </div>
  );
};

export default function BlackjackPage() {
  const [user, setUser] = useState(null);
  const [bet, setBet] = useState(10);
  const [game, setGame] = useState(null);
  const [deck, setDeck] = useState([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [message, setMessage] = useState('Place your bet to start.');

  useEffect(() => {
    User.me().then(setUser);
    createNewDeck();
  }, []);

  const createNewDeck = () => {
    let newDeck = [];
    for (const suit of cardSuits) {
      for (const rank of cardRanks) {
        newDeck.push(rank + suit);
      }
    }
    setDeck(shuffle(newDeck));
  };

  const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const getCardValue = (card) => {
    const rank = card.slice(0, -1);
    if (['J', 'Q', 'K', 'T'].includes(rank)) return 10;
    if (rank === 'A') return 11;
    return parseInt(rank);
  };

  const calculateScore = (hand) => {
    let score = hand.reduce((acc, card) => acc + getCardValue(card), 0);
    let aces = hand.filter(c => c.startsWith('A')).length;
    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }
    return score;
  };

  const dealCards = async () => {
    if (user.wallet_balance < bet) {
      setMessage("Insufficient funds.");
      return;
    }
    
    let currentDeck = deck;
    if (currentDeck.length < 10) {
        currentDeck = shuffle(createNewDeck());
    }

    const playerHand = [currentDeck.pop(), currentDeck.pop()];
    const dealerHand = [currentDeck.pop(), currentDeck.pop()];
    setDeck(currentDeck);

    const newGame = {
      player_hand: playerHand,
      dealer_hand: dealerHand,
      status: 'active',
      bet_amount: bet,
    };
    
    setGame(newGame);
    const pScore = calculateScore(playerHand);
    setPlayerScore(pScore);
    setDealerScore(calculateScore([dealerHand[0]]));
    
    if (pScore === 21) {
      endGame(newGame, 'player_blackjack');
    } else {
      setMessage("Your turn. Hit or Stand?");
    }
  };

  const hit = () => {
    if (!game || game.status !== 'active') return;

    let currentDeck = deck;
    const newCard = currentDeck.pop();
    const newPlayerHand = [...game.player_hand, newCard];
    const newGame = { ...game, player_hand: newPlayerHand };
    setGame(newGame);
    setDeck(currentDeck);

    const newScore = calculateScore(newPlayerHand);
    setPlayerScore(newScore);

    if (newScore > 21) {
      endGame(newGame, 'busted');
    }
  };

  const stand = () => {
    if (!game || game.status !== 'active') return;
    
    let currentDeck = deck;
    let currentDealerHand = [...game.dealer_hand];
    let currentDealerScore = calculateScore(currentDealerHand);
    
    while (currentDealerScore < 17) {
      const newCard = currentDeck.pop();
      currentDealerHand.push(newCard);
      currentDealerScore = calculateScore(currentDealerHand);
    }
    setDeck(currentDeck);

    const finalGame = { ...game, dealer_hand: currentDealerHand };

    if (currentDealerScore > 21 || playerScore > currentDealerScore) {
      endGame(finalGame, 'player_win');
    } else if (playerScore < currentDealerScore) {
      endGame(finalGame, 'dealer_win');
    } else {
      endGame(finalGame, 'push');
    }
  };

  const endGame = async (finalGame, finalStatus) => {
    let winAmount = 0;
    let finalMessage = '';

    switch (finalStatus) {
      case 'player_blackjack':
        winAmount = finalGame.bet_amount * 1.5;
        finalMessage = `Blackjack! You win ₹${winAmount}!`;
        break;
      case 'player_win':
        winAmount = finalGame.bet_amount;
        finalMessage = `You win! ₹${winAmount}`;
        break;
      case 'busted':
        winAmount = -finalGame.bet_amount;
        finalMessage = 'Busted! You lose.';
        break;
      case 'dealer_win':
        winAmount = -finalGame.bet_amount;
        finalMessage = 'Dealer wins.';
        break;
      case 'push':
        winAmount = 0;
        finalMessage = 'Push! It\'s a tie.';
        break;
    }
    
    setMessage(finalMessage);

    const gameRecord = await BlackjackGame.create({
        user_id: user.id,
        ...finalGame,
        status: finalStatus,
        win_amount: winAmount > 0 ? winAmount : 0
    });
    
    const newBalance = user.wallet_balance + winAmount;
    await User.updateMyUserData({ wallet_balance: newBalance });
    setUser(prev => ({...prev, wallet_balance: newBalance}));

    setGame(prev => ({...prev, status: finalStatus}));
    setDealerScore(calculateScore(finalGame.dealer_hand));
  };
  
  const resetGame = () => {
    setGame(null);
    setMessage('Place your bet to start.');
  }

  return (
    <div className="min-h-screen p-4 lg:p-8 bg-green-800 bg-cover bg-center" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/felt.png')"}}>
      <div className="max-w-4xl mx-auto">
        <Card className="bg-black/40 border-yellow-400/30 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-serif text-yellow-300">Blackjack</CardTitle>
            <p className="text-gray-300">Get closer to 21 than the dealer without going over!</p>
            <div className="mt-2 text-lg">Wallet: <span className="font-bold text-green-400">₹{user?.wallet_balance.toFixed(2)}</span></div>
          </CardHeader>
          <CardContent>
            {/* Game Table */}
            <div className="bg-green-900/70 rounded-xl p-6 min-h-[450px] flex flex-col justify-between border-4 border-yellow-800/50">
              {/* Dealer's Hand */}
              <div>
                <h3 className="text-xl font-bold text-center mb-2">Dealer's Hand ({game && game.status !== 'active' ? calculateScore(game.dealer_hand) : dealerScore})</h3>
                <div className="flex justify-center gap-4">
                  {game ? game.dealer_hand.map((card, i) => <CardComponent key={i} card={card} hidden={i === 1 && game.status === 'active'} />) : <div className="h-36"/>}
                </div>
              </div>

              {/* Message Area */}
              <div className="text-center text-2xl font-bold my-4 text-yellow-200 h-8">{message}</div>

              {/* Player's Hand */}
              <div>
                <h3 className="text-xl font-bold text-center mb-2">Your Hand ({playerScore})</h3>
                <div className="flex justify-center gap-4">
                  {game ? game.player_hand.map((card, i) => <CardComponent key={i} card={card} />) : <div className="h-36"/>}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-6">
              {!game ? (
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Label>Bet Amount:</Label>
                        <Input type="number" value={bet} onChange={e => setBet(Number(e.target.value))} className="w-32 bg-slate-800 border-slate-600"/>
                        <Button onClick={() => setBet(b => b + 10)}>+10</Button>
                        <Button onClick={() => setBet(b => b + 50)}>+50</Button>
                    </div>
                  <Button onClick={dealCards} className="bg-yellow-600 hover:bg-yellow-700 px-10 py-6 text-xl">Deal</Button>
                </div>
              ) : game.status === 'active' ? (
                <div className="flex justify-center gap-4">
                  <Button onClick={hit} className="bg-blue-600 hover:bg-blue-700 px-10 py-6 text-xl">Hit</Button>
                  <Button onClick={stand} className="bg-red-600 hover:bg-red-700 px-10 py-6 text-xl">Stand</Button>
                </div>
              ) : (
                <div className="text-center">
                    <Button onClick={resetGame} className="bg-yellow-600 hover:bg-yellow-700 px-10 py-6 text-xl">Play Again</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
