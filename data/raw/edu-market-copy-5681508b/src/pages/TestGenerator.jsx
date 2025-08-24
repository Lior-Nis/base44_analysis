import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { InvokeLLM } from '@/api/integrations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Wand2, Loader2, FileText } from 'lucide-react';

export default function TestGenerator() {
    const [topic, setTopic] = useState('');
    const [level, setLevel] = useState('middle_school');
    const [loading, setLoading] = useState(false);
    const [test, setTest] = useState(null);
    const [error, setError] = useState('');

    const generateTest = async () => {
        if (!topic) {
            setError('Please enter a topic.');
            return;
        }
        setError('');
        setLoading(true);
        setTest(null);

        const prompt = `Generate a 5-question multiple-choice test on the topic of "${topic}" for a ${level.replace('_', ' ')} level. Provide four options for each question, with one correct answer. The output must be a JSON object.`;

        try {
            const response = await InvokeLLM({
                prompt: prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        test_title: { type: "string" },
                        questions: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    question_text: { type: "string" },
                                    options: {
                                        type: "array",
                                        items: { type: "string" }
                                    },
                                    correct_answer_index: { type: "number" }
                                },
                                required: ["question_text", "options", "correct_answer_index"]
                            }
                        }
                    },
                    required: ["test_title", "questions"]
                }
            });
            setTest(response);
        } catch (e) {
            console.error(e);
            setError('Failed to generate the test. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                     <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full mb-4">
                        <Bot className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">AI-Powered Test Generator</h1>
                    <p className="text-lg text-slate-600">Instantly create assessments for any topic and level.</p>
                </div>

                <Card className="shadow-xl bg-white/70 backdrop-blur-sm mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-800">
                            <Wand2 className="w-5 h-5 text-purple-600" />
                            Create a New Test
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="topic">Topic</Label>
                            <Input
                                id="topic"
                                placeholder="e.g., Photosynthesis, The American Revolution"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="level">Academic Level</Label>
                            <Select value={level} onValueChange={setLevel}>
                                <SelectTrigger id="level">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="elementary">Elementary School</SelectItem>
                                    <SelectItem value="middle_school">Middle School</SelectItem>
                                    <SelectItem value="high_school">High School</SelectItem>
                                    <SelectItem value="college">College</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={generateTest} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                'Generate Test'
                            )}
                        </Button>
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </CardContent>
                </Card>

                {test && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                <FileText className="w-6 h-6 text-blue-600"/>
                                {test.test_title}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {test.questions.map((q, index) => (
                                    <div key={index} className="p-4 border rounded-lg bg-slate-50">
                                        <p className="font-semibold mb-3">{index + 1}. {q.question_text}</p>
                                        <div className="space-y-2">
                                            {q.options.map((option, i) => (
                                                <div key={i} className={`p-2 rounded text-sm ${i === q.correct_answer_index ? 'bg-green-100 border border-green-300 text-green-800 font-bold' : 'bg-white'}`}>
                                                    {String.fromCharCode(97 + i)}. {option}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
}