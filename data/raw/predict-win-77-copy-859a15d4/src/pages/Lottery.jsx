import React, { useState, useEffect } from 'react';
import { User, LotteryDraw, LotteryTicket } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Ticket, 
  Clock, 
  DollarSign, 
  Shuffle,
  Star,
  Gift,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TICKET_PRICE = 50;
const MAX_NUMBER = 49;
const NUMBERS_TO_PICK = 6;

export default function LotteryPage() {
  const [user, setUser] = useState(null);
  const [currentDraw, setCurrentDraw] = useState(null);
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [recentWinners, setRecentWinners] = useState([]);
  const [timeLeft, setTimeLeft] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentDraw) {
      const timer = setInterval(updateCountdown, 1000);
      return () => clearInterval(timer);
    }
  }, [currentDraw]);

  const loadData = async () => {
    const userData = await User.me();
    setUser(userData);

    // Get current active draw
    const activeDraws = await LotteryDraw.filter({ status: 'active' }, '-draw_time', 1);
    if (activeDraws.length > 0) {
      setCurrentDraw(activeDraws[0]);
      
      // Get user's tickets for this draw
      const userTickets = await LotteryTicket.filter({ 
        user_id: userData.id, 
        draw_id: activeDraws[0].id 
      });
      setMyTickets(userTickets);
    }

    // Get recent winners for social proof
    const recentTickets = await LotteryTicket.filter({ status: 'winner' }, '-created_date', 10);
    setRecentWinners(recentTickets);
  };

  const updateCountdown = () => {
    if (!currentDraw) return;
    
    const now = new Date().getTime();
    const drawTime = new Date(currentDraw.draw_time).getTime();
    const distance = drawTime - now;

    if (distance > 0) {
      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    } else {
      setTimeLeft('Draw in progress...');
    }
  };

  const toggleNumber = (number) => {
    setSelectedNumbers(prev => {
      if (prev.includes(number)) {
        return prev.filter(n => n !== number);
      } else if (prev.length < NUMBERS_TO_PICK) {
        return [...prev, number].sort((a, b) => a - b);
      }
      return prev;
    });
  };

  const quickPick = () => {
    const numbers = [];
    while (numbers.length < NUMBERS_TO_PICK) {
      const num = Math.floor(Math.random() * MAX_NUMBER) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    setSelectedNumbers(numbers.sort((a, b) => a - b));
  };

  const clearNumbers = () => {
    setSelectedNumbers([]);
  };

  const buyTicket = async () => {
    if (selectedNumbers.length !== NUMBERS_TO_PICK) {
      alert(`Please select exactly ${NUMBERS_TO_PICK} numbers`);
      return;
    }

    if (user.wallet_balance < TICKET_PRICE) {
      alert('Insufficient balance! Please add money to your wallet.');
      return;
    }

    setIsLoading(true);
    try {
      // Deduct ticket price from wallet
      const newBalance = user.wallet_balance - TICKET_PRICE;
      await User.updateMyUserData({ wallet_balance: newBalance });

      // Create ticket
      const ticketNumber = `TK${Date.now()}${Math.random().toString(36).substr(2, 4)}`;
      await LotteryTicket.create({
        user_id: user.id,
        draw_id: currentDraw.id,
        ticket_number: ticketNumber,
        selected_numbers: selectedNumbers,
        is_quick_pick: false,
        ticket_price: TICKET_PRICE
      });

      // Update draw totals
      const updatedTotalTickets = (currentDraw.total_tickets || 0) + 1;
      const updatedTotalSales = (currentDraw.total_sales || 0) + TICKET_PRICE;
      await LotteryDraw.update(currentDraw.id, {
        total_tickets: updatedTotalTickets,
        total_sales: updatedTotalSales
      });

      alert('Ticket purchased successfully! Good luck!');
      setSelectedNumbers([]);
      setUser(prev => ({ ...prev, wallet_balance: newBalance }));
      loadData();
    } catch (error) {
      console.error('Error buying ticket:', error);
      alert('Failed to purchase ticket. Please try again.');
    }
    setIsLoading(false);
  };

  const generateNumbers = () => {
    return Array.from({ length: MAX_NUMBER }, (_, i) => i + 1);
  };

  if (!currentDraw) {
    return (
      <div className="min-h-screen p-4 lg:p-8 flex items-center justify-center">
        <Card className="bg-slate-800/50 border-slate-700/50 p-8 text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white mb-2">No Active Draw</h2>
          <p className="text-gray-400">The next lottery draw will be announced soon!</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-full px-4 py-2 mb-6">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-300">LuckyPick Lottery</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
            Win Big Today!
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Pick 6 numbers from 1 to 49 and win amazing prizes. Every ticket has a chance to win the jackpot!
          </p>
        </div>

        {/* Current Jackpot & Countdown */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-500/30">
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
              <div className="text-4xl font-bold text-white mb-2">
                ₹{currentDraw.jackpot_amount?.toLocaleString()}
              </div>
              <div className="text-yellow-300">Current Jackpot</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-blue-500/30">
            <CardContent className="p-6 text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              <div className="text-2xl font-bold text-white mb-2">{timeLeft}</div>
              <div className="text-blue-300">Next Draw</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30">
            <CardContent className="p-6 text-center">
              <Ticket className="w-12 h-12 mx-auto mb-4 text-purple-400" />
              <div className="text-2xl font-bold text-white mb-2">
                {currentDraw.total_tickets || 0}
              </div>
              <div className="text-purple-300">Tickets Sold</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Number Selection */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Pick Your Lucky Numbers
                </CardTitle>
                <p className="text-gray-400">Select {NUMBERS_TO_PICK} numbers from 1 to {MAX_NUMBER}</p>
              </CardHeader>
              <CardContent>
                {/* Selected Numbers Display */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-white font-medium">Selected Numbers:</span>
                    <Badge variant="outline" className="text-yellow-300 border-yellow-500/30">
                      {selectedNumbers.length}/{NUMBERS_TO_PICK}
                    </Badge>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {Array.from({ length: NUMBERS_TO_PICK }, (_, i) => (
                      <div
                        key={i}
                        className={`w-16 h-16 rounded-full border-2 flex items-center justify-center text-xl font-bold ${
                          selectedNumbers[i]
                            ? 'bg-yellow-500 border-yellow-400 text-black'
                            : 'border-slate-600 text-gray-400'
                        }`}
                      >
                        {selectedNumbers[i] || '?'}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-4 mb-6">
                  <Button onClick={quickPick} className="bg-blue-600 hover:bg-blue-700">
                    <Shuffle className="w-4 h-4 mr-2" />
                    Quick Pick
                  </Button>
                  <Button onClick={clearNumbers} variant="outline" className="border-slate-600">
                    Clear All
                  </Button>
                </div>

                {/* Number Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {generateNumbers().map(number => (
                    <motion.button
                      key={number}
                      onClick={() => toggleNumber(number)}
                      className={`w-12 h-12 rounded-lg font-bold transition-all duration-200 ${
                        selectedNumbers.includes(number)
                          ? 'bg-yellow-500 text-black shadow-lg scale-105'
                          : 'bg-slate-700 text-white hover:bg-slate-600 hover:scale-105'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {number}
                    </motion.button>
                  ))}
                </div>

                {/* Purchase Button */}
                <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-white">Ticket Price:</span>
                    <span className="text-2xl font-bold text-yellow-400">₹{TICKET_PRICE}</span>
                  </div>
                  <Button
                    onClick={buyTicket}
                    disabled={selectedNumbers.length !== NUMBERS_TO_PICK || isLoading}
                    className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-black font-bold py-3 text-lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Ticket className="w-5 h-5 mr-2" />
                        Buy Ticket
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* My Tickets */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-blue-400" />
                  My Tickets ({myTickets.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myTickets.length > 0 ? (
                  <div className="space-y-3">
                    {myTickets.map(ticket => (
                      <div key={ticket.id} className="bg-slate-700/50 p-3 rounded-lg">
                        <div className="text-sm text-gray-400 mb-2">
                          #{ticket.ticket_number?.slice(-8)}
                        </div>
                        <div className="flex gap-2">
                          {ticket.selected_numbers.map(num => (
                            <span
                              key={num}
                              className="w-8 h-8 bg-yellow-500 text-black rounded-full flex items-center justify-center text-sm font-bold"
                            >
                              {num}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                          ₹{ticket.ticket_price}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <Ticket className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No tickets yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Prize Structure */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Gift className="w-5 h-5 text-green-400" />
                  Prize Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">6 Numbers:</span>
                  <span className="text-yellow-400 font-bold">Jackpot</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">5 Numbers:</span>
                  <span className="text-green-400">₹10,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">4 Numbers:</span>
                  <span className="text-blue-400">₹1,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">3 Numbers:</span>
                  <span className="text-purple-400">₹100</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Winners */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  Recent Winners
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentWinners.length > 0 ? (
                  <div className="space-y-3">
                    {recentWinners.slice(0, 5).map(winner => (
                      <div key={winner.id} className="flex justify-between items-center">
                        <div>
                          <div className="text-white text-sm">
                            User...{winner.user_id?.slice(-6)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {winner.matches} matches
                          </div>
                        </div>
                        <Badge className="bg-green-500/20 text-green-300">
                          ₹{winner.win_amount}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No winners yet</p>
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