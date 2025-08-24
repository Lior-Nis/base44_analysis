import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Target, Timer } from "lucide-react";

export default function SyntaxMatchGame({ 
  game, 
  onComplete, 
  onClose 
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);

  const questions = game.game_data.questions || [];
  const question = questions[currentQuestion];

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameEnded) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameEnded) {
      endGame();
    }
  }, [timeLeft, gameStarted, gameEnded]);

  const startGame = () => {
    setGameStarted(true);
    setTimeLeft(60);
    setScore(0);
    setCurrentQuestion(0);
    setAnswers([]);
    setGameEnded(false);
    setShowResult(false);
  };

  const selectAnswer = (selectedOption) => {
    const isCorrect = selectedOption === question.correct;
    const newAnswer = {
      question: currentQuestion,
      selected: selectedOption,
      correct: isCorrect
    };

    setAnswers([...answers, newAnswer]);
    
    if (isCorrect) {
      setScore(score + 10);
    }

    setShowResult(true);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setShowResult(false);
      } else {
        endGame();
      }
    }, 1500);
  };

  const endGame = () => {
    setGameEnded(true);
    const finalScore = Math.round((score / (questions.length * 10)) * game.points);
    
    setTimeout(() => {
      onComplete({
        score: finalScore,
        completed: true,
        attempts: 1,
        completion_time: 60 - timeLeft
      });
    }, 2000);
  };

  if (!gameStarted) {
    return (
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">🎯 {game.title}</CardTitle>
          <p className="text-gray-600">{game.description}</p>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">60s</div>
              <div className="text-sm text-gray-600">Time Limit</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{game.points}</div>
              <div className="text-sm text-gray-600">Max Points</div>
            </div>
          </div>
          
          <Button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-xl text-lg"
          >
            <Target className="w-5 h-5 mr-2" />
            Start Game
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (gameEnded) {
    const accuracy = Math.round((answers.filter(a => a.correct).length / questions.length) * 100);
    
    return (
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-green-600">🎉 Game Complete!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{score}</div>
              <div className="text-sm text-gray-600">Final Score</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{accuracy}%</div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{60 - timeLeft}s</div>
              <div className="text-sm text-gray-600">Time Used</div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={startGame}
              variant="outline"
              className="flex-1"
            >
              Play Again
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white"
            >
              Continue Learning
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              Question {currentQuestion + 1} of {questions.length}
            </Badge>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="font-semibold">{score} points</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-blue-600">
            <Timer className="w-4 h-4" />
            <span className="font-mono text-lg">{timeLeft}s</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4">{question.question}</h3>
          {question.code && (
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-left">
              <pre>{question.code}</pre>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.options.map((option, index) => (
            <Button
              key={index}
              onClick={() => selectAnswer(option)}
              disabled={showResult}
              variant="outline"
              className={`p-4 h-auto text-left hover:bg-blue-50 transition-colors ${
                showResult && option === question.correct 
                  ? 'bg-green-50 border-green-500 text-green-700' 
                  : showResult && option !== question.correct && answers[answers.length - 1]?.selected === option
                  ? 'bg-red-50 border-red-500 text-red-700'
                  : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="font-mono">{option}</span>
                {showResult && option === question.correct && (
                  <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                )}
                {showResult && option !== question.correct && answers[answers.length - 1]?.selected === option && (
                  <XCircle className="w-5 h-5 text-red-600 ml-auto" />
                )}
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}