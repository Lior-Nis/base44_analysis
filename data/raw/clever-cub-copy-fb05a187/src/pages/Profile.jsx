import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Loader2, Award, Leaf, BarChart2, BookOpen, Star, Trophy, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const AdventureStatCard = ({ icon, label, value, color, emoji, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay }}
        whileHover={{ y: -10, scale: 1.05 }}
        className={`bg-gradient-to-br ${color} p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center border-4 border-white transform transition-all duration-300`}
    >
        <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-4"
        >
            {emoji}
        </motion.div>
        <div className="bg-white/20 p-4 rounded-full mb-4">
            {icon}
        </div>
        <p className="text-white text-xl font-semibold mb-2 adventure-title">{label}</p>
        <p className="text-5xl font-bold text-white adventure-title drop-shadow-lg">{value}</p>
    </motion.div>
);

const AchievementBadge = ({ title, description, icon, earned, delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, type: "spring", stiffness: 200 }}
        className={`p-6 rounded-2xl border-4 ${earned ? 'bg-gradient-to-br from-yellow-300 to-orange-400 border-yellow-400' : 'bg-gray-200 border-gray-300'} transform transition-all duration-300 hover:scale-105`}
    >
        <div className={`text-4xl mb-3 ${earned ? 'grayscale-0' : 'grayscale'}`}>{icon}</div>
        <h4 className={`font-bold text-lg mb-2 adventure-title ${earned ? 'text-gray-800' : 'text-gray-500'}`}>{title}</h4>
        <p className={`text-sm ${earned ? 'text-gray-700' : 'text-gray-400'}`}>{description}</p>
    </motion.div>
);

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true);
            try {
                const currentUser = await User.me();
                setUser(currentUser);
            } catch (e) {
                console.error("User not logged in");
            }
            setIsLoading(false);
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        await User.logout();
        window.location.reload();
    };
    
    const handleLogin = async () => {
        await User.login();
    };

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-[calc(100vh-80px)] bg-gradient-to-br from-purple-400 to-pink-400">
                <div className="text-8xl mb-8 animate-bounce">🐨</div>
                <Loader2 className="w-16 h-16 animate-spin text-white mb-4" />
                <p className="text-2xl text-white font-bold adventure-title">Loading your adventure profile...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col justify-center items-center h-[calc(100vh-80px)] text-center px-4 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 relative overflow-hidden">
                {/* Background animations */}
                <div className="absolute inset-0">
                    {[...Array(10)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-4xl opacity-20"
                            initial={{ y: Math.random() * window.innerHeight, x: Math.random() * window.innerWidth }}
                            animate={{ y: Math.random() * window.innerHeight, x: Math.random() * window.innerWidth }}
                            transition={{ duration: 15, delay: Math.random() * 5, repeat: Infinity, repeatType: "reverse" }}
                        >
                            {['🌟', '🎯', '🏆', '⭐', '🎉'][Math.floor(Math.random() * 5)]}
                        </motion.div>
                    ))}
                </div>
                
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 1 }}
                    className="text-8xl mb-8"
                >
                    🦸‍♀️
                </motion.div>
                <motion.h2 
                    className="text-5xl font-bold mb-4 text-white adventure-title drop-shadow-lg"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    Join the Adventure Club!
                </motion.h2>
                <p className="text-2xl text-white mb-8 drop-shadow font-semibold max-w-2xl">Log in to save your progress, collect achievements, and become the ultimate knowledge hero!</p>
                <Button 
                    onClick={handleLogin} 
                    size="lg" 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold text-2xl px-12 py-6 rounded-full shadow-2xl transform hover:scale-110 transition-all border-4 border-white adventure-title"
                >
                    🚀 Start My Adventure!
                </Button>
            </div>
        );
    }

    const totalLevel = (user.level_maths || 1) + (user.level_english || 1);
    const achievements = [
        { title: "First Steps", description: "Complete your first question", icon: "👶", earned: (user.gum_leaves || 0) > 0 },
        { title: "Leaf Collector", description: "Collect 50 gum leaves", icon: "🍃", earned: (user.gum_leaves || 0) >= 50 },
        { title: "Math Wizard", description: "Reach level 3 in Math", icon: "🧙‍♂️", earned: (user.level_maths || 1) >= 3 },
        { title: "Word Master", description: "Reach level 3 in English", icon: "📚", earned: (user.level_english || 1) >= 3 },
        { title: "Knowledge Hero", description: "Reach level 5 in any subject", icon: "🦸‍♀️", earned: Math.max(user.level_maths || 1, user.level_english || 1) >= 5 },
        { title: "Champion", description: "Collect 100 gum leaves", icon: "🏆", earned: (user.gum_leaves || 0) >= 100 }
    ];

    return (
        <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 opacity-10">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-6xl"
                        initial={{ y: Math.random() * window.innerHeight, x: Math.random() * window.innerWidth }}
                        animate={{ y: Math.random() * window.innerHeight, x: Math.random() * window.innerWidth }}
                        transition={{ duration: 25, delay: Math.random() * 10, repeat: Infinity, repeatType: "reverse" }}
                    >
                        {['🌟', '⭐', '🎯', '🏆', '🎉', '⚡', '🚀', '🎪'][Math.floor(Math.random() * 8)]}
                    </motion.div>
                ))}
            </div>

            <div className="container mx-auto p-4 md:p-8 relative z-10">
                {/* Hero Profile Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="bg-white/90 backdrop-blur-md rounded-3xl p-8 mb-12 shadow-2xl border-4 border-white"
                >
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="flex flex-col lg:flex-row items-center gap-8">
                            <motion.div
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="relative"
                            >
                                <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-6xl border-8 border-white shadow-2xl">
                                    🐨
                                </div>
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-2xl border-4 border-white shadow-lg"
                                >
                                    {totalLevel >= 10 ? '👑' : totalLevel >= 5 ? '⭐' : '🌟'}
                                </motion.div>
                            </motion.div>
                            <div className="text-center lg:text-left">
                                <h1 className="text-4xl lg:text-6xl font-bold text-gray-800 mb-2 adventure-title">{user.full_name || 'Brave Explorer'}</h1>
                                <p className="text-xl text-gray-600 mb-4">{user.email}</p>
                                <div className="flex items-center gap-4 justify-center lg:justify-start">
                                    <div className="bg-gradient-to-r from-purple-400 to-pink-500 text-white px-6 py-2 rounded-full font-bold shadow-lg">
                                        Level {totalLevel} Hero
                                    </div>
                                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
                                        <Leaf className="w-5 h-5" />
                                        {user.gum_leaves || 0} Leaves
                                    </div>
                                </div>
                            </div>
                        </div>
                         <Button 
                            onClick={handleLogout} 
                            className="bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white font-bold px-8 py-4 rounded-full shadow-2xl transform hover:scale-105 transition-all border-2 border-white"
                        >
                            ⚡ Log Out
                        </Button>
                    </div>
                </motion.div>

                {/* Stats Section */}
                <motion.h2 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-bold text-white mb-8 text-center adventure-title drop-shadow-lg"
                >
                    🎯 Your Adventure Stats
                </motion.h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <AdventureStatCard 
                        icon={<Leaf className="w-12 h-12 text-white"/>}
                        label="Magic Leaves"
                        value={user.gum_leaves || 0}
                        color="from-green-400 to-emerald-600"
                        emoji="🍃"
                        delay={0.1}
                    />
                     <AdventureStatCard 
                        icon={<BarChart2 className="w-12 h-12 text-white"/>}
                        label="Maths Power"
                        value={`Level ${user.level_maths || 1}`}
                        color="from-orange-400 to-red-500"
                        emoji="🧮"
                        delay={0.2}
                    />
                     <AdventureStatCard 
                        icon={<BookOpen className="w-12 h-12 text-white"/>}
                        label="Word Strength"
                        value={`Level ${user.level_english || 1}`}
                        color="from-blue-400 to-indigo-600"
                        emoji="📚"
                        delay={0.3}
                    />
                </div>
                
                {/* Achievements Section */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-4 border-white"
                >
                    <h3 className="text-4xl font-bold text-gray-800 mb-8 text-center adventure-title flex items-center justify-center gap-4">
                        <Trophy className="w-10 h-10 text-yellow-500" />
                        Achievement Badges
                        <Trophy className="w-10 h-10 text-yellow-500" />
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {achievements.map((achievement, index) => (
                            <AchievementBadge
                                key={achievement.title}
                                {...achievement}
                                delay={0.1 * index}
                            />
                        ))}
                    </div>
                </motion.div>
                
                {/* Coming Soon Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-16 text-center bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-3xl p-12 border-4 border-white/50"
                >
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-8xl mb-6"
                    >
                        🚀
                    </motion.div>
                    <h3 className="text-4xl font-bold text-white mb-4 adventure-title drop-shadow-lg">Epic Adventures Coming Soon!</h3>
                    <p className="text-white text-xl drop-shadow max-w-2xl mx-auto">More challenges, rewards, and magical learning experiences are on their way. Keep exploring to be ready for the next big adventure!</p>
                </motion.div>
            </div>
        </div>
    );
}