import React, { useState, useEffect, useCallback } from 'react';
import { MultiplayerGame } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/components/ui/use-toast";
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User as UserIcon, Trophy } from 'lucide-react';

export default function MultiplayerGamePage() {
    const [game, setGame] = useState(null);
    const [user, setUser] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const gameId = new URLSearchParams(window.location.search).get('gameId');

    const fetchGameData = useCallback(async () => {
        if (!gameId) return;
        try {
            const gameData = await MultiplayerGame.get(gameId);
            if (gameData.status === 'completed') {
                setGame(gameData);
            } else {
                 setGame(prevGame => ({...prevGame, ...gameData}));
            }
        } catch (error) {
            console.error("Error fetching game state:", error);
        }
    }, [gameId]);
    
    useEffect(() => {
        const initialLoad = async () => {
            setIsLoading(true);
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                const gameData = await MultiplayerGame.get(gameId);
                setGame(gameData);
            } catch (error) {
                toast({ title: "Error", description: "Could not load the game.", variant: "destructive" });
                navigate(createPageUrl('Challenges'));
            }
            setIsLoading(false);
        };
        initialLoad();
    }, [gameId, toast, navigate]);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchGameData();
        }, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, [fetchGameData]);

    const handleAnswer = async () => {
        if (!user || !game) return;
        setIsSubmitting(true);
        
        const isChallenger = game.challenger_email === user.email;
        const myProgress = isChallenger ? game.challenger_progress : game.opponent_progress;
        
        const currentQuestion = game.questions[myProgress.question_index];
        const isCorrect = parseInt(userAnswer) === currentQuestion.answer;

        const newScore = myProgress.score + (isCorrect ? 10 : 0);
        const newQuestionIndex = myProgress.question_index + 1;

        let updatePayload = {};
        if (isChallenger) {
            updatePayload.challenger_progress = { score: newScore, question_index: newQuestionIndex };
        } else {
            updatePayload.opponent_progress = { score: newScore, question_index: newQuestionIndex };
        }

        try {
            const updatedGame = await MultiplayerGame.update(game.id, updatePayload);
            setGame(updatedGame);
            setUserAnswer('');
        } catch (error) {
            console.error("Error submitting answer:", error);
            toast({ title: "Error", description: "Could not submit your answer.", variant: "destructive"});
        }
        setIsSubmitting(false);
    };

    useEffect(() => {
        if (!game || !user) return;
        
        const isChallenger = game.challenger_email === user.email;
        const myProgress = isChallenger ? game.challenger_progress : game.opponent_progress;
        const opponentProgress = isChallenger ? game.opponent_progress : game.challenger_progress;

        if (myProgress.question_index >= game.questions.length && opponentProgress.question_index >= game.questions.length && game.status !== 'completed') {
            // Both players finished, determine winner
            const challengerScore = game.challenger_progress.score;
            const opponentScore = game.opponent_progress.score;
            let winner = null;
            if (challengerScore > opponentScore) winner = game.challenger_email;
            else if (opponentScore > challengerScore) winner = game.opponent_email;
            else winner = 'draw'; // Handle draws

            MultiplayerGame.update(game.id, { status: 'completed', winner_email: winner }).then(setGame);
        }
    }, [game, user]);


    if (isLoading || !game || !user) {
        return <div className="min-h-screen bg-blue-600 p-8 text-center text-white">Setting up the game...</div>;
    }

    const isChallenger = game.challenger_email === user.email;
    const myProgress = isChallenger ? game.challenger_progress : game.opponent_progress;
    const opponentProgress = isChallenger ? game.opponent_progress : game.challenger_progress;
    const myNickname = isChallenger ? game.challenger_nickname : game.opponent_nickname;
    const opponentNickname = isChallenger ? game.opponent_nickname : game.challenger_nickname;

    if (game.status === 'completed') {
        const isWinner = game.winner_email === user.email;
        const isDraw = game.winner_email === 'draw';

        return (
            <div className="min-h-screen bg-blue-600 p-4 md:p-8 flex items-center justify-center">
                <Card className="bg-white/95 backdrop-blur-sm max-w-md w-full text-center">
                    <CardContent className="p-8">
                        <Trophy className="w-24 h-24 mx-auto text-yellow-400 mb-4" />
                        <h2 className="game-title text-3xl mb-4 text-gray-800">
                            {isDraw ? "It's a Draw!" : isWinner ? "You Win!" : "You Lost!"}
                        </h2>
                        <div className="space-y-2 mb-6 text-left">
                            <p><strong>{myNickname} (You):</strong> {myProgress.score} points</p>
                            <p><strong>{opponentNickname}:</strong> {opponentProgress.score} points</p>
                        </div>
                        <Link to={createPageUrl("Challenges")}>
                           <Button className="btn-kid">Back to Challenges</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    const currentQuestion = game.questions[myProgress.question_index];
    const isFinished = myProgress.question_index >= game.questions.length;

    return (
        <div className="min-h-screen bg-blue-600 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                 {/* Scoreboard */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <Card className="bg-white/95 backdrop-blur-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2"><UserIcon className="w-5 h-5 text-purple-500" /><span>{myNickname} (You)</span></div>
                            <p className="text-3xl font-bold">{myProgress.score}</p>
                            <Progress value={(myProgress.question_index / game.questions.length) * 100} className="h-2 mt-2" />
                        </CardContent>
                    </Card>
                    <Card className="bg-white/95 backdrop-blur-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2"><UserIcon className="w-5 h-5" /><span>{opponentNickname}</span></div>
                            <p className="text-3xl font-bold">{opponentProgress.score}</p>
                            <Progress value={(opponentProgress.question_index / game.questions.length) * 100} className="h-2 mt-2" />
                        </CardContent>
                    </Card>
                </div>
                
                {/* Game Area */}
                <Card className="bg-white/95 backdrop-blur-sm mx-auto max-w-2xl">
                    <CardContent className="p-8 md:p-12 text-center">
                        {isFinished ? (
                             <div className="space-y-4">
                                <h2 className="game-title text-3xl">Great Job!</h2>
                                <p className="text-gray-600">Waiting for {opponentNickname} to finish...</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <p className="text-lg text-gray-500">Question {myProgress.question_index + 1} / {game.questions.length}</p>
                                <div className="text-6xl md:text-8xl font-bold text-gray-800 mb-8">
                                    {currentQuestion.num1} {currentQuestion.operation} {currentQuestion.num2} = ?
                                </div>
                                <div className="space-y-6">
                                    <input
                                      type="number"
                                      value={userAnswer}
                                      onChange={(e) => setUserAnswer(e.target.value)}
                                      onKeyPress={(e) => e.key === 'Enter' && userAnswer && handleAnswer()}
                                      placeholder="Your answer..."
                                      className="w-full max-w-xs mx-auto text-center text-3xl p-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                                      autoFocus
                                    />
                                    <Button
                                      onClick={handleAnswer}
                                      disabled={!userAnswer || isSubmitting}
                                      className="btn-kid px-8 py-4 text-xl"
                                    >
                                      {isSubmitting ? 'Checking...' : 'Submit Answer'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}