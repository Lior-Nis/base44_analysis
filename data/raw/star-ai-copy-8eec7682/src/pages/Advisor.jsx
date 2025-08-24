import React, { useState, useEffect } from 'react';
import { Message } from '@/api/entities';
import { UserSession } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { User } from '@/api/entities';
import ChatInput from '../components/advisor/ChatInput';
import ChatMessage from '../components/advisor/ChatMessage';
import PromptSuggestions from '../components/advisor/PromptSuggestions';
import LawModeSetup from '../components/advisor/LawModeSetup';
import Logo from '../components/ui/Logo';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function AdvisorPage() {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userSession, setUserSession] = useState(null);
    const [showLawModeSetup, setShowLawModeSetup] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [lawMode, setLawMode] = useState(false);

    useEffect(() => {
        initializeSession();
    }, []);

    const initializeSession = async () => {
        try {
            const user = await User.me();
            setIsAuthenticated(true);
            loadMessages();
        } catch (error) {
            // User not authenticated, create anonymous session
            const sessionId = generateSessionId();
            const session = await UserSession.create({ 
                session_id: sessionId,
                usage_count: 0 
            });
            setUserSession(session);
        }
    };

    const generateSessionId = () => {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    };

    const loadMessages = async () => {
        try {
            const history = await Message.list("created_date");
            setMessages(history);
        } catch (error) {
            console.error("Failed to load messages:", error);
        }
    };

    const handleSendMessage = async (userInput, selectedLawMode = false) => {
        const userMessage = { role: 'user', content: userInput };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            if (isAuthenticated) {
                await Message.create(userMessage);
            }

            // Update usage count
            if (userSession) {
                await UserSession.update(userSession.id, {
                    usage_count: (userSession.usage_count || 0) + 1
                });
            }

            const isLawMode = userInput.startsWith('[LAW MODE]') || selectedLawMode;
            const actualInput = isLawMode ? userInput.replace('[LAW MODE] ', '') : userInput;

            // Enhanced prompts with learning patterns
            const baseContext = `Previous conversation history for context:
            ${messages.map(m => `${m.role}: ${m.content}`).join('\n')}`;

            const legalSpeciality = userSession?.legal_speciality || '';
            const usageCount = userSession?.usage_count || 0;

            const prompt = isLawMode ? 
                `You are Star, an expert legal AI assistant specializing in law for lawyers and business professionals. 
                You are helpful, knowledgeable, and always provide accurate legal information.
                
                ${legalSpeciality ? `The user specializes in ${legalSpeciality} law.` : ''}
                ${usageCount > 5 ? 'This user is experienced - provide more detailed and nuanced responses.' : ''}
                
                Provide detailed, accurate legal information, case law references when relevant, and practical legal advice.
                Focus on legal research, case analysis, statutory interpretation, and compliance guidance.
                Always include disclaimers about seeking qualified legal counsel for specific situations.
                
                User's legal question: "${actualInput}"
                
                ${baseContext}` :
                
                `You are Star, an expert business AI assistant for lawyers and business professionals.
                You are helpful, professional, and provide actionable business advice.
                
                ${usageCount > 5 ? 'This user is experienced - provide more strategic and advanced insights.' : ''}
                
                Keep your responses concise, actionable, and professional.
                Focus on practical business strategies, growth, efficiency, and best practices.
                
                User's business question: "${actualInput}"
                
                ${baseContext}`;

            const aiResponse = await InvokeLLM({ prompt });
            
            const assistantMessage = { role: 'assistant', content: aiResponse };
            setMessages([...newMessages, assistantMessage]);
            
            if (isAuthenticated) {
                await Message.create(assistantMessage);
            }

        } catch (error) {
            console.error("Error getting AI response:", error);
            const errorMessage = { role: 'assistant', content: "I'm sorry, I encountered an error. Please try again." };
            setMessages([...newMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLawModeSetup = async (speciality) => {
        if (userSession) {
            await UserSession.update(userSession.id, { legal_speciality: speciality });
            setUserSession({ ...userSession, legal_speciality: speciality });
        }
        setShowLawModeSetup(false);
    };

    const handlePromptSelect = (prompt) => {
        handleSendMessage(prompt, lawMode);
    };

    return (
        <div className="flex h-screen bg-slate-100">
            <div className="flex flex-col w-full max-w-3xl mx-auto bg-white shadow-lg">
                <header className="p-4 border-b border-slate-200">
                    <div className="flex items-center gap-4">
                        <Logo />
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">AI Business Advisor</h1>
                            <p className="text-sm text-slate-500">For Lawyers & Business</p>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 space-y-6">
                    {!isAuthenticated && (
                        <Alert className="bg-yellow-50 border-yellow-200">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <AlertDescription className="text-yellow-800">
                                <strong>Free Version:</strong> Your conversations won't be saved. 
                                Consider upgrading to save your chat history and get advanced features.
                            </AlertDescription>
                        </Alert>
                    )}

                    {showLawModeSetup && (
                        <LawModeSetup 
                            onSetup={handleLawModeSetup}
                            onSkip={() => setShowLawModeSetup(false)}
                        />
                    )}

                    {messages.length === 0 && !isLoading && !showLawModeSetup && (
                        <div className="space-y-6">
                            <div className="text-center text-slate-500 mt-8">
                                <img 
                                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/72f2e91e1_B3CACE63-2212-47D8-9A85-A978E4BDF399.png" 
                                    alt="Star AI"
                                    className="w-20 h-20 mx-auto mb-4 rounded-full"
                                />
                                <p className="text-lg font-medium">Hi! This is Star, your personal AI helper 🌟</p>
                                <p className="text-sm">Ask me anything about your business or legal practice.</p>
                            </div>
                            
                            <PromptSuggestions 
                                onSelectPrompt={handlePromptSelect}
                                lawMode={lawMode}
                            />
                        </div>
                    )}
                    
                    {messages.map((msg, index) => (
                        <ChatMessage 
                            key={index} 
                            message={msg} 
                            isFirstMessage={index === 0 && msg.role === 'assistant'}
                        />
                    ))}
                    {isLoading && <ChatMessage message={{ role: 'assistant', content: '' }} isLoading={true} />}
                </main>

                <footer className="p-4 border-t border-slate-200">
                    <ChatInput 
                        onSendMessage={handleSendMessage} 
                        isLoading={isLoading}
                        onLawModeToggle={(enabled) => {
                            setLawMode(enabled);
                            if (enabled && !userSession?.legal_speciality) {
                                setShowLawModeSetup(true);
                            }
                        }}
                        lawMode={lawMode}
                    />
                </footer>
            </div>
        </div>
    );
}