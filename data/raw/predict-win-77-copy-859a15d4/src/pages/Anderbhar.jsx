import React, { useState, useEffect, useCallback } from 'react';
import { User, AnderbaharGame, AnderbaharBet } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clapperboard, Coins, History, Timer, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const CardComponent = ({ card, isJoker, isFaceDown }) => {
  const isRed = card?.suit === '♥' || card?.suit === '♦';
  if (isFaceDown) {
    return <div className="w-16 h-24 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-blue-300"></div>
  }
  return (
    <div className={`w-16 h-24 rounded-lg flex flex-col justify-between p-2 shadow-md text-2xl font-bold border-2 ${isJoker ? 'bg-yellow-400 border-yellow-200' : 'bg-white border-gray-300'}`}>
      <span className={isRed ? 'text-red-500' : 'text-black'}>{card?.rank}</span>
      <span className={isRed ? 'text-red-500' : 'text-black'}>{card?.suit}</span>
    </div>
  );
};

export default function AnderbharPage() {
  const [user, setUser] = useState(null);
  const [betAmount, setBetAmount] = useState(10);
  const [gameState, setGameState] = useState('betting');
  const [game, setGame] = useState(null);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [userBet, setUserBet] = useState(null);

  const getDeck = () => {
    return SUITS.flatMap(suit => RANKS.map(rank => ({ rank, suit })));
  };

  const parseCard = (cardString) => {
    if (!cardString || cardString.length < 2) return null;
    return { rank: cardString.slice(0, -1), suit: cardString.slice(-1) };
  };

  const startNewRound = useCallback(async () => {
    setGameState('betting');
    setResult(null);
    setUserBet(null);
    setTimeLeft(10);

    const newGame = await AnderbaharGame.create({
      game_number: `AB-${Date.now()}`,
      status: 'betting'
    });
    setGame(newGame);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (e) {}
    };
    loadUser();
    startNewRound();
  }, [startNewRound]);

  useEffect(() => {
    if (gameState !== 'betting') return;
    if (timeLeft <= 0) {
      dealAndFinish();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [gameState, timeLeft]);

  const placeBet = async (choice) => {
    if (gameState !== 'betting' || userBet) return;
    if (betAmount > (user?.wallet_balance || 0)) return alert("Insufficient balance.");

    const newBalance = user.wallet_balance - betAmount;
    await User.updateMyUserData({ wallet_balance: newBalance });
    setUser(prev => ({ ...prev, wallet_balance: newBalance }));
    
    const bet = await AnderbaharBet.create({
      user_id: user.id,
      game_id: game.id,
      bet_on: choice,
      bet_amount: betAmount
    });
    setUserBet(bet);
  };
  
  const dealAndFinish = async () => {
    setGameState('dealing');
    
    let deck = getDeck();
    deck = deck.sort(() => Math.random() - 0.5);

    const joker = deck.pop();
    await AnderbaharGame.update(game.id, { joker_card: `${joker.rank}${joker.suit}` });
    
    let andar = [], bahar = [];
    let turn = 'andar';
    let winner = null;

    while (deck.length > 0) {
        const drawnCard = deck.pop();
        if (turn === 'andar') {
            andar.push(`${drawnCard.rank}${drawnCard.suit}`);
        } else {
            bahar.push(`${drawnCard.rank}${drawnCard.suit}`);
        }

        if (drawnCard.rank === joker.rank) {
            winner = turn;
            break;
        }
        turn = turn === 'andar' ? 'bahar' : 'andar';
    }

    await AnderbaharGame.update(game.id, {
        andar_cards: andar,
        bahar_cards: bahar,
        winning_pile: winner,
        status: 'completed'
    });
    setGame(prev => ({...prev, joker_card: `${joker.rank}${joker.suit}`, andar_cards: andar, bahar_cards: bahar, winning_pile: winner}));

    if (userBet) {
        if (userBet.bet_on === winner) {
            const winAmount = betAmount * 1.9;
            await AnderbaharBet.update(userBet.id, { status: 'won', win_amount: winAmount });
            const finalBalance = user.wallet_balance + winAmount;
            await User.updateMyUserData({ wallet_balance: finalBalance });
            setUser(prev => ({ ...prev, wallet_balance: finalBalance }));
            setResult({ outcome: 'win', amount: winAmount });
        } else {
            await AnderbaharBet.update(userBet.id, { status: 'lost' });
            setResult({ outcome: 'loss', amount: betAmount });
        }
    }
    
    setGameState('finished');
    setTimeout(startNewRound, 5000);
  };

  return (
    <div className="min-h-screen p-4 flex justify-center items-center">
      <div className="w-full max-w-6xl mx-auto">
        <Card className="bg-slate-800/50 border-slate-700/50 text-white">
          <CardHeader className="text-center">
            <Clapperboard className="w-12 h-12 mx-auto text-purple-400 mb-4" />
            <CardTitle className="text-4xl font-bold">Anderbahar</CardTitle>
            <p className="text-gray-400">Bet on Andar or Bahar to win 1.9x!</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Game Table */}
            <div className="h-96 bg-green-800/50 rounded-lg p-4 flex flex-col items-center justify-around border-2 border-yellow-700/50">
                <div className="flex justify-center gap-8 w-full">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-blue-300 mb-2">ANDAR</h3>
                        <div className="flex gap-2 min-h-[100px]">
                            {game?.andar_cards?.map((c, i) => <CardComponent key={i} card={parseCard(c)} />) || <CardComponent isFaceDown />}
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-yellow-300 mb-2">JOKER</h3>
                        <CardComponent card={parseCard(game?.joker_card)} isJoker />
                    </div>
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-red-300 mb-2">BAHAR</h3>
                        <div className="flex gap-2 min-h-[100px]">
                            {game?.bahar_cards?.map((c, i) => <CardComponent key={i} card={parseCard(c)} />) || <CardComponent isFaceDown />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="grid lg:grid-cols-3 gap-8 items-start">
              <div className="p-4 rounded-lg bg-slate-700/50 space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 flex items-center gap-2"><Wallet className="w-4 h-4"/> Balance</p>
                    <p className="text-xl font-bold text-green-400">₹{user?.wallet_balance?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                      <label className="text-gray-400 text-sm">Bet Amount</label>
                      <Input type="number" value={betAmount} onChange={e => setBetAmount(Number(e.target.value))} className="bg-slate-700 mt-1" disabled={!!userBet}/>
                  </div>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4">
                {gameState === 'betting' && !userBet && (
                    <div className="grid grid-cols-2 gap-4 w-full">
                        <Button onClick={() => placeBet('andar')} className="h-16 text-xl bg-blue-600 hover:bg-blue-700">ANDAR</Button>
                        <Button onClick={() => placeBet('bahar')} className="h-16 text-xl bg-red-600 hover:bg-red-700">BAHAR</Button>
                    </div>
                )}
                {userBet && <p className="text-lg">You bet ₹{userBet.bet_amount} on <span className="font-bold capitalize">{userBet.bet_on}</span></p>}
                
                <AnimatePresence>
                {result && (
                  <motion.div initial={{scale:0}} animate={{scale:1}} className={`p-4 rounded-lg text-center ${result.outcome === 'win' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    <h3 className={`text-2xl font-bold ${result.outcome === 'win' ? 'text-green-400' : 'text-red-400'}`}>You {result.outcome}!</h3>
                    <p>Winning pile was {game.winning_pile}. You {result.outcome === 'win' ? 'won' : 'lost'} ₹{result.amount.toFixed(2)}</p>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>
              <div className="p-4 rounded-lg bg-slate-700/50 text-center">
                <p className="text-sm text-gray-400 flex items-center justify-center gap-2"><Timer className="w-4 h-4"/> Time Left</p>
                <p className="text-5xl font-bold text-yellow-400">{timeLeft}</p>
                <p className="text-gray-400">{gameState === 'betting' ? 'Place your bet' : 'Dealing...'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}