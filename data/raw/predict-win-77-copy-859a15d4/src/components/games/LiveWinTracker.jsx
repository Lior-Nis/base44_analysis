import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ColourBet, SlotSpin, CricketBet, FootballBet } from '@/api/entities';
import { Award } from 'lucide-react';

export default function LiveWinTracker() {
  const [wins, setWins] = useState([]);

  useEffect(() => {
    const fetchWins = async () => {
      try {
        const [colorWins, slotWins, cricketWins, footballWins] = await Promise.all([
          ColourBet.filter({ status: 'won' }, '-created_date', 10),
          SlotSpin.filter({ total_win: { '>': 0 } }, '-created_date', 10),
          CricketBet.filter({ status: 'won' }, '-created_date', 10),
          FootballBet.filter({ status: 'won' }, '-created_date', 10),
        ]);

        const allWins = [
          ...colorWins.map(w => ({ id: w.id, user: w.user_id, amount: w.actual_win, game: 'Colour Game' })),
          ...slotWins.map(w => ({ id: w.id, user: w.user_id, amount: w.total_win, game: w.game_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) })),
          ...cricketWins.map(w => ({ id: w.id, user: w.user_id, amount: w.actual_win, game: 'Cricket' })),
          ...footballWins.map(w => ({ id: w.id, user: w.user_id, amount: w.actual_win, game: 'Football' })),
        ].sort(() => 0.5 - Math.random()).slice(0, 15); // Sort randomly and take 15

        setWins(allWins);
      } catch (error) {
        console.error("Error fetching live wins:", error);
      }
    };

    fetchWins();
    const interval = setInterval(fetchWins, 15000); // Refresh every 15 seconds
    return () => clearInterval(interval);
  }, []);

  if (wins.length === 0) return null;

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm rounded-xl p-4 my-8">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-yellow-400" />
        Live Wins
      </h3>
      <div className="h-48 overflow-hidden relative">
        <AnimatePresence>
          <motion.div
            className="absolute top-0 left-0 w-full"
            animate={{ y: `-${(wins.length) * 3}rem` }}
            transition={{ duration: wins.length * 2, repeat: Infinity, ease: "linear" }}
          >
            {[...wins, ...wins].map((win, index) => (
              <div key={`${win.id}-${index}`} className="flex items-center justify-between p-2 h-12 text-sm bg-slate-700/30 mb-2 rounded-lg">
                <span className="text-gray-300">Player...{win.user?.slice(-4)}</span>
                <span className="text-white">just won</span>
                <span className="font-bold text-green-400">₹{win.amount.toFixed(2)}</span>
                <span className="text-gray-300">in</span>
                <span className="text-purple-400 font-semibold">{win.game}</span>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}