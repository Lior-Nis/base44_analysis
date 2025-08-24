import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Play, RotateCcw, Lightbulb } from "lucide-react";

export default function CodeChallengeGame({ 
  game, 
  onComplete, 
  onClose 
}) {
  const [userCode, setUserCode] = useState("");
  const [result, setResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [showHint, setShowHint] = useState(false);

  const challenge = game.game_data;

  const checkSolution = () => {
    setIsRunning(true);
    setAttempts(prev => prev + 1);

    setTimeout(() => {
      const normalizedUserCode = userCode.trim().toLowerCase().replace(/\s+/g, ' ');
      const normalizedSolution = challenge.solution.trim().toLowerCase().replace(/\s+/g, ' ');
      
      const isCorrect = normalizedUserCode.includes(normalizedSolution) || 
                       challenge.acceptedSolutions?.some(sol => 
                         normalizedUserCode.includes(sol.toLowerCase().replace(/\s+/g, ' '))
                       );

      if (isCorrect) {
        const timeBonus = Math.max(0, 300 - Math.floor((Date.now() - startTime) / 1000));
        const attemptPenalty = Math.max(0, (attempts - 1) * 10);
        const finalScore = Math.max(10, game.points + timeBonus - attemptPenalty);
        
        setScore(finalScore);
        setResult({ success: true, message: "Correct! Well done!" });
        
        setTimeout(() => {
          onComplete({
            score: finalScore,
            attempts: attempts,
            completed: true,
            completion_time: Math.floor((Date.now() - startTime) / 1000)
          });
        }, 2000);
      } else {
        setResult({ success: false, message: "Not quite right. Try again!" });
      }
      
      setIsRunning(false);
    }, 1000);
  };

  const resetCode = () => {
    setUserCode(challenge.starter_code || "");
    setResult(null);
    setShowHint(false);
  };

  useEffect(() => {
    if (challenge.starter_code) {
      setUserCode(challenge.starter_code);
    }
  }, [challenge.starter_code]);

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🧩 {game.title}</span>
            <div className="text-sm text-gray-500">
              Points: {game.points} | Attempts: {attempts}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none mb-4">
            <p className="text-gray-700">{challenge.problem}</p>
            
            {challenge.example && (
              <div className="bg-gray-50 p-3 rounded-lg mt-3">
                <strong>Example:</strong>
                <pre className="text-sm mt-1">{challenge.example}</pre>
              </div>
            )}
          </div>

          {showHint && challenge.hint && (
            <Alert className="mb-4 bg-yellow-50 border-yellow-200">
              <Lightbulb className="w-4 h-4" />
              <AlertDescription>
                <strong>Hint:</strong> {challenge.hint}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Code Editor
            <div className="flex gap-2">
              {challenge.hint && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                  className="text-yellow-600 hover:bg-yellow-50"
                >
                  <Lightbulb className="w-4 h-4 mr-1" />
                  Hint
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={resetCode}
                className="hover:bg-gray-100"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            className="font-mono text-sm min-h-40 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            placeholder={`Write your ${game.language} code here...`}
          />

          {result && (
            <Alert className={result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
              {result.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
                {result.message}
                {result.success && score > 0 && (
                  <span className="ml-2 font-semibold">Score: {score} points!</span>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button
              onClick={checkSolution}
              disabled={isRunning || !userCode.trim()}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Checking...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Submit Solution
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6"
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}