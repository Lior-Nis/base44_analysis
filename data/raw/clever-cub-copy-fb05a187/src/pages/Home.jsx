import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Mountain, Waves, Sparkles, Trophy } from "lucide-react";
import { motion } from "framer-motion";

const AdventureCard = ({ title, description, icon, emoji, gradient, link, delay }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay }}
            whileHover={{ y: -15, scale: 1.05, rotateY: 5 }}
            className="relative bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 border-4 border-white"
        >
            <Link to={link} className="block group">
                <div className={`p-12 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                    {/* Sparkle effects */}
                    <div className="absolute top-4 right-4">
                        <Sparkles className="w-8 h-8 text-white/60 animate-pulse" />
                    </div>
                    <div className="absolute bottom-4 left-4">
                        <Sparkles className="w-6 h-6 text-white/40 animate-bounce" />
                    </div>
                    
                    {/* Main icon */}
                    <div className="flex justify-center items-center mb-4">
                        <div className="text-8xl mb-4 animate-bounce" style={{animationDelay: `${delay}s`}}>
                            {emoji}
                        </div>
                    </div>
                    <div className="flex justify-center">
                        {icon}
                    </div>
                </div>
                <div className="p-8 bg-gradient-to-br from-white to-gray-50">
                    <h2 className="text-4xl font-bold text-gray-800 mb-3 adventure-title">{title}</h2>
                    <p className="text-gray-600 mb-6 text-lg">{description}</p>
                    <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-gray-700 adventure-title group-hover:text-purple-600 transition-colors">Adventure Awaits!</span>
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-3 group-hover:scale-110 transition-transform shadow-lg">
                            <ArrowRight className="text-white w-6 h-6" />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default function HomePage() {
    return (
        <div className="relative min-h-[calc(100vh-80px)] overflow-hidden">
            {/* Enhanced Background Elements */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 opacity-20"></div>
                <div className="absolute top-10 -left-32 w-96 h-96 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-pulse"></div>
                <div className="absolute top-32 -right-32 w-96 h-96 bg-gradient-to-br from-pink-300 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-gradient-to-br from-green-300 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>

            <div className="container mx-auto px-6 py-16 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="text-center mb-20"
                >
                    <motion.h1 
                        className="text-6xl md:text-8xl font-bold text-white mb-6 adventure-title drop-shadow-2xl"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                    >
                        Welcome, Brave Explorer! 🌟
                    </motion.h1>
                    <motion.p 
                        className="text-2xl text-white max-w-4xl mx-auto drop-shadow-lg font-semibold"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                    >
                        Join Wazza the Wombat on epic learning adventures! Choose your quest and become the ultimate knowledge hero! 🦸‍♀️🦸‍♂️
                    </motion.p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-16 max-w-6xl mx-auto mb-16">
                    <AdventureCard
                        title="Maths Mountain 🏔️"
                        description="Scale the mighty peaks by solving magical number puzzles and mathematical mysteries!"
                        icon={<Mountain className="w-16 h-16 text-white/90" />}
                        emoji="🧮"
                        gradient="from-orange-400 via-red-400 to-pink-500"
                        link={createPageUrl("LearningZone") + "?subject=maths"}
                        delay={0.2}
                    />
                    <AdventureCard
                        title="English River 🌊"
                        description="Navigate the flowing waters of words, letters, and enchanting stories!"
                        icon={<Waves className="w-16 h-16 text-white/90" />}
                        emoji="📚"
                        gradient="from-blue-400 via-cyan-400 to-teal-500"
                        link={createPageUrl("LearningZone") + "?subject=english"}
                        delay={0.4}
                    />
                </div>

                 <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="flex justify-center items-center"
                >
                    <div className="relative">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 w-80 h-80 opacity-20 blur-lg"
                        />
                        <motion.img 
                            src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400" 
                            alt="Wazza the Wombat" 
                            className="relative z-10 h-72 w-72 rounded-full border-8 border-white shadow-2xl object-cover"
                            animate={{ y: [-10, 10, -10] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div
                            className="absolute -top-8 -right-8 text-4xl"
                            animate={{ rotate: [0, 20, -20, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            ✨
                        </motion.div>
                        <motion.div
                            className="absolute -bottom-4 -left-8 text-3xl"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            🎯
                        </motion.div>
                    </div>
                </motion.div>

                {/* Achievement Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 1.2 }}
                    className="text-center mt-16 bg-white/20 backdrop-blur-md rounded-3xl p-8 border-2 border-white/30"
                >
                    <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
                    <h3 className="text-3xl font-bold text-white adventure-title mb-2">Collect Gum Leaves! 🍃</h3>
                    <p className="text-white text-lg">Every correct answer earns you magical gum leaves. Collect them to unlock amazing rewards and level up your adventure!</p>
                </motion.div>
            </div>
        </div>
    );
}