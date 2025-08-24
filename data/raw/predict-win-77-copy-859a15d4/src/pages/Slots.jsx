
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { SlotGame } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gamepad2, 
  Star, 
  Crown, 
  Zap, 
  Trophy,
  Search,
  Filter,
  Flame,
  Gem
} from 'lucide-react';

export default function SlotsPage() {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('all');

  useEffect(() => {
    loadGames();
  }, []);

  useEffect(() => {
    filterGames();
  }, [games, searchTerm, selectedTheme]);

  const loadGames = async () => {
    try {
      const allGames = await SlotGame.filter({ status: 'active' }, 'title');
      setGames(allGames);
    } catch (error) {
      console.error("Error loading games:", error);
    }
  };

  const filterGames = () => {
    let filtered = games;
    
    if (searchTerm) {
      filtered = filtered.filter(game => 
        game.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedTheme !== 'all') {
      filtered = filtered.filter(game => game.theme === selectedTheme);
    }
    
    setFilteredGames(filtered);
  };

  const themes = [
    { key: 'all', label: 'All Games', icon: Gamepad2 },
    { key: 'classic', label: 'Classic', icon: Star },
    { key: 'ancient', label: 'Ancient', icon: Crown },
    { key: 'adventure', label: 'Adventure', icon: Zap },
    { key: 'fantasy', label: 'Fantasy', icon: Gem },
    { key: 'animal', label: 'Animal', icon: Trophy },
    { key: 'sport', label: 'Sport', icon: Trophy },
    { key: 'mystery', label: 'Mystery', icon: Flame }
  ];

  const getThemeColor = (theme) => {
    const colors = {
      adventure: 'from-green-500 to-emerald-500',
      ancient: 'from-yellow-500 to-orange-500',
      fantasy: 'from-purple-500 to-pink-500',
      classic: 'from-blue-500 to-cyan-500',
      animal: 'from-green-400 to-teal-500',
      sport: 'from-red-500 to-rose-500',
      mystery: 'from-indigo-500 to-purple-600'
    };
    return colors[theme] || 'from-gray-500 to-gray-600';
  };

  const getThemeIcon = (theme) => {
    const icons = {
      adventure: Zap,
      ancient: Crown,
      fantasy: Gem,
      classic: Star,
      animal: Trophy,
      sport: Trophy,
      mystery: Flame
    };
    const IconComponent = icons[theme] || Gamepad2;
    return IconComponent;
  };

  // Featured games (jackpot enabled or high RTP)
  const featuredGames = games.filter(game => game.jackpot_enabled || game.rtp >= 97);
  const newGames = games.slice(-6); // Last 6 games as "new"
  const popularGames = games.filter(game => game.rtp >= 96 && !game.jackpot_enabled);

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full px-4 py-2 mb-6">
            <Gamepad2 className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-300">Yono-Style Premium Slots</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
            Slot Games
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Experience 50+ premium Yono-style slot games with amazing themes and big wins!
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-600 text-white"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {themes.map(theme => {
              const IconComponent = theme.icon;
              return (
                <Button
                  key={theme.key}
                  variant={selectedTheme === theme.key ? "default" : "outline"}
                  onClick={() => setSelectedTheme(theme.key)}
                  className={`whitespace-nowrap ${
                    selectedTheme === theme.key 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'border-slate-600 text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {theme.label}
                </Button>
              );
            })}
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
            <TabsTrigger value="all">All Games</TabsTrigger>
            <TabsTrigger value="featured">
              <Crown className="w-4 h-4 mr-2" />
              Featured
            </TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {filteredGames.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredGames.map((game) => {
                  const IconComponent = getThemeIcon(game.theme);
                  const gameColorScheme = game.color_scheme || getThemeColor(game.theme);
                  
                  return (
                    <Card key={game.id} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm overflow-hidden group hover:scale-105 transition-all duration-300 hover:border-purple-500">
                      <CardContent className="p-0">
                        <div className={`h-24 bg-gradient-to-r ${gameColorScheme} flex items-center justify-center relative`}>
                          {game.game_icon ? (
                            <div className="text-4xl">{game.game_icon}</div>
                          ) : (
                            <IconComponent className="w-12 h-12 text-white/80" />
                          )}
                          {game.jackpot_enabled && (
                            <Badge className="absolute top-2 right-2 bg-yellow-500 text-black font-bold">
                              <Crown className="w-3 h-3 mr-1" />
                              JACKPOT
                            </Badge>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-white text-lg font-bold mb-2">{game.title}</h3>
                          <div className="flex justify-between items-center mb-3">
                            <Badge variant="outline" className="border-purple-500/30 text-purple-300 capitalize">
                              {game.theme}
                            </Badge>
                            <div className="flex items-center gap-1 text-yellow-400">
                              <Star className="w-4 h-4" />
                              <span className="text-sm font-medium">{game.rtp}%</span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-400 mb-4">
                            <div className="flex justify-between">
                              <span>Min Bet:</span>
                              <span className="text-white">₹{game.min_bet}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Max Bet:</span>
                              <span className="text-white">₹{game.max_bet}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Paylines:</span>
                              <span className="text-white">{game.paylines}</span>
                            </div>
                          </div>
                          {game.jackpot_enabled && game.jackpot_amount > 0 && (
                            <div className="mb-4 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center">
                              <div className="text-yellow-400 text-xs">JACKPOT</div>
                              <div className="text-white font-bold">₹{game.jackpot_amount.toLocaleString()}</div>
                            </div>
                          )}
                          <Link to={createPageUrl(`SlotGame?game=${game.game_key}`)}>
                            <Button className={`w-full bg-gradient-to-r ${gameColorScheme} hover:opacity-90 text-white py-2`}>
                              <Zap className="w-4 h-4 mr-2" />
                              Play Now
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-12 text-center">
                  <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
                  <h3 className="text-xl font-bold text-white mb-2">No Games Found</h3>
                  <p className="text-gray-400">
                    {searchTerm || selectedTheme !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Slot games are being added. Check back soon!'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="featured">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredGames.map((game) => {
                const IconComponent = getThemeIcon(game.theme);
                return (
                  <Card key={game.id} className="bg-slate-800/50 border-yellow-500/50 backdrop-blur-sm overflow-hidden group hover:scale-105 transition-all duration-300">
                    <CardContent className="p-0">
                      <div className={`h-24 bg-gradient-to-r ${getThemeColor(game.theme)} flex items-center justify-center relative`}>
                        <IconComponent className="w-12 h-12 text-white/80" />
                        <Badge className="absolute top-2 right-2 bg-yellow-500 text-black font-bold">
                          <Crown className="w-3 h-3 mr-1" />
                          FEATURED
                        </Badge>
                      </div>
                      <div className="p-4">
                        <h3 className="text-white text-lg font-bold mb-2">{game.title}</h3>
                        <div className="flex justify-between items-center mb-3">
                          <Badge className="bg-yellow-500/20 text-yellow-300 capitalize">
                            {game.theme}
                          </Badge>
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-4 h-4" />
                            <span className="text-sm font-medium">{game.rtp}%</span>
                          </div>
                        </div>
                        {game.jackpot_enabled && (
                          <div className="mb-4 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center">
                            <div className="text-yellow-400 text-xs">JACKPOT</div>
                            <div className="text-white font-bold">₹{game.jackpot_amount.toLocaleString()}</div>
                          </div>
                        )}
                        <Link to={createPageUrl(`SlotGame?game=${game.game_key}`)}>
                          <Button className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:opacity-90 text-white py-2">
                            <Crown className="w-4 h-4 mr-2" />
                            Play Featured
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="new">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {newGames.map((game) => {
                const IconComponent = getThemeIcon(game.theme);
                return (
                  <Card key={game.id} className="bg-slate-800/50 border-green-500/50 backdrop-blur-sm overflow-hidden group hover:scale-105 transition-all duration-300">
                    <CardContent className="p-0">
                      <div className={`h-24 bg-gradient-to-r ${getThemeColor(game.theme)} flex items-center justify-center relative`}>
                        <IconComponent className="w-12 h-12 text-white/80" />
                        <Badge className="absolute top-2 right-2 bg-green-500 text-white font-bold">
                          NEW
                        </Badge>
                      </div>
                      <div className="p-4">
                        <h3 className="text-white text-lg font-bold mb-2">{game.title}</h3>
                        <div className="flex justify-between items-center mb-3">
                          <Badge className="bg-green-500/20 text-green-300 capitalize">
                            {game.theme}
                          </Badge>
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-4 h-4" />
                            <span className="text-sm font-medium">{game.rtp}%</span>
                          </div>
                        </div>
                        <Link to={createPageUrl(`SlotGame?game=${game.game_key}`)}>
                          <Button className={`w-full bg-gradient-to-r ${getThemeColor(game.theme)} hover:opacity-90 text-white py-2`}>
                            <Zap className="w-4 h-4 mr-2" />
                            Try New Game
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="popular">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {popularGames.map((game) => {
                const IconComponent = getThemeIcon(game.theme);
                return (
                  <Card key={game.id} className="bg-slate-800/50 border-blue-500/50 backdrop-blur-sm overflow-hidden group hover:scale-105 transition-all duration-300">
                    <CardContent className="p-0">
                      <div className={`h-24 bg-gradient-to-r ${getThemeColor(game.theme)} flex items-center justify-center relative`}>
                        <IconComponent className="w-12 h-12 text-white/80" />
                        <Badge className="absolute top-2 right-2 bg-blue-500 text-white font-bold">
                          <Flame className="w-3 h-3 mr-1" />
                          HOT
                        </Badge>
                      </div>
                      <div className="p-4">
                        <h3 className="text-white text-lg font-bold mb-2">{game.title}</h3>
                        <div className="flex justify-between items-center mb-3">
                          <Badge className="bg-blue-500/20 text-blue-300 capitalize">
                            {game.theme}
                          </Badge>
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-4 h-4" />
                            <span className="text-sm font-medium">{game.rtp}%</span>
                          </div>
                        </div>
                        <Link to={createPageUrl(`SlotGame?game=${game.game_key}`)}>
                          <Button className={`w-full bg-gradient-to-r ${getThemeColor(game.theme)} hover:opacity-90 text-white py-2`}>
                            <Flame className="w-4 h-4 mr-2" />
                            Play Popular
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
