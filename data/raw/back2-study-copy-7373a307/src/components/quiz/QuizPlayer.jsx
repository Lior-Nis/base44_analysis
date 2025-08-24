import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuizPlayer({ quiz, onComplete, onExit, language = 'he' }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(quiz.time_limit * 60); // Convert to seconds
  const [startTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      handleComplete();
    }
  }, [timeLeft]);

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    const timeSpent = (Date.now() - questionStartTime) / 1000;
    const isCorrect = selectedAnswer === quiz.questions[currentQuestion].correct_answer;
    
    setAnswers([...answers, {
      question_index: currentQuestion,
      selected_answer: selectedAnswer,
      is_correct: isCorrect,
      time_spent: timeSpent
    }]);

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setQuestionStartTime(Date.now());
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    const finalAnswers = selectedAnswer !== null ? 
      [...answers, {
        question_index: currentQuestion,
        selected_answer: selectedAnswer,
        is_correct: selectedAnswer === quiz.questions[currentQuestion].correct_answer,
        time_spent: (Date.now() - questionStartTime) / 1000
      }] : answers;

    const correctAnswers = finalAnswers.filter(a => a.is_correct).length;
    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    const totalTime = (Date.now() - startTime) / 1000 / 60; // Convert to minutes

    onComplete({
      quiz_id: quiz.id,
      user_id: quiz.user_id,
      score,
      correct_answers: correctAnswers,
      total_questions: quiz.questions.length,
      time_taken: totalTime,
      answers: finalAnswers
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const question = quiz.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={onExit}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            חזור
          </Button>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg p-2">
              <Clock className="w-4 h-4 mr-2" />
              {formatTime(timeLeft)}
            </Badge>
            <Badge className="text-lg p-2 bg-purple-100 text-purple-800">
              {currentQuestion + 1} / {quiz.questions.length}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-3 bg-gray-200" />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl mb-8">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">
                  {question.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {question.options.map((option, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full text-right p-4 rounded-lg border-2 transition-all duration-200 ${
                        selectedAnswer === index
                          ? 'border-purple-500 bg-purple-50 text-purple-900'
                          : 'border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-25'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="flex-1 mr-4">{option}</span>
                        {selectedAnswer === index && (
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                        )}
                      </div>
                    </button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Next Button */}
        <div className="text-center">
          <Button
            onClick={handleNextQuestion}
            disabled={selectedAnswer === null}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-3 text-lg"
          >
            {currentQuestion === quiz.questions.length - 1 ? 'סיים חידון' : 'שאלה הבאה'}
          </Button>
        </div>
      </div>
    </div>
  );
}