import React, { useState, useEffect } from 'react';
import { User, Question, QuizAttempt } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, CheckCircle, XCircle, Trophy, Loader2 } from 'lucide-react';

const QUIZ_LENGTH = 5;
const TIME_PER_QUESTION = 15; // seconds

export default function QuizPage() {
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [gameState, setGameState] = useState('start'); // start, playing, end
  const [isLoading, setIsLoading] =useState(false);

  useEffect(() => {
    User.me().then(setUser).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0 && !isAnswered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'playing' && timeLeft === 0 && !isAnswered) {
      handleAnswer(null); // Time's up
    }
  }, [timeLeft, gameState, isAnswered]);

  const startQuiz = async () => {
    setIsLoading(true);
    try {
        const allQuestions = await Question.list();
        // Get a random subset of questions
        const shuffled = allQuestions.sort(() => 0.5 - Math.random());
        setQuestions(shuffled.slice(0, QUIZ_LENGTH));
        
        setCurrentQuestionIndex(0);
        setScore(0);
        setTimeLeft(TIME_PER_QUESTION);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setGameState('playing');
    } catch (error) {
        alert("Could not load quiz. Please try again.");
        console.error("Error loading questions:", error);
    }
    setIsLoading(false);
  };

  const handleAnswer = (answer) => {
    if (isAnswered) return;

    setIsAnswered(true);
    setSelectedAnswer(answer);

    if (answer === questions[currentQuestionIndex].correct_answer) {
      setScore(score + 1);
    }

    setTimeout(nextQuestion, 2000);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeLeft(TIME_PER_QUESTION);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      endQuiz();
    }
  };

  const endQuiz = async () => {
    setGameState('end');
    if(user) {
        const reward = score * 2; // ₹2 per correct answer
        await QuizAttempt.create({
            user_id: user.id,
            score: score,
            questions_answered: questions.length,
            reward_amount: reward
        });
        if(reward > 0) {
            const newBalance = (user.wallet_balance || 0) + reward;
            await User.updateMyUserData({ wallet_balance: newBalance });
            setUser(prev => ({...prev, wallet_balance: newBalance}));
        }
    }
  };
  
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen p-4 lg:p-8 flex items-center justify-center">
      <Card className="w-full max-w-2xl bg-slate-800/50 border-slate-700/50 text-white">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold flex items-center justify-center gap-2">
            <BrainCircuit className="w-8 h-8 text-purple-400" />
            Quiz Arena
          </CardTitle>
          <p className="text-center text-gray-400">Answer correctly and earn rewards!</p>
        </CardHeader>
        <CardContent>
          {gameState === 'start' && (
            <div className="text-center">
              <p className="mb-4">Answer {QUIZ_LENGTH} questions. The faster you answer, the better. Ready?</p>
              <Button onClick={startQuiz} size="lg" disabled={isLoading} className="bg-purple-600 hover:bg-purple-700">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : null}
                Start Quiz
              </Button>
            </div>
          )}

          {gameState === 'playing' && currentQuestion && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm">Question {currentQuestionIndex + 1}/{questions.length}</div>
                <div className="text-lg font-bold">Time Left: {timeLeft}s</div>
              </div>
              <Progress value={(timeLeft / TIME_PER_QUESTION) * 100} className="mb-6" />
              <h3 className="text-xl font-semibold mb-6 text-center">{currentQuestion.question_text}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => {
                  const isCorrect = option === currentQuestion.correct_answer;
                  let buttonClass = 'bg-slate-700 hover:bg-slate-600';
                  if (isAnswered) {
                    if (isCorrect) {
                      buttonClass = 'bg-green-600';
                    } else if (selectedAnswer === option) {
                      buttonClass = 'bg-red-600';
                    }
                  }

                  return (
                    <Button
                      key={index}
                      onClick={() => handleAnswer(option)}
                      disabled={isAnswered}
                      className={`h-auto py-4 text-lg whitespace-normal ${buttonClass}`}
                    >
                      {option}
                      {isAnswered && isCorrect && <CheckCircle className="w-5 h-5 ml-auto" />}
                      {isAnswered && !isCorrect && selectedAnswer === option && <XCircle className="w-5 h-5 ml-auto" />}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {gameState === 'end' && (
            <div className="text-center">
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4"/>
              <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
              <p className="text-lg mb-4">You scored {score} out of {questions.length}!</p>
              <p className="text-lg mb-6 text-green-400">You earned ₹{(score * 2).toFixed(2)}!</p>
              <Button onClick={startQuiz} size="lg" className="bg-purple-600 hover:bg-purple-700">Play Again</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}