import React, { useState, useEffect } from "react";
import { Suggestion, User } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Bot, User as UserIcon, Shield, Loader2, Check, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

export default function AdminPage() {
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [analyzingId, setAnalyzingId] = useState(null);

    useEffect(() => {
        loadSuggestions();
    }, []);

    const loadSuggestions = async () => {
        setIsLoading(true);
        try {
            const allSuggestions = await Suggestion.list('-created_date');
            setSuggestions(allSuggestions);
        } catch (error) {
            console.error("Error loading suggestions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnalyze = async (suggestion) => {
        setAnalyzingId(suggestion.id);
        try {
            const prompt = `As the lead developer of the 'EcoHustle' app, analyze the following user suggestion. Provide a brief, actionable analysis covering:
1.  **Feasibility**: How difficult is this to implement? (Easy, Medium, Hard)
2.  **Impact**: What is the potential positive impact on user engagement or app growth? (Low, Medium, High)
3.  **Recommendation**: Should we prioritize this? (Yes, No, Consider for later)
4.  **Suggested Implementation Steps**: Briefly outline the technical steps to make this happen.

User Suggestion: "${suggestion.suggestion_text}"
Category: "${suggestion.category}"`;
            
            const analysisResult = await InvokeLLM({ prompt });
            
            await Suggestion.update(suggestion.id, { 
                ai_analysis: analysisResult,
                status: 'under_review'
            });
            await loadSuggestions();
        } catch (error) {
            console.error("Error analyzing suggestion:", error);
        } finally {
            setAnalyzingId(null);
        }
    };

    const handleStatusChange = async (suggestionId, newStatus) => {
        try {
            await Suggestion.update(suggestionId, { status: newStatus });
            await loadSuggestions();
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    if (isLoading && suggestions.length === 0) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Shield className="w-10 h-10 text-emerald-600" />
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600">Manage user suggestions and app data.</p>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">User Suggestions</h2>
                {suggestions.map(suggestion => (
                    <motion.div
                        key={suggestion.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="overflow-hidden">
                            <CardHeader className="flex flex-row items-start justify-between gap-4 bg-gray-50 p-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                                        <CardTitle className="text-lg">{suggestion.category}</CardTitle>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Submitted by <span className="font-medium">{suggestion.created_by}</span> on {format(new Date(suggestion.created_date), 'MMM d, yyyy')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Select 
                                        value={suggestion.status} 
                                        onValueChange={(value) => handleStatusChange(suggestion.id, value)}
                                    >
                                        <SelectTrigger className="w-[180px] bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="new">New</SelectItem>
                                            <SelectItem value="under_review">Under Review</SelectItem>
                                            <SelectItem value="planned">Planned</SelectItem>
                                            <SelectItem value="implemented">Implemented</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <p className="text-gray-800 mb-6">{suggestion.suggestion_text}</p>
                                
                                <AnimatePresence>
                                {suggestion.ai_analysis && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg"
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <Bot className="w-5 h-5 text-emerald-700" />
                                            <h4 className="font-semibold text-emerald-900">AI Analysis</h4>
                                        </div>
                                        <pre className="text-sm text-emerald-800 whitespace-pre-wrap font-sans">{suggestion.ai_analysis}</pre>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </CardContent>
                            <CardFooter className="bg-gray-50 p-4 flex justify-end">
                                <Button 
                                    onClick={() => handleAnalyze(suggestion)}
                                    disabled={analyzingId === suggestion.id}
                                    variant="outline"
                                    className="bg-white"
                                >
                                    {analyzingId === suggestion.id ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Bot className="w-4 h-4 mr-2" />
                                    )}
                                    {suggestion.ai_analysis ? 'Re-Analyze' : 'Analyze with AI'}
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}