

import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Play, Trophy, Star, Volume2, VolumeX, ShoppingCart, Users, Swords } from "lucide-react";

export default function Layout({ children, currentPageName }) {
    const location = useLocation();
    const [isMusicOn, setIsMusicOn] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        // Initialize audio element
        audioRef.current = new Audio("https://assets.mixkit.co/music/preview/mixkit-children-s-game-315.mp3");
        audioRef.current.loop = true;

        // Check localStorage for saved preference
        const savedMusicPref = localStorage.getItem("musicOn");
        if (savedMusicPref === "true") {
            setIsMusicOn(true);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("musicOn", isMusicOn);
        if (isMusicOn) {
            audioRef.current.play().catch(error => {
                // Autoplay was prevented.
                console.log("Music autoplay prevented by browser. User must interact first.");
            });
        } else {
            audioRef.current.pause();
        }
    }, [isMusicOn]);

    const toggleMusic = () => {
        setIsMusicOn(prev => !prev);
    };

    const isActive = (pageName) => {
        const pageUrl = createPageUrl(pageName);
        return location.pathname === pageUrl;
    };

    const navItems = [
        { name: "Home", page: "Dashboard", icon: Home, color: "blue" },
        { name: "Play", page: "Game", icon: Play, color: "green" },
        { name: "Challenges", page: "Challenges", icon: Swords, color: "red" },
        { name: "Rewards", page: "Rewards", icon: Trophy, color: "orange" },
        { name: "Shop", page: "Shop", icon: ShoppingCart, color: "pink" },
        { name: "Friends", page: "Friends", icon: Users, color: "purple" }
    ];

    return (
        <div className="min-h-screen bg-blue-600">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Fredoka+One:wght@400&family=Nunito:wght@400;600;700;800&display=swap');
                
                body {
                    background-color: #2563eb; /* blue-600 */
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.1'%3E%3Cpolygon points='36 34 24 34 24 26 36 26'/%3E%3Cpolygon points='18 14 6 14 6 6 18 6'/%3E%3Cpolygon points='54 54 42 54 42 46 54 46'/%3E%3Cpolygon points='12 30 0 30 0 22 12 22'/%3E%3Cpolygon points='60 8 48 8 48 0 60 0'/%3E%3Cpolygon points='30 60 18 60 18 52 30 52'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                }

                .game-font { font-family: 'Nunito', sans-serif; }
                .game-title { font-family: 'Fredoka One', cursive; }
                
                .bounce-in {
                    animation: bounceIn 0.6s ease-out;
                }
                
                @keyframes bounceIn {
                    0% { transform: scale(0.3); opacity: 0; }
                    50% { transform: scale(1.05); }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); opacity: 1; }
                }
                
                .float {
                    animation: float 3s ease-in-out infinite;
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }

                .btn-kid {
                    border-radius: 12px;
                    font-weight: 600;
                    padding: 10px 20px;
                    transform: translateY(0);
                    transition: all 0.2s ease-in-out;
                    box-shadow: 0 4px 0 0 #eab308; /* yellow-500 */
                    background-color: #facc15; /* yellow-400 */
                    color: #422006;
                }
                .btn-kid:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 0 0 #eab308;
                }
                .btn-kid:active {
                    transform: translateY(2px);
                    box-shadow: 0 2px 0 0 #eab308;
                }
            `}</style>
      
            <div className="game-font">
                {/* Header */}
                <header className="bg-white/90 backdrop-blur-sm shadow-lg sticky top-0 z-50">
                    <div className="max-w-6xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center transform rotate-12">
                                    <Star className="w-7 h-7 text-white" />
                                </div>
                                <h1 className="game-title text-3xl text-gray-800">MathQuest</h1>
                            </Link>
                            
                            <div className="flex items-center gap-2">
                                <nav className="hidden md:flex items-center gap-2">
                                    {navItems.map(item => (
                                        <Link
                                            key={item.name}
                                            to={createPageUrl(item.page)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all font-semibold ${
                                            isActive(item.page)
                                                ? `bg-${item.color}-500 text-white shadow-lg`
                                                : `text-gray-600 hover:text-${item.color}-500 hover:bg-${item.color}-50`
                                            }`}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span>{item.name}</span>
                                        </Link>
                                    ))}
                                </nav>

                                <button 
                                  onClick={toggleMusic} 
                                  className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-all"
                                  aria-label={isMusicOn ? 'Mute music' : 'Unmute music'}
                                >
                                  {isMusicOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Mobile Navigation */}
                <nav className="md:hidden bg-white/95 backdrop-blur-sm border-t fixed bottom-0 left-0 right-0 z-50">
                    <div className="flex items-center justify-around py-1">
                        {navItems.map(item => (
                             <Link
                                key={item.name}
                                to={createPageUrl(item.page)}
                                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all w-16 ${
                                    isActive(item.page) ? `text-${item.color}-500` : 'text-gray-600'
                                }`}
                            >
                                <item.icon className="w-6 h-6" />
                                <span className="text-xs font-semibold">{item.name}</span>
                            </Link>
                        ))}
                    </div>
                </nav>

                {/* Main Content */}
                <main className="pb-20 md:pb-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

