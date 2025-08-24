
import React, { useState, useEffect } from "react";
import { User, Gecko, GeckoImage, ForumPost, GeckoOfTheDay as GotdEntity } from "@/api/entities"; // Renamed GeckoOfTheDay to avoid conflict
import { BarChart3, Users, GitBranch, Image as ImageIcon, MessageSquare, Star, Sparkles, Eye } from 'lucide-react';
import StatsCard from "../components/dashboard/StatsCard";
import RecentActivity from "../components/dashboard/RecentActivity";
import TrainingProgress from "../components/dashboard/TrainingProgress";
import { default as GeckoOfTheDayComponent } from '../components/dashboard/GeckoOfTheDay';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from 'date-fns';


export default function Dashboard() {
    const [stats, setStats] = useState({ users: 0, geckos: 0, images: 0, posts: 0, verifiedImages: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [geckoOfTheDay, setGeckoOfTheDay] = useState(null);
    const [recentImages, setRecentImages] = useState([]);
    const [allImages, setAllImages] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const today = format(new Date(), 'yyyy-MM-dd');
                const [currentUser, users, geckos, posts, gotd, allGeckoImages, recentImagesData] = await Promise.all([
                    User.me().catch(() => null),
                    User.list(),
                    Gecko.list(),
                    ForumPost.list().catch(() => []),
                    GotdEntity.filter({ date: today }, '-created_date', 1).catch(() => []),
                    GeckoImage.list(),
                    GeckoImage.list('-created_date', 5)
                ]);

                setUser(currentUser);
                setAllImages(allGeckoImages);
                setRecentImages(recentImagesData);
                
                setStats({
                    users: users.length,
                    geckos: geckos.length,
                    images: allGeckoImages.length,
                    verifiedImages: allGeckoImages.filter(img => img.verified).length,
                    posts: posts.length,
                });

                if (gotd && gotd.length > 0) {
                    const featuredGeckoImage = await GeckoImage.get(gotd[0].gecko_image_id);
                    const uploaderResult = await User.filter({ email: gotd[0].uploader_email });
                    const uploader = uploaderResult[0] || null;
                    setGeckoOfTheDay({ ...gotd[0], image: featuredGeckoImage, uploader });
                } else {
                    setGeckoOfTheDay(null);
                }

            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            }
            setIsLoading(false);
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950/30 to-slate-900 relative overflow-hidden">
            {/* Ambient background effects */}
            <div className="absolute inset-0 gecko-scale-pattern opacity-5"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-emerald-500/10 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-radial from-green-500/10 to-transparent rounded-full blur-3xl"></div>
            
            <div className="relative z-10 p-6 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Enhanced header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-5xl font-bold text-gecko-text text-glow tracking-tight">
                                Dashboard
                            </h1>
                            <p className="text-gecko-text-muted text-lg max-w-2xl leading-relaxed">
                                Welcome back to your gecko universe. Here's what's happening in the community.
                            </p>
                        </div>
                        {user && (
                            <div className="flex gap-3">
                                <Link to={createPageUrl('MyGeckos')}>
                                    <Button variant="outline" className="border-gecko-border text-gecko-text hover:bg-gecko-hover backdrop-blur-sm transition-all duration-300 hover:scale-105">
                                        <Users className="w-4 h-4 mr-2" />
                                        My Collection
                                    </Button>
                                </Link>
                                <Link to={createPageUrl('Training')}>
                                    <Button className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold shadow-lg gecko-glow transition-all duration-300 hover:scale-105">
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Train AI Model
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Enhanced stats grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="gecko-card h-40">
                                    <div className="p-6 space-y-4">
                                        <div className="h-4 bg-gecko-surface rounded animate-pulse"></div>
                                        <div className="h-8 bg-gecko-surface rounded animate-pulse"></div>
                                        <div className="h-3 bg-gecko-surface rounded w-2/3 animate-pulse"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatsCard 
                                title="Community Members" 
                                value={stats.users.toLocaleString()} 
                                icon={Users} 
                                gradient="from-cyan-500 to-blue-600"
                                description="Active gecko enthusiasts"
                            />
                            <StatsCard 
                                title="Geckos Tracked" 
                                value={stats.geckos.toLocaleString()} 
                                icon={GitBranch} 
                                gradient="from-emerald-500 to-green-600"
                                description="Individual geckos in collections"
                            />
                            <StatsCard 
                                title="AI Training Images" 
                                value={stats.images.toLocaleString()} 
                                icon={ImageIcon} 
                                gradient="from-amber-500 to-orange-600"
                                description="Photos training our AI"
                            />
                            <StatsCard 
                                title="Forum Discussions" 
                                value={stats.posts.toLocaleString()} 
                                icon={MessageSquare} 
                                gradient="from-violet-500 to-purple-600"
                                description="Community conversations"
                            />
                        </div>
                    )}
                    
                    {/* Enhanced content grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <div className="lg:col-span-2 space-y-8">
                            <GeckoOfTheDayComponent geckoOfTheDay={geckoOfTheDay} />
                            <RecentActivity geckoImages={recentImages} isLoading={isLoading} />
                        </div>
                        <div className="space-y-8">
                            <TrainingProgress totalImages={stats.images} verifiedImages={stats.verifiedImages} isLoading={isLoading} />
                            <Card className="gecko-card">
                                <CardHeader>
                                    <CardTitle className="text-gecko-text text-glow flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-gecko-accent" />
                                        New to Geck Inspect?
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-gecko-text-muted leading-relaxed">
                                        Start your journey by adding geckos to your collection or help train our AI with gecko photos.
                                    </p>
                                    <div className="space-y-3">
                                        <Link to={createPageUrl('MyGeckos')}>
                                            <Button variant="outline" className="w-full border-gecko-border hover:bg-gecko-hover backdrop-blur-sm transition-all duration-300 hover:scale-105">
                                                <Users className="w-4 h-4 mr-2" />
                                                Build My Collection
                                            </Button>
                                        </Link>
                                        <Link to={createPageUrl('Recognition')}>
                                            <Button className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold gecko-glow transition-all duration-300 hover:scale-105">
                                                <Eye className="w-4 h-4 mr-2" />
                                                Identify a Morph
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
