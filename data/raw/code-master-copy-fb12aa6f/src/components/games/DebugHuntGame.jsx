import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bug, CheckCircle, XCircle, Zap, Clock } from "lucide-react";

export default function DebugHuntGame({ 
  game, 
  onComplete, 
  onClose 
}) {
  const [selectedLines, setSelectedLines] = useState(new Set());
  const [result, setResult] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);

  const bugData = game.game_data;
  const codeLines = bugData.code.split('\n');
  const buggyLines = new Set(bugData.buggy_lines);

  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStarted) {
      checkSolution();
    }
  }, [timeLeft, gameStarted]);

  const startGame = () => {
    setGameStarted(true);
    setSelectedLines(new Set());
    setResult(null);
    setAttempts(0);
    setScore(0);
    setTimeLeft(120);
  };

  const toggleLine = (lineIndex) => {
    if (result) return;
    
    const newSelected = new Set(selectedLines);
    if (newSelected.has(lineIndex)) {
      newSelected.delete(lineIndex);
    } else {
      newSelected.add(lineIndex);
    }
    setSelectedLines(newSelected);
  };

  const checkSolution = () => {
    setAttempts(prev => prev + 1);
    
    const correctLines = [...selectedLines].filter(line => buggyLines.has(line));
    const incorrectLines = [...selectedLines].filter(line => !buggyLines.has(line));
    const missedLines = [...buggyLines].filter(line => !selectedLines.has(line));

    const accuracy = correctLines.length / buggyLines.size;
    const penalty = incorrectLines.length * 10 + missedLines.length * 15;
    const timeBonus = Math.max(0, timeLeft * 2);
    const attemptPenalty = (attempts - 1) * 20;
    
    const finalScore = Math.max(0, Math.round(accuracy * game.points + timeBonus - penalty - attemptPenalty));

    if (accuracy === 1 && incorrectLines.length === 0) {
      setResult({
        success: true,
        message: `Perfect! Found all ${buggyLines.size} bugs!`,
        details: {
          correct: correctLines.length,
          incorrect: incorrectLines.length,
          missed: missedLines.length,
          score: finalScore
        }
      });
      setScore(finalScore);
      
      setTimeout(() => {
        onComplete({
          score: finalScore,
          completed: true,
          attempts: attempts,
          completion_time: 120 - timeLeft
        });
      }, 3000);
    } else {
      setResult({
        success: false,
        message: `Found ${correctLines.length}/${buggyLines.size} bugs. ${incorrectLines.length > 0 ? `${incorrectLines.length} false positives.` : ''}`,
        details: {
          correct: correctLines.length,
          incorrect: incorrectLines.length,
          missed: missedLines.length,
          score: 0
        }
      });
    }
  };

  if (!gameStarted) {
    return (
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">🐛 {game.title}</CardTitle>
          <p className="text-gray-600">{game.description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">Instructions:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Find and click on all the buggy lines in the code</li>
              <li>• You have 2 minutes to complete the challenge</li>
              <li>• There are {bugData.buggy_lines.length} bugs to find</li>
              <li>• Avoid selecting correct lines (false positives)</li>
            </ul>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{bugData.buggy_lines.length}</div>
              <div className="text-sm text-gray-600">Bugs to Find</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">2:00</div>
              <div className="text-sm text-gray-600">Time Limit</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{game.points}</div>
              <div className="text-sm text-gray-600">Max Points</div>
            </div>
          </div>

          <Button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold py-3 rounded-xl text-lg"
          >
            <Bug className="w-5 h-5 mr-2" />
            Start Bug Hunt
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              🐛 Debug Hunt: {bugData.title}
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Clock className="w-4 h-4" />
                <span className="font-mono text-lg">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
              </div>
              <div className="text-sm text-gray-600">
                Selected: {selectedLines.size} | Target: {buggyLines.size}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-0 shadow-lg bg-gray-900 text-green-400">
        <CardContent className="p-6">
          <div className="font-mono text-sm">
            {codeLines.map((line, index) => (
              <div
                key={index}
                onClick={() => toggleLine(index)}
                className={`flex items-center cursor-pointer hover:bg-gray-800 px-2 py-1 rounded transition-colors ${
                  selectedLines.has(index) 
                    ? buggyLines.has(index) 
                      ? 'bg-red-900 bg-opacity-50 border-l-4 border-red-400' 
                      : 'bg-yellow-900 bg-opacity-50 border-l-4 border-yellow-400'
                    : 'hover:bg-gray-800'
                } ${
                  result && buggyLines.has(index) && !selectedLines.has(index)
                    ? 'bg-red-900 bg-opacity-30 animate-pulse'
                    : ''
                }`}
              >
                <span className="text-gray-500 w-8 text-right mr-4">
                  {index + 1}
                </span>
                <span className="flex-1">{line || ' '}</span>
                {selectedLines.has(index) && (
                  <Bug className="w-4 h-4 text-red-400" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {result && (
        <Alert className={result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
          {result.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
            {result.message}
            {result.success && (
              <div className="mt-2 font-semibold">
                🎉 Score: {result.details.score} points!
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button
          onClick={checkSolution}
          disabled={selectedLines.size === 0 || result?.success}
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl"
        >
          <Zap className="w-4 h-4 mr-2" />
          Submit Solution
        </Button>
        <Button
          variant="outline"
          onClick={onClose}
          className="px-6"
        >
          Close
        </Button>
      </div>
    </div>
  );
}