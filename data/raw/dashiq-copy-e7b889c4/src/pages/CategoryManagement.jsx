import React, { useState, useEffect } from "react";
import { Category, CategoryRule, Transaction } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Edit,
  Trash2,
  FolderOpen,
  Tag,
  Settings,
  HelpCircle,
  Info,
  Shapes,
  ChevronDown,
  ChevronUp,
  List,
  Filter
} from "lucide-react";
import { IconRenderer, getIconOptions } from "@/components/utils/icons";
import CategoryForm from "../components/categories/CategoryForm";
import { t, isRTL } from "@/components/utils/i18n";
import { checkAndInitializeUser } from '@/components/utils/initializeUser';

export default function CategoryManagementPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [rules, setRules] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [isRuleFormOpen, setIsRuleFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingRule, setEditingRule] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [deletingRule, setDeletingRule] = useState(null);
  const [activeTab, setActiveTab] = useState("categories");
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedRules, setExpandedRules] = useState({});
  const isRTLLayout = isRTL();

  // Rule form state
  const [ruleForm, setRuleForm] = useState({
    business_name_pattern: "",
    category_id: ""
  });
  const [ruleFormErrors, setRuleFormErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, categoryFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Check and auto-initialize user if needed
      const initResult = await checkAndInitializeUser();
      if (initResult.needsInitialization && initResult.initializationResult.success) {
        console.log(`Initialized user with ${initResult.categoryCount} categories`);
        toast({
          title: t('toast.success'),
          description: t('toast.categoriesInitialized', { count: initResult.categoryCount }),
        });
      }

      const [categoriesData, rulesData, transactionsData] = await Promise.all([
        Category.list('sort_order'),
        CategoryRule.list(),
        Transaction.list('-date', 100) // Just for counting
      ]);
      setCategories(categoriesData);
      setRules(rulesData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        variant: "destructive",
        title: t('toast.error'),
        description: t('toast.loadingData'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterCategories = () => {
    let filtered = categories;
    if (categoryFilter === "expense") {
      filtered = categories.filter(c => c.type === "expense");
    } else if (categoryFilter === "income") {
      filtered = categories.filter(c => c.type === "income");
    }
    setFilteredCategories(filtered);
  };

  const getCategoryTransactionCount = (categoryId) => {
    return transactions.filter(t => t.category_id === categoryId).length;
  };

  const handleCategoryFormSubmit = async (categoryData, isEditing) => {
    try {
      if (isEditing) {
        await Category.update(editingCategory.id, categoryData);
        toast({
          title: t('toast.success'),
          description: t('toast.categoryUpdated'),
        });
      } else {
        await Category.create(categoryData);
        toast({
          title: t('toast.success'),
          description: t('toast.categoryAdded'),
        });
      }
      
      setIsCategoryFormOpen(false);
      setEditingCategory(null);
      loadData();
    } catch (error) {
      console.error("Error saving category:", error);
      
      if (error.message && (error.message.includes('duplicate') || error.message.includes('unique'))) {
        toast({
          variant: "destructive",
          title: t('toast.error'),
          description: t('toast.categoryExists'),
        });
      } else {
        toast({
          variant: "destructive",
          title: t('toast.error'),
          description: t('toast.serverError'),
        });
      }
    }
  };

  const handleCategoryFormError = (error) => {
    console.error("Category form error:", error);
    toast({
      variant: "destructive",
      title: t('toast.error'),
      description: t('toast.serverError'),
    });
  };

  const openEditCategory = (category) => {
    setEditingCategory(category);
    setIsCategoryFormOpen(true);
  };

  const handleDeleteCategory = async (category) => {
    try {
      const transactionCount = getCategoryTransactionCount(category.id);
      if (transactionCount > 0) {
        toast({
          variant: "destructive",
          title: t('toast.warning'),
          description: t('toast.categoryInUse'),
        });
        return;
      }

      await Category.delete(category.id);
      toast({
        title: t('toast.success'),
        description: t('toast.categoryDeleted'),
      });
      setDeletingCategory(null);
      loadData();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        variant: "destructive",
        title: t('toast.error'),
        description: t('toast.serverError'),
      });
    }
  };

  const validateRuleForm = () => {
    const errors = {};
    
    if (!ruleForm.business_name_pattern.trim()) {
      errors.business_name_pattern = t('categories.rules.patternRequired');
    }
    if (!ruleForm.category_id) {
      errors.category_id = t('categories.rules.categoryRequired');
    }

    setRuleFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRuleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateRuleForm()) {
      return;
    }

    try {
      const ruleData = {
        business_name_pattern: ruleForm.business_name_pattern.trim(),
        category_id: ruleForm.category_id
      };

      if (editingRule) {
        await CategoryRule.update(editingRule.id, ruleData);
        toast({
          title: t('toast.success'),
          description: t('toast.ruleUpdated'),
        });
      } else {
        await CategoryRule.create(ruleData);
        toast({
          title: t('toast.success'),
          description: t('toast.ruleAdded'),
        });
      }

      setIsRuleFormOpen(false);
      setEditingRule(null);
      setRuleForm({ business_name_pattern: "", category_id: "" });
      setRuleFormErrors({});
      loadData();
    } catch (error) {
      console.error("Error saving rule:", error);
      toast({
        variant: "destructive",
        title: t('toast.error'),
        description: t('toast.serverError'),
      });
    }
  };

  const openEditRule = (rule) => {
    setEditingRule(rule);
    setRuleForm({
      business_name_pattern: rule.business_name_pattern,
      category_id: rule.category_id
    });
    setIsRuleFormOpen(true);
  };

  const handleDeleteRule = async (rule) => {
    try {
      await CategoryRule.delete(rule.id);
      toast({
        title: t('toast.success'),
        description: t('toast.ruleDeleted'),
      });
      setDeletingRule(null);
      loadData();
    } catch (error) {
      console.error("Error deleting rule:", error);
      toast({
        variant: "destructive",
        title: t('toast.error'),
        description: t('toast.serverError'),
      });
    }
  };

  const getRuleCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : t('common.uncategorized');
  };

  const toggleCategoryExpanded = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const toggleRuleExpanded = (ruleId) => {
    setExpandedRules(prev => ({
      ...prev,
      [ruleId]: !prev[ruleId]
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-2 sm:p-6" dir={isRTLLayout ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4 sm:space-y-6">
            <div className="h-6 sm:h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="h-10 bg-gray-300 rounded"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-6 overflow-x-hidden" dir={isRTLLayout ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header - Mobile Optimized */}
        <div className="bg-white rounded-lg p-3 sm:p-6 shadow-sm">
          <div className="space-y-4">
            {/* Title and Description */}
            <div className="flex items-start gap-3">
              <Shapes className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0 mt-1" />
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 break-words leading-tight">
                  {t('categories.title')}
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base leading-relaxed break-words">
                  {t('categories.subtitle')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Mobile Optimized */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir={isRTLLayout ? 'rtl' : 'ltr'}>
            <div className="border-b border-gray-200 px-3 sm:px-6">
              <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0">
                <TabsTrigger 
                  value="categories" 
                  className="flex items-center gap-2 px-3 sm:px-4 py-3 text-sm sm:text-base data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('categories.tabs.allCategories')}</span>
                  <span className="sm:hidden">{t('categories.tabs.categories')}</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="rules" 
                  className="flex items-center gap-2 px-3 sm:px-4 py-3 text-sm sm:text-base data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('categories.rules.title')}</span>
                  <span className="sm:hidden">{t('categories.tabs.rules')}</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Categories Tab Content */}
            <TabsContent value="categories" className="p-3 sm:p-6 space-y-4">
              {/* Controls - Mobile Stack */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="w-full sm:w-auto">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-48 bg-white">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent dir={isRTLLayout ? 'rtl' : 'ltr'}>
                      <SelectItem value="all">{t('categories.tabs.allCategories')}</SelectItem>
                      <SelectItem value="expense">{t('categories.tabs.expenseCategories')}</SelectItem>
                      <SelectItem value="income">{t('categories.tabs.incomeCategories')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => {
                    setEditingCategory(null);
                    setIsCategoryFormOpen(true);
                  }}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="sm:hidden">{t('categories.add')}</span>
                  <span className="hidden sm:inline">{t('categories.addCategory')}</span>
                </Button>
              </div>

              {/* Categories List - Mobile Cards */}
              {filteredCategories.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                    <FolderOpen className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                      {t('categories.empty.title')}
                    </h3>
                    <p className="text-gray-500 text-center mb-6 text-sm sm:text-base break-words px-4">
                      {t('categories.empty.description')}
                    </p>
                    <Button 
                      onClick={() => setIsCategoryFormOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t('categories.empty.addFirst')}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {/* Desktop Table View - Hidden on Mobile */}
                  <div className="hidden lg:block">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t('categories.tabs.categoryList')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className={isRTLLayout ? "text-right" : "text-left"}></TableHead>
                              <TableHead className={isRTLLayout ? "text-right" : "text-left"}>{t('categories.table.name')}</TableHead>
                              <TableHead className={isRTLLayout ? "text-right" : "text-left"}>{t('categories.table.type')}</TableHead>
                              <TableHead className={isRTLLayout ? "text-right" : "text-left"}>{t('categories.table.transactionCount')}</TableHead>
                              <TableHead className={isRTLLayout ? "text-right" : "text-left"}>{t('categories.table.actions')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredCategories.map((category) => (
                              <TableRow key={category.id}>
                                <TableCell>
                                  <IconRenderer iconName={category.icon || 'HelpCircle'} size={20} />
                                </TableCell>
                                <TableCell className="font-medium">{category.name}</TableCell>
                                <TableCell>
                                  <Badge variant={category.type === 'expense' ? 'destructive' : 'default'}>
                                    {category.type === 'expense' ? t('categories.expense') : t('categories.income')}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {getCategoryTransactionCount(category.id)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openEditCategory(category)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setDeletingCategory(category)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-3">
                    {filteredCategories.map((category) => (
                      <Card key={category.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 min-w-0 flex-1">
                                <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                                  <IconRenderer iconName={category.icon || 'HelpCircle'} size={20} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-semibold text-base break-words leading-tight">
                                    {category.name}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <Badge variant={category.type === 'expense' ? 'destructive' : 'default'} className="text-xs">
                                      {category.type === 'expense' ? t('categories.expense') : t('categories.income')}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {getCategoryTransactionCount(category.id)} {t('categories.transactions')}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Expand/Collapse Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleCategoryExpanded(category.id)}
                                className="flex-shrink-0 p-2"
                              >
                                {expandedCategories[category.id] ? 
                                  <ChevronUp className="w-4 h-4" /> : 
                                  <ChevronDown className="w-4 h-4" />
                                }
                              </Button>
                            </div>

                            {/* Expanded Content */}
                            {expandedCategories[category.id] && (
                              <div className="space-y-3 pt-3 border-t border-gray-100">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditCategory(category)}
                                    className="flex items-center gap-2"
                                  >
                                    <Edit className="w-4 h-4" />
                                    <span>{t('common.edit')}</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeletingCategory(category)}
                                    className="text-red-600 hover:text-red-700 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span>{t('common.delete')}</span>
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Rules Tab Content */}
            <TabsContent value="rules" className="p-3 sm:p-6 space-y-4">
              {/* Header and Add Button */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl font-semibold break-words">{t('categories.rules.title')}</h2>
                  <p className="text-gray-600 text-sm sm:text-base mt-1 break-words">{t('categories.rules.subtitle')}</p>
                </div>
                <Button
                  onClick={() => {
                    setEditingRule(null);
                    setRuleForm({ business_name_pattern: "", category_id: "" });
                    setRuleFormErrors({});
                    setIsRuleFormOpen(true);
                  }}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="sm:hidden">{t('categories.rules.add')}</span>
                  <span className="hidden sm:inline">{t('categories.rules.addRule')}</span>
                </Button>
              </div>

              {/* Rules List */}
              {rules.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                    <Settings className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                      {t('categories.rules.empty.title')}
                    </h3>
                    <p className="text-gray-500 text-center mb-6 text-sm sm:text-base break-words px-4">
                      {t('categories.rules.empty.description')}
                    </p>
                    <Button 
                      onClick={() => setIsRuleFormOpen(true)}
                      className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t('categories.rules.addRule')}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {/* Desktop Table View - Hidden on Mobile */}
                  <div className="hidden lg:block">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t('categories.rules.title')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className={isRTLLayout ? "text-right" : "text-left"}>{t('categories.rules.table.pattern')}</TableHead>
                              <TableHead className={isRTLLayout ? "text-right" : "text-left"}>{t('categories.rules.table.category')}</TableHead>
                              <TableHead className={isRTLLayout ? "text-right" : "text-left"}>{t('categories.rules.table.actions')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {rules.map((rule) => (
                              <TableRow key={rule.id}>
                                <TableCell className="font-mono text-sm bg-gray-50 rounded px-2 py-1">
                                  {rule.business_name_pattern}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <IconRenderer 
                                      iconName={categories.find(c => c.id === rule.category_id)?.icon || 'HelpCircle'} 
                                      size={16} 
                                    />
                                    {getRuleCategoryName(rule.category_id)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openEditRule(rule)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setDeletingRule(rule)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-3">
                    {rules.map((rule) => (
                      <Card key={rule.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Tag className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm text-gray-600">{t('categories.rules.pattern')}</span>
                                </div>
                                <div className="font-mono text-sm bg-gray-50 rounded px-3 py-2 break-all">
                                  {rule.business_name_pattern}
                                </div>
                                
                                <div className="flex items-center gap-2 mt-3">
                                  <IconRenderer 
                                    iconName={categories.find(c => c.id === rule.category_id)?.icon || 'HelpCircle'} 
                                    size={16} 
                                  />
                                  <span className="text-sm font-medium break-words">
                                    {getRuleCategoryName(rule.category_id)}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Expand/Collapse Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleRuleExpanded(rule.id)}
                                className="flex-shrink-0 p-2"
                              >
                                {expandedRules[rule.id] ? 
                                  <ChevronUp className="w-4 h-4" /> : 
                                  <ChevronDown className="w-4 h-4" />
                                }
                              </Button>
                            </div>

                            {/* Expanded Content */}
                            {expandedRules[rule.id] && (
                              <div className="space-y-3 pt-3 border-t border-gray-100">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditRule(rule)}
                                    className="flex items-center gap-2"
                                  >
                                    <Edit className="w-4 h-4" />
                                    <span>{t('common.edit')}</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeletingRule(rule)}
                                    className="text-red-600 hover:text-red-700 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span>{t('common.delete')}</span>
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Category Form Dialog - Mobile Optimized */}
        {isCategoryFormOpen && (
          <Dialog open={isCategoryFormOpen} onOpenChange={setIsCategoryFormOpen}>
            <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto" dir={isRTLLayout ? 'rtl' : 'ltr'}>
              <DialogHeader>
                <DialogTitle className="text-lg break-words">
                  {editingCategory ? t('categories.form.editTitle') : t('categories.form.addTitle')}
                </DialogTitle>
              </DialogHeader>
              <CategoryForm
                category={editingCategory}
                onSave={handleCategoryFormSubmit}
                onError={handleCategoryFormError}
                onCancel={() => {
                  setIsCategoryFormOpen(false);
                  setEditingCategory(null);
                }}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Rule Form Dialog - Mobile Optimized */}
        <Dialog open={isRuleFormOpen} onOpenChange={setIsRuleFormOpen}>
          <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto" dir={isRTLLayout ? 'rtl' : 'ltr'}>
            <DialogHeader>
              <DialogTitle className="text-lg break-words">
                {editingRule ? t('categories.rules.form.editTitle') : t('categories.rules.form.title')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRuleFormSubmit} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-2 break-words">
                  {t('categories.rules.form.description')}
                </p>
                <p className="text-xs text-blue-600 break-words">
                  {t('categories.rules.form.patternHelp')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pattern">{t('categories.rules.businessPattern')} *</Label>
                <Input
                  id="pattern"
                  type="text"
                  placeholder={t('categories.rules.patternPlaceholder')}
                  value={ruleForm.business_name_pattern}
                  onChange={(e) => setRuleForm(prev => ({
                    ...prev,
                    business_name_pattern: e.target.value
                  }))}
                  className={ruleFormErrors.business_name_pattern ? "border-red-500" : ""}
                />
                {ruleFormErrors.business_name_pattern && (
                  <p className="text-sm text-red-600">{ruleFormErrors.business_name_pattern}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">{t('categories.rules.category')} *</Label>
                <Select
                  value={ruleForm.category_id}
                  onValueChange={(value) => setRuleForm(prev => ({
                    ...prev,
                    category_id: value
                  }))}
                >
                  <SelectTrigger className={ruleFormErrors.category_id ? "border-red-500" : ""}>
                    <SelectValue placeholder={t('categories.selectCategory')} />
                  </SelectTrigger>
                  <SelectContent dir={isRTLLayout ? 'rtl' : 'ltr'} className="max-h-48">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2 w-full">
                          <IconRenderer iconName={category.icon || 'HelpCircle'} size={16} />
                          <span className="break-words flex-1">{category.name}</span>
                          <Badge variant={category.type === 'expense' ? 'destructive' : 'default'} className="text-xs">
                            {category.type === 'expense' ? t('categories.expense') : t('categories.income')}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {ruleFormErrors.category_id && (
                  <p className="text-sm text-red-600">{ruleFormErrors.category_id}</p>
                )}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  {t('categories.rules.form.examples.title')}
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• {t('categories.rules.form.examples.supermarket')}</li>
                  <li>• {t('categories.rules.form.examples.gas')}</li>
                  <li>• {t('categories.rules.form.examples.pharmacy')}</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsRuleFormOpen(false)}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  {t('common.cancel')}
                </Button>
                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto order-1 sm:order-2"
                >
                  {editingRule ? t('common.save') : t('common.add')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Category Dialog */}
        <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
          <AlertDialogContent dir={isRTLLayout ? 'rtl' : 'ltr'} className="w-[95vw] max-w-md mx-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="break-words">{t('categories.dialogs.deleteCategory')}</AlertDialogTitle>
              <AlertDialogDescription className="break-words">
                {t('categories.dialogs.deleteCategoryDescription', { name: deletingCategory?.name })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="w-full sm:w-auto">{t('categories.dialogs.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDeleteCategory(deletingCategory)}
                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
              >
                {t('categories.dialogs.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Rule Dialog */}
        <AlertDialog open={!!deletingRule} onOpenChange={() => setDeletingRule(null)}>
          <AlertDialogContent dir={isRTLLayout ? 'rtl' : 'ltr'} className="w-[95vw] max-w-md mx-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="break-words">{t('categories.rules.deleteRule')}</AlertDialogTitle>
              <AlertDialogDescription className="break-words">
                {t('categories.rules.deleteRuleDescription', { pattern: deletingRule?.business_name_pattern })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="w-full sm:w-auto">{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDeleteRule(deletingRule)}
                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
              >
                {t('common.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}