import React, { useState, useEffect } from 'react';
import { Question, QuizAttempt } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Brain, BarChart, Trash2 } from 'lucide-react';

export default function QuizManager() {
  const [questions, setQuestions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    options: ['', '', '', ''],
    correct_answer: '',
    category: 'General Knowledge',
    difficulty: 'medium'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const questionsData = await Question.list('-created_date');
      const attemptsData = await QuizAttempt.list('-created_date', 50);
      setQuestions(questionsData);
      setAttempts(attemptsData);
    } catch (error) {
      console.error("Error loading quiz data:", error);
    }
  };

  const handleCreateQuestion = async () => {
    if (!newQuestion.question_text || !newQuestion.correct_answer) {
      alert("Please fill in the question and correct answer");
      return;
    }

    if (newQuestion.options.some(opt => !opt.trim())) {
      alert("Please fill in all options");
      return;
    }

    if (!newQuestion.options.includes(newQuestion.correct_answer)) {
      alert("Correct answer must be one of the options");
      return;
    }

    try {
      await Question.create(newQuestion);
      alert("Question created successfully!");
      setNewQuestion({
        question_text: '',
        options: ['', '', '', ''],
        correct_answer: '',
        category: 'General Knowledge',
        difficulty: 'medium'
      });
      setIsCreating(false);
      loadData();
    } catch (error) {
      console.error("Error creating question:", error);
      alert("Error creating question");
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (confirm("Are you sure you want to delete this question?")) {
      try {
        await Question.delete(questionId);
        loadData();
        alert("Question deleted successfully!");
      } catch (error) {
        console.error("Error deleting question:", error);
        alert("Error deleting question");
      }
    }
  };

  const categories = ['General Knowledge', 'Sports', 'Science', 'Geography', 'History', 'Entertainment', 'Math'];

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-400" />
              Quiz Game Management
            </CardTitle>
            <Button onClick={() => setIsCreating(!isCreating)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="questions">
            <TabsList className="grid w-full grid-cols-3 bg-slate-700">
              <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="attempts">Recent Attempts</TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="space-y-6">
              {isCreating && (
                <Card className="bg-slate-700/50 border-slate-600/50">
                  <CardHeader>
                    <CardTitle className="text-white">Create New Question</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-white">Question</Label>
                      <Input
                        value={newQuestion.question_text}
                        onChange={(e) => setNewQuestion({...newQuestion, question_text: e.target.value})}
                        placeholder="Enter your question..."
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {newQuestion.options.map((option, index) => (
                        <div key={index}>
                          <Label className="text-white">Option {index + 1}</Label>
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...newQuestion.options];
                              newOptions[index] = e.target.value;
                              setNewQuestion({...newQuestion, options: newOptions});
                            }}
                            placeholder={`Option ${index + 1}...`}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-white">Correct Answer</Label>
                        <Select value={newQuestion.correct_answer} onValueChange={(value) => setNewQuestion({...newQuestion, correct_answer: value})}>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Select correct answer" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 text-white">
                            {newQuestion.options.filter(opt => opt.trim()).map((option, index) => (
                              <SelectItem key={index} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-white">Category</Label>
                        <Select value={newQuestion.category} onValueChange={(value) => setNewQuestion({...newQuestion, category: value})}>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 text-white">
                            {categories.map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-white">Difficulty</Label>
                        <Select value={newQuestion.difficulty} onValueChange={(value) => setNewQuestion({...newQuestion, difficulty: value})}>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 text-white">
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleCreateQuestion} className="bg-green-600 hover:bg-green-700">
                        Create Question
                      </Button>
                      <Button onClick={() => setIsCreating(false)} variant="outline" className="border-slate-500 text-slate-300">
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {questions.map((question) => (
                  <Card key={question.id} className="bg-slate-700/50 border-slate-600/50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-2">{question.question_text}</h3>
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {question.options.map((option, index) => (
                              <div key={index} className={`p-2 rounded text-sm ${option === question.correct_answer ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-slate-800/50 text-gray-300'}`}>
                                {option}
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Badge className="bg-blue-500/20 text-blue-300">{question.category}</Badge>
                            <Badge className={
                              question.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                              question.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-red-500/20 text-red-300'
                            }>
                              {question.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleDeleteQuestion(question.id)}
                          variant="outline"
                          size="icon"
                          className="border-red-500 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="stats">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-700/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-white">{questions.length}</div>
                    <div className="text-gray-400">Total Questions</div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-700/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{attempts.length}</div>
                    <div className="text-gray-400">Quiz Attempts</div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-700/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {attempts.length > 0 ? (attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length).toFixed(1) : 0}%
                    </div>
                    <div className="text-gray-400">Avg Score</div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-700/50">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      ₹{attempts.reduce((sum, a) => sum + a.reward_amount, 0)}
                    </div>
                    <div className="text-gray-400">Total Rewards</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="attempts">
              <Card className="bg-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-white">Recent Quiz Attempts</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-600">
                        <TableHead className="text-white">User</TableHead>
                        <TableHead className="text-white">Score</TableHead>
                        <TableHead className="text-white">Questions</TableHead>
                        <TableHead className="text-white">Reward</TableHead>
                        <TableHead className="text-white">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attempts.map((attempt) => (
                        <TableRow key={attempt.id} className="border-slate-600">
                          <TableCell className="text-gray-300">{attempt.user_id.slice(0, 8)}...</TableCell>
                          <TableCell className="text-white">{attempt.score}%</TableCell>
                          <TableCell className="text-gray-400">{attempt.questions_answered}</TableCell>
                          <TableCell className="text-green-400">₹{attempt.reward_amount}</TableCell>
                          <TableCell className="text-gray-400">
                            {new Date(attempt.created_date).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      {attempts.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-400">No quiz attempts yet.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}