import React, { useState, useEffect } from 'react';
import { User, HiLoGame } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spade, Heart, Diamond, Club, ArrowUp, ArrowDown, DollarSign, Trophy } from 'lucide-react';

const cardRanks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const cardSuits = ['S', 'H', 'D', 'C'];
const rankValues = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };

const CardComponent = ({ card }) => {
    if (!card) return <div className="w-32 h-48 bg-slate-600 rounded-lg" />;
    
    const rank = card.slice(0, -1);
    const suit = card.slice(-1);
    const suitIcons = { S: <Spade />, H: <Heart />, D: <Diamond />, C: <Club /> };
    const suitColor = ['H', 'D'].includes(suit) ? 'text-red-500' : 'text-slate-200';

    return (
        <div className={`w-32 h-48 bg-slate-700 rounded-lg p-3 flex flex-col justify-between border-4 border-slate-500 shadow-lg ${suitColor}`}>
            <div className="text-4xl font-bold">{rank === 'T' ? '10' : rank}</div>
            <div className="text-4xl self-center">{suitIcons[suit]}</div>
        </div>
    );
};


export default function HiLoPage() {
    const [user, setUser] = useState(null);
    const [bet, setBet] = useState(10);
    const [gameState, setGameState] = useState('betting'); // betting, playing, finished
    const [deck, setDeck] = useState([]);
    const [currentCard, setCurrentCard] = useState(null);
    const [nextCard, setNextCard] = useState(null);
    const [streak, setStreak] = useState(0);
    const [potentialWin, setPotentialWin] = useState(0);

    useEffect(() => { User.me().then(setUser); }, []);

    const startGame = async () => {
        if (user.wallet_balance < bet) {
            alert("Insufficient balance");
            return;
        }
        await User.updateMyUserData({ wallet_balance: user.wallet_balance - bet });
        setUser(prev => ({...prev, wallet_balance: prev.wallet_balance - bet}));

        let newDeck = [];
        for (const suit of cardSuits) {
            for (const rank of cardRanks) {
                newDeck.push(rank + suit);
            }
        }
        newDeck.sort(() => Math.random() - 0.5); // Shuffle
        
        setCurrentCard(newDeck.pop());
        setDeck(newDeck);
        setGameState('playing');
        setPotentialWin(bet);
        setStreak(0);
    };

    const handleGuess = (guess) => {
        const next = deck.pop();
        setNextCard(next);

        const currentRank = rankValues[currentCard[0]];
        const nextRank = rankValues[next[0]];
        
        let correct = false;
        if (guess === 'high' && nextRank > currentRank) correct = true;
        if (guess === 'low' && nextRank < currentRank) correct = true;
        if (nextRank === currentRank) correct = true; // Push is a win

        if (correct) {
            setStreak(prev => prev + 1);
            setPotentialWin(prev => prev * 1.25); // Simplified multiplier
            setTimeout(() => {
                setCurrentCard(next);
                setNextCard(null);
            }, 1500);
        } else {
            setGameState('finished');
        }
    };
    
    const cashOut = async () => {
        await User.updateMyUserData({ wallet_balance: user.wallet_balance + potentialWin });
        setUser(prev => ({...prev, wallet_balance: prev.wallet_balance + potentialWin}));
        setGameState('finished');
    };

    return (
        <div className="min-h-screen p-4 lg:p-8 bg-indigo-900 text-white flex items-center justify-center">
            <Card className="w-full max-w-lg bg-indigo-800/50 border-indigo-700">
                <CardHeader className="text-center">
                    <CardTitle className="text-4xl text-yellow-300 flex items-center justify-center gap-2"><Trophy /> Hi-Lo Card Game</CardTitle>
                    <p className="text-gray-300">Balance: ₹{user?.wallet_balance || 0}</p>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-around items-center h-56 my-4">
                        <div className="text-center">
                            <h3 className="mb-2">Current Card</h3>
                            <CardComponent card={currentCard} />
                        </div>
                        {gameState === 'playing' && <div className="text-4xl font-bold">VS</div>}
                        <div className="text-center">
                            <h3 className="mb-2">Next Card</h3>
                            <CardComponent card={nextCard} />
                        </div>
                    </div>
                    
                    {gameState === 'betting' && (
                        <div className="flex flex-col items-center gap-4">
                            <Input type="number" value={bet} onChange={e => setBet(Number(e.target.value))} className="w-32 bg-slate-700" />
                            <Button onClick={startGame} size="lg">Start Game</Button>
                        </div>
                    )}
                    
                    {gameState === 'playing' && (
                        <div className="text-center space-y-4">
                            <div className="flex justify-center gap-4">
                                <Button onClick={() => handleGuess('low')} className="h-16 w-32 text-xl bg-blue-600"><ArrowDown className="mr-2"/> Low</Button>
                                <Button onClick={() => handleGuess('high')} className="h-16 w-32 text-xl bg-red-600"><ArrowUp className="mr-2"/> High</Button>
                            </div>
                            <Badge>Streak: {streak}</Badge>
                            <p>Potential Win: ₹{potentialWin.toFixed(2)}</p>
                            <Button onClick={cashOut} className="bg-green-600"><DollarSign className="mr-2"/>Cash Out</Button>
                        </div>
                    )}

                    {gameState === 'finished' && (
                        <div className="text-center space-y-4">
                            <p className="text-2xl font-bold text-red-500">Game Over!</p>
                            <Button onClick={() => setGameState('betting')} size="lg">Play Again</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}