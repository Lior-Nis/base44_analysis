import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, PiggyBank, ChevronDown, ChevronUp } from "lucide-react";
import { t, formatCurrency } from "@/components/utils/i18n";
import { truncateText } from "@/components/utils";
import { useUserPreferences } from "@/components/utils/UserPreferencesContext";
import RecentTransactions from "./RecentTransactions";
import { parseISO, isWithinInterval } from "date-fns";

export default function GeneralSummaryCard({
  transactions = [],
  categories = [],
  budgets = [],
  periodLabel = "",
  selectedCategoryForReport = null,
  filteredCategoryIds = [],
  currentDate,
  periodType = "month",
  getDateRange,
  setSelectedCategoryForReport,
  getFilteredCategoriesLabel
}) {
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const { preferences } = useUserPreferences();

  // Get the current period date range using the same function as Dashboard
  const currentPeriodRange = useMemo(() => {
    if (!getDateRange || !currentDate) return null;
    return getDateRange(currentDate, periodType);
  }, [getDateRange, currentDate, periodType]);

  // Filter transactions by the current period
  const periodFilteredTransactions = useMemo(() => {
    if (!currentPeriodRange) return transactions;
    
    const { startDate, endDate } = currentPeriodRange;
    
    return transactions.filter(t => {
      if (!t || !t.date) return false;
      
      try {
        const transactionDate = parseISO(t.date);
        return isWithinInterval(transactionDate, { start: startDate, end: endDate });
      } catch (error) {
        console.error('Error parsing transaction date:', t.date, error);
        return false;
      }
    });
  }, [transactions, currentPeriodRange]);

  // Calculate summary KPIs safely using period-filtered transactions
  const summaryData = useMemo(() => {
    try {
      // Filter transactions based on current filters and period
      const filteredTransactions = periodFilteredTransactions.filter(t => {
        if (!t || typeof t !== 'object') return false;
        
        if (selectedCategoryForReport) {
          return t.category_id === selectedCategoryForReport.id && !t.is_income;
        }
        
        if (filteredCategoryIds.length > 0) {
          return filteredCategoryIds.includes(t.category_id) && !t.is_income;
        }
        
        return !t.is_income; // Only expenses by default
      });

      const totalAmount = filteredTransactions.reduce((sum, t) => {
        const amount = typeof t.billing_amount === 'number' ? t.billing_amount : 0;
        return sum + amount;
      }, 0);

      const transactionCount = filteredTransactions.length;
      const averageTransaction = transactionCount > 0 ? totalAmount / transactionCount : 0;

      // Calculate business spending with safe truncation
      const businessSpending = {};
      filteredTransactions.forEach(t => {
        if (t.business_name) {
          // Use safe truncation with fallback
          const name = typeof truncateText === 'function' 
            ? truncateText(t.business_name, 30) 
            : (t.business_name.length > 30 ? t.business_name.substring(0, 30) + '...' : t.business_name);
          businessSpending[name] = (businessSpending[name] || 0) + (t.billing_amount || 0);
        }
      });

      const topBusinesses = Object.entries(businessSpending)
        .map(([name, amount]) => ({ name, amount: Math.round(amount) }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);

      // Get recent transactions from top businesses with safe truncation
      const recentTransactionsFromTopBusinesses = [];
      const topBusinessNames = topBusinesses.slice(0, 5).map(b => b.name);
      
      for (const businessName of topBusinessNames) {
        const businessTransactions = filteredTransactions
          .filter(t => {
            if (!t.business_name) return false;
            const truncatedName = typeof truncateText === 'function' 
              ? truncateText(t.business_name, 30)
              : (t.business_name.length > 30 ? t.business_name.substring(0, 30) + '...' : t.business_name);
            return truncatedName === businessName;
          })
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 2);
        
        recentTransactionsFromTopBusinesses.push(...businessTransactions);
        
        if (recentTransactionsFromTopBusinesses.length >= 10) break;
      }

      return {
        totalAmount: Math.round(totalAmount),
        transactionCount,
        averageTransaction: Math.round(averageTransaction),
        topBusinesses,
        recentTransactionsFromTopBusinesses: recentTransactionsFromTopBusinesses.slice(0, 10)
      };
    } catch (error) {
      console.error('Error calculating summary data:', error);
      return {
        totalAmount: 0,
        transactionCount: 0,
        averageTransaction: 0,
        topBusinesses: [],
        recentTransactionsFromTopBusinesses: []
      };
    }
  }, [periodFilteredTransactions, selectedCategoryForReport, filteredCategoryIds]);

  const handleBackToGeneral = () => {
    if (setSelectedCategoryForReport) {
      setSelectedCategoryForReport(null);
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden hover:bg-white/80 hover:shadow-2xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100/50 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2 md:gap-3">
              <PiggyBank className="w-5 h-5 md:w-6 md:h-6 text-purple-600 flex-shrink-0" />
              <span className="truncate">
                {selectedCategoryForReport 
                  ? t('dashboard.categorySummary', { category: selectedCategoryForReport.name }) 
                  : t('dashboard.generalSummary')
                }
                {getFilteredCategoriesLabel && getFilteredCategoriesLabel()}
              </span>
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 font-medium mt-1">
              {selectedCategoryForReport
                ? t('dashboard.categoryAnalysisDescription', { 
                    category: selectedCategoryForReport.name, 
                    period: periodLabel 
                  })
                : t('dashboard.generalAnalysisDescription', { period: periodLabel })
              }
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {selectedCategoryForReport && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToGeneral}
                className="bg-white/80 hover:bg-white/100 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 flex items-center gap-1"
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{t('dashboard.backToGeneral')}</span>
                <span className="sm:hidden">{t('common.back')}</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
              className="bg-white/80 hover:bg-white/100 flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
            >
              {isSummaryExpanded ? (
                <>
                  <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{t('common.collapse')}</span>
                  <span className="sm:hidden">{t('common.less')}</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{t('common.expand')}</span>
                  <span className="sm:hidden">{t('common.more')}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-6">
        {/* Summary KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/80 border border-gray-200">
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 mb-1">
                {selectedCategoryForReport 
                  ? t('dashboard.categoryAmount') 
                  : filteredCategoryIds.length > 0 
                    ? t('dashboard.filteredExpenses') 
                    : t('dashboard.totalExpenses')
                }
              </div>
              <div className="text-xl font-bold text-blue-700">
                {formatCurrency(summaryData.totalAmount, preferences?.displayCurrency || 'ILS')}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 border border-gray-200">
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 mb-1">{t('dashboard.transactionCount')}</div>
              <div className="text-xl font-bold text-blue-700">
                {summaryData.transactionCount}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 border border-gray-200 col-span-2 md:col-span-1">
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 mb-1">{t('dashboard.averageTransaction')}</div>
              <div className="text-xl font-bold text-blue-700">
                {formatCurrency(summaryData.averageTransaction, preferences?.displayCurrency || 'ILS')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Businesses */}
        {summaryData.topBusinesses.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-purple-600" />
              {t('dashboard.topBusinesses')} {!isSummaryExpanded && t('dashboard.topThree')}
            </h4>
            <div className="grid gap-3">
              {summaryData.topBusinesses
                .slice(0, isSummaryExpanded ? summaryData.topBusinesses.length : 3)
                .map((business, index) => (
                <div key={`${business.name}-${index}`} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 flex-shrink-0">
                      {index + 1}
                    </Badge>
                    <span className="font-medium text-gray-700 truncate">{business.name}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(business.amount, preferences?.displayCurrency || 'ILS')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {summaryData.totalAmount > 0 
                        ? ((business.amount / summaryData.totalAmount) * 100).toFixed(1) 
                        : 0
                      }% {t('dashboard.ofAmount')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {!isSummaryExpanded && summaryData.topBusinesses.length > 3 && (
              <div className="text-center mt-3">
                <span className="text-sm text-gray-500">
                  {t('dashboard.andMoreBusinesses', { 
                    count: (summaryData.topBusinesses.length - 3).toLocaleString() 
                  })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Recent Transactions (only when expanded) */}
        {isSummaryExpanded && summaryData.recentTransactionsFromTopBusinesses.length > 0 && (
          <div className="mt-6">
            <RecentTransactions
              transactions={summaryData.recentTransactionsFromTopBusinesses}
              categories={categories}
              title={t('dashboard.recentTransactionsFromTopBusinesses')}
              maxItems={10}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}