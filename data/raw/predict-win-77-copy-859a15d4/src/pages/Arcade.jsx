
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Puzzle, Coins, Bomb, Dices, Disc, Flame, Car, Droplets, Rocket, 
  GitCompareArrows, RotateCw, Egg, Zap, Plane, Target, Fish, 
  Spade, MousePointer, 
  Heart, Club, Diamond, Trophy as KenoIcon,
  Scaling, Users, Star, Ticket,
  Gem, BrainCircuit // Added new icons
} from 'lucide-react';

const games = [
  {
    title: "Heds or Tels",
    description: "A simple 50/50 coin flip. Double your money or lose it all.",
    icon: Coins,
    page: "HedsOrTels",
    color: "from-yellow-500 to-orange-500",
    status: "Live"
  },
  {
    title: "Mines",
    description: "Uncover gems and avoid the mines. The more you find, the more you win!",
    icon: Bomb,
    page: "Mines",
    color: "from-red-500 to-rose-500",
    status: "Live"
  },
  {
    title: "Anderbahar",
    description: "A classic card guessing game. Bet on Andar or Bahar.",
    icon: Puzzle,
    page: "Anderbhar",
    color: "from-purple-500 to-indigo-500",
    status: "Live"
  },
  {
    title: "Jhandi Munda",
    description: "A classic Indian dice game. Bet on the symbol that appears most!",
    icon: Dices,
    page: "JhandiMunda",
    color: "from-orange-500 to-amber-500",
    status: "Live"
  },
  {
    title: "Treasure Box",
    description: "Open treasure boxes to find gems and increase your winnings. Avoid the bomb!",
    icon: Gem,
    page: "TreasureBox",
    color: "from-pink-500 to-fuchsia-500",
    status: "Live"
  },
  {
    title: "Quiz Arena",
    description: "Test your knowledge and answer questions to earn rewards.",
    icon: BrainCircuit,
    page: "Quiz",
    color: "from-purple-500 to-indigo-500",
    status: "Live"
  },
  {
    title: "Chekian Road",
    description: "An adventure journey with risks and rewards. Choose your path wisely!",
    icon: Puzzle,
    page: "ChekianRoad",
    color: "from-green-500 to-teal-500",
    status: "Live"
  },
  {
    title: "7Up 7Down",
    description: "Bet on the sum of two dice. Will it be above, below, or exactly 7?",
    icon: Dices,
    page: "7Up7Down",
    color: "from-cyan-500 to-blue-500",
    status: "Live"
  },
  {
    title: "Rullotr",
    description: "Spin the wheel and bet on colors or numbers for big payouts.",
    icon: Disc,
    page: "Rullotr",
    color: "from-green-500 to-emerald-500",
    status: "Live"
  },
  {
    title: "Dragon Tiger",
    description: "A fast-paced card game. Bet on Dragon, Tiger or a Tie.",
    icon: Flame,
    page: "DragonTiger",
    color: "from-red-600 to-orange-500",
    status: "Live"
  },
  {
    title: "Car Roulette",
    description: "Bet on your favorite car brands in this modern roulette twist.",
    icon: Car,
    page: "CarRoulette",
    color: "from-blue-600 to-indigo-700",
    status: "Live"
  },
  {
    title: "Plinko",
    description: "Drop the ball and watch it bounce to big multipliers.",
    icon: Droplets,
    page: "Plinko",
    color: "from-purple-600 to-pink-500",
    status: "Live"
  },
  {
    title: "SkyBlast: Crash & Cash",
    description: "Cash out before the rocket crashes to win big multipliers.",
    icon: Rocket,
    page: "SkyBlast",
    color: "from-cyan-500 to-teal-500",
    status: "Live"
  },
  {
    title: "Parity",
    description: "Bet on odd/even, number ranges, or specific numbers.",
    icon: GitCompareArrows,
    page: "Parity",
    color: "from-fuchsia-500 to-cyan-500",
    status: "Live"
  },
  {
    title: "Dice Roll",
    description: "Predict the exact sum of two dice for a big win.",
    icon: Dices,
    page: "DiceRoll",
    color: "from-amber-500 to-yellow-500",
    status: "Live"
  },
  {
    title: "Spin & Win",
    description: "A simple and fun wheel of fortune with instant prizes.",
    icon: RotateCw,
    page: "SpinToWin",
    color: "from-lime-500 to-green-500",
    status: "Live"
  },
  {
    title: "Chicken Road",
    description: "Help the chicken cross the road and collect eggs for rewards.",
    icon: Egg,
    page: "ChickenRoad",
    color: "from-orange-400 to-yellow-500",
    status: "Live"
  },
  {
    title: "Penalty Unlimited",
    description: "Score goals in a penalty shootout to win.",
    icon: Zap,
    page: "Penalty",
    color: "from-green-500 to-lime-600",
    status: "Live"
  },
  {
    title: "Avia Fly",
    description: "An Aviator-style crash game. Cash out before it's too late!",
    icon: Plane,
    page: "SkyBlast",
    color: "from-sky-400 to-cyan-500",
    status: "Live"
  },
  {
    title: "In-Out Game",
    description: "Predict if the number will be In (3-6) or Out (0-2, 7-9).",
    icon: Target,
    page: "InOut",
    color: "from-violet-500 to-purple-600",
    status: "Live"
  },
  {
    title: "Coin Flip",
    description: "Classic heads or tails. Simple 50/50 chance to double your money.",
    icon: Coins,
    page: "CoinFlip",
    color: "from-gold-400 to-yellow-500",
    status: "Live"
  },
  {
    title: "Hamster Run",
    description: "Run as far as you can! Avoid obstacles and collect coins.",
    icon: MousePointer,
    page: "HamsterRun",
    color: "from-pink-500 to-rose-500",
    status: "Live"
  },
  {
    title: "Teen Patti",
    description: "The classic Indian card game. Beat the dealer's hand.",
    icon: Spade,
    page: "TeenPatti",
    color: "from-red-700 to-pink-600",
    status: "Live"
  },
  {
    title: "Fish Hunter",
    description: "Shoot fish in the ocean and win based on your catch!",
    icon: Fish,
    page: "FishHunter",
    color: "from-blue-500 to-teal-600",
    status: "Live"
  },
  {
    title: "Blackjack 21",
    description: "The classic card game. Beat the dealer by getting as close to 21 as possible.",
    icon: Spade,
    page: "Blackjack",
    color: "from-green-600 to-gray-800",
    status: "Live"
  },
  {
    title: "Baccarat",
    description: "A high-stakes game of chance. Bet on Player, Banker, or a Tie.",
    icon: Diamond,
    page: "Baccarat",
    color: "from-red-700 to-yellow-600",
    status: "Live"
  },
  {
    title: "Video Poker",
    description: "Combine skill and luck to create the best five-card poker hand.",
    icon: Club,
    page: "VideoPoker",
    color: "from-blue-700 to-indigo-800",
    status: "Live"
  },
  {
    title: "Keno",
    description: "A fun, lottery-style game. Pick your lucky numbers and hope they match!",
    icon: KenoIcon,
    page: "Keno",
    color: "from-purple-600 to-fuchsia-700",
    status: "Live"
  },
  {
    title: "Sic Bo",
    description: "An ancient Chinese dice game. Bet on various outcomes of three dice.",
    icon: Dices,
    page: "SicBo",
    color: "from-slate-500 to-slate-700",
    status: "Live"
  },
  {
    title: "3 Card Poker",
    description: "A quick and easy poker variant played against the dealer.",
    icon: Users,
    page: "ThreeCardPoker",
    color: "from-green-700 to-green-900",
    status: "Live"
  },
  {
    title: "Hi-Lo",
    description: "Guess if the next card is higher or lower. Build your streak!",
    icon: Scaling,
    page: "HiLo",
    color: "from-indigo-500 to-violet-600",
    status: "Live"
  },
  {
    title: "Scratch & Win",
    description: "Instant gratification! Scratch the card to reveal your prize.",
    icon: Star,
    page: "ScratchCard",
    color: "from-purple-700 to-pink-700",
    status: "Live"
  },
  {
    title: "Bingo Rush",
    description: "A fast-paced single-player bingo game for quick wins.",
    icon: Ticket,
    page: "Bingo",
    color: "from-teal-500 to-cyan-600",
    status: "Live"
  }
];

export default function ArcadePage() {
  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full px-4 py-2 mb-6">
            <Puzzle className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-300">21 Amazing Games</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
            Arcade Zone
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            The ultimate collection of earning games - from prediction to skill-based challenges!
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm overflow-hidden group hover:scale-105 transition-all duration-300 hover:border-purple-500">
              <CardContent className="p-0">
                <div className={`h-20 bg-gradient-to-r ${game.color} flex items-center justify-center`}>
                  <game.icon className="w-10 h-10 text-white/80" />
                </div>
                <div className="p-4">
                  <CardTitle className="text-white text-lg mb-2">{game.title}</CardTitle>
                  <p className="text-gray-400 text-sm min-h-[40px]">{game.description}</p>
                  
                  <div className="mt-4">
                    {game.status === 'Live' ? (
                      <Link to={createPageUrl(game.page)}>
                        <Button className={`w-full bg-gradient-to-r ${game.color} hover:opacity-90 text-white py-2 text-sm`}>
                          Play Now
                        </Button>
                      </Link>
                    ) : (
                      <Button disabled className="w-full bg-slate-700 text-gray-400 py-2 text-sm">
                        Coming Soon
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
