
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, User as UserIcon, Leaf, Star, Zap } from "lucide-react";
import { User } from "@/api/entities";

export default function Layout({ children }) {
    const location = useLocation();
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await User.me();
                setUserData(user);
            } catch (e) {
                // Not logged in
            }
        };
        fetchUser();
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 font-sans relative overflow-hidden">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Fredoka+One:wght@400&family=Quicksand:wght@400;500;700&display=swap');
                body {
                    font-family: 'Quicksand', sans-serif;
                }
                .adventure-title {
                    font-family: 'Fredoka One', cursive;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes sparkle {
                    0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
                    50% { opacity: 0.5; transform: scale(1.2) rotate(180deg); }
                }
                .float { animation: float 3s ease-in-out infinite; }
                .sparkle { animation: sparkle 2s ease-in-out infinite; }
                .cloud {
                    background: rgba(255, 255, 255, 0.8);
                    border-radius: 50px;
                    position: absolute;
                }
                .cloud:before {
                    content: '';
                    position: absolute;
                    background: rgba(255, 255, 255, 0.8);
                    border-radius: 50px;
                }
                .adventure-bg {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
            `}</style>

            {/* Floating Adventure Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Clouds */}
                <div className="cloud w-20 h-12 top-10 left-10 float" style={{animationDelay: '0s'}}></div>
                <div className="cloud w-16 h-8 top-20 right-20 float" style={{animationDelay: '1s'}}></div>
                <div className="cloud w-24 h-14 top-32 left-1/3 float" style={{animationDelay: '2s'}}></div>
                
                {/* Sparkles */}
                <Star className="absolute w-6 h-6 text-yellow-300 top-16 right-32 sparkle" style={{animationDelay: '0.5s'}} />
                <Star className="absolute w-4 h-4 text-pink-300 top-40 left-16 sparkle" style={{animationDelay: '1.5s'}} />
                <Star className="absolute w-5 h-5 text-blue-300 top-24 left-1/2 sparkle" style={{animationDelay: '2.5s'}} />
                <Zap className="absolute w-7 h-7 text-yellow-400 top-48 right-16 sparkle" style={{animationDelay: '1s'}} />
            </div>

            <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl sticky top-0 z-50 border-b-4 border-yellow-400">
                <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <Link to={createPageUrl("Home")} className="flex items-center gap-3 transform hover:scale-105 transition-transform">
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-2xl">🐨</span>
                            </div>
                            <span className="text-3xl font-bold text-white adventure-title drop-shadow-lg">Clever Cub</span>
                        </Link>
                        <div className="flex items-center gap-4 sm:gap-6">
                           {userData && (
                                 <div className="flex items-center gap-3 bg-gradient-to-r from-green-400 to-emerald-500 border-2 border-green-300 px-6 py-3 rounded-full shadow-lg transform hover:scale-105 transition-transform">
                                     <Leaf className="w-6 h-6 text-white animate-pulse"/>
                                     <span className="font-bold text-white text-xl adventure-title">{userData.gum_leaves || 0}</span>
                                 </div>
                            )}
                            <Link to={createPageUrl("Home")} className="p-3 rounded-full bg-gradient-to-br from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 transition-all duration-300 transform hover:scale-110 shadow-lg">
                                <Home className="w-7 h-7 text-white" />
                            </Link>
                            <Link to={createPageUrl("Profile")} className="p-3 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 transition-all duration-300 transform hover:scale-110 shadow-lg">
                                <UserIcon className="w-7 h-7 text-white" />
                            </Link>
                        </div>
                    </div>
                </nav>
            </header>
            <main className="relative z-10">{children}</main>
        </div>
    );
}
