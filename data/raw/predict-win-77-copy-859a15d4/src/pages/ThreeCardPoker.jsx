import React, { useState, useEffect } from 'react';
import { User, ThreeCardPokerGame } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spade, Heart, Diamond, Club } from 'lucide-react';

const cardRanks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const cardSuits = ['S', 'H', 'D', 'C'];
const rankValues = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };

const CardComponent = ({ card, hidden }) => {
    if (!card) return <div className="w-24 h-36 bg-slate-600 rounded-lg" />;
    if (hidden) return <div className="w-24 h-36 bg-blue-800 rounded-lg" />;

    const rank = card.slice(0, -1);
    const suit = card.slice(-1);
    const suitIcons = { S: <Spade />, H: <Heart />, D: <Diamond />, C: <Club /> };
    const suitColor = ['H', 'D'].includes(suit) ? 'text-red-500' : 'text-slate-200';

    return (
        <div className={`w-24 h-36 bg-slate-700 rounded-lg p-2 flex flex-col justify-between border-2 border-slate-600 shadow-lg ${suitColor}`}>
            <div className="text-2xl font-bold">{rank === 'T' ? '10' : rank}</div>
            <div className="text-2xl self-center">{suitIcons[suit]}</div>
        </div>
    );
};

export default function ThreeCardPokerPage() {
    const [user, setUser] = useState(null);
    const [ante, setAnte] = useState(10);
    const [gameState, setGameState] = useState('betting'); // betting, dealt, finished
    const [playerHand, setPlayerHand] = useState([]);
    const [dealerHand, setDealerHand] = useState([]);
    const [message, setMessage] = useState('Place your Ante bet to start.');

    useEffect(() => { User.me().then(setUser); }, []);

    const deal = async () => {
        if (user.wallet_balance < ante) {
            setMessage("Insufficient funds.");
            return;
        }

        const newBalance = user.wallet_balance - ante;
        await User.updateMyUserData({ wallet_balance: newBalance });
        setUser(prev => ({ ...prev, wallet_balance: newBalance }));

        let deck = [];
        for (const suit of cardSuits) {
            for (const rank of cardRanks) {
                deck.push(rank + suit);
            }
        }
        deck.sort(() => Math.random() - 0.5); // Shuffle

        setPlayerHand(deck.slice(0, 3));
        setDealerHand(deck.slice(3, 6));
        setGameState('dealt');
        setMessage('Will you Play or Fold?');
    };

    const handlePlay = async () => {
        if (user.wallet_balance < ante) {
            setMessage("Insufficient funds for Play bet.");
            return;
        }
        
        const newBalance = user.wallet_balance - ante;
        await User.updateMyUserData({ wallet_balance: newBalance });
        setUser(prev => ({ ...prev, wallet_balance: newBalance }));

        // Simplified logic, would be on backend in real app
        const playerRank = getHandRank(playerHand);
        const dealerRank = getHandRank(dealerHand);
        
        let result = '';
        let winAmount = 0;

        if (playerRank.value > dealerRank.value) {
            result = 'You win!';
            winAmount = ante * 4; // Ante + Play, simplified 1:1 payout
        } else if (playerRank.value < dealerRank.value) {
            result = 'Dealer wins.';
        } else {
            result = 'Push!';
            winAmount = ante * 2; // Return Ante + Play bets
        }
        
        if (winAmount > 0) {
            const finalBalance = newBalance + winAmount;
            await User.updateMyUserData({ wallet_balance: finalBalance });
            setUser(prev => ({...prev, wallet_balance: finalBalance}));
        }

        setMessage(result);
        setGameState('finished');
    };

    const handleFold = () => {
        setMessage('You folded. Dealer wins.');
        setGameState('finished');
    };
    
    const getHandRank = (hand) => {
        // Simplified ranking logic
        const ranks = hand.map(c => rankValues[c[0]]).sort((a,b) => a-b);
        const isFlush = new Set(hand.map(c => c[1])).size === 1;
        const isStraight = ranks[2] - ranks[0] === 2 && new Set(ranks).size === 3;
        if(isStraight && isFlush) return { name: "Straight Flush", value: 5};
        if(ranks[0] === ranks[1] && ranks[1] === ranks[2]) return { name: "Three of a Kind", value: 4};
        if(isStraight) return { name: "Straight", value: 3};
        if(isFlush) return { name: "Flush", value: 2};
        if(ranks[0] === ranks[1] || ranks[1] === ranks[2]) return { name: "Pair", value: 1};
        return { name: "High Card", value: 0};
    }

    const newGame = () => {
        setGameState('betting');
        setMessage('Place your Ante bet to start.');
        setPlayerHand([]);
        setDealerHand([]);
    };

    return (
        <div className="min-h-screen p-4 lg:p-8 bg-green-900 text-white">
            <div className="max-w-4xl mx-auto">
                <Card className="bg-green-800/50 border-green-600">
                    <CardHeader className="text-center">
                        <CardTitle className="text-4xl text-yellow-300">3 Card Poker</CardTitle>
                        <p className="text-gray-300">Balance: ₹{user?.wallet_balance || 0}</p>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center my-4">
                            <h3 className="text-xl">Dealer's Hand</h3>
                            <div className="flex justify-center gap-2 my-2">
                                {dealerHand.map((card, i) => <CardComponent key={i} card={card} hidden={gameState !== 'finished'}/>)}
                                {dealerHand.length === 0 && [...Array(3)].map((_,i) => <CardComponent key={i}/>)}
                            </div>
                        </div>

                        <div className="text-center text-2xl font-bold my-6 p-3 bg-yellow-400/20 text-yellow-300 rounded-lg">{message}</div>

                        <div className="text-center my-4">
                            <h3 className="text-xl">Your Hand</h3>
                            <div className="flex justify-center gap-2 my-2">
                                {playerHand.map((card, i) => <CardComponent key={i} card={card} />)}
                                {playerHand.length === 0 && [...Array(3)].map((_,i) => <CardComponent key={i}/>)}
                            </div>
                        </div>

                        <div className="mt-8 flex justify-center items-center gap-4">
                            {gameState === 'betting' && <>
                                <Input type="number" value={ante} onChange={e => setAnte(Number(e.target.value))} className="w-24 bg-slate-700" />
                                <Button onClick={deal} size="lg">Deal</Button>
                            </>}
                            {gameState === 'dealt' && <>
                                <Button onClick={handlePlay} size="lg" className="bg-blue-600">Play (Bet ₹{ante})</Button>
                                <Button onClick={handleFold} size="lg" variant="destructive">Fold</Button>
                            </>}
                            {gameState === 'finished' && <Button onClick={newGame} size="lg">New Game</Button>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}