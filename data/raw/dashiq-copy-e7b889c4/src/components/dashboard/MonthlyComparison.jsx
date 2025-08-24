
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Badge might still be used elsewhere, keeping it for safety unless explicitly removed
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  format,
  subMonths,
  subWeeks,
  subQuarters,
  subYears,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  subDays,
  getQuarter,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  addDays,
  differenceInDays,
  isSameDay
} from "date-fns";
import { ArrowUp, ArrowDown, DownloadIcon, BarChartHorizontal, CheckCircle, PlusCircle, ChevronDown, Filter, X } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from "recharts";

import { truncateText } from "@/components/utils";
import { t, formatCurrency, isRTL } from "@/components/utils/i18n";
import { IconRenderer } from "@/components/utils/icons";

export default function MonthlyComparison({ transactions, categories, periodType = "month", onCategorySelect, onCategoryFilterChange }) {
  const [comparisons, setComparisons] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]); // Stores array of selected category IDs
  const [topExpenseCategories, setTopExpenseCategories] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    if (transactions?.length > 0 && categories?.length > 0) {
      generateComparisons();
      calculateTopCategories();
    }
  }, [transactions, categories, selectedCategoryIds, periodType]);

  // Notify parent component when selectedCategoryIds changes
  useEffect(() => {
    if (onCategoryFilterChange) {
      onCategoryFilterChange(selectedCategoryIds);
    }
  }, [selectedCategoryIds, onCategoryFilterChange]);

  const isRTLLayout = isRTL();

  const getPeriodTitle = () => {
    switch(periodType) {
      case "week": return t('monthlyComparison.weeklyComparison');
      case "month": return t('monthlyComparison.monthlyComparison');
      case "quarter": return t('monthlyComparison.quarterlyComparison');
      case "year": return t('monthlyComparison.yearlyComparison');
      default: return t('monthlyComparison.monthlyComparison');
    }
  };

  const getPeriodDescription = () => {
    switch(periodType) {
      case "week": return t('monthlyComparison.weeklyDescription');
      case "month": return t('monthlyComparison.monthlyDescription');
      case "quarter": return t('monthlyComparison.quarterlyDescription');
      case "year": return t('monthlyComparison.yearlyDescription');
      default: return t('monthlyComparison.monthlyDescription');
    }
  };

  const getCorrespondingPeriodRange = (currentStart, currentEnd, periodsBack) => {
    const periodLength = differenceInDays(currentEnd, currentStart) + 1;

    let previousStart, previousEnd;

    switch (periodType) {
      case "week":
        previousStart = subDays(currentStart, 7 * periodsBack);
        previousEnd = subDays(currentEnd, 7 * periodsBack);
        break;

      case "month":
        const targetMonth = subMonths(currentStart, periodsBack);
        const dayOfMonth = Math.min(
          currentStart.getDate(),
          new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate()
        );

        previousStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), dayOfMonth);
        previousEnd = addDays(previousStart, periodLength - 1);

        const targetMonthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
        if (previousEnd > targetMonthEnd) {
          previousEnd = targetMonthEnd;
        }
        break;

      case "quarter":
        previousStart = subQuarters(currentStart, periodsBack);

        const daysInQuarter = differenceInDays(
          endOfQuarter(previousStart),
          startOfQuarter(previousStart)
        ) + 1;

        const daysFromQuarterStart = differenceInDays(
          currentStart,
          startOfQuarter(currentStart)
        );

        if (daysFromQuarterStart >= daysInQuarter) {
          previousStart = endOfQuarter(previousStart);
        } else {
          previousStart = addDays(startOfQuarter(previousStart), daysFromQuarterStart);
        }

        previousEnd = addDays(previousStart, periodLength - 1);

        if (previousEnd > endOfQuarter(previousStart)) {
          previousEnd = endOfQuarter(previousStart);
        }
        break;

      case "year":
        previousStart = new Date(
          currentStart.getFullYear() - periodsBack,
          currentStart.getMonth(),
          Math.min(currentStart.getDate(),
            new Date(currentStart.getFullYear() - periodsBack, currentStart.getMonth() + 1, 0).getDate()
          )
        );

        previousEnd = addDays(previousStart, periodLength - 1);

        if (previousEnd.getFullYear() > previousStart.getFullYear()) {
          previousEnd = new Date(previousStart.getFullYear(), 11, 31);
        }
        break;

      default:
        previousStart = subMonths(currentStart, periodsBack);
        previousEnd = subMonths(currentEnd, periodsBack);
    }

    return { previousStart, previousEnd };
  };

  const generateComparisons = () => {
    const today = new Date();
    let currentPeriodStart, currentPeriodEnd;

    if (periodType === "week") {
      currentPeriodStart = startOfWeek(today, { weekStartsOn: 0 });
      currentPeriodEnd = endOfWeek(today, { weekStartsOn: 0 });
    } else if (periodType === "month") {
      currentPeriodStart = startOfMonth(today);
      currentPeriodEnd = endOfMonth(today);
    } else if (periodType === "quarter") {
      currentPeriodStart = startOfQuarter(today);
      currentPeriodEnd = endOfQuarter(today);
    } else { // year
      currentPeriodStart = startOfYear(today);
      currentPeriodEnd = endOfYear(today);
    }

    const periodsData = [];
    const periodsCount = 6;

    for (let i = 0; i < periodsCount; i++) {
      const { previousStart: periodStart, previousEnd: periodEnd } =
        getCorrespondingPeriodRange(currentPeriodStart, currentPeriodEnd, i);

      let periodLabel;
      if (periodType === "week") {
        periodLabel = `${format(periodStart, "dd/MM")} - ${format(periodEnd, "dd/MM")}`;
      } else if (periodType === "month") {
        periodLabel = format(periodStart, "MMM yy");
      } else if (periodType === "quarter") {
        const quarterNumber = getQuarter(periodStart);
        periodLabel = `Q${quarterNumber} ${format(periodStart, "yy")}`;
      } else { // year
        periodLabel = format(periodStart, "yyyy");
      }

      const periodTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return isWithinInterval(transactionDate, { start: periodStart, end: periodEnd });
      });

      let income = 0;
      let expenses = 0; // Total expenses for the period
      let selectedCategoriesExpense = 0; // Sum of expenses ONLY for selected categories

      periodTransactions.forEach(t => {
        if (t.is_income) {
          income += Math.round(t.billing_amount || 0);
        } else {
          expenses += Math.round(t.billing_amount || 0);
          if (selectedCategoryIds.length > 0 && selectedCategoryIds.includes(t.category_id)) {
            selectedCategoriesExpense += Math.round(t.billing_amount || 0);
          }
        }
      });

      periodsData.push({
        period: periodLabel,
        income,
        expenses, // This is the total expenses for the period
        selectedCategoriesExpense, // This is the sum for *selected* categories only
        balance: income - expenses,
        periodStart,
        periodEnd
      });
    }

    setComparisons(periodsData.reverse());
  };

  const calculateTopCategories = () => {
    if (!categories || !transactions) return [];

    const today = new Date();
    let periodStart, periodEnd;

    if (periodType === "week") {
      periodStart = startOfWeek(today, { weekStartsOn: 0 });
      periodEnd = endOfWeek(today, { weekStartsOn: 0 });
    } else if (periodType === "month") {
      periodStart = startOfMonth(today);
      periodEnd = endOfMonth(today);
    } else if (periodType === "quarter") {
      periodStart = subMonths(startOfMonth(today), 2);
      periodEnd = endOfMonth(today);
    } else {
      periodStart = subMonths(startOfMonth(today), 11);
      periodEnd = endOfMonth(today);
    }

    const periodTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return !t.is_income &&
             isWithinInterval(transactionDate, {
               start: periodStart,
               end: periodEnd
             });
    });

    const expensesByCategory = {};
    periodTransactions.forEach(t => {
      if (!t.category_id) return;

      if (!expensesByCategory[t.category_id]) {
        expensesByCategory[t.category_id] = 0;
      }

      expensesByCategory[t.category_id] += Math.round(t.billing_amount || 0);
    });

    const categoriesArray = Object.keys(expensesByCategory).map(categoryId => {
      const category = categories.find(c => c.id === categoryId);
      return {
        id: categoryId,
        name: category ? category.name : t('common.uncategorized'),
        amount: expensesByCategory[categoryId]
      };
    }).sort((a, b) => b.amount - a.amount);

    setTopExpenseCategories(categoriesArray.slice(0, 5));
  };

  const calculateChanges = () => {
    if (comparisons.length < 2) return { expenses: 0, income: 0, balance: 0 };

    const currentPeriod = comparisons[comparisons.length - 1];
    const previousPeriod = comparisons[comparisons.length - 2];

    const expensesChange = previousPeriod.expenses === 0 ? (currentPeriod.expenses > 0 ? 100 : 0) : Math.round(((currentPeriod.expenses - previousPeriod.expenses) / previousPeriod.expenses) * 100);
    const incomeChange = previousPeriod.income === 0 ? (currentPeriod.income > 0 ? 100 : 0) : Math.round(((currentPeriod.income - previousPeriod.income) / previousPeriod.income) * 100);
    const balanceChange = previousPeriod.balance === 0 ? (currentPeriod.balance !== 0 ? 100 * Math.sign(currentPeriod.balance) : 0) : Math.round(((currentPeriod.balance - previousPeriod.balance) / Math.abs(previousPeriod.balance)) * 100);

    return {
      expenses: isNaN(expensesChange) ? 0 : expensesChange,
      income: isNaN(incomeChange) ? 0 : incomeChange,
      balance: isNaN(balanceChange) ? 0 : balanceChange
    };
  };

  const changes = calculateChanges();

  const exportToExcel = () => {
    if (typeof window !== 'undefined') {
      // English column headers for Excel export
      let csvContent = `Period,Income,Total Expenses,Selected Categories Expense,Balance\n`;

      comparisons.forEach(period => {
        csvContent += `${period.period},${period.income},${period.expenses},${period.selectedCategoriesExpense || 0},${period.balance}\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${periodType}_comparison.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border rounded shadow z-50" dir={isRTLLayout ? "rtl" : "ltr"}>
          <p className="font-medium text-sm">{label}</p>
          <div className="max-h-[150px] overflow-y-auto">
            {payload.map((p, i) => (
              <p key={i} className="flex items-center gap-1 text-xs mt-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
                <span className="font-medium">{p.name}:</span>
                <span>{formatCurrency(Math.round(p.value))}</span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const handleCategoryToggle = (categoryId, checked) => {
    setSelectedCategoryIds(prev => {
      if (checked) {
        return [...prev, categoryId];
      } else {
        return prev.filter(id => id !== categoryId);
      }
    });
  };

  const handleSelectAll = () => {
    const expenseCategories = categories.filter(c => c.type === 'expense');
    setSelectedCategoryIds(expenseCategories.map(c => c.id));
  };

  const handleClearAll = () => {
    setSelectedCategoryIds([]);
  };

  const getSelectedCategoriesLabel = () => {
    if (selectedCategoryIds.length === 0) return t('monthlyComparison.allExpenses');
    if (selectedCategoryIds.length === 1) {
      const cat = categories.find(c => c.id === selectedCategoryIds[0]);
      return cat ? cat.name : t('monthlyComparison.selectedCategory');
    }
    return t('monthlyComparison.selectedCategoriesCount', { count: selectedCategoryIds.length });
  };


  return (
    <Card className="col-span-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 pb-3">
        <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:justify-between md:items-center">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2 truncate">
                <BarChartHorizontal className="w-5 h-5 text-indigo-600 flex-shrink-0"/>
                <span className="truncate">{getPeriodTitle()}</span>
            </CardTitle>
            <CardDescription className="text-gray-600 truncate text-sm">{getPeriodDescription()}</CardDescription>
          </div>
          <div className="flex-shrink-0 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToExcel}
              className="bg-white shadow-sm border-gray-200 hover:bg-gray-50 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 w-full md:w-auto"
            >
              <DownloadIcon className="w-3 h-3 sm:w-4 h-4 mr-1 sm:mr-2 text-gray-700 flex-shrink-0" />
              <span className="truncate">{t('monthlyComparison.exportToExcel')}</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-5">

        <div className="mb-6 bg-gray-50 p-3 rounded-lg border border-gray-200 overflow-hidden" dir={isRTLLayout ? 'rtl' : 'ltr'}>
          <h3 className="text-sm font-medium mb-3 text-gray-700">{t('monthlyComparison.filterByCategory')}:</h3>
          <div className="flex flex-wrap gap-2 items-center">
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="bg-white border-gray-300 hover:bg-gray-50 text-sm px-3 py-2 h-9 min-w-[200px] justify-between"
                  dir={isRTLLayout ? 'rtl' : 'ltr'}
                >
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="truncate">{getSelectedCategoriesLabel()}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start" dir={isRTLLayout ? 'rtl' : 'ltr'}>
                <div className="p-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm text-gray-900">{t('monthlyComparison.selectCategories')}</h4>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleSelectAll}
                        className="text-xs px-2 py-1 h-auto"
                      >
                        {t('common.selectAll')}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleClearAll}
                        className="text-xs px-2 py-1 h-auto"
                      >
                        {t('common.clear')}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto" dir={isRTLLayout ? 'rtl' : 'ltr'}>
                  <div className="p-2 space-y-1">
                    {categories.filter(c => c.type === 'expense').map(cat => (
                      <div key={cat.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md" dir={isRTLLayout ? 'rtl' : 'ltr'}>
                        <Checkbox
                          id={cat.id}
                          checked={selectedCategoryIds.includes(cat.id)}
                          onCheckedChange={(checked) => handleCategoryToggle(cat.id, checked)}
                        />
                        <label 
                          htmlFor={cat.id} 
                          className="flex items-center gap-2 flex-1 cursor-pointer text-sm"
                          dir={isRTLLayout ? 'rtl' : 'ltr'}
                        >
                          <IconRenderer iconName={cat.icon || 'HelpCircle'} size={14} className="text-gray-500 flex-shrink-0" />
                          <span className="truncate">{cat.name}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {selectedCategoryIds.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-xs px-2 py-1 h-auto text-gray-500 hover:text-gray-700"
              >
                <X className="w-3 h-3 mr-1" />
                {t('common.clear')}
              </Button>
            )}
          </div>
        </div>

        <div className="h-[350px] bg-white p-2 rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisons}
              margin={{ top: 30, right: 15, left: 15, bottom: 40 }}
              onClick={(data, index) => {
                // Safe click handler that doesn't pass complex objects
                if (onCategorySelect && selectedCategoryIds.length > 0) {
                  onCategorySelect(selectedCategoryIds[0]);
                } else if (onCategorySelect) {
                  onCategorySelect(null);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 13, fill: '#6B7280' }}
                interval="preserveStartEnd"
                tickMargin={15}
                height={50}
                angle={-45}
                textAnchor="end"
                padding={{ left: 10, right: 10 }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis
                tickFormatter={(value) => `${formatCurrency(Math.round(value / 1000))}K`}
                tick={{ fontSize: 13, fill: '#6B7280' }}
                tickMargin={0}
                width={50}
                padding={{ top: 0, bottom: 0 }}
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <Tooltip
                content={<CustomTooltip />}
                wrapperStyle={{ zIndex: 100 }}
              />
              <Legend
                verticalAlign="top"
                height={35}
                iconSize={10}
                iconType="circle"
                wrapperStyle={{
                  fontSize: '13px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '15px'
                }}
              />
              {selectedCategoryIds.length === 0 ? (
                <>
                  <Bar
                    name={t('monthlyComparison.income')}
                    dataKey="income"
                    fill="#10B981"
                    barSize={20}
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    name={t('monthlyComparison.totalExpenses')}
                    dataKey="expenses"
                    fill="#EF4444"
                    barSize={20}
                    radius={[3, 3, 0, 0]}
                  />
                </>
              ) : (
                <Bar
                  name={getSelectedCategoriesLabel()}
                  dataKey="selectedCategoriesExpense"
                  fill="#6366F1"
                  barSize={20}
                  radius={[3, 3, 0, 0]}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
