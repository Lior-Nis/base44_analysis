import React, { useState, useEffect } from 'react';
import { MultiplayerGame } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Swords, Check, X, Play, Trophy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ChallengesPage() {
    const [user, setUser] = useState(null);
    const [challenges, setChallenges] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchUserAndChallenges = async () => {
            setIsLoading(true);
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                const userChallenges = await MultiplayerGame.list('-created_date');
                setChallenges(userChallenges);
            } catch (error) {
                console.error("Error loading challenges", error);
                toast({ title: "Error", description: "Could not load challenges.", variant: "destructive" });
            }
            setIsLoading(false);
        };
        fetchUserAndChallenges();
    }, [toast]);

    const handleAccept = async (game) => {
        try {
            await MultiplayerGame.update(game.id, { status: 'active' });
            toast({ title: "Challenge Accepted!", description: "Let the game begin!" });
            setChallenges(challenges.map(c => c.id === game.id ? { ...c, status: 'active' } : c));
        } catch (error) {
            console.error("Error accepting challenge:", error);
        }
    };

    const handleDecline = async (game) => {
        try {
            await MultiplayerGame.update(game.id, { status: 'declined' });
            toast({ title: "Challenge Declined" });
            setChallenges(challenges.filter(c => c.id !== game.id));
        } catch (error) {
            console.error("Error declining challenge:", error);
        }
    };

    if (isLoading || !user) {
        return <div className="min-h-screen bg-blue-600 p-8 text-center text-white">Loading Challenges...</div>;
    }

    const received = challenges.filter(c => c.opponent_email === user.email && c.status === 'pending');
    const sent = challenges.filter(c => c.challenger_email === user.email && c.status === 'pending');
    const active = challenges.filter(c => c.status === 'active');
    const completed = challenges.filter(c => c.status === 'completed');

    const renderGameCard = (game, type) => (
        <div key={game.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/6.x/bottts/svg?seed=${type === 'sent' ? game.opponent_email : game.challenger_email}`} />
                    <AvatarFallback>{(type === 'sent' ? game.opponent_nickname : game.challenger_nickname)?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">
                        {type === 'sent' ? `You challenged ${game.opponent_nickname}` : `${game.challenger_nickname} challenged you`}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{game.level} {game.operation}</p>
                </div>
            </div>
            <div className="flex gap-2">
                {type === 'received' && (
                    <>
                        <Button size="sm" className="bg-green-500 hover:bg-green-600" onClick={() => handleAccept(game)}><Check className="w-4 h-4 mr-1"/>Accept</Button>
                        <Button size="sm" variant="outline" onClick={() => handleDecline(game)}><X className="w-4 h-4 mr-1"/>Decline</Button>
                    </>
                )}
                {type === 'sent' && <span className="text-sm text-gray-500">Waiting...</span>}
                {type === 'active' && (
                    <Link to={createPageUrl(`MultiplayerGame?gameId=${game.id}`)}>
                        <Button size="sm" className="bg-purple-500 hover:bg-purple-600"><Play className="w-4 h-4 mr-1"/>Play Now</Button>
                    </Link>
                )}
                {type === 'completed' && (
                   <div className="flex items-center gap-2 text-sm">
                        <Trophy className={`w-4 h-4 ${game.winner_email === user.email ? 'text-yellow-500' : 'text-gray-400'}`} />
                        <span className={game.winner_email === user.email ? 'font-bold text-green-600' : 'text-red-600'}>
                            {game.winner_email === user.email ? 'You Won!' : 'You Lost'}
                        </span>
                   </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-blue-600 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="game-title text-4xl md:text-6xl text-white mb-4 drop-shadow-lg flex items-center justify-center gap-4">
                        <Swords className="w-12 h-12" /> Challenges
                    </h1>
                    <p className="text-xl text-white/90 drop-shadow">
                        Play against your friends and see who is the Math Master!
                    </p>
                </div>

                <div className="space-y-8">
                    <Card className="bg-white/95 backdrop-blur-sm">
                        <CardHeader><CardTitle>Active Games</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {active.length > 0 ? active.map(g => renderGameCard(g, 'active')) : <p className="text-gray-500 text-center">No active games.</p>}
                        </CardContent>
                    </Card>

                    <Card className="bg-white/95 backdrop-blur-sm">
                        <CardHeader><CardTitle>Received Challenges</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {received.length > 0 ? received.map(g => renderGameCard(g, 'received')) : <p className="text-gray-500 text-center">No new challenges.</p>}
                        </CardContent>
                    </Card>

                    <Card className="bg-white/95 backdrop-blur-sm">
                        <CardHeader><CardTitle>Sent Challenges</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {sent.length > 0 ? sent.map(g => renderGameCard(g, 'sent')) : <p className="text-gray-500 text-center">No pending challenges sent.</p>}
                        </CardContent>
                    </Card>

                     <Card className="bg-white/95 backdrop-blur-sm">
                        <CardHeader><CardTitle>Completed Games</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {completed.length > 0 ? completed.map(g => renderGameCard(g, 'completed')) : <p className="text-gray-500 text-center">No games completed yet.</p>}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}