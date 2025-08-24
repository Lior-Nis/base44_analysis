import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import FeedbackButtons from './FeedbackButtons';
import { t, isRTL } from '@/components/utils/i18n';

export default function InsightCard({ insight, isLoading, onFeedback }) {
  const isRTLLayout = isRTL();

  const roundNumbersInString = (text) => {
    if (typeof text !== 'string' || !text) return text;

    // This regex looks for numbers (with optional commas/decimals) that might be preceded by a currency symbol
    // It is designed to be flexible.
    const currencyAndNumberRegex = /(?:[₪$€£¥₹]\s*)?([\d,]+(?:\.\d{1,2})?)/g;
    const percentageRegex = /([\d,]+(?:\.\d+)?)\s*%/g;

    let processedText = text.replace(currencyAndNumberRegex, (match, numberStr) => {
      if (!numberStr) return match;

      const currencySymbol = match.replace(numberStr, '').trim();
      const number = parseFloat(numberStr.replace(/,/g, ''));
      if (isNaN(number)) return match;
      
      // Format to whole number and prepend currency symbol
      return `${currencySymbol}${new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(number)}`;
    });
    
    processedText = processedText.replace(percentageRegex, (match, numberStr) => {
        const number = parseFloat(numberStr.replace(/,/g, ''));
        if (isNaN(number)) return match;
        return `${Math.round(number)}%`;
    });
    
    return processedText;
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-50 border-gray-200 animate-pulse">
        <CardContent className="p-4 text-center">
          <Lightbulb className="w-8 h-8 text-gray-500 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">{t('insights.card.loadingInsight')}</p>
        </CardContent>
      </Card>
    );
  }

  if (!insight) {
    return null;
  }
  
  const { title, description, recommendation, urgency, type, potential_impact } = insight;

  const urgencyStyles = {
    high: {
      bg: 'border-red-200',
      text: 'text-red-700',
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />
    },
    medium: {
      bg: 'border-yellow-200',
      text: 'text-yellow-700',
      icon: <TrendingUp className="w-5 h-5 text-yellow-500" />
    },
    low: {
      bg: 'border-green-200',
      text: 'text-green-700',
      icon: <CheckCircle className="w-5 h-5 text-green-500" />
    }
  };

  const currentUrgency = urgencyStyles[urgency?.toLowerCase()] || urgencyStyles.low;

  return (
    <Card 
      className={`overflow-hidden border-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 
                 ${currentUrgency.bg} bg-gradient-to-br from-white to-gray-50`}
      dir={isRTLLayout ? 'rtl' : 'ltr'}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`p-3 rounded-xl bg-gray-100 shadow-md flex-shrink-0`}>
              {currentUrgency.icon}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-bold text-gray-900 leading-tight mb-2">
                {title || t('insights.card.noTitle')}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant="secondary" 
                  className={`capitalize text-xs font-medium border border-opacity-50 
                             ${type === 'spending' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                               type === 'budget' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                               type === 'trend' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                               type === 'general' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                               'bg-gray-100 text-gray-800 border-gray-200'}`}>
                  {t(`insights.types.${type?.toLowerCase()}`)}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`capitalize text-xs font-medium border border-opacity-50 
                             ${currentUrgency.text} bg-white bg-opacity-50`}>
                  {t(`insights.urgency.${urgency?.toLowerCase()}`)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div>
            <p className="text-gray-700 leading-relaxed">
              {roundNumbersInString(description) || t('insights.card.noDescription')}
            </p>
          </div>
        
          <div className="mt-4 pt-4 border-t border-gray-200">
            {recommendation && (
              <div className="bg-white/70 rounded-lg p-4 border border-gray-200 mb-3">
                <div className="flex items-start gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {t('insights.card.recommendation')}
                  </h4>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {roundNumbersInString(recommendation)}
                </p>
              </div>
            )}
            {potential_impact && (
              <div className="bg-blue-50/70 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <h4 className="font-semibold text-blue-900 text-sm">
                    {t('insights.card.potentialImpact')}
                  </h4>
                </div>
                <p className="text-blue-800 text-sm leading-relaxed">
                  {roundNumbersInString(potential_impact)}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-white/50 px-6 py-3 flex flex-col items-start border-t border-gray-100">
        <div className="flex justify-start items-center w-full">
          <FeedbackButtons onFeedback={onFeedback} insightId={insight.id} />
        </div>
      </CardFooter>
    </Card>
  );
}