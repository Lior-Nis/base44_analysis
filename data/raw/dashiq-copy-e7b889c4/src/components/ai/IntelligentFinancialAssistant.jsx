import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { 
  BrainCircuit, 
  Send, 
  Loader2, 
  X, 
  ThumbsUp, 
  ThumbsDown,
  TrendingUp,
  Calculator,
  AlertTriangle,
  Lightbulb,
  BarChart3,
  PieChart,
  Target,
  Clock,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { Transaction, Category, Budget } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { t, formatCurrency, formatDate, isRTL } from '@/components/utils/i18n';
import { useUserPreferences } from '@/components/utils/UserPreferencesContext';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  parseISO, 
  isWithinInterval 
} from 'date-fns';

const IntelligentFinancialAssistant = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  
  const messagesEndRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const { toast } = useToast();
  const { preferences } = useUserPreferences();
  const isRTLLayout = isRTL();

  // Improved quick action templates with specific, useful queries
  const quickActions = [
    {
      icon: TrendingUp,
      title: isRTLLayout ? "השוואה חודשית" : "Monthly Comparison",
      query: isRTLLayout 
        ? "השווה את ההוצאות שלי החודש לעומת החודש שעבר. באילו קטגוריות הוצאתי יותר?"
        : "Compare my expenses this month vs last month. Which categories increased?"
    },
    {
      icon: Target,
      title: isRTLLayout ? "סטטוס תקציב" : "Budget Status",
      query: isRTLLayout 
        ? "איך אני עומד בתקציב החודשי? באילו קטגוריות אני חורג?"
        : "How am I doing with my monthly budget? Which categories am I overspending?"
    },
    {
      icon: PieChart,
      title: isRTLLayout ? "הוצאות מובילות" : "Top Expenses",
      query: isRTLLayout 
        ? "מהן 5 ההוצאות הגדולות שלי החודש? איך אוכל לחסוך?"
        : "What are my top 5 expenses this month? How can I save money?"
    },
    {
      icon: BarChart3,
      title: isRTLLayout ? "ניתוח מגמות" : "Spending Trends",
      query: isRTLLayout 
        ? "איך השתנו ההוצאות שלי ב-3 החודשים האחרונים?"
        : "How have my spending patterns changed over the last 3 months?"
    }
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = () => {
    setMessages([{
      id: Date.now(),
      type: 'assistant',
      content: isRTLLayout 
        ? "שלום! אני העוזר הפיננסי החכם שלך. אני יכול לעזור לך לנתח את ההוצאות, לעקוב אחר התקציב ולקבל תובנות על המצב הכספי שלך. במה אוכל לעזור?"
        : "Hello! I'm your smart financial assistant. I can help you analyze expenses, track budgets, and get insights about your financial situation. How can I help you today?",
      timestamp: new Date(),
      isSystem: true
    }]);
    setShowQuickActions(true);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInputValue('');
    setIsLoading(false);
    initializeChat();
    
    toast({
      title: isRTLLayout ? "הצ'אט נוקה" : "Chat Cleared",
      description: isRTLLayout ? "התחלנו שיחה חדשה" : "Started a new conversation",
    });
  };

  const getFinancialContext = async () => {
    try {
      const [transactions, categories, budgets] = await Promise.all([
        Transaction.list('-date', 200),
        Category.list(),
        Budget.list()
      ]);

      // Current month data
      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);
      
      const currentMonthTransactions = transactions.filter(t => 
        isWithinInterval(parseISO(t.date), { start: currentMonthStart, end: currentMonthEnd })
      );

      // Previous month data
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));
      
      const lastMonthTransactions = transactions.filter(t => 
        isWithinInterval(parseISO(t.date), { start: lastMonthStart, end: lastMonthEnd })
      );

      // Calculate totals
      const currentMonthExpenses = currentMonthTransactions
        .filter(t => !t.is_income)
        .reduce((sum, t) => sum + t.billing_amount, 0);

      const lastMonthExpenses = lastMonthTransactions
        .filter(t => !t.is_income)
        .reduce((sum, t) => sum + t.billing_amount, 0);

      const currentMonthIncome = currentMonthTransactions
        .filter(t => t.is_income)
        .reduce((sum, t) => sum + t.billing_amount, 0);

      // Category breakdown
      const categorySpending = {};
      currentMonthTransactions.filter(t => !t.is_income).forEach(t => {
        const category = categories.find(c => c.id === t.category_id);
        const categoryName = category ? category.name : (isRTLLayout ? 'לא מסווג' : 'Uncategorized');
        categorySpending[categoryName] = (categorySpending[categoryName] || 0) + t.billing_amount;
      });

      // Budget analysis
      const budgetAnalysis = budgets.map(budget => {
        const category = categories.find(c => c.id === budget.category_id);
        const spent = categorySpending[category?.name] || 0;
        return {
          category: category?.name || (isRTLLayout ? 'לא ידוע' : 'Unknown'),
          budgeted: budget.amount,
          spent: spent,
          remaining: budget.amount - spent,
          percentage: budget.amount > 0 ? (spent / budget.amount) * 100 : 0
        };
      });

      return {
        currentMonthExpenses,
        lastMonthExpenses,
        currentMonthIncome,
        categorySpending,
        budgetAnalysis,
        totalTransactions: transactions.length,
        categoriesCount: categories.length,
        currency: preferences?.displayCurrency || 'ILS'
      };
    } catch (error) {
      console.error('Error getting financial context:', error);
      return null;
    }
  };

  const formatAIResponse = (response) => {
    // Clean up AI response - remove excessive markdown and formatting
    return response
      .replace(/\*\*\*/g, '') // Remove triple asterisks
      .replace(/\*\*/g, '') // Remove double asterisks  
      .replace(/###\s*/g, '') // Remove markdown headers
      .replace(/##\s*/g, '')
      .replace(/#\s*/g, '')
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
      .trim();
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setShowQuickActions(false);

    try {
      // Get financial context
      const financialContext = await getFinancialContext();
      
      let contextPrompt = isRTLLayout 
        ? `אתה עוזר פיננסי מועיל. ענה על שאלת המשתמש בנוגע למצבו הפיננסי האישי. תן תשובות קצרות, ברורות ומעשיות בעברית.`
        : `You are a helpful financial assistant. Answer the user's question about their personal finances. Give concise, clear, and practical responses in English.`;
      
      if (financialContext) {
        const currency = financialContext.currency;
        const expenseChange = financialContext.currentMonthExpenses - financialContext.lastMonthExpenses;
        const changeText = expenseChange > 0 
          ? (isRTLLayout ? `עלייה של ${formatCurrency(expenseChange, currency)}` : `increase of ${formatCurrency(expenseChange, currency)}`)
          : (isRTLLayout ? `ירידה של ${formatCurrency(Math.abs(expenseChange), currency)}` : `decrease of ${formatCurrency(Math.abs(expenseChange), currency)}`);

        contextPrompt += isRTLLayout ? `

נתונים פיננסיים:
- הוצאות החודש: ${formatCurrency(financialContext.currentMonthExpenses, currency)}
- הוצאות חודש שעבר: ${formatCurrency(financialContext.lastMonthExpenses, currency)} (${changeText})
- הכנסות החודש: ${formatCurrency(financialContext.currentMonthIncome, currency)}
- סך עסקאות: ${financialContext.totalTransactions}

הוצאות לפי קטגוריות:
${Object.entries(financialContext.categorySpending)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 5)
  .map(([category, amount]) => `- ${category}: ${formatCurrency(amount, currency)}`)
  .join('\n')}

מצב תקציב:
${financialContext.budgetAnalysis
  .filter(b => b.budgeted > 0)
  .slice(0, 3)
  .map(b => `- ${b.category}: הוצא ${formatCurrency(b.spent, currency)} מתוך ${formatCurrency(b.budgeted, currency)} (${Math.round(b.percentage)}%)`)
  .join('\n')}

תן תובנות ספציפיות ומעשיות על בסיס הנתונים האלו.` : `

Financial Data:
- Current month expenses: ${formatCurrency(financialContext.currentMonthExpenses, currency)}
- Last month expenses: ${formatCurrency(financialContext.lastMonthExpenses, currency)} (${changeText})
- Current month income: ${formatCurrency(financialContext.currentMonthIncome, currency)}
- Total transactions: ${financialContext.totalTransactions}

Top Category Spending:
${Object.entries(financialContext.categorySpending)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 5)
  .map(([category, amount]) => `- ${category}: ${formatCurrency(amount, currency)}`)
  .join('\n')}

Budget Status:
${financialContext.budgetAnalysis
  .filter(b => b.budgeted > 0)
  .slice(0, 3)
  .map(b => `- ${b.category}: Spent ${formatCurrency(b.spent, currency)} of ${formatCurrency(b.budgeted, currency)} (${Math.round(b.percentage)}%)`)
  .join('\n')}

Provide specific, actionable insights based on this data.`;
      }

      const response = await InvokeLLM({
        prompt: `${contextPrompt}

${isRTLLayout ? 'שאלת המשתמש' : 'User Question'}: ${userMessage.content}

${isRTLLayout 
  ? 'תן תשובה קצרה ומעשית (עד 150 מילים). הימנע מעיצוב מרקדאון מיותר.'
  : 'Give a concise, practical response (max 150 words). Avoid excessive markdown formatting.'
}`,
        add_context_from_internet: false
      });

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: formatAIResponse(response),
        timestamp: new Date(),
        hasContext: !!financialContext
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: isRTLLayout 
          ? 'מצטער, אירעה שגיאה. אנא נסה שוב.'
          : 'Sorry, an error occurred. Please try again.',
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: t('common.error'),
        description: isRTLLayout ? 'שגיאה בעיבוד השאלה' : 'Error processing question',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    setInputValue(action.query);
    setShowQuickActions(false);
  };

  const handleFeedback = (messageId, feedback) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId 
        ? { ...m, userFeedback: feedback }
        : m
    ));

    toast({
      title: isRTLLayout ? "תודה על המשוב!" : "Thanks for feedback!",
      description: feedback === 'positive' 
        ? (isRTLLayout ? "שמחנו שעזרנו!" : "We're glad we helped!")
        : (isRTLLayout ? "נשפר בפעם הבאה" : "We'll improve next time"),
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card 
        className="w-full max-w-3xl h-[650px] flex flex-col shadow-xl border-0 overflow-hidden"
        dir={isRTLLayout ? 'rtl' : 'ltr'}
      >
        {/* Fixed Header with Controls */}
        <CardHeader className="pb-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-b-0 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xl">{isRTLLayout ? 'עוזר AI פיננסי' : 'Financial AI Assistant'}</div>
                <div className="text-sm opacity-90 font-normal">
                  {isRTLLayout ? 'ניתוח חכם של הנתונים הפיננסיים שלך' : 'Smart analysis of your financial data'}
                </div>
              </div>
            </CardTitle>
            
            {/* Control Buttons */}
            <div className="flex items-center gap-2">
              {/* Scroll to Top Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={scrollToTop}
                className="text-white hover:bg-white/20 p-2"
                title={isRTLLayout ? "גלול למעלה" : "Scroll to Top"}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              
              {/* Clear Chat Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="text-white hover:bg-white/20 p-2"
                title={isRTLLayout ? "נקה צ'אט" : "Clear Chat"}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 p-2"
                title={isRTLLayout ? "סגור" : "Close"}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Scrollable Messages Area */}
        <CardContent className="flex-1 p-0 flex flex-col bg-gray-50 overflow-hidden">
          <ScrollArea 
            ref={scrollAreaRef}
            className="flex-1 p-6"
            style={{ maxHeight: 'calc(100% - 80px)' }}
          >
            <div className="space-y-6 min-h-full">
              {/* Quick Actions */}
              {showQuickActions && messages.length <= 1 && (
                <div className="space-y-4 sticky top-0 bg-gray-50 z-10 pb-4">
                  <div className="text-sm font-semibold text-gray-700 px-1">
                    {isRTLLayout ? 'שאלות מומלצות:' : 'Suggested Questions:'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => handleQuickAction(action)}
                        className="justify-start h-auto p-4 text-left hover:bg-blue-50 hover:border-blue-300 border-gray-200 bg-white"
                      >
                        <div className={`flex items-center gap-3 w-full ${isRTLLayout ? 'flex-row-reverse text-right' : ''}`}>
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <action.icon className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{action.title}</div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-3">
                    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white shadow-md'
                          : message.isError
                          ? 'bg-red-50 border border-red-200 text-red-700'
                          : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                      }`}>
                        <div className="whitespace-pre-wrap leading-relaxed text-sm break-words">
                          {message.content}
                        </div>
                        
                        {/* Context indicator */}
                        {message.hasContext && !message.isSystem && (
                          <div className="mt-3 pt-2 border-t border-gray-100">
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                              {isRTLLayout ? 'מבוסס על הנתונים שלך' : 'Based on your data'}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Feedback buttons for assistant messages */}
                    {message.type === 'assistant' && !message.isSystem && !message.isError && (
                      <div className={`flex items-center gap-2 ${isRTLLayout ? 'justify-end mr-4' : 'justify-start ml-4'}`}>
                        <div className="text-xs text-gray-500">
                          {isRTLLayout ? 'האם זה עזר?' : 'Was this helpful?'}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFeedback(message.id, 'positive')}
                          className={`h-7 w-7 p-0 ${
                            message.userFeedback === 'positive' ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-green-600'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFeedback(message.id, 'negative')}
                          className={`h-7 w-7 p-0 ${
                            message.userFeedback === 'negative' ? 'text-red-600 bg-red-50' : 'text-gray-400 hover:text-red-600'
                          }`}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600">
                        {isRTLLayout ? 'מנתח...' : 'Analyzing...'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Fixed Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
            <div className="flex gap-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isRTLLayout 
                  ? "שאל אותי על המצב הפיננסי שלך..."
                  : "Ask me about your financial situation..."
                }
                disabled={isLoading}
                className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 px-6"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntelligentFinancialAssistant;