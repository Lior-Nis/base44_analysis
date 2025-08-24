import React, { useState, useEffect } from 'react';
import { User, BingoGame } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ticket, Play, Loader2 } from 'lucide-react';

const BINGO_CARD_PRICE = 10;

const generateBingoCard = () => {
    const card = Array(5).fill(0).map(() => Array(5).fill(0));
    const columns = [
        [...Array(15)].map((_, i) => i + 1), // B
        [...Array(15)].map((_, i) => i + 16),// I
        [...Array(15)].map((_, i) => i + 31),// N
        [...Array(15)].map((_, i) => i + 46),// G
        [...Array(15)].map((_, i) => i + 61) // O
    ];
    
    for (let col = 0; col < 5; col++) {
        let nums = [...columns[col]];
        for (let row = 0; row < 5; row++) {
            if (col === 2 && row === 2) continue; // Free space
            const randIndex = Math.floor(Math.random() * nums.length);
            card[row][col] = nums.splice(randIndex, 1)[0];
        }
    }
    return card;
};

export default function BingoPage() {
    const [user, setUser] = useState(null);
    const [card, setCard] = useState(null);
    const [drawnNumbers, setDrawnNumbers] = useState([]);
    const [gameState, setGameState] = useState('start'); // start, drawing, finished
    const [win, setWin] = useState(false);

    useEffect(() => { User.me().then(setUser); }, []);

    const buyCard = async () => {
        if (user.wallet_balance < BINGO_CARD_PRICE) {
            alert("Not enough funds");
            return;
        }
        await User.updateMyUserData({ wallet_balance: user.wallet_balance - BINGO_CARD_PRICE });
        setUser(prev => ({...prev, wallet_balance: prev.wallet_balance - BINGO_CARD_PRICE}));

        setCard(generateBingoCard());
        setDrawnNumbers([]);
        setWin(false);
        setGameState('drawing');
        
        // Simulate drawing numbers
        const numbersToDraw = [...Array(75)].map((_, i) => i + 1).sort(() => Math.random() - 0.5);
        let i = 0;
        const interval = setInterval(() => {
            if (i < numbersToDraw.length) {
                setDrawnNumbers(prev => [...prev, numbersToDraw[i]]);
                i++;
            } else {
                clearInterval(interval);
            }
        }, 200);
    };

    useEffect(() => {
        if (gameState === 'drawing' && card) {
            if (checkWin(card, drawnNumbers)) {
                setWin(true);
                setGameState('finished');
                const winAmount = BINGO_CARD_PRICE * 10;
                User.updateMyUserData({ wallet_balance: user.wallet_balance + winAmount });
            }
        }
    }, [drawnNumbers]);

    const checkWin = (currentCard, numbers) => {
        // Check rows and columns
        for(let i=0; i<5; i++){
            let rowWin = true;
            let colWin = true;
            for(let j=0; j<5; j++){
                if(!numbers.includes(currentCard[i][j]) && !(i===2 && j===2)) rowWin = false;
                if(!numbers.includes(currentCard[j][i]) && !(j===2 && i===2)) colWin = false;
            }
            if(rowWin || colWin) return true;
        }
        return false; // Diagonals not included for simplicity
    };

    return (
        <div className="min-h-screen p-4 lg:p-8 bg-teal-900 text-white flex items-center justify-center">
            <Card className="w-full max-w-2xl bg-teal-800/50 border-teal-700">
                <CardHeader className="text-center">
                    <CardTitle className="text-4xl text-yellow-300 flex items-center justify-center gap-2"><Ticket /> Bingo Rush</CardTitle>
                    <p className="text-gray-300">Balance: ₹{user?.wallet_balance || 0}</p>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <div className="w-2/3">
                            <div className="grid grid-cols-5 text-center font-bold text-2xl mb-2">
                                {['B','I','N','G','O'].map(l => <div key={l}>{l}</div>)}
                            </div>
                            <div className="grid grid-cols-5 gap-1 bg-slate-900 p-2 rounded-lg">
                                {card ? card.flat().map((num, i) => (
                                    <div key={i} className={`w-16 h-16 flex items-center justify-center rounded-full text-lg font-bold
                                        ${i === 12 ? 'bg-yellow-500 text-black' : 'bg-blue-500'}
                                        ${drawnNumbers.includes(num) ? 'ring-4 ring-green-400 opacity-50' : ''}`}>
                                        {i === 12 ? 'FREE' : num}
                                    </div>
                                )) : [...Array(25)].map((_, i) => <div key={i} className="w-16 h-16 bg-slate-700 rounded-full"/>)}
                            </div>
                        </div>
                        <div className="w-1/3">
                            <h3 className="font-bold mb-2">Drawn Numbers</h3>
                            <div className="h-96 overflow-y-auto bg-slate-900 p-2 rounded-lg flex flex-wrap gap-1">
                                {drawnNumbers.map(n => <Badge key={n}>{n}</Badge>)}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        {gameState === 'start' && <Button onClick={buyCard} size="lg">Buy Card (₹{BINGO_CARD_PRICE})</Button>}
                        {gameState === 'drawing' && <p className="text-2xl animate-pulse">Drawing Numbers...</p>}
                        {gameState === 'finished' && (
                            <div className="space-y-4">
                                <p className="text-4xl font-bold text-green-400">BINGO!</p>
                                <Button onClick={buyCard} size="lg">Play Again</Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}