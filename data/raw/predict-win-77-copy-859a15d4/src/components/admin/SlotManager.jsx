
import React, { useState, useEffect } from "react";
import { SlotGame, SlotSpin } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea"; // Although not used in current outline, keeping for completeness
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Plus, Edit, Trash2, BarChart, Crown, Star } from "lucide-react";

export default function SlotManager() {
  const [games, setGames] = useState([]);
  const [spins, setSpins] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingGame, setEditingGame] = useState(null); // Not used in current outline, keeping for completeness
  const [newGame, setNewGame] = useState({
    title: '',
    game_key: '',
    theme: 'classic',
    rtp: 96.0,
    min_bet: 1,
    max_bet: 1000,
    reels: 5,
    rows: 3,
    paylines: 25,
    jackpot_enabled: false,
    jackpot_amount: 0,
    status: 'active'
  });

  // Complete Yono-Style Slot Games Collection - Expanded to 50 games (10 per category)
  const predefinedGames = [
    // Classic 3-Reel & 5-Reel Slot Games (10 games)
    { title: "Lucky 7 Classic", key: "lucky_7_classic", theme: "classic", rtp: 96.5, description: "Classic Vegas-style slot with lucky 7s", icon: "🎰", colors: "from-red-500 via-yellow-500 to-orange-500" },
    { title: "Triple Dragon", key: "triple_dragon", theme: "classic", rtp: 95.8, description: "Three dragons guard ancient treasures", icon: "🐉", colors: "from-red-600 via-orange-600 to-yellow-500" },
    { title: "Golden Buffalo", key: "golden_buffalo", theme: "classic", rtp: 96.2, description: "Wild west adventure with golden buffalo", icon: "🦬", colors: "from-amber-600 via-yellow-500 to-orange-500" },
    { title: "Fruit Fiesta", key: "fruit_fiesta", theme: "classic", rtp: 95.5, description: "Colorful fruit festival slot", icon: "🍒", colors: "from-green-400 via-yellow-400 to-red-400" },
    { title: "777 Blaze", key: "777_blaze", theme: "classic", rtp: 96.8, description: "Blazing hot 777 action", icon: "🔥", colors: "from-red-500 via-orange-500 to-yellow-400" },
    { title: "Money Coming", key: "money_coming", theme: "classic", rtp: 97.0, description: "Spin the reels of wealth", icon: "💰", colors: "from-green-500 via-yellow-500 to-red-500" }, // Original list had this under Asian, but theme was Classic
    { 
      title: "Double Diamond", 
      key: "double_diamond", 
      theme: "classic", 
      rtp: 97.1, 
      description: "Sparkling diamonds double your luck",
      icon: "💎",
      colors: "from-blue-400 via-cyan-300 to-teal-400"
    },
    { title: "Sparkling Reels", key: "sparkling_reels", theme: "classic", rtp: 96.3, description: "Bright lights and dazzling wins on the reels", icon: "✨", colors: "from-purple-400 via-pink-400 to-rose-400" },
    { title: "Vegas Dreams", key: "vegas_dreams", theme: "classic", rtp: 95.9, description: "Experience the thrill of Las Vegas nights", icon: "🌃", colors: "from-gray-700 via-gray-800 to-black" },
    { title: "Diamond Strike", key: "diamond_strike", theme: "classic", rtp: 96.4, description: "Hit it big with sparkling diamond wins", icon: "💠", colors: "from-blue-600 via-blue-500 to-cyan-500" },

    // Asian Theme Slots (Jili/Fa Chai Style) (10 games)
    { title: "Mahjong Ways 2", key: "mahjong_ways_2", theme: "ancient", rtp: 97.2, description: "The highly popular Mahjong-themed slot", icon: "🀄", colors: "from-green-500 via-yellow-500 to-red-500" },
    { title: "Ganesha Fortune", key: "ganesha_fortune", theme: "ancient", rtp: 96.9, description: "Be blessed by the god of new beginnings", icon: "🐘", colors: "from-yellow-400 via-amber-500 to-orange-500" },
    { title: "Dragon Hatch 2", key: "dragon_hatch_2", theme: "ancient", rtp: 96.5, description: "Hatch dragon eggs for massive wins", icon: "🥚", colors: "from-red-600 via-yellow-500 to-orange-600" },
    { title: "Fortune Tiger", key: "fortune_tiger", theme: "ancient", rtp: 96.7, description: "The lucky tiger brings good fortune", icon: "🐅", colors: "from-orange-500 via-red-500 to-yellow-500" },
    { title: "Panda Fortune", key: "panda_fortune", theme: "ancient", rtp: 96.1, description: "Find your fortune with adorable pandas", icon: "🐼", colors: "from-green-600 via-lime-500 to-yellow-400" }, // New game added to fill category
    { 
      title: "Emperor’s Wealth", 
      key: "emperors_wealth", 
      theme: "ancient", 
      rtp: 96.6, 
      description: "Discover the wealth of the ancient emperor",
      icon: "👑",
      colors: "from-yellow-500 via-red-600 to-purple-600"
    },
    { title: "Cai Shen 88", key: "cai_shen_88", theme: "ancient", rtp: 97.0, description: "Prosperity and good luck with Cai Shen", icon: "🧧", colors: "from-red-700 via-orange-600 to-yellow-500" },
    { title: "Fa Cai Shen", key: "fa_cai_shen", theme: "ancient", rtp: 96.8, description: "The God of Wealth brings abundant riches", icon: "💰", colors: "from-gold-500 via-yellow-600 to-orange-600" },
    { title: "Golden Pig", key: "golden_pig", theme: "ancient", rtp: 96.3, description: "A lucky golden pig promises big wins", icon: "🐖", colors: "from-pink-400 via-orange-400 to-yellow-400" },
    { title: "Prosperity Lion", key: "prosperity_lion", theme: "ancient", rtp: 96.5, description: "Dance with the lion for prosperity", icon: "🦁", colors: "from-red-500 via-orange-500 to-yellow-500" },

    // Adventure & Fantasy Slots (10 games)
    { title: "Pirate King", key: "pirate_king", theme: "adventure", rtp: 96.3, description: "High seas pirate adventure", icon: "🏴‍☠️", colors: "from-blue-600 via-cyan-500 to-teal-400" },
    { title: "Medusa II", key: "medusa_ii", theme: "adventure", rtp: 96.8, description: "Face the gorgon and turn symbols to gold", icon: "🐍", colors: "from-purple-600 via-stone-500 to-green-500" },
    { title: "Treasure Island", key: "treasure_island", theme: "adventure", rtp: 96.1, description: "Island paradise treasure hunt", icon: "🏝️", colors: "from-blue-500 via-green-500 to-yellow-400" },
    { title: "Jungle Secret", key: "jungle_secret", theme: "adventure", rtp: 96.4, description: "Hidden jungle treasures", icon: "🌿", colors: "from-green-600 via-emerald-500 to-teal-500" },
    { title: "Egypt Spin", key: "egypt_spin", theme: "ancient", rtp: 96.6, description: "Pharaoh's golden treasures", icon: "🔺", colors: "from-yellow-600 via-orange-500 to-blue-600" }, // Original list had this under Adventure, but theme was Ancient
    { 
      title: "Temple of Spin", 
      key: "temple_of_spin", 
      theme: "adventure", 
      rtp: 96.0, 
      description: "Spin the reels in the ancient temple",
      icon: "🏛️",
      colors: "from-stone-500 via-orange-400 to-yellow-500"
    },
    { title: "Book of Dead", key: "book_of_dead", theme: "adventure", rtp: 96.2, description: "Join Rich Wilde on an Egyptian quest", icon: "📜", colors: "from-brown-600 via-amber-500 to-yellow-600" },
    { title: "Gonzo's Quest Megaways", key: "gonzos_quest_megaways", theme: "adventure", rtp: 96.0, description: "Avalanche reels and huge potential wins", icon: "🗿", colors: "from-green-500 via-teal-500 to-blue-500" },
    { title: "Viking Runecraft", key: "viking_runecraft", theme: "fantasy", rtp: 96.7, description: "Unleash the power of the Norse gods", icon: "🛡️", colors: "from-gray-600 via-blue-600 to-red-600" },
    { title: "Lost Relics", key: "lost_relics", theme: "adventure", rtp: 96.3, description: "Uncover ancient treasures in a forgotten tomb", icon: "🏺", colors: "from-orange-700 via-amber-600 to-yellow-500" },

    // Fun & Cartoon Style Slots (10 games)
    { title: "Candy Boom", key: "candy_boom", theme: "fantasy", rtp: 95.9, description: "Sweet candy explosion", icon: "🍭", colors: "from-pink-400 via-purple-400 to-blue-400" },
    { title: "Fish Party", key: "fish_party", theme: "animal", rtp: 96.0, description: "Underwater fish celebration", icon: "🐠", colors: "from-blue-400 via-cyan-400 to-teal-400" },
    { title: "Hamster Gold", key: "hamster_gold", theme: "animal", rtp: 95.7, description: "Cute hamster's gold adventure", icon: "🐹", colors: "from-yellow-400 via-orange-400 to-pink-400" },
    { title: "Crazy Hunter", key: "crazy_hunter", theme: "animal", rtp: 96.2, description: "Join the hunt for wild wins", icon: "🎯", colors: "from-green-500 via-lime-400 to-yellow-400" },
    { title: "Chicken Boom Boom", key: "chicken_boom_boom", theme: "animal", rtp: 95.6, description: "Explosive chickens laying golden eggs", icon: "🐔", colors: "from-yellow-500 via-orange-400 to-red-400" },
    { title: "Sweet Bonanza", key: "sweet_bonanza", theme: "fantasy", rtp: 96.5, description: "Indulge in a world of candies and fruits", icon: "🍬", colors: "from-red-400 via-pink-500 to-purple-500" },
    { title: "Reactoonz", key: "reactoonz", theme: "fantasy", rtp: 96.5, description: "Play with cute alien creatures on a quantum grid", icon: "👾", colors: "from-blue-500 via-purple-500 to-pink-500" },
    { title: "Jammin' Jars", key: "jammin_jars", theme: "fantasy", rtp: 96.8, description: "Groovy disco with fruit symbols and cascading wins", icon: "🍓", colors: "from-orange-500 via-red-500 to-pink-500" },
    { title: "Animal Quest", key: "animal_quest", theme: "animal", rtp: 96.1, description: "Embark on an adventure with brave animal heroes", icon: "🐾", colors: "from-green-500 via-yellow-500 to-brown-500" },
    { title: "Toonmania", key: "toonmania", theme: "animal", rtp: 95.8, description: "Wild and wacky cartoon characters bring big wins", icon: "🤪", colors: "from-yellow-300 via-lime-300 to-blue-400" },
    
    // High Stakes or Jackpot Slots (10 games)
    { title: "Mega Win 5X", key: "mega_win_5x", theme: "classic", rtp: 97.5, description: "5X multiplier mega wins", jackpot: 500000, icon: "⚡", colors: "from-yellow-400 via-orange-500 to-red-500" },
    { title: "Jackpot Gold Rush", key: "jackpot_gold_rush", theme: "classic", rtp: 96.9, description: "Gold rush jackpot bonanza", jackpot: 1000000, icon: "💰", colors: "from-yellow-500 via-orange-500 to-red-600" },
    { title: "Super Ace", key: "super_ace", theme: "classic", rtp: 97.8, description: "High-stakes card action", jackpot: 2000000, icon: "♠️", colors: "from-purple-600 via-gold-500 to-yellow-400" },
    { title: "Firestorm Fortune", key: "firestorm_fortune", theme: "fantasy", rtp: 97.1, description: "Fiery wheel with coins bursting into flames", jackpot: 750000, icon: "🔥", colors: "from-red-600 via-orange-500 to-yellow-400" },
    { title: "Infinity Reels", key: "infinity_reels", theme: "fantasy", rtp: 97.6, description: "Endless reels with infinite winning possibilities", jackpot: 5000000, icon: "♾️", colors: "from-blue-500 via-purple-500 to-pink-500" },
    { title: "Mega Moolah", key: "mega_moolah", theme: "animal", rtp: 88.12, description: "The millionaire-maker progressive jackpot slot", jackpot: 10000000, icon: "🦁", colors: "from-green-700 via-emerald-600 to-yellow-500" },
    { title: "Divine Fortune", key: "divine_fortune", theme: "ancient", rtp: 96.59, description: "Mythological jackpot with falling wilds and free spins", jackpot: 500000, icon: " Pegasus", colors: "from-gold-400 via-yellow-400 to-orange-400" },
    { title: "Hall of Gods", key: "hall_of_gods", theme: "ancient", rtp: 95.5, description: "Join Norse gods for a chance at three progressive jackpots", jackpot: 7000000, icon: "🔨", colors: "from-blue-600 via-cyan-500 to-gray-500" },
    { title: "Age of the Gods", key: "age_of_the_gods", theme: "ancient", rtp: 95.02, description: "Four progressive jackpots inspired by Greek mythology", jackpot: 250000, icon: "🔱", colors: "from-gold-600 via-yellow-600 to-orange-600" },
    { title: "Major Millions", key: "major_millions", theme: "classic", rtp: 89.37, description: "Classic military-themed progressive jackpot slot", jackpot: 1000000, icon: "🎖️", colors: "from-green-800 via-green-700 to-olive-600" }
  ];

  useEffect(() => {
    loadGames();
    loadRecentSpins();
  }, []);

  const loadGames = async () => {
    const allGames = await SlotGame.list('-created_date');
    setGames(allGames);
  };

  const loadRecentSpins = async () => {
    const recentSpins = await SlotSpin.list('-created_date', 50);
    setSpins(recentSpins);
  };

  const createPredefinedGame = async (gameData) => {
    const symbols = getSymbolsForTheme(gameData.theme);
    const paytable = getPaytableForTheme(gameData.theme);
    
    const newGameData = {
      title: gameData.title,
      game_key: gameData.key,
      theme: gameData.theme,
      rtp: gameData.rtp,
      min_bet: 5,
      max_bet: 500,
      reels: 5,
      rows: 3,
      paylines: 25,
      symbols: symbols,
      paytable: paytable,
      bonus_features: ['wild_substitution', 'scatter_bonus'],
      jackpot_enabled: !!gameData.jackpot,
      jackpot_amount: gameData.jackpot || 0,
      status: 'active',
      game_icon: gameData.icon,
      color_scheme: gameData.colors,
      description: gameData.description
    };

    try {
      await SlotGame.create(newGameData);
      alert(`${gameData.title} created successfully!`);
      loadGames();
    } catch (error) {
      alert(`Error creating ${gameData.title}: ${error.message}`);
      console.error(`Error creating ${gameData.title}:`, error);
    }
  };

  const createAllGames = async () => {
    if (!confirm('This will create all 50 popular slot games. This action cannot be undone. Are you sure?')) {
      return;
    }

    try {
      for (const gameData of predefinedGames) {
        // Check if game with this key already exists
        const existingGame = games.find(game => game.game_key === gameData.key);
        if (existingGame) {
          console.warn(`Game '${gameData.title}' (key: ${gameData.key}) already exists. Skipping.`);
          continue; 
        }

        const symbols = getSymbolsForTheme(gameData.theme);
        const paytable = getPaytableForTheme(gameData.theme);
        
        const newGameData = {
          title: gameData.title,
          game_key: gameData.key,
          theme: gameData.theme,
          rtp: gameData.rtp,
          min_bet: 5,
          max_bet: 500,
          reels: 5,
          rows: 3,
          paylines: 25,
          symbols: symbols,
          paytable: paytable,
          bonus_features: ['wild_substitution', 'scatter_bonus'],
          jackpot_enabled: !!gameData.jackpot,
          jackpot_amount: gameData.jackpot || 0,
          status: 'active',
          game_icon: gameData.icon,
          color_scheme: gameData.colors,
          description: gameData.description
        };

        await SlotGame.create(newGameData);
        // Add small delay to avoid overwhelming the system or rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      alert('All 50 popular slot games created successfully!');
      loadGames(); // Reload games after all creations are done
    } catch (error) {
      console.error('Error creating some games:', error);
      alert('An error occurred while creating games. Please check the console for details.');
    }
  };

  const getSymbolsForTheme = (theme) => {
    const symbolSets = {
      classic: ['cherry', 'lemon', 'orange', 'grape', 'watermelon', 'bell', 'bar', 'seven', 'diamond', 'wild'],
      ancient: ['dragon', 'temple', 'coin', 'lotus', 'tiger', 'jade', 'bamboo', 'lantern', 'gold_ingot', 'wild'],
      adventure: ['treasure', 'sword', 'compass', 'map', 'ship', 'skull', 'gem', 'crown', 'anchor', 'wild'],
      fantasy: ['unicorn', 'fairy', 'castle', 'magic_wand', 'potion', 'crystal', 'phoenix', 'spell_book', 'rainbow', 'wild'],
      animal: ['lion', 'tiger', 'elephant', 'monkey', 'panda', 'fish', 'bird', 'butterfly', 'paw', 'wild'],
      sport: ['football', 'basketball', 'tennis', 'soccer', 'trophy', 'medal', 'whistle', 'goal', 'champion', 'wild'],
      mystery: ['eye', 'crystal_ball', 'tarot', 'candle', 'potion', 'raven', 'moon', 'star', 'key', 'wild']
    };
    return symbolSets[theme] || symbolSets.classic;
  };

  const getPaytableForTheme = (theme) => {
    // Base paytable that can be customized per theme
    return {
      wild: { 3: 100, 4: 500, 5: 2000 },
      premium_1: { 3: 50, 4: 200, 5: 1000 },
      premium_2: { 3: 25, 4: 100, 5: 500 },
      medium_1: { 3: 20, 4: 80, 5: 300 },
      medium_2: { 3: 15, 4: 60, 5: 200 },
      low_1: { 3: 10, 4: 40, 5: 150 },
      low_2: { 3: 8, 4: 30, 5: 100 },
      low_3: { 3: 5, 4: 20, 5: 75 }
    };
  };

  const handleCreateGame = async () => {
    if (!newGame.title || !newGame.game_key) {
      alert("Please fill in required fields");
      return;
    }

    const gameData = {
      ...newGame,
      symbols: getSymbolsForTheme(newGame.theme),
      paytable: getPaytableForTheme(newGame.theme),
      bonus_features: ['wild_substitution'],
      // Game icon, color scheme, and description are not part of custom game form currently
      // So they will be undefined for custom games unless added to newGame state and form
    };

    try {
      await SlotGame.create(gameData);
      alert("Game created successfully!");
      setIsCreating(false);
      setNewGame({
        title: '',
        game_key: '',
        theme: 'classic',
        rtp: 96.0,
        min_bet: 1,
        max_bet: 1000,
        reels: 5,
        rows: 3,
        paylines: 25,
        jackpot_enabled: false,
        jackpot_amount: 0,
        status: 'active'
      });
      loadGames();
    } catch (error) {
      alert(`Error creating game: ${error.message}`);
      console.error("Error creating game:", error);
    }
  };

  const handleUpdateGame = async (gameId, updates) => {
    try {
      await SlotGame.update(gameId, updates);
      loadGames();
      alert("Game updated successfully!");
    } catch (error) {
      alert(`Error updating game: ${error.message}`);
      console.error("Error updating game:", error);
    }
  };

  const handleDeleteGame = async (gameId) => {
    if (confirm("Are you sure you want to delete this game? This action cannot be undone.")) {
      try {
        await SlotGame.delete(gameId);
        loadGames();
        alert("Game deleted successfully!");
      } catch (error) {
        alert(`Error deleting game: ${error.message}`);
        console.error("Error deleting game:", error);
      }
    }
  };

  const themes = ['classic', 'adventure', 'ancient', 'fantasy', 'animal', 'sport', 'mystery'];

  // This function is still used by the custom game creation form for background colors
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

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-purple-400" />
              Slot Game Management
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={createAllGames}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create All 50 Games
              </Button>
              <Button 
                onClick={() => setIsCreating(!isCreating)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Game
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="games">
            <TabsList className="grid w-full grid-cols-4 bg-slate-700">
              <TabsTrigger value="games">Games ({games.length})</TabsTrigger>
              <TabsTrigger value="predefined">WinVerse Collection ({predefinedGames.length})</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="spins">Recent Spins</TabsTrigger>
            </TabsList>

            <TabsContent value="games" className="space-y-6">
              {/* Create New Game Form */}
              {isCreating && (
                <Card className="bg-slate-700/50 border-slate-600/50">
                  <CardHeader>
                    <CardTitle className="text-white">Create New Slot Game</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">Game Title</Label>
                        <Input
                          value={newGame.title}
                          onChange={(e) => setNewGame({...newGame, title: e.target.value})}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="e.g., Diamond Rush"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Game Key (Unique, lowercase, snake_case)</Label>
                        <Input
                          value={newGame.game_key}
                          onChange={(e) => setNewGame({...newGame, game_key: e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')})}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="e.g., diamond_rush"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-white">Theme</Label>
                        <Select value={newGame.theme} onValueChange={(value) => setNewGame({...newGame, theme: value})}>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 text-white">
                            {themes.map(theme => (
                              <SelectItem key={theme} value={theme} className="capitalize">{theme}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-white">RTP (%)</Label>
                        <Input
                          type="number"
                          value={newGame.rtp}
                          onChange={(e) => setNewGame({...newGame, rtp: Number(e.target.value)})}
                          className="bg-slate-700 border-slate-600 text-white"
                          min="85"
                          max="99"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Paylines</Label>
                        <Input
                          type="number"
                          value={newGame.paylines}
                          onChange={(e) => setNewGame({...newGame, paylines: Number(e.target.value)})}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label className="text-white">Min Bet</Label>
                        <Input
                          type="number"
                          value={newGame.min_bet}
                          onChange={(e) => setNewGame({...newGame, min_bet: Number(e.target.value)})}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Max Bet</Label>
                        <Input
                          type="number"
                          value={newGame.max_bet}
                          onChange={(e) => setNewGame({...newGame, max_bet: Number(e.target.value)})}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Reels</Label>
                        <Input
                          type="number"
                          value={newGame.reels}
                          onChange={(e) => setNewGame({...newGame, reels: Number(e.target.value)})}
                          className="bg-slate-700 border-slate-600 text-white"
                          min="3"
                          max="7"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Rows</Label>
                        <Input
                          type="number"
                          value={newGame.rows}
                          onChange={(e) => setNewGame({...newGame, rows: Number(e.target.value)})}
                          className="bg-slate-700 border-slate-600 text-white"
                          min="3"
                          max="5"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={newGame.jackpot_enabled}
                          onCheckedChange={(checked) => setNewGame({...newGame, jackpot_enabled: checked})}
                        />
                        <Label className="text-white">Enable Jackpot</Label>
                      </div>
                      {newGame.jackpot_enabled && (
                        <div>
                          <Label className="text-white">Jackpot Amount</Label>
                          <Input
                            type="number"
                            value={newGame.jackpot_amount}
                            onChange={(e) => setNewGame({...newGame, jackpot_amount: Number(e.target.value)})}
                            className="bg-slate-700 border-slate-600 text-white w-32"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleCreateGame} className="bg-green-600 hover:bg-green-700">
                        Create Game
                      </Button>
                      <Button onClick={() => setIsCreating(false)} variant="outline" className="border-slate-500 text-slate-300 hover:bg-slate-700">
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Games List */}
              <div className="space-y-4">
                {games.length === 0 && <p className="text-gray-400 text-center">No games created yet. Use "Add Custom Game" or "Create All 50 Games" to get started!</p>}
                {games.map((game) => (
                  <Card key={game.id} className="bg-slate-700/50 border-slate-600/50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">{game.title}</h3>
                          <div className="flex gap-2 mb-2">
                            <Badge className="bg-purple-500/20 text-purple-300 capitalize">{game.theme}</Badge>
                            <Badge className="bg-green-500/20 text-green-300">{game.rtp}% RTP</Badge>
                            <Badge className="bg-blue-500/20 text-blue-300">{game.paylines} Lines</Badge>
                            {game.jackpot_enabled && (
                              <Badge className="bg-yellow-500/20 text-yellow-300">
                                <Crown className="w-3 h-3 mr-1" />
                                Jackpot: ₹{game.jackpot_amount.toLocaleString()}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-400">
                            Bet Range: ₹{game.min_bet} - ₹{game.max_bet} | Grid: {game.reels}x{game.rows}
                          </div>
                          {game.description && (
                            <p className="text-xs text-gray-500 mt-2 line-clamp-1">{game.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Select 
                            value={game.status} 
                            onValueChange={(value) => handleUpdateGame(game.id, { status: value })}
                          >
                            <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 text-white">
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            onClick={() => handleDeleteGame(game.id)}
                            variant="outline"
                            size="icon"
                            className="border-red-500 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="predefined" className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Complete WinVerse Slot Collection</h3>
                <p className="text-gray-400">A hand-picked selection of {predefinedGames.length} professionally designed slot games across 5 categories, ready to deploy.</p>
              </div>

              {/* Category Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">10</div>
                    <div className="text-sm">Classic Games</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">10</div>
                    <div className="text-sm">Asian Theme</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">10</div>
                    <div className="text-sm">Adventure</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">10</div>
                    <div className="text-sm">Fun & Cartoon</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-red-500 to-rose-500 text-white">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold">10</div>
                    <div className="text-sm">High Stakes</div>
                  </CardContent>
                </Card>
              </div>

              {/* Games Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {predefinedGames.map((game, index) => (
                  <Card key={index} className="bg-slate-700/50 border-slate-600/50 hover:border-purple-500/50 transition-colors">
                    <CardContent className="p-4">
                      <div className={`h-2 bg-gradient-to-r ${game.colors} mb-4 rounded`} />
                      <div className="flex items-center gap-3 mb-3">
                        {game.icon && <div className="text-3xl">{game.icon}</div>}
                        <div>
                          <h3 className="text-white font-bold text-sm">{game.title}</h3>
                          <Badge className="text-xs capitalize bg-purple-500/20 text-purple-300">{game.theme}</Badge>
                        </div>
                      </div>
                      <p className="text-gray-400 text-xs mb-3 line-clamp-2">{game.description}</p>
                      <div className="flex justify-between items-center mb-3 text-xs">
                        <Badge className="bg-green-500/20 text-green-300">{game.rtp}% RTP</Badge>
                        {game.jackpot && (
                          <Badge className="bg-yellow-500/20 text-yellow-300">
                            ₹{(game.jackpot / 1000).toFixed(0)}K Jackpot
                          </Badge>
                        )}
                      </div>
                      <Button
                        onClick={() => createPredefinedGame(game)}
                        className={`w-full bg-gradient-to-r ${game.colors} hover:opacity-90 text-white text-xs py-1`}
                        disabled={games.some(g => g.game_key === game.key)} // Disable if game already exists
                      >
                        {games.some(g => g.game_key === game.key) ? (
                          <><Star className="w-3 h-3 mr-1" /> Created</>
                        ) : (
                          <><Plus className="w-3 h-3 mr-1" /> Create Game</>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="stats">
              <Card className="bg-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart className="w-5 h-5" />
                    Slot Games Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-white">{games.length}</div>
                      <div className="text-gray-400">Total Games</div>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">{games.filter(g => g.status === 'active').length}</div>
                      <div className="text-gray-400">Active Games</div>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-400">{games.filter(g => g.jackpot_enabled).length}</div>
                      <div className="text-gray-400">Jackpot Games</div>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">{spins.length}</div>
                      <div className="text-gray-400">Recent Spins</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="spins">
              <Card className="bg-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Recent Spins Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-600">
                        <TableHead className="text-white">User</TableHead>
                        <TableHead className="text-white">Game</TableHead>
                        <TableHead className="text-white">Bet</TableHead>
                        <TableHead className="text-white">Win</TableHead>
                        <TableHead className="text-white">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {spins.slice(0, 20).map((spin) => (
                        <TableRow key={spin.id} className="border-slate-600">
                          <TableCell className="text-gray-300">{spin.user_id?.slice(0, 8) || 'N/A'}...</TableCell>
                          <TableCell className="text-white">{spin.game_key}</TableCell>
                          <TableCell className="text-blue-400">₹{spin.bet_amount}</TableCell>
                          <TableCell className={spin.total_win > 0 ? "text-green-400" : "text-gray-400"}>
                            ₹{spin.total_win}
                          </TableCell>
                          <TableCell className="text-gray-400">
                            {new Date(spin.created_date).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      {spins.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-400">No recent spins found.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
