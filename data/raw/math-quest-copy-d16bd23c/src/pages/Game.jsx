
import React, { useState, useEffect } from "react";
import { GameProgress } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Star, Timer, Target, RefreshCw } from "lucide-react";
import { User } from "@/api/entities";

export default function Game() {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [gameState, setGameState] = useState("setup"); // setup, playing, finished
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedOperation, setSelectedOperation] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const totalQuestions = 10;

  const operations = {
    easy: ["addition", "subtraction"],
    medium: ["addition", "subtraction", "multiplication"],
    hard: ["addition", "subtraction", "multiplication", "division"]
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const level = urlParams.get('level');
    if (level && operations[level]) {
      setSelectedLevel(level);
    }
  }, []);

  useEffect(() => {
    let timer;
    if (gameState === "playing" && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === "playing") {
      finishGame();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, gameState]);

  const generateQuestion = (operation, level) => {
    let num1, num2, answer;
    
    const ranges = {
      easy: { min: 1, max: 20 },
      medium: { min: 1, max: 50 },
      hard: { min: 1, max: 100 }
    };
    
    const range = ranges[level];
    
    switch (operation) {
      case "addition":
        num1 = Math.floor(Math.random() * range.max) + range.min;
        num2 = Math.floor(Math.random() * range.max) + range.min;
        answer = num1 + num2;
        return { num1, num2, operation: "+", answer };
        
      case "subtraction":
        num1 = Math.floor(Math.random() * range.max) + range.min;
        num2 = Math.floor(Math.random() * Math.min(num1, range.max)) + 1;
        answer = num1 - num2;
        return { num1, num2, operation: "−", answer };
        
      case "multiplication":
        const maxMultiplier = level === "medium" ? 12 : 15;
        num1 = Math.floor(Math.random() * maxMultiplier) + 1;
        num2 = Math.floor(Math.random() * maxMultiplier) + 1;
        answer = num1 * num2;
        return { num1, num2, operation: "×", answer };
        
      case "division":
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = Math.floor(Math.random() * 12) + 1;
        num1 = num2 * answer;
        return { num1, num2, operation: "÷", answer };
        
      default:
        return generateQuestion("addition", level);
    }
  };

  const startGame = (operation) => {
    setSelectedOperation(operation);
    setGameState("playing");
    setScore(0);
    setQuestionNumber(1);
    setCorrectAnswers(0);
    setTimeLeft(60);
    setGameStartTime(Date.now());
    setUserAnswer("");
    setFeedback(null);
    
    const question = generateQuestion(operation, selectedLevel);
    setCurrentQuestion(question);
  };

  const handleAnswer = () => {
    const isCorrect = parseInt(userAnswer) === currentQuestion.answer;
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setScore(prev => prev + (selectedLevel === "easy" ? 10 : selectedLevel === "medium" ? 15 : 20));
      setFeedback({ type: "correct", message: "Great job! 🎉" });
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1000);
    } else {
      setFeedback({ 
        type: "incorrect", 
        message: `Oops! The answer was ${currentQuestion.answer}. Try the next one! 💪`
      });
    }

    setTimeout(() => {
      if (questionNumber >= totalQuestions) {
        finishGame();
      } else {
        nextQuestion();
      }
    }, 2000);
  };

  const nextQuestion = () => {
    setQuestionNumber(prev => prev + 1);
    setUserAnswer("");
    setFeedback(null);
    
    const question = generateQuestion(selectedOperation, selectedLevel);
    setCurrentQuestion(question);
  };

  const finishGame = async () => {
    setGameState("finished");
    
    const timeTaken = Math.floor((Date.now() - gameStartTime) / 1000);
    const accuracy = (correctAnswers / totalQuestions) * 100;
    
    try {
      const user = await User.me();
      if (user) {
        const newPoints = (user.points || 0) + score;
        await User.updateMyUserData({ points: newPoints });
      }

      await GameProgress.create({
        level: selectedLevel,
        operation: selectedOperation,
        score: score,
        correct_answers: correctAnswers,
        total_questions: totalQuestions,
        time_taken: timeTaken,
        completed: accuracy >= 70
      });
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const resetGame = () => {
    setGameState("setup");
    setCurrentQuestion(null);
    setUserAnswer("");
    setFeedback(null);
    setScore(0);
    setQuestionNumber(1);
    setCorrectAnswers(0);
    setTimeLeft(60);
  };

  if (gameState === "setup") {
    return (
      <div className="min-h-screen bg-blue-600 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Link to={createPageUrl("Dashboard")}>
              <Button variant="ghost" className="mb-4 text-white hover:bg-white/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            
            <h1 className="game-title text-4xl text-white mb-4 drop-shadow-lg">
              Let's Play Math! 🎮
            </h1>
            
            {selectedLevel && (
              <p className="text-xl text-white/90 mb-8 drop-shadow capitalize">
                {selectedLevel} Level - Choose an operation to practice!
              </p>
            )}
          </div>

          {!selectedLevel ? (
            <div className="text-center">
              <p className="text-white mb-6">Please select a level first!</p>
              <Link to={createPageUrl("Dashboard")}>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                  Choose Level
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {operations[selectedLevel].map((operation) => (
                <Card 
                  key={operation}
                  className="bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-105 cursor-pointer"
                  onClick={() => startGame(operation)}
                >
                  <CardContent className="p-8 text-center">
                    <div className="text-6xl mb-4">
                      {operation === 'addition' ? '➕' : 
                       operation === 'subtraction' ? '➖' : 
                       operation === 'multiplication' ? '✖️' : '➗'}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 capitalize">
                      {operation}
                    </h3>
                    <Button className="w-full mt-4 bg-gradient-to-r from-blue-400 to-blue-600 text-white">
                      Start!
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (gameState === "finished") {
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = accuracy >= 70;
    
    return (
      <div className="min-h-screen bg-blue-600 p-4 md:p-8 flex items-center justify-center">
        <Card className="bg-white/95 backdrop-blur-sm max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">
              {passed ? "🏆" : "💪"}
            </div>
            
            <h2 className="game-title text-3xl mb-4 text-gray-800">
              {passed ? "Amazing Job!" : "Keep Practicing!"}
            </h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Score:</span>
                <span className="font-bold text-2xl text-blue-600">{score} points</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Accuracy:</span>
                <span className="font-bold text-lg">{accuracy}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Correct:</span>
                <span className="font-bold">{correctAnswers}/{totalQuestions}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={resetGame}
                className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
              
              <Link to={createPageUrl("Dashboard")} className="block">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-600 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Game Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("Dashboard")}>
              <Button variant="ghost" className="text-white hover:bg-white/20">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            
            <div className="flex items-center gap-2 text-white">
              <Timer className="w-5 h-5" />
              <span className="font-bold text-lg">{timeLeft}s</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-white">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              <span className="font-bold text-lg">{score}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              <span className="font-bold">{questionNumber}/{totalQuestions}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress 
            value={(questionNumber / totalQuestions) * 100} 
            className="h-3 bg-white/30"
          />
        </div>

        {/* Main Game Area */}
        <Card className={`bg-white/95 backdrop-blur-sm mx-auto max-w-2xl transition-all duration-500 ${showCelebration ? 'scale-105 shadow-2xl' : ''}`}>
          <CardContent className="p-8 md:p-12 text-center">
            {currentQuestion && (
              <div className="space-y-8">
                <div className="text-6xl md:text-8xl font-bold text-gray-800 mb-8">
                  {currentQuestion.num1} {currentQuestion.operation} {currentQuestion.num2} = ?
                </div>
                
                {!feedback ? (
                  <div className="space-y-6">
                    <input
                      type="number"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && userAnswer && handleAnswer()}
                      placeholder="Your answer..."
                      className="w-full max-w-xs mx-auto text-center text-3xl p-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                      autoFocus
                    />
                    
                    <Button
                      onClick={handleAnswer}
                      disabled={!userAnswer}
                      className="px-8 py-4 text-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl"
                    >
                      Submit Answer
                    </Button>
                  </div>
                ) : (
                  <div className={`p-6 rounded-xl ${feedback.type === 'correct' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                    <div className="text-2xl font-bold mb-2">
                      {feedback.message}
                    </div>
                    {feedback.type === 'correct' && (
                      <div className="text-4xl animate-bounce">🎉</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
