import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Lightbulb, 
  BookOpen,
  Award,
  Zap,
  BarChart3,
  Eye,
  RefreshCw
} from 'lucide-react';
import { getCurrentLanguage } from '@/components/utils/i18n';

// Advanced Learning Engine for Financial Insights
export default function LearningEngine({ 
  conversationHistory = [], 
  financialData = {}, 
  onInsightGenerated,
  onLearningUpdate 
}) {
  const [learningMetrics, setLearningMetrics] = useState({
    totalQueries: 0,
    categoryExpertise: {},
    insightAccuracy: 0,
    userSatisfaction: 0,
    adaptationLevel: 0
  });
  
  const [generatedInsights, setGeneratedInsights] = useState([]);
  const [isLearning, setIsLearning] = useState(false);
  const currentLanguage = getCurrentLanguage();

  // Learning Categories
  const learningCategories = {
    spending_patterns: {
      he: 'דפוסי הוצאה',
      en: 'Spending Patterns',
      icon: <BarChart3 className="w-4 h-4" />,
      complexity: 'intermediate'
    },
    budget_optimization: {
      he: 'אופטימיזציה תקציבית',
      en: 'Budget Optimization',
      icon: <Target className="w-4 h-4" />,
      complexity: 'advanced'
    },
    trend_analysis: {
      he: 'ניתוח מגמות',
      en: 'Trend Analysis',
      icon: <TrendingUp className="w-4 h-4" />,
      complexity: 'advanced'
    },
    behavioral_insights: {
      he: 'תובנות התנהגותיות',
      en: 'Behavioral Insights',
      icon: <Brain className="w-4 h-4" />,
      complexity: 'expert'
    },
    risk_assessment: {
      he: 'הערכת סיכונים',
      en: 'Risk Assessment',
      icon: <Eye className="w-4 h-4" />,
      complexity: 'expert'
    }
  };

  useEffect(() => {
    analyzeConversationHistory();
  }, [conversationHistory]);

  useEffect(() => {
    if (financialData && Object.keys(financialData).length > 0) {
      generateProactiveInsights();
    }
  }, [financialData]);

  // Analyze conversation history to improve learning
  const analyzeConversationHistory = () => {
    if (conversationHistory.length === 0) return;

    setIsLearning(true);
    
    const categoryExpertise = {};
    let totalAccuracy = 0;
    
    conversationHistory.forEach(conversation => {
      const { queryType, userFeedback } = conversation;
      
      // Track expertise in different categories
      if (queryType) {
        categoryExpertise[queryType] = (categoryExpertise[queryType] || 0) + 1;
      }
      
      // Calculate accuracy based on user feedback
      if (userFeedback) {
        totalAccuracy += userFeedback.helpfulness || 0;
      }
    });

    // Calculate adaptation level based on conversation complexity
    const adaptationLevel = calculateAdaptationLevel(conversationHistory);
    
    setLearningMetrics({
      totalQueries: conversationHistory.length,
      categoryExpertise,
      insightAccuracy: conversationHistory.length > 0 ? totalAccuracy / conversationHistory.length : 0,
      userSatisfaction: calculateUserSatisfaction(conversationHistory),
      adaptationLevel
    });

    setIsLearning(false);
  };

  // Calculate how well the AI adapts to user patterns
  const calculateAdaptationLevel = (history) => {
    if (history.length < 3) return 0;
    
    let adaptationScore = 0;
    const recentQueries = history.slice(-5);
    
    // Check for pattern recognition
    const queryTypes = recentQueries.map(q => q.queryType);
    const uniqueTypes = new Set(queryTypes);
    
    if (uniqueTypes.size > 1) {
      adaptationScore += 20; // Diversity bonus
    }
    
    // Check for follow-up questions (indicates engagement)
    let followUpChain = 0;
    for (let i = 1; i < recentQueries.length; i++) {
      if (recentQueries[i].query.includes('המשך') || 
          recentQueries[i].query.includes('follow') ||
          recentQueries[i].timestamp - recentQueries[i-1].timestamp < 120000) { // Within 2 minutes
        followUpChain++;
      }
    }
    
    adaptationScore += Math.min(followUpChain * 15, 60);
    
    // Check for increasing complexity
    const complexityProgression = checkComplexityProgression(recentQueries);
    adaptationScore += complexityProgression;
    
    return Math.min(adaptationScore, 100);
  };

  // Check if user questions are becoming more sophisticated
  const checkComplexityProgression = (queries) => {
    const complexityScores = queries.map(q => {
      const query = q.query.toLowerCase();
      let score = 0;
      
      // Multi-dimensional questions
      if (query.includes('השווה') || query.includes('compare')) score += 10;
      if (query.includes('מגמה') || query.includes('trend')) score += 15;
      if (query.includes('חזוי') || query.includes('forecast')) score += 20;
      if (query.includes('אופטימיזציה') || query.includes('optimize')) score += 25;
      
      return score;
    });
    
    // Check if complexity is generally increasing
    const firstHalf = complexityScores.slice(0, Math.floor(complexityScores.length / 2));
    const secondHalf = complexityScores.slice(Math.floor(complexityScores.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
    
    return secondAvg > firstAvg ? 20 : 0;
  };

  // Calculate user satisfaction from conversation patterns
  const calculateUserSatisfaction = (history) => {
    if (history.length === 0) return 0;
    
    let satisfactionScore = 0;
    
    history.forEach(conversation => {
      // Long conversations indicate engagement
      if (conversation.query.length > 50) satisfactionScore += 5;
      
      // Follow-up questions indicate satisfaction with previous answers
      if (conversation.query.includes('ועוד') || conversation.query.includes('also')) {
        satisfactionScore += 10;
      }
      
      // Specific feedback
      if (conversation.userFeedback) {
        satisfactionScore += conversation.userFeedback.helpfulness * 2;
      }
    });
    
    return Math.min(satisfactionScore / history.length, 100);
  };

  // Generate proactive insights based on financial data patterns
  const generateProactiveInsights = () => {
    const insights = [];
    
    // Spending pattern insights
    if (financialData.spendingPatterns) {
      const seasonalInsight = analyzeSeasonalSpending(financialData.spendingPatterns);
      if (seasonalInsight) insights.push(seasonalInsight);
      
      const weeklyInsight = analyzeWeeklyPatterns(financialData.spendingPatterns);
      if (weeklyInsight) insights.push(weeklyInsight);
    }
    
    // Budget optimization insights
    if (financialData.budgetStatus) {
      const budgetInsight = analyzeBudgetOptimization(financialData.budgetStatus);
      if (budgetInsight) insights.push(budgetInsight);
    }
    
    // Trend analysis insights
    if (financialData.trendAnalysis) {
      const trendInsight = analyzeTrendOpportunities(financialData.trendAnalysis);
      if (trendInsight) insights.push(trendInsight);
    }
    
    setGeneratedInsights(insights);
    
    // Notify parent component
    if (onInsightGenerated && insights.length > 0) {
      onInsightGenerated(insights);
    }
  };

  // Analyze seasonal spending patterns
  const analyzeSeasonalSpending = (patterns) => {
    if (!patterns.seasonality) return null;
    
    const seasons = Object.entries(patterns.seasonality);
    const maxSeason = seasons.reduce((max, current) => 
      current[1] > max[1] ? current : max
    );
    
    return {
      type: 'seasonal_pattern',
      category: 'spending_patterns',
      title: currentLanguage === 'he' ? 'דפוס הוצאה עונתי' : 'Seasonal Spending Pattern',
      insight: currentLanguage === 'he' 
        ? `אתה מוציא הכי הרבה ב${maxSeason[0]} - כדאי לתכנן תקציב מיוחד לעונה זו`
        : `You spend most during ${maxSeason[0]} - consider planning a special budget for this season`,
      confidence: 0.8,
      actionable: true
    };
  };

  // Analyze weekly spending patterns
  const analyzeWeeklyPatterns = (patterns) => {
    if (!patterns.byDayOfWeek) return null;
    
    const days = Object.entries(patterns.byDayOfWeek);
    const maxDay = days.reduce((max, current) => 
      current[1] > max[1] ? current : max
    );
    
    const isWeekend = maxDay[0] === 'Saturday' || maxDay[0] === 'Sunday';
    
    return {
      type: 'weekly_pattern',
      category: 'behavioral_insights',
      title: currentLanguage === 'he' ? 'דפוס הוצאה שבועי' : 'Weekly Spending Pattern',
      insight: currentLanguage === 'he' 
        ? `ההוצאות הגבוהות ביותר שלך ב${maxDay[0]}${isWeekend ? ' - זה נורמלי לסוף שבוע' : ' - שקול לתכנן את הרכישות שלך'}`
        : `Your highest spending is on ${maxDay[0]}${isWeekend ? ' - this is normal for weekends' : ' - consider planning your purchases'}`,
      confidence: 0.7,
      actionable: !isWeekend
    };
  };

  // Analyze budget optimization opportunities
  const analyzeBudgetOptimization = (budgetStatus) => {
    const overBudgetCategories = budgetStatus.filter(b => b.status === 'over');
    
    if (overBudgetCategories.length === 0) return null;
    
    const worstCategory = overBudgetCategories.reduce((worst, current) => 
      current.percentage > worst.percentage ? current : worst
    );
    
    return {
      type: 'budget_optimization',
      category: 'budget_optimization',
      title: currentLanguage === 'he' ? 'הזדמנות לאופטימיזציה' : 'Optimization Opportunity',
      insight: currentLanguage === 'he' 
        ? `קטגוריית ${worstCategory.categoryName} חורגת ב-${worstCategory.percentage - 100}% - זה התחום העיקרי לחיסכון`
        : `${worstCategory.categoryName} category exceeds by ${worstCategory.percentage - 100}% - this is your main saving opportunity`,
      confidence: 0.9,
      actionable: true,
      suggestedAction: currentLanguage === 'he' 
        ? `נסה להפחית ב-${Math.ceil((worstCategory.percentage - 100) / 2)}% כתחילה`
        : `Try reducing by ${Math.ceil((worstCategory.percentage - 100) / 2)}% initially`
    };
  };

  // Analyze trend opportunities
  const analyzeTrendOpportunities = (trendData) => {
    if (!trendData.monthly) return null;
    
    const monthlyData = Object.entries(trendData.monthly);
    if (monthlyData.length < 3) return null;
    
    const recentTrend = monthlyData.slice(-3);
    const isIncreasing = recentTrend.every((month, index) => 
      index === 0 || month[1] > recentTrend[index - 1][1]
    );
    
    if (isIncreasing) {
      return {
        type: 'trend_alert',
        category: 'trend_analysis',
        title: currentLanguage === 'he' ? 'מגמת עלייה בהוצאות' : 'Rising Spending Trend',
        insight: currentLanguage === 'he' 
          ? 'ההוצאות שלך עולות בחודשים האחרונים - כדאי לבדוק מה הסיבה'
          : 'Your spending has been rising in recent months - worth investigating the cause',
        confidence: 0.8,
        actionable: true,
        urgency: 'medium'
      };
    }
    
    return null;
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Brain className="w-5 h-5" />
          {currentLanguage === 'he' ? 'מנוע למידה AI' : 'AI Learning Engine'}
          {isLearning && <RefreshCw className="w-4 h-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Learning Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{learningMetrics.totalQueries}</div>
            <div className="text-xs text-gray-600">
              {currentLanguage === 'he' ? 'שאלות' : 'Queries'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(learningMetrics.insightAccuracy)}%
            </div>
            <div className="text-xs text-gray-600">
              {currentLanguage === 'he' ? 'דיוק' : 'Accuracy'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(learningMetrics.userSatisfaction)}%
            </div>
            <div className="text-xs text-gray-600">
              {currentLanguage === 'he' ? 'שביעות רצון' : 'Satisfaction'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(learningMetrics.adaptationLevel)}%
            </div>
            <div className="text-xs text-gray-600">
              {currentLanguage === 'he' ? 'הסתגלות' : 'Adaptation'}
            </div>
          </div>
        </div>

        {/* Category Expertise */}
        <div>
          <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4" />
            {currentLanguage === 'he' ? 'מומחיות בתחומים' : 'Domain Expertise'}
          </h4>
          <div className="grid gap-2">
            {Object.entries(learningCategories).map(([key, category]) => {
              const expertise = learningMetrics.categoryExpertise[key] || 0;
              const maxExpertise = Math.max(...Object.values(learningMetrics.categoryExpertise), 1);
              const progress = (expertise / maxExpertise) * 100;
              
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 min-w-[120px]">
                    {category.icon}
                    <span className="text-sm font-medium">{category[currentLanguage]}</span>
                  </div>
                  <div className="flex-1">
                    <Progress value={progress} className="h-2" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {expertise}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* Generated Insights */}
        {generatedInsights.length > 0 && (
          <div>
            <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              {currentLanguage === 'he' ? 'תובנות שנוצרו' : 'Generated Insights'}
            </h4>
            <div className="space-y-3">
              {generatedInsights.slice(0, 3).map((insight, index) => (
                <div key={index} className="bg-white/80 rounded-lg p-3 border border-purple-200/50">
                  <div className="flex items-start gap-3">
                    <div className="p-1 bg-purple-100 rounded">
                      {learningCategories[insight.category]?.icon || <Zap className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-purple-800 text-sm">
                        {insight.title}
                      </div>
                      <div className="text-gray-700 text-sm mt-1">
                        {insight.insight}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {currentLanguage === 'he' ? 'ביטחון' : 'Confidence'}: {Math.round(insight.confidence * 100)}%
                        </Badge>
                        {insight.actionable && (
                          <Badge className="text-xs bg-green-100 text-green-800">
                            {currentLanguage === 'he' ? 'ניתן ליישום' : 'Actionable'}
                          </Badge>
                        )}
                      </div>
                      {insight.suggestedAction && (
                        <div className="mt-2 text-xs text-blue-600 font-medium">
                          💡 {insight.suggestedAction}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}