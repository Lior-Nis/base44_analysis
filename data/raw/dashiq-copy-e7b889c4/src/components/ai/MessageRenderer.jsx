import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  BarChart3, 
  Copy, 
  Star,
  User,
  Bot,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { formatCurrency, t, getCurrentLanguage } from '@/components/utils/i18n';
import { useToast } from '@/components/ui/use-toast';

const MessageRenderer = ({ message, onCopy }) => {
  const { toast } = useToast();
  const currentLanguage = getCurrentLanguage();
  const isRTL = currentLanguage === 'he';

  // Handle case where message is undefined or null
  if (!message) {
    return null;
  }

  // Default message structure if properties are missing
  const safeMessage = {
    type: message.type || 'assistant',
    content: message.content || '',
    error: message.error || false,
    summary: message.summary || null,
    recommendations: Array.isArray(message.recommendations) ? message.recommendations : [],
    timestamp: message.timestamp || new Date().toISOString(),
    relevantData: message.relevantData || {}
  };

  const handleCopy = () => {
    if (safeMessage.content) {
      navigator.clipboard.writeText(safeMessage.content);
      if (onCopy) onCopy();
      toast({
        title: t('common.success'),
        description: t('aiAssistant.copyMessage'),
      });
    }
  };

  const formatMessageContent = (content) => {
    if (!content || typeof content !== 'string') return '';
    
    // Split by double newlines to create paragraphs
    const paragraphs = content.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Check if paragraph contains list items
      if (paragraph.includes('\n') && (paragraph.includes('•') || paragraph.includes('1.') || paragraph.includes('📊') || paragraph.includes('💰'))) {
        const lines = paragraph.split('\n');
        const title = lines[0];
        const items = lines.slice(1).filter(line => line.trim());
        
        return (
          <div key={index} className="mb-4">
            {title && (
              <div className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                {title.includes('📊') && <BarChart3 className="w-4 h-4 text-blue-500" />}
                {title.includes('💰') && <DollarSign className="w-4 h-4 text-green-500" />}
                {title.includes('📈') && <TrendingUp className="w-4 h-4 text-green-500" />}
                {title.includes('📉') && <TrendingDown className="w-4 h-4 text-red-500" />}
                {title.includes('⏰') && <Calendar className="w-4 h-4 text-purple-500" />}
                <span>{title.replace(/[📊💰📈📉⏰🏪📤📥➡️📅⏱️❌]/g, '').trim()}</span>
              </div>
            )}
            <div className="space-y-1">
              {items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-start gap-2 text-gray-700">
                  {item.match(/^\d+\./) ? (
                    <span className="text-sm font-medium text-blue-600 min-w-[20px]">
                      {item.match(/^\d+\./)[0]}
                    </span>
                  ) : item.startsWith('•') ? (
                    <span className="text-blue-500 mt-1">•</span>
                  ) : null}
                  <span className="flex-1">
                    {item.replace(/^\d+\.\s*|^•\s*/, '').trim()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      } else {
        // Regular paragraph
        return (
          <div key={index} className="mb-3">
            <p className="text-gray-700 leading-relaxed">
              {paragraph.trim()}
            </p>
          </div>
        );
      }
    });
  };

  // Helper function to safely render data objects
  const renderDataSafely = (data) => {
    if (!data) return null;
    if (typeof data === 'string') return data;
    if (typeof data === 'number') return data.toString();
    if (typeof data === 'boolean') return data ? 'Yes' : 'No';
    if (Array.isArray(data)) {
      return data.map((item, index) => {
        if (typeof item === 'object' && item !== null) {
          return (
            <div key={index} className="text-sm">
              {JSON.stringify(item)}
            </div>
          );
        }
        return <span key={index}>{String(item)}</span>;
      });
    }
    if (typeof data === 'object' && data !== null) {
      return JSON.stringify(data);
    }
    return String(data);
  };

  if (safeMessage.type === 'user') {
    return (
      <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-end`}>
        <div className="flex-1 max-w-[80%]">
          <Card className="bg-blue-500 text-white border-blue-600">
            <CardContent className="p-4">
              <div className="text-sm font-medium">
                {safeMessage.content}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="flex-1 max-w-[85%]">
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardContent className="p-4">
            {safeMessage.error ? (
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-600 font-medium mb-2">
                    {currentLanguage === 'he' ? 'שגיאה בעיבוד השאלה' : 'Error processing question'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {safeMessage.content}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                {/* Main answer */}
                <div className="prose prose-sm max-w-none">
                  {formatMessageContent(safeMessage.content)}
                </div>

                {/* Summary section */}
                {safeMessage.summary && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        {currentLanguage === 'he' ? 'סיכום' : 'Summary'}
                      </span>
                    </div>
                    <p className="text-sm text-blue-700">
                      {safeMessage.summary}
                    </p>
                  </div>
                )}

                {/* Recommendations section */}
                {safeMessage.recommendations && safeMessage.recommendations.length > 0 && (
                  <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-800">
                        {currentLanguage === 'he' ? 'המלצות' : 'Recommendations'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {safeMessage.recommendations.map((rec, index) => (
                        <p key={index} className="text-sm text-amber-700">
                          • {String(rec)}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Relevant data section - only show key metrics */}
                {safeMessage.relevantData && safeMessage.relevantData.hasData && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {safeMessage.relevantData.transactionCount && (
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-500">
                          {currentLanguage === 'he' ? 'עסקאות' : 'Transactions'}
                        </div>
                        <div className="font-medium text-gray-800">
                          {String(safeMessage.relevantData.transactionCount)}
                        </div>
                      </div>
                    )}
                    {safeMessage.relevantData.totalExpenses !== undefined && (
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-500">
                          {currentLanguage === 'he' ? 'הוצאות' : 'Expenses'}
                        </div>
                        <div className="font-medium text-gray-800">
                          {renderDataSafely(safeMessage.relevantData.totalExpenses)}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    {currentLanguage === 'he' ? 'העתק' : 'Copy'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MessageRenderer;