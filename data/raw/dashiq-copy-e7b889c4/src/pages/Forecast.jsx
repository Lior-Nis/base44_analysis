
import React, { useState, useEffect, useCallback } from "react";
import { Transaction, Category } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Calculator,
  Target,
  Calendar,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
  AlertCircle,
  CheckCircle,
  Loader2,
  Settings,
  Info
} from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
  isWithinInterval,
  parseISO,
  differenceInMonths
} from "date-fns";
import { t, formatCurrency, formatDate, formatNumber, isRTL, getCurrentLanguage } from '@/components/utils/i18n';

export default function ForecastPage() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("spending");
  const isRTLLayout = isRTL();

  // Forecast parameters
  const [forecastPeriod, setForecastPeriod] = useState("6"); // months
  const [forecastMethod, setForecastMethod] = useState("trend"); // trend, average, seasonal
  const [customGrowthRate, setCustomGrowthRate] = useState("0"); // percentage

  // Forecast results
  const [spendingForecast, setSpendingForecast] = useState([]);
  const [incomeForecast, setIncomeForecast] = useState([]);
  const [savingsForecast, setSavingsForecast] = useState([]);
  const [categoryForecast, setCategoryForecast] = useState([]);
  const [forecastSummary, setForecastSummary] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (transactions.length > 0 && categories.length > 0) {
      generateForecast();
    }
  }, [transactions, categories, forecastPeriod, forecastMethod, customGrowthRate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [transactionsData, categoriesData] = await Promise.all([
        Transaction.list('-date', 1000),
        Category.list('name')
      ]);

      setTransactions(transactionsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: t('errors.loadingData'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateForecast = () => {
    try {
      const now = new Date();
      const monthsToForecast = parseInt(forecastPeriod);
      const historicalPeriods = 12; // Use last 12 months for analysis

      // Get historical data
      const historicalData = [];
      for (let i = historicalPeriods - 1; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(now, i));
        const monthEnd = endOfMonth(subMonths(now, i));

        const monthTransactions = transactions.filter(t =>
          isWithinInterval(parseISO(t.date), { start: monthStart, end: monthEnd })
        );

        const monthIncome = monthTransactions
          .filter(t => t.is_income)
          .reduce((sum, t) => sum + (t.billing_amount || 0), 0);

        const monthExpenses = monthTransactions
          .filter(t => !t.is_income)
          .reduce((sum, t) => sum + (t.billing_amount || 0), 0);

        historicalData.push({
          month: formatDate(monthStart, 'MMM yyyy'),
          income: Math.round(monthIncome),
          expenses: Math.round(monthExpenses),
          savings: Math.round(monthIncome - monthExpenses),
          date: monthStart
        });
      }

      // Calculate trends and averages
      const avgIncome = historicalData.reduce((sum, d) => sum + d.income, 0) / historicalData.length;
      const avgExpenses = historicalData.reduce((sum, d) => sum + d.expenses, 0) / historicalData.length;
      const avgSavings = avgIncome - avgExpenses;

      // Calculate growth rates
      const incomeGrowthRate = calculateGrowthRate(historicalData.map(d => d.income));
      const expenseGrowthRate = calculateGrowthRate(historicalData.map(d => d.expenses));

      // Generate future forecast
      const forecastData = [];
      for (let i = 1; i <= monthsToForecast; i++) {
        const futureMonth = addMonths(now, i);
        let projectedIncome, projectedExpenses;

        if (forecastMethod === "average") {
          projectedIncome = avgIncome;
          projectedExpenses = avgExpenses;
        } else if (forecastMethod === "trend") {
          projectedIncome = avgIncome * Math.pow(1 + incomeGrowthRate / 100, i);
          projectedExpenses = avgExpenses * Math.pow(1 + expenseGrowthRate / 100, i);
        } else if (forecastMethod === "custom") {
          const growthRate = parseFloat(customGrowthRate) / 100;
          projectedIncome = avgIncome * Math.pow(1 + growthRate, i);
          projectedExpenses = avgExpenses * Math.pow(1 + growthRate, i);
        }

        forecastData.push({
          month: formatDate(futureMonth, 'MMM yyyy'),
          income: Math.round(projectedIncome),
          expenses: Math.round(projectedExpenses),
          savings: Math.round(projectedIncome - projectedExpenses),
          date: futureMonth,
          isForecast: true
        });
      }

      // Combine historical and forecast data
      const combinedData = [...historicalData, ...forecastData];

      setSpendingForecast(combinedData);
      setIncomeForecast(combinedData);
      setSavingsForecast(combinedData);

      // Generate category-wise forecast
      generateCategoryForecast(monthsToForecast);

      // Generate summary
      const totalForecastIncome = forecastData.reduce((sum, d) => sum + d.income, 0);
      const totalForecastExpenses = forecastData.reduce((sum, d) => sum + d.expenses, 0);
      const totalForecastSavings = totalForecastIncome - totalForecastExpenses;

      setForecastSummary({
        totalIncome: Math.round(totalForecastIncome),
        totalExpenses: Math.round(totalForecastExpenses),
        totalSavings: Math.round(totalForecastSavings),
        avgMonthlyIncome: Math.round(totalForecastIncome / monthsToForecast),
        avgMonthlyExpenses: Math.round(totalForecastExpenses / monthsToForecast),
        avgMonthlySavings: Math.round(totalForecastSavings / monthsToForecast),
        savingsRate: totalForecastIncome > 0 ? Math.round((totalForecastSavings / totalForecastIncome) * 100) : 0
      });

    } catch (error) {
      console.error("Error generating forecast:", error);
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: t('forecast.errors.generationFailed'),
      });
    }
  };

  const calculateGrowthRate = (values) => {
    if (values.length < 2) return 0;

    const validValues = values.filter(v => v > 0);
    if (validValues.length < 2) return 0;

    const firstValue = validValues[0];
    const lastValue = validValues[validValues.length - 1];
    const periods = validValues.length - 1;

    if (firstValue === 0) return 0;

    const growthRate = (Math.pow(lastValue / firstValue, 1 / periods) - 1) * 100;
    return Math.max(-50, Math.min(50, growthRate)); // Cap between -50% and 50%
  };

  const generateCategoryForecast = (monthsToForecast) => {
    const categoryData = [];

    categories.filter(c => c.type === 'expense').forEach(category => {
      const categoryTransactions = transactions.filter(t =>
        t.category_id === category.id && !t.is_income
      );

      if (categoryTransactions.length === 0) return;

      // Calculate monthly averages for the category
      const monthlyData = [];
      const now = new Date();

      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(now, i));
        const monthEnd = endOfMonth(subMonths(now, i));

        const monthCategoryTransactions = categoryTransactions.filter(t =>
          isWithinInterval(parseISO(t.date), { start: monthStart, end: monthEnd })
        );

        const monthTotal = monthCategoryTransactions.reduce((sum, t) => sum + (t.billing_amount || 0), 0);
        monthlyData.push(monthTotal);
      }

      const avgMonthlySpending = monthlyData.reduce((sum, amount) => sum + amount, 0) / monthlyData.length;
      const growthRate = calculateGrowthRate(monthlyData);

      if (avgMonthlySpending > 0) {
        categoryData.push({
          category: category.name,
          icon: category.icon,
          currentMonthly: Math.round(avgMonthlySpending),
          forecastTotal: Math.round(avgMonthlySpending * monthsToForecast * Math.pow(1 + growthRate / 100, monthsToForecast / 2)),
          growthRate: Math.round(growthRate * 10) / 10,
          trend: growthRate > 0 ? 'increasing' : growthRate < 0 ? 'decreasing' : 'stable'
        });
      }
    });

    setCategoryForecast(categoryData.sort((a, b) => b.forecastTotal - a.forecastTotal));
  };

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4" dir={isRTLLayout ? 'rtl' : 'ltr'}>
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-blue-600 mx-auto" />
          <span className="text-base sm:text-lg text-gray-700 break-words">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 overflow-x-hidden" dir={isRTLLayout ? 'rtl' : 'ltr'}>
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-xl border border-white/20">
            <div className="flex items-start gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg flex-shrink-0">
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent break-words">
                  {t('forecast.title')}
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base break-words">{t('forecast.subtitle')}</p>
              </div>
            </div>
          </div>

          {/* No Data State */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
              <Activity className="h-16 w-16 sm:h-20 sm:w-20 text-gray-400 mb-6" />
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-4 text-center break-words">
                {t('forecast.noData.title')}
              </h3>
              <p className="text-gray-500 text-center max-w-md break-words text-sm sm:text-base">
                {t('forecast.noData.description')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-2 sm:p-4 md:p-6 overflow-x-hidden" dir={isRTLLayout ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header - Mobile Optimized */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 shadow-xl border border-white/20">
          <div className="space-y-4">
            {/* Title Section */}
            <div className="flex items-start gap-3">
              <div className="p-2 md:p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg md:rounded-2xl shadow-lg flex-shrink-0">
                <BarChart3 className="w-5 h-5 md:w-8 md:h-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent break-words leading-tight">
                  {t('forecast.title')}
                </h1>
                <p className="text-gray-600 mt-1 text-xs sm:text-sm md:text-base break-words">{t('forecast.subtitle')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Forecast Configuration - Mobile Optimized */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl break-words">
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <span className="break-words">{t('forecast.configuration.title')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="forecastPeriod" className="text-sm font-medium break-words">
                  {t('forecast.configuration.period')}
                </Label>
                <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
                  <SelectTrigger className="w-full bg-white/90">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir={isRTLLayout ? 'rtl' : 'ltr'}>
                    <SelectItem value="3">{t('forecast.configuration.periods.3months')}</SelectItem>
                    <SelectItem value="6">{t('forecast.configuration.periods.6months')}</SelectItem>
                    <SelectItem value="12">{t('forecast.configuration.periods.12months')}</SelectItem>
                    <SelectItem value="24">{t('forecast.configuration.periods.24months')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="forecastMethod" className="text-sm font-medium break-words">
                  {t('forecast.configuration.method')}
                </Label>
                <Select value={forecastMethod} onValueChange={setForecastMethod}>
                  <SelectTrigger className="w-full bg-white/90">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir={isRTLLayout ? 'rtl' : 'ltr'}>
                    <SelectItem value="average">{t('forecast.configuration.methods.average')}</SelectItem>
                    <SelectItem value="trend">{t('forecast.configuration.methods.trend')}</SelectItem>
                    <SelectItem value="custom">{t('forecast.configuration.methods.custom')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {forecastMethod === "custom" && (
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <Label htmlFor="customGrowthRate" className="text-sm font-medium break-words">
                    {t('forecast.configuration.growthRate')}
                  </Label>
                  <Input
                    id="customGrowthRate"
                    type="number"
                    value={customGrowthRate}
                    onChange={(e) => setCustomGrowthRate(e.target.value)}
                    placeholder="0"
                    className="bg-white/90"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Forecast Summary - Mobile Grid */}
        {forecastSummary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-green-600 font-medium break-words">
                      {t('forecast.summary.totalIncome')}
                    </p>
                    <p className="text-base sm:text-lg md:text-xl font-bold text-green-800 break-all">
                      {formatCurrency(forecastSummary.totalIncome)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200 shadow-lg">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                    <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-red-600 font-medium break-words">
                      {t('forecast.summary.totalExpenses')}
                    </p>
                    <p className="text-base sm:text-lg md:text-xl font-bold text-red-800 break-all">
                      {formatCurrency(forecastSummary.totalExpenses)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-blue-600 font-medium break-words">
                      {t('forecast.summary.totalSavings')}
                    </p>
                    <p className={`text-base sm:text-lg md:text-xl font-bold break-all ${forecastSummary.totalSavings >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
                      {formatCurrency(forecastSummary.totalSavings)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border-purple-200 shadow-lg">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                    <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-purple-600 font-medium break-words">
                      {t('forecast.summary.savingsRate')}
                    </p>
                    <p className={`text-base sm:text-lg md:text-xl font-bold break-all ${forecastSummary.savingsRate >= 20 ? 'text-green-600' : forecastSummary.savingsRate >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {forecastSummary.savingsRate}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Forecast Charts - Mobile Optimized */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl break-words">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <span className="break-words">{t('forecast.charts.title')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 md:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Mobile-optimized TabsList */}
              <TabsList className="w-full h-auto bg-gray-100 p-1 mb-4 sm:mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 w-full">
                  <TabsTrigger
                    value="spending"
                    className="w-full text-xs sm:text-sm px-2 py-2 sm:px-4 sm:py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md whitespace-nowrap"
                  >
                    <span className="truncate">{t('forecast.charts.tabs.overview')}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="trends"
                    className="w-full text-xs sm:text-sm px-2 py-2 sm:px-4 sm:py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md whitespace-nowrap"
                  >
                    <span className="truncate">{t('forecast.charts.tabs.trends')}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="categories"
                    className="w-full text-xs sm:text-sm px-2 py-2 sm:px-4 sm:py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md whitespace-nowrap"
                  >
                    <span className="truncate">{t('forecast.charts.tabs.categories')}</span>
                  </TabsTrigger>
                </div>
              </TabsList>

              {/* Rest of the tabs content remains the same */}
              <TabsContent value="spending" className="mt-4 sm:mt-6">
                <div className="h-[300px] sm:h-[350px] md:h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={spendingForecast}
                      margin={{ top: 10, right: 10, left: 5, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={0}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        width={50}
                        tickFormatter={(value) => formatCurrency(value).replace(/[₪$€]/g, '')}
                      />
                      <Tooltip
                        formatter={(value, name) => [formatCurrency(value), t(`forecast.charts.${name}`)]}
                        labelFormatter={(label) => `${t('common.month')}: ${label}`}
                        contentStyle={{
                          fontSize: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="income" fill="#10B981" name="income" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="expenses" fill="#EF4444" name="expenses" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="trends" className="mt-4 sm:mt-6">
                <div className="h-[300px] sm:h-[350px] md:h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={savingsForecast}
                      margin={{ top: 10, right: 10, left: 5, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={0}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        width={50}
                        tickFormatter={(value) => formatCurrency(value).replace(/[₪$€]/g, '')}
                      />
                      <Tooltip
                        formatter={(value) => [formatCurrency(value), t('forecast.charts.savings')]}
                        labelFormatter={(label) => `${t('common.month')}: ${label}`}
                        contentStyle={{
                          fontSize: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="savings"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="categories" className="mt-4 sm:mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Pie Chart */}
                  <div className="h-[300px] sm:h-[350px] w-full">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-center break-words">
                      {t('forecast.charts.categoryDistribution')}
                    </h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryForecast.slice(0, 8)}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="forecastTotal"
                          label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                          labelStyle={{ fontSize: '10px' }}
                        >
                          {categoryForecast.slice(0, 8).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => formatCurrency(value)}
                          contentStyle={{
                            fontSize: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Category List */}
                  <div className="space-y-3">
                    <h3 className="text-base sm:text-lg font-semibold break-words">
                      {t('forecast.charts.categoryForecast')}
                    </h3>
                    <div className="space-y-2 max-h-[280px] sm:max-h-[320px] overflow-y-auto pr-2">
                      {categoryForecast.map((category, index) => (
                        <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="font-medium text-sm truncate">{category.category}</span>
                            {category.trend === 'increasing' && <TrendingUp className="w-3 h-3 text-red-500 flex-shrink-0" />}
                            {category.trend === 'decreasing' && <TrendingDown className="w-3 h-3 text-green-500 flex-shrink-0" />}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-semibold text-sm break-all">{formatCurrency(category.forecastTotal)}</div>
                            <div className="text-xs text-gray-500">
                              {category.growthRate > 0 ? '+' : ''}{category.growthRate}% {t('forecast.charts.growth')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Forecast Insights - Mobile Optimized */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl break-words">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
              <span className="break-words">{t('forecast.insights.title')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {forecastSummary?.savingsRate < 10 && (
              <div className="flex items-start gap-3 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-red-800 text-sm sm:text-base break-words">
                    {t('forecast.insights.lowSavings.title')}
                  </h4>
                  <p className="text-red-700 text-xs sm:text-sm mt-1 break-words">
                    {t('forecast.insights.lowSavings.description')}
                  </p>
                </div>
              </div>
            )}

            {forecastSummary?.savingsRate >= 20 && (
              <div className="flex items-start gap-3 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-green-800 text-sm sm:text-base break-words">
                    {t('forecast.insights.goodSavings.title')}
                  </h4>
                  <p className="text-green-700 text-xs sm:text-sm mt-1 break-words">
                    {t('forecast.insights.goodSavings.description')}
                  </p>
                </div>
              </div>
            )}

            {categoryForecast.some(c => c.trend === 'increasing' && c.growthRate > 10) && (
              <div className="flex items-start gap-3 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <TrendingUp className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-yellow-800 text-sm sm:text-base break-words">
                    {t('forecast.insights.increasingExpenses.title')}
                  </h4>
                  <p className="text-yellow-700 text-xs sm:text-sm mt-1 mb-2 break-words">
                    {t('forecast.insights.increasingExpenses.description')}
                  </p>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {categoryForecast
                      .filter(c => c.trend === 'increasing' && c.growthRate > 10)
                      .slice(0, 3)
                      .map(category => (
                        <Badge key={category.category} variant="outline" className="text-xs break-all">
                          {category.category} (+{category.growthRate}%)
                        </Badge>
                      ))
                    }
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
