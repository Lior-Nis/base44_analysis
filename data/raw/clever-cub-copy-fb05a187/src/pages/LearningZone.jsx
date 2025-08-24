import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Question } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Zap, Check, X, Award, ArrowRight, Home, Star, Heart, Crown } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function LearningZone() {
    const location = useLocation();
    const navigate = useNavigate();
    const [subject, setSubject] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [user, setUser] = useState(null);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);

    const fetchUserAndQuestions = useCallback(async (currentSubject) => {
        setIsLoading(true);
        try {
            const currentUser = await User.me();
            setUser(currentUser);
            const userLevel = currentSubject === "maths" ? currentUser.level_maths : currentUser.level_english;
            
            const fetchedQuestions = await Question.filter({ subject: currentSubject, difficulty: userLevel }, '-created_date', 5);
            
            if (fetchedQuestions.length > 0) {
                setQuestions(fetchedQuestions);
            } else {
                const easierQuestions = await Question.filter({ subject: currentSubject, difficulty: Math.max(1, userLevel - 1) }, '-created_date', 5);
                 if(easierQuestions.length > 0) {
                    setQuestions(easierQuestions);
                 } else {
                    setQuestions([]);
                 }
            }
            
        } catch (error) {
            console.error("Error fetching data:", error);
            navigate(createPageUrl("Home"));
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const currentSubject = searchParams.get("subject");
        if (currentSubject) {
            setSubject(currentSubject);
            fetchUserAndQuestions(currentSubject);
        } else {
            navigate(createPageUrl("Home"));
        }
    }, [location.search, navigate, fetchUserAndQuestions]);
    
    const handleAnswer = async (answer) => {
        if (selectedAnswer) return;

        const correct = answer === questions[currentQuestionIndex].correct_answer;
        setSelectedAnswer(answer);
        setIsCorrect(correct);
        
        if(correct) {
            setShowConfetti(true);
            setScore(s => s + 1);
            setStreak(s => s + 1);
        } else {
            setStreak(0);
        }

        setTimeout(async () => {
            if(correct) {
                const bonusPoints = streak >= 3 ? 20 : 10; // Bonus for streaks
                const newGumLeaves = (user.gum_leaves || 0) + bonusPoints;
                await User.updateMyUserData({ gum_leaves: newGumLeaves });
                setUser(prev => ({...prev, gum_leaves: newGumLeaves}));
            }
            
            setShowConfetti(false);
            setSelectedAnswer(null);
            setIsCorrect(null);

            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
            } else {
                const newLevel = (subject === 'maths' ? user.level_maths : user.level_english) + 1;
                const userDataToUpdate = subject === 'maths' ? { level_maths: newLevel } : { level_english: newLevel };
                await User.updateMyUserData(userDataToUpdate);
                setShowLevelUp(true);
            }
        }, 2000);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-[calc(100vh-80px)] bg-gradient-to-br from-purple-400 to-pink-400">
                <div className="text-8xl mb-8 animate-bounce">🐨</div>
                <Loader2 className="w-16 h-16 animate-spin text-white mb-4" />
                <p className="text-2xl text-white font-bold adventure-title">Wazza is preparing your adventure...</p>
            </div>
        );
    }
    
    if (showLevelUp) {
        return (
            <div className="flex flex-col justify-center items-center h-[calc(100vh-80px)] text-center px-4 bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 relative overflow-hidden">
                {/* Celebration background */}
                <div className="absolute inset-0">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute text-4xl"
                            initial={{ y: -100, x: Math.random() * window.innerWidth, rotate: 0 }}
                            animate={{ y: window.innerHeight + 100, rotate: 360 }}
                            transition={{ duration: 3, delay: Math.random() * 2, repeat: Infinity }}
                        >
                            {['🎉', '⭐', '🎊', '🏆', '🌟'][Math.floor(Math.random() * 5)]}
                        </motion.div>
                    ))}
                </div>
                
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 1 }}
                >
                    <Crown className="w-40 h-40 text-yellow-300 mb-6 drop-shadow-2xl" />
                </motion.div>
                <motion.h2 
                    className="text-6xl font-bold mb-4 text-white adventure-title drop-shadow-lg"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                >
                    🎉 LEVEL COMPLETE! 🎉
                </motion.h2>
                <p className="text-2xl text-white mb-8 font-semibold drop-shadow">You answered {score} out of {questions.length} questions correctly! You're becoming a true knowledge hero! 🦸‍♀️</p>
                <div className="flex gap-6">
                    <Button 
                        onClick={() => {setShowLevelUp(false); setCurrentQuestionIndex(0); setScore(0); setStreak(0); fetchUserAndQuestions(subject);}} 
                        size="lg" 
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-xl px-8 py-4 rounded-full shadow-2xl transform hover:scale-105 transition-all"
                    >
                        Next Adventure! <ArrowRight className="ml-2"/>
                    </Button>
                     <Button 
                        onClick={() => navigate(createPageUrl("Home"))} 
                        size="lg" 
                        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold text-xl px-8 py-4 rounded-full shadow-2xl transform hover:scale-105 transition-all"
                    >
                        <Home className="mr-2"/> Back to Base
                    </Button>
                </div>
            </div>
        )
    }
    
    if (!questions || questions.length === 0) {
         return (
            <div className="flex flex-col justify-center items-center h-[calc(100vh-80px)] text-center px-4 bg-gradient-to-br from-blue-400 to-purple-500">
                <div className="text-8xl mb-8 animate-bounce">🤔</div>
                <h2 className="text-5xl font-bold mb-4 text-white adventure-title drop-shadow-lg">Wazza is cooking up new challenges!</h2>
                <p className="text-xl text-white mb-8 drop-shadow">More exciting questions are on their way. Check back soon for new adventures!</p>
                <Button 
                    onClick={() => navigate(createPageUrl("Home"))} 
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-xl px-8 py-4 rounded-full shadow-2xl transform hover:scale-105 transition-all"
                >
                    <Home className="mr-2"/> Back to Home Base
                </Button>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const subjectColors = {
        maths: { bg: "from-orange-400 to-red-500", progress: "bg-orange-500", text: "text-orange-600", border: "border-orange-500" },
        english: { bg: "from-blue-400 to-purple-500", progress: "bg-blue-500", text: "text-blue-600", border: "border-blue-500" }
    }
    const colors = subjectColors[subject];

    return (
        <div className={`min-h-[calc(100vh-80px)] bg-gradient-to-br ${colors.bg} relative overflow-hidden`}>
            {/* Background Elements */}
            <div className="absolute inset-0 opacity-10">
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-6xl"
                        initial={{ y: Math.random() * window.innerHeight, x: Math.random() * window.innerWidth }}
                        animate={{ y: Math.random() * window.innerHeight, x: Math.random() * window.innerWidth }}
                        transition={{ duration: 20, delay: Math.random() * 10, repeat: Infinity, repeatType: "reverse" }}
                    >
                        {subject === 'maths' ? ['🔢', '➕', '➖', '✖️', '➗'][Math.floor(Math.random() * 5)] : ['📚', '✏️', '📝', '🎭', '🗣️'][Math.floor(Math.random() * 5)]}
                    </motion.div>
                ))}
            </div>

            <div className="container mx-auto px-4 py-12 relative z-10">
                {/* Game UI Header */}
                <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 mb-8 shadow-2xl border-4 border-white">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 text-2xl font-bold ${colors.text} bg-white rounded-full px-6 py-3 shadow-lg`}>
                                <Zap className="animate-pulse" />
                                <span className="adventure-title">Question {currentQuestionIndex + 1} / {questions.length}</span>
                            </div>
                            {streak > 0 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full px-4 py-2 font-bold shadow-lg"
                                >
                                    <Star className="w-5 h-5" />
                                    <span>{streak} Streak!</span>
                                </motion.div>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`text-xl font-bold bg-gradient-to-r ${colors.bg} text-white px-6 py-3 rounded-full shadow-lg adventure-title`}>
                                Level {subject === 'maths' ? user?.level_maths : user?.level_english}
                            </div>
                            <div className="flex items-center gap-2 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-full px-4 py-2 font-bold shadow-lg">
                                <Heart className="w-5 h-5 animate-pulse" />
                                <span>{score}</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
                        <motion.div
                            className={`${colors.progress} h-6 rounded-full shadow-lg`}
                            initial={{ width: '0%' }}
                            animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestionIndex}
                        initial={{ opacity: 0, y: 100, scale: 0.8, rotateY: -90 }}
                        animate={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
                        exit={{ opacity: 0, y: -100, scale: 0.8, rotateY: 90 }}
                        transition={{ duration: 0.8, type: "spring" }}
                        className="bg-white/95 backdrop-blur-md p-10 rounded-3xl shadow-2xl max-w-5xl mx-auto border-4 border-white"
                    >
                        {currentQuestion.question_image && (
                            <motion.div 
                                className="mb-8 rounded-3xl overflow-hidden shadow-2xl"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <img src={currentQuestion.question_image} alt="Question illustration" className="w-full h-auto max-h-80 object-cover" />
                            </motion.div>
                        )}
                        
                        <motion.h2 
                            className="text-5xl font-bold text-center mb-12 text-gray-800 adventure-title"
                            animate={{ scale: [1, 1.02, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            {currentQuestion.question_text}
                        </motion.h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {currentQuestion.options.map((option, index) => {
                                const isSelected = selectedAnswer === option;
                                const buttonColors = [
                                    'from-red-400 to-pink-500',
                                    'from-blue-400 to-indigo-500', 
                                    'from-green-400 to-emerald-500',
                                    'from-purple-400 to-violet-500'
                                ];
                                
                                let buttonClass = `bg-gradient-to-br ${buttonColors[index]} hover:scale-105 text-white shadow-2xl border-4 border-white`;
                                if(isSelected) {
                                    buttonClass = isCorrect 
                                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-400 text-white shadow-2xl animate-pulse' 
                                        : 'bg-gradient-to-br from-red-500 to-red-600 border-red-400 text-white shadow-2xl animate-pulse';
                                }

                                return (
                                    <motion.div 
                                        key={option}
                                        whileHover={{ y: -5 }}
                                        whileTap={{ scale: 0.95 }}
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Button
                                            onClick={() => handleAnswer(option)}
                                            className={`w-full h-28 text-3xl font-bold transition-all duration-300 rounded-3xl flex items-center justify-center gap-4 adventure-title ${buttonClass}`}
                                            disabled={!!selectedAnswer}
                                        >
                                            {option}
                                            {isSelected && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: "spring", stiffness: 500 }}
                                                >
                                                    {isCorrect ? <Check className="w-10 h-10"/> : <X className="w-10 h-10"/>}
                                                </motion.div>
                                            )}
                                        </Button>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Feedback Messages */}
                        <AnimatePresence>
                            {isCorrect === true && (
                                <motion.div
                                    initial={{ opacity: 0, y: 50, scale: 0.5 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -50, scale: 0.5 }}
                                    className="text-center mt-8"
                                >
                                    <div className="text-6xl mb-4">🎉</div>
                                    <p className="text-3xl font-bold text-green-600 adventure-title">Fantastic! You're amazing! 🌟</p>
                                </motion.div>
                            )}
                            {isCorrect === false && (
                                <motion.div
                                    initial={{ opacity: 0, y: 50, scale: 0.5 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -50, scale: 0.5 }}
                                    className="text-center mt-8"
                                >
                                    <div className="text-6xl mb-4">💪</div>
                                    <p className="text-3xl font-bold text-orange-600 adventure-title">Keep trying! You're learning! 🚀</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}