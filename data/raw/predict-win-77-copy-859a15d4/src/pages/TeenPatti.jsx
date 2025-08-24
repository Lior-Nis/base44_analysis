import React, { useState, useEffect } from 'react';
import { User, TeenPattiGame, TeenPattiBet } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spade, Timer, Coins, Trophy } from 'lucide-react';

const CARD_SUITS = ['♠', '♥', '♦', '♣'];
const CARD_VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export default function TeenPattiPage() {
  const [user, setUser] = useState(null);
  const [currentGame, setCurrentGame] = useState(null);
  const [userBets, setUserBets] = useState([]);
  const [betAmount, setBetAmount] = useState(10);
  const [gamePhase, setGamePhase] = useState('betting'); // betting, dealing, result
  const [timeLeft, setTimeLeft] = useState(30);
  const [recentGames, setRecentGames] = useState([]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentGame && gamePhase === 'betting') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGamePhase('dealing');
            setTimeout(() => {
              completeGame();
            }, 3000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentGame, gamePhase]);

  const loadData = async () => {
    const userData = await User.me();
    setUser(userData);

    // Check for active game
    let activeGame = await TeenPattiGame.filter({ status: 'betting' });
    if (activeGame.length === 0) {
      createNewGame();
    } else {
      setCurrentGame(activeGame[0]);
      loadUserBets(userData.id, activeGame[0].id);
    }

    // Load recent games
    const recent = await TeenPattiGame.filter({ status: 'completed' }, '-created_date', 10);
    setRecentGames(recent);
  };

  const createNewGame = async () => {
    const gameNumber = `TP${Date.now()}`;
    const newGame = await TeenPattiGame.create({
      game_number: gameNumber,
      status: 'betting'
    });
    setCurrentGame(newGame);
    setTimeLeft(30);
    setGamePhase('betting');
    setUserBets([]);
  };

  const loadUserBets = async (userId, gameId) => {
    const bets = await TeenPattiBet.filter({ user_id: userId, game_id: gameId });
    setUserBets(bets);
  };

  const placeBet = async (betOn) => {
    if (!user || !currentGame || gamePhase !== 'betting' || timeLeft <= 3) return;
    if (user.wallet_balance < betAmount) {
      alert('Insufficient balance!');
      return;
    }
    if (userBets.find(b => b.bet_on === betOn)) {
      alert('You already bet on this option!');
      return;
    }

    const newBalance = user.wallet_balance - betAmount;
    await User.updateMyUserData({ wallet_balance: newBalance });
    setUser(prev => ({ ...prev, wallet_balance: newBalance }));

    await TeenPattiBet.create({
      user_id: user.id,
      game_id: currentGame.id,
      bet_on: betOn,
      bet_amount: betAmount
    });

    loadUserBets(user.id, currentGame.id);
  };

  const generateCard = () => {
    const suit = CARD_SUITS[Math.floor(Math.random() * CARD_SUITS.length)];
    const value = CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)];
    return `${value}${suit}`;
  };

  const evaluateHand = (cards) => {
    const values = cards.map(card => {
      const val = card.slice(0, -1);
      if (val === 'A') return 14;
      if (val === 'K') return 13;
      if (val === 'Q') return 12;
      if (val === 'J') return 11;
      return parseInt(val);
    }).sort((a, b) => b - a);

    const suits = cards.map(card => card.slice(-1));
    const isFlush = suits.every(suit => suit === suits[0]);
    const isStraight = values[0] - values[2] === 2 && values[0] - values[1] === 1 && values[1] - values[2] === 1;
    
    // Hand rankings (higher is better)
    if (isStraight && isFlush) return 8; // Straight Flush
    if (values[0] === values[1] && values[1] === values[2]) return 7; // Trail
    if (isStraight) return 6; // Straight
    if (isFlush) return 5; // Flush
    if (values[0] === values[1] || values[1] === values[2]) return 4; // Pair
    return values[0] + values[1] + values[2]; // High Card
  };

  const completeGame = async () => {
    if (!currentGame) return;

    const playerCards = [generateCard(), generateCard(), generateCard()];
    const dealerCards = [generateCard(), generateCard(), generateCard()];
    
    const playerScore = evaluateHand(playerCards);
    const dealerScore = evaluateHand(dealerCards);
    
    let winner = 'tie';
    if (playerScore > dealerScore) winner = 'player';
    else if (dealerScore > playerScore) winner = 'dealer';

    await TeenPattiGame.update(currentGame.id, {
      player_cards: playerCards,
      dealer_cards: dealerCards,
      winning_hand: winner,
      status: 'completed'
    });

    // Process bets
    const allBets = await TeenPattiBet.filter({ game_id: currentGame.id });
    const userUpdates = {};

    for (const bet of allBets) {
      let winAmount = 0;
      let multiplier = 0;

      if ((bet.bet_on === 'player' && winner === 'player') ||
          (bet.bet_on === 'dealer' && winner === 'dealer')) {
        multiplier = 2.0;
        winAmount = bet.bet_amount * multiplier;
      } else if (bet.bet_on === 'tie' && winner === 'tie') {
        multiplier = 8.0;
        winAmount = bet.bet_amount * multiplier;
      }

      await TeenPattiBet.update(bet.id, {
        status: winAmount > 0 ? 'won' : 'lost',
        win_amount: winAmount
      });

      if (winAmount > 0) {
        if (!userUpdates[bet.user_id]) {
          const betUser = await User.get(bet.user_id);
          userUpdates[bet.user_id] = betUser.wallet_balance || 0;
        }
        userUpdates[bet.user_id] += winAmount;
      }
    }

    // Update user balances
    for (const [userId, newBalance] of Object.entries(userUpdates)) {
      await User.update(userId, { wallet_balance: newBalance });
      if (userId === user.id) {
        setUser(prev => ({ ...prev, wallet_balance: newBalance }));
      }
    }

    setGamePhase('result');
    setTimeout(() => {
      createNewGame();
    }, 10000);
  };

  const formatTime = (seconds) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const getCardColor = (card) => {
    const suit = card.slice(-1);
    return suit === '♥' || suit === '♦' ? 'text-red-500' : 'text-gray-900';
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">♠ Teen Patti ♠</h1>
          <p className="text-gray-300">The classic Indian card game - Beat the dealer's hand!</p>
        </div>

        {/* Game Timer */}
        <Card className="mb-8 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Timer className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="text-4xl font-bold text-white">{formatTime(timeLeft)}</div>
                <div className="text-sm text-gray-300">
                  {gamePhase === 'betting' ? 'Betting Time' : 
                   gamePhase === 'dealing' ? 'Dealing Cards...' : 'Game Finished'}
                </div>
              </div>
            </div>
            {currentGame && (
              <Badge className="bg-purple-500/20 text-purple-300">
                Game #{currentGame.game_number?.slice(-4)}
              </Badge>
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Betting Section */}
          <div className="lg:col-span-2 space-y-6">
            {gamePhase === 'betting' && (
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Place Your Bets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <label className="text-white block mb-2">Bet Amount</label>
                    <Input
                      type="number"
                      min="10"
                      max={user?.wallet_balance || 0}
                      value={betAmount}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <Button
                      onClick={() => placeBet('player')}
                      disabled={gamePhase !== 'betting' || timeLeft <= 3 || userBets.find(b => b.bet_on === 'player')}
                      className={`h-20 text-white text-lg font-bold bg-blue-600 hover:bg-blue-700 ${userBets.find(b => b.bet_on === 'player') ? 'ring-4 ring-yellow-400' : ''}`}
                    >
                      PLAYER
                      <div className="text-xs">2x Payout</div>
                    </Button>
                    <Button
                      onClick={() => placeBet('tie')}
                      disabled={gamePhase !== 'betting' || timeLeft <= 3 || userBets.find(b => b.bet_on === 'tie')}
                      className={`h-20 text-white text-lg font-bold bg-yellow-600 hover:bg-yellow-700 ${userBets.find(b => b.bet_on === 'tie') ? 'ring-4 ring-yellow-400' : ''}`}
                    >
                      TIE
                      <div className="text-xs">8x Payout</div>
                    </Button>
                    <Button
                      onClick={() => placeBet('dealer')}
                      disabled={gamePhase !== 'betting' || timeLeft <= 3 || userBets.find(b => b.bet_on === 'dealer')}
                      className={`h-20 text-white text-lg font-bold bg-red-600 hover:bg-red-700 ${userBets.find(b => b.bet_on === 'dealer') ? 'ring-4 ring-yellow-400' : ''}`}
                    >
                      DEALER
                      <div className="text-xs">2x Payout</div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cards Display */}
            {(gamePhase === 'dealing' || gamePhase === 'result') && currentGame && (
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white text-center">Card Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-blue-400 mb-4">PLAYER</h3>
                      <div className="flex justify-center gap-2">
                        {currentGame.player_cards?.map((card, index) => (
                          <div key={index} className={`w-16 h-24 bg-white rounded-lg flex items-center justify-center text-lg font-bold ${getCardColor(card)}`}>
                            {card}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-red-400 mb-4">DEALER</h3>
                      <div className="flex justify-center gap-2">
                        {currentGame.dealer_cards?.map((card, index) => (
                          <div key={index} className={`w-16 h-24 bg-white rounded-lg flex items-center justify-center text-lg font-bold ${getCardColor(card)}`}>
                            {card}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {gamePhase === 'result' && (
                    <div className="text-center mt-6">
                      <Badge className={`text-lg px-4 py-2 ${
                        currentGame.winning_hand === 'player' ? 'bg-blue-500' :
                        currentGame.winning_hand === 'dealer' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}>
                        {currentGame.winning_hand?.toUpperCase()} WINS!
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Bets */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  Your Bets
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userBets.length > 0 ? (
                  <div className="space-y-2">
                    {userBets.map(bet => (
                      <div key={bet.id} className="flex justify-between items-center bg-slate-700/50 p-2 rounded-lg">
                        <span className="text-white font-bold">{bet.bet_on.toUpperCase()}</span>
                        <span className="text-yellow-400">₹{bet.bet_amount}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">No bets placed yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Results */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-green-400" />
                  Recent Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentGames.length > 0 ? (
                  <div className="space-y-2">
                    {recentGames.map((game) => (
                      <div key={game.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                        <span className="text-white">#{game.game_number?.slice(-4)}</span>
                        <Badge className={
                          game.winning_hand === 'player' ? 'bg-blue-500/20 text-blue-300' :
                          game.winning_hand === 'dealer' ? 'bg-red-500/20 text-red-300' : 
                          'bg-yellow-500/20 text-yellow-300'
                        }>
                          {game.winning_hand?.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    <Spade className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No results yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}