import React, { useState, useEffect, useCallback } from 'react';
import { User, DragonTigerGame, DragonTigerBet } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, History, Timer, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const RANK_VALUES = { 'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13 };

const CardComponent = ({ card, isFaceDown, title }) => {
  const isRed = card?.suit === '♥' || card?.suit === '♦';
  if (isFaceDown) {
    return <div className="w-24 h-36 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-gray-600 flex items-center justify-center"><span className="text-white font-bold text-xl">{title}</span></div>
  }
  return (
    <motion.div initial={{ rotateY: 180 }} animate={{ rotateY: 0 }} transition={{ duration: 0.5 }} className={`w-24 h-36 rounded-lg flex flex-col justify-between p-2 shadow-lg text-3xl font-bold border-2 bg-white border-gray-300`}>
      <span className={isRed ? 'text-red-500' : 'text-black'}>{card?.rank}</span>
      <span className={isRed ? 'text-red-500' : 'text-black'}>{card?.suit}</span>
    </motion.div>
  );
};

export default function DragonTigerPage() {
  const [user, setUser] = useState(null);
  const [betAmount, setBetAmount] = useState(10);
  const [gameState, setGameState] = useState('betting');
  const [game, setGame] = useState(null);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [userBets, setUserBets] = useState({});

  const getDeck = () => SUITS.flatMap(suit => RANKS.map(rank => ({ rank, suit, value: RANK_VALUES[rank] })));
  const parseCard = (cardString) => {
      if (!cardString || cardString.length < 2) return null;
      const rank = cardString.slice(0, -1);
      const suit = cardString.slice(-1);
      return { rank, suit, value: RANK_VALUES[rank] };
  };

  const startNewRound = useCallback(async () => {
    setGameState('betting');
    setResult(null);
    setUserBets({});
    setTimeLeft(10);
    const newGame = await DragonTigerGame.create({ game_number: `DT-${Date.now()}`, status: 'betting' });
    setGame(newGame);
  }, []);

  useEffect(() => {
    const loadUser = async () => { try { const u = await User.me(); setUser(u); } catch(e) {} };
    loadUser();
    startNewRound();
  }, [startNewRound]);

  useEffect(() => {
    if (gameState !== 'betting' || timeLeft <= 0) {
        if (timeLeft <= 0 && gameState === 'betting') finishRound();
        return;
    };
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [gameState, timeLeft]);

  const placeBet = async (choice) => {
    if (gameState !== 'betting' || userBets[choice]) return;
    if (betAmount > (user?.wallet_balance || 0)) return alert("Insufficient balance.");

    const newBalance = user.wallet_balance - betAmount;
    await User.updateMyUserData({ wallet_balance: newBalance });
    setUser(prev => ({ ...prev, wallet_balance: newBalance }));
    setUserBets(prev => ({...prev, [choice]: betAmount}));
  };

  const finishRound = async () => {
    setGameState('dealing');
    let deck = getDeck();
    const dragonCard = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
    const tigerCard = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];

    let winning_hand;
    if (dragonCard.value > tigerCard.value) winning_hand = 'dragon';
    else if (tigerCard.value > dragonCard.value) winning_hand = 'tiger';
    else winning_hand = 'tie';

    await DragonTigerGame.update(game.id, {
        dragon_card: `${dragonCard.rank}${dragonCard.suit}`,
        tiger_card: `${tigerCard.rank}${tigerCard.suit}`,
        winning_hand: winning_hand,
        status: 'completed'
    });

    let totalWin = 0;
    const payoutRates = { dragon: 2, tiger: 2, tie: 8 };

    for(const choice in userBets) {
        const betAmt = userBets[choice];
        const newBet = await DragonTigerBet.create({
            user_id: user.id,
            game_id: game.id,
            bet_on: choice,
            bet_amount: betAmt,
        });

        if(choice === winning_hand) {
            const winAmount = betAmt * payoutRates[choice];
            totalWin += winAmount;
            await DragonTigerBet.update(newBet.id, { status: 'won', win_amount: winAmount });
        } else {
            await DragonTigerBet.update(newBet.id, { status: 'lost' });
        }
    }
    
    if (totalWin > 0) {
        const newBalance = user.wallet_balance - Object.values(userBets).reduce((a, b) => a + b, 0) + totalWin;
        await User.updateMyUserData({ wallet_balance: newBalance });
        setUser(prev => ({...prev, wallet_balance: newBalance}));
    }

    setResult({ dragonCard, tigerCard, winning_hand });
    setTimeout(startNewRound, 5000);
  };
  
  return (
    <div className="min-h-screen p-4 lg:p-8 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto">
            <Card className="bg-slate-800/50 border-slate-700/50 mb-6 text-center">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2 text-3xl">
                        <Flame className="text-red-500"/> Dragon Tiger <Flame className="text-blue-500"/>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-around items-center">
                    <div className="flex items-center gap-2 text-green-400"><Wallet size={20}/> ₹{user?.wallet_balance || 0}</div>
                    {gameState === 'betting' && <div className="flex items-center gap-2 text-yellow-400"><Timer size={20}/> {timeLeft}s</div>}
                </CardContent>
            </Card>

            <div className="flex justify-around items-center mb-8 h-40">
                <CardComponent card={result?.dragonCard} isFaceDown={!result} title="DRAGON"/>
                <span className="text-4xl font-bold text-gray-400">VS</span>
                <CardComponent card={result?.tigerCard} isFaceDown={!result} title="TIGER"/>
            </div>

            {result && (
                <motion.div initial={{opacity: 0, scale: 0.5}} animate={{opacity: 1, scale: 1}} className="text-center mb-4 text-3xl font-bold uppercase">
                   {result.winning_hand === 'tie' ? <span className="text-green-400">Tie!</span> : <span className={result.winning_hand === 'dragon' ? 'text-red-500' : 'text-blue-500'}>{result.winning_hand} Wins!</span>}
                </motion.div>
            )}

            <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-6">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <span className="text-lg">Bet: ₹</span>
                        <Input type="number" value={betAmount} onChange={e => setBetAmount(parseInt(e.target.value))} className="w-24 bg-slate-700 border-slate-600"/>
                        {[10, 50, 100, 500].map(amt => <Button key={amt} onClick={() => setBetAmount(amt)} variant={betAmount === amt ? 'default' : 'outline'}>₹{amt}</Button>)}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <Button onClick={() => placeBet('dragon')} disabled={gameState !== 'betting' || !!userBets.dragon} className="h-20 bg-red-600 hover:bg-red-700 text-xl">Dragon <Badge>2x</Badge>{userBets.dragon && <span className="text-xs"> (₹{userBets.dragon})</span>}</Button>
                        <Button onClick={() => placeBet('tie')} disabled={gameState !== 'betting' || !!userBets.tie} className="h-20 bg-green-600 hover:bg-green-700 text-xl">Tie <Badge>8x</Badge>{userBets.tie && <span className="text-xs"> (₹{userBets.tie})</span>}</Button>
                        <Button onClick={() => placeBet('tiger')} disabled={gameState !== 'betting' || !!userBets.tiger} className="h-20 bg-blue-600 hover:bg-blue-700 text-xl">Tiger <Badge>2x</Badge>{userBets.tiger && <span className="text-xs"> (₹{userBets.tiger})</span>}</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}