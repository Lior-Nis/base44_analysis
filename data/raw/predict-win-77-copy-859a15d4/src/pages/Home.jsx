
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { ColourGame, ColourBet, CricketMatch, CricketBet } from "@/api/entities";
import { 
  Gamepad2, 
  Trophy, 
  Wallet, 
  TrendingUp, 
  Clock,
  Zap,
  Target,
  Award,
  Users,
  PlayCircle,
  AlertCircle,
  Star,
  Quote,
  Sparkles,
  Flame,
  Gift
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import LiveWinTracker from '../components/games/LiveWinTracker';

const testimonials = [
  {
    name: "Rohan S.",
    quote: "I've tried many prediction apps, but PredictWin 77 is the best! The color prediction game is fast and the results feel fair. I won ₹5,000 last week!",
    stars: 5,
    avatar: "🎯",
    location: "Mumbai"
  },
  {
    name: "Priya K.",
    quote: "The cricket betting section is amazing. Great odds and all the major matches are available. The interface is super easy to use.",
    stars: 5,
    avatar: "🏏",
    location: "Delhi"
  },
  {
    name: "Amit G.",
    quote: "Withdrawing my winnings was quick and easy. The support team is also very responsive. Highly recommend this platform for anyone interested in prediction games.",
    stars: 4,
    avatar: "💰",
    location: "Bangalore"
  }
];

export default function Home() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalBets: 0,
    totalWinnings: 0,
    winRate: 0,
    activeGames: 0
  });
  const [recentGames, setRecentGames] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const gameFeatures = [
    {
      title: "Colour Prediction",
      description: "Predict Red, Green, or Violet and win instantly! Fast-paced games every minute with high rewards.",
      reward: "Up to 4.5x Returns",
      color: "from-red-500 to-pink-500",
      icon: Target,
      link: "ColourGame",
      emoji: "🎯"
    },
    {
      title: "Cricket Betting",
      description: "Bet on live cricket matches and tournaments. Use your sports knowledge to earn big!",
      reward: "Live Match Betting",
      color: "from-blue-500 to-cyan-500",
      icon: Trophy,
      link: "Cricket",
      emoji: "🏏"
    }
  ];

  useEffect(() => {
    document.title = 'WinVerse: The Ultimate Real Money Play Hub';
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userData = await User.me();
      setUser(userData);

      // Load user stats with error handling
      try {
        const colourBets = await ColourBet.filter({ user_id: userData.id });
        const cricketBets = await CricketBet.filter({ user_id: userData.id });
        
        const totalBets = colourBets.length + cricketBets.length;
        const wonBets = colourBets.filter(b => b.status === 'won').length + 
                       cricketBets.filter(b => b.status === 'won').length;
        const totalWinnings = colourBets.reduce((sum, b) => sum + (b.actual_win || 0), 0) +
                             cricketBets.reduce((sum, b) => sum + (b.actual_win || 0), 0);
        
        setStats({
          totalBets,
          totalWinnings,
          winRate: totalBets > 0 ? parseFloat(((wonBets / totalBets) * 100).toFixed(1)) : 0,
          activeGames: colourBets.filter(b => b.status === 'pending').length +
                      cricketBets.filter(b => b.status === 'pending').length
        });
      } catch (error) {
        console.error("Error loading user stats:", error);
        setStats({
            totalBets: 0,
            totalWinnings: 0,
            winRate: 0,
            activeGames: 0
        });
      }

      // Load recent games with error handling
      try {
        const recentColourGames = await ColourGame.list('-created_date', 3);
        setRecentGames(recentColourGames);
      } catch (error) {
        console.error("Error loading recent games:", error);
        setRecentGames([]);
      }

      // Load upcoming matches with error handling
      try {
        const matches = await CricketMatch.filter({ status: 'upcoming' }, '-match_date', 3);
        setUpcomingMatches(matches);
      } catch (error) {
        console.error("Error loading matches:", error);
        setUpcomingMatches([]);
      }

    } catch (error) {
      console.error("Critical error loading data:", error);
      setError("Failed to load dashboard data. Please refresh the page or check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen p-4 lg:p-8 flex items-start justify-center pt-20">
        <div className="max-w-7xl mx-auto w-full">
          <Alert className="border-red-500/30 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300 flex items-center justify-between">
              <span>{error}</span>
              <Button 
                onClick={loadData}
                variant="outline"
                size="sm"
                className="ml-4 border-red-500 text-red-400 hover:bg-red-500/10"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Hero Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full px-6 py-3 mb-8"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="w-5 h-5 text-yellow-400" />
            </motion.div>
            <span className="text-sm text-gray-300 font-medium">Live Prediction Games • 24/7</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl lg:text-7xl font-bold text-white mb-6"
          >
            Welcome to{" "}
            <span className="relative">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                PredictWin
              </span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-4 -right-8 text-2xl"
              >
                ✨
              </motion.div>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            Test your prediction skills with our exciting colour and cricket games. 
            Win real money with every correct prediction! 🎯
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <Link to={createPageUrl("ColourGame")}>
              <Button size="lg" className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-10 py-4 text-lg font-semibold shadow-2xl hover:shadow-red-500/25 transition-all duration-300">
                <PlayCircle className="w-6 h-6 mr-3" />
                🚀 Start Playing
              </Button>
            </Link>
            <Link to={createPageUrl("Wallet")}>
              <Button variant="outline" size="lg" className="border-2 border-purple-500 text-purple-400 hover:bg-purple-500/10 px-10 py-4 text-lg font-semibold">
                <Wallet className="w-6 h-6 mr-3" />
                💰 Add Money
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Live Win Tracker */}
        <LiveWinTracker />

        {/* Enhanced Stats Cards */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {[
              { icon: Target, label: "Total Bets", value: stats.totalBets, color: "purple", emoji: "🎯" },
              { icon: TrendingUp, label: "Total Won", value: `₹${stats.totalWinnings}`, color: "green", emoji: "💰" },
              { icon: Award, label: "Win Rate", value: `${stats.winRate}%`, color: "yellow", emoji: "🏆" },
              { icon: Clock, label: "Active Bets", value: stats.activeGames, color: "blue", emoji: "⚡" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className={`bg-slate-800/50 border-${stat.color}-500/20 backdrop-blur-sm relative overflow-hidden`}>
                  <div className={`absolute inset-0 bg-gradient-to-r from-${stat.color}-500/5 to-transparent`} />
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className={`w-8 h-8 text-${stat.color}-400`} />
                      <Badge variant="outline" className={`bg-${stat.color}-500/20 text-${stat.color}-300 border-${stat.color}-500/30`}>
                        {stat.emoji}
                      </Badge>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Enhanced Game Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="grid lg:grid-cols-2 gap-8 mb-12"
        >
          {gameFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + index * 0.2 }}
              whileHover={{ scale: 1.02, y: -10 }}
            >
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm overflow-hidden group hover:shadow-2xl transition-all duration-500">
                <CardContent className="p-0">
                  <div className={`h-3 bg-gradient-to-r ${feature.color}`} />
                  <div className="p-8">
                    <div className="flex items-center gap-6 mb-6">
                      <div className={`w-20 h-20 rounded-3xl bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-xl`}>
                        <span className="text-3xl">{feature.emoji}</span>
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-white mb-3">{feature.title}</h3>
                        <Badge className={`bg-gradient-to-r ${feature.color} text-white border-0 px-4 py-2 text-sm font-semibold`}>
                          {feature.reward}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-8 text-lg leading-relaxed">{feature.description}</p>
                    <Link to={createPageUrl(feature.link)}>
                      <Button className={`w-full bg-gradient-to-r ${feature.color} hover:opacity-90 text-white py-4 text-lg font-semibold shadow-xl transition-all duration-300`}>
                        <PlayCircle className="w-5 h-5 mr-2" />
                        Play Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Testimonials Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="mb-12"
        >
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <span>What Our Players Say</span>
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                💬
              </motion.span>
            </h2>
            <p className="text-gray-400 text-lg">Join thousands of happy players winning every day!</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 + index * 0.2 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 h-full">
                  <CardContent className="p-6 relative">
                    <Quote className="w-10 h-10 text-purple-400 mb-4 opacity-60" />
                    <p className="text-gray-300 mb-6 text-lg leading-relaxed">"{testimonial.quote}"</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                          {testimonial.avatar}
                        </div>
                        <div>
                          <p className="font-bold text-white text-lg">{testimonial.name}</p>
                          <p className="text-gray-400 text-sm">{testimonial.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(testimonial.stars)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="grid lg:grid-cols-2 gap-8"
        >
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3 text-xl">
                <Gamepad2 className="w-6 h-6 text-purple-400" />
                Recent Colour Games
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  Live
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentGames.length > 0 ? (
                <div className="space-y-4">
                  {recentGames.map((game, index) => (
                    <motion.div
                      key={game.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl hover:bg-slate-700/70 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full ${
                          game.result_colour === 'red' ? 'bg-red-500' :
                          game.result_colour === 'green' ? 'bg-green-500' : 'bg-violet-500'
                        } flex items-center justify-center shadow-lg`}>
                          <span className="text-white font-bold text-lg">{game.result_number}</span>
                        </div>
                        <div>
                          <div className="text-white font-semibold text-lg">#{game.game_number?.slice(-4)}</div>
                          <div className="text-sm text-gray-400">Result: {game.result_number}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-gray-300 border-gray-500/30">
                        {game.status}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Gamepad2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No recent games</p>
                  <p className="text-sm">Start playing to see your game history!</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3 text-xl">
                <Trophy className="w-6 h-6 text-blue-400" />
                Upcoming Matches
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  Cricket
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingMatches.length > 0 ? (
                <div className="space-y-4">
                  {upcomingMatches.map((match, index) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-slate-700/50 rounded-xl hover:bg-slate-700/70 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-white font-semibold text-lg">{match.match_name}</div>
                        <Badge variant="outline" className="text-blue-300 border-blue-500/30">
                          {match.status}
                        </Badge>
                      </div>
                      <div className="text-gray-300 mb-2">
                        🏏 {match.team_a} vs {match.team_b}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(match.match_date).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No upcoming matches</p>
                  <p className="text-sm">Check back later for cricket betting opportunities!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
