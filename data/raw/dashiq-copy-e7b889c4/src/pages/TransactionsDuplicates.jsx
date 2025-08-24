
import React, { useState, useEffect, useCallback } from 'react';
import { Transaction } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { 
  Search, 
  Trash2, 
  EyeOff, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  ArrowLeft,
  Users,
  FileSearch
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { t, isRTL, formatCurrency, formatDate } from '@/components/utils/i18n';

export default function TransactionsDuplicatesPage() {
  const [transactions, setTransactions] = useState([]);
  const [duplicateSets, setDuplicateSets] = useState([]);
  const [selectedToDelete, setSelectedToDelete] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [expandedSets, setExpandedSets] = useState({});
  const { toast } = useToast();
  const isRTLLayout = isRTL();

  // Load transactions and find duplicates
  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await Transaction.list('-date', 5000);
      setTransactions(data);
      findDuplicates(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({
        title: t('common.error'),
        description: t('transactions.messages.loadingError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, t]);

  // Find duplicate transactions
  const findDuplicates = (transactionsList) => {
    const duplicates = [];
    const processed = new Set();
    
    for (let i = 0; i < transactionsList.length; i++) {
      if (processed.has(transactionsList[i].id)) continue;
      
      const currentTransaction = transactionsList[i];
      const similarTransactions = [currentTransaction];
      
      for (let j = i + 1; j < transactionsList.length; j++) {
        if (processed.has(transactionsList[j].id)) continue;
        
        const otherTransaction = transactionsList[j];
        
        // Check for potential duplicates based on business name, amount, and date proximity
        const isSimilar = 
          currentTransaction.business_name === otherTransaction.business_name &&
          Math.abs(currentTransaction.billing_amount - otherTransaction.billing_amount) < 0.01 &&
          Math.abs(new Date(currentTransaction.date) - new Date(otherTransaction.date)) < 24 * 60 * 60 * 1000; // Within 24 hours
        
        if (isSimilar) {
          similarTransactions.push(otherTransaction);
          processed.add(otherTransaction.id);
        }
      }
      
      if (similarTransactions.length > 1) {
        const allTransactionsReviewed = similarTransactions.every(t => t.is_reviewed_duplicate);
        
        if (!allTransactionsReviewed) {
          duplicates.push(similarTransactions);
        }
      }
      
      processed.add(currentTransaction.id);
    }
    
    setDuplicateSets(duplicates);
  };

  // Handle transaction selection
  const handleToggleSelection = (transactionId) => {
    setSelectedToDelete(prev => ({
      ...prev,
      [transactionId]: !prev[transactionId]
    }));
  };

  // Handle set expansion
  const toggleSetExpansion = (setIndex) => {
    setExpandedSets(prev => ({
      ...prev,
      [setIndex]: !prev[setIndex]
    }));
  };

  // Handle resolution
  const handleResolve = async () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    
    try {
      const idsToDelete = Object.keys(selectedToDelete).filter(id => selectedToDelete[id]);
      
      if (idsToDelete.length === 0) {
        toast({
          title: t('common.warning'),
          description: t('transactions.duplicates.selectTransactions'),
          variant: 'destructive',
        });
        setIsProcessing(false);
        return;
      }

      // Delete selected transactions
      for (let i = 0; i < idsToDelete.length; i++) {
        await Transaction.delete(idsToDelete[i]);
        setProcessingProgress(((i + 1) / idsToDelete.length) * 50);
      }

      // Mark ONLY remaining transactions in AFFECTED sets as reviewed
      const affectedSets = duplicateSets.filter(set => 
        set.some(t => idsToDelete.includes(t.id))
      );

      const setsToMarkReviewed = [];
      affectedSets.forEach(set => {
        const survivingTransactions = set.filter(t => !idsToDelete.includes(t.id));
        setsToMarkReviewed.push(...survivingTransactions);
      });

      // Mark only surviving transactions from affected sets as reviewed
      for (let i = 0; i < setsToMarkReviewed.length; i++) {
        const transaction = setsToMarkReviewed[i];
        await Transaction.update(transaction.id, { 
          ...transaction, 
          is_reviewed_duplicate: true 
        });
        setProcessingProgress(50 + ((i + 1) / setsToMarkReviewed.length) * 50);
      }

      toast({
        title: t('common.success'),
        description: t('transactions.duplicates.deletedAndMarkedSuccess', { 
          deleted: idsToDelete.length, 
          marked: setsToMarkReviewed.length 
        }),
      });

      setSelectedToDelete({});
      setExpandedSets({});
      loadTransactions();
      
    } catch (error) {
      console.error('Error resolving duplicates:', error);
      toast({
        title: t('common.error'),
        description: t('transactions.messages.savingError'),
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  // Handle ignore set
  const handleIgnoreSet = async (set) => {
    setIsProcessing(true);
    try {
      for (const transaction of set) {
        await Transaction.update(transaction.id, { 
          ...transaction, 
          is_reviewed_duplicate: true 
        });
      }
      
      toast({
        title: t('common.success'),
        description: t('transactions.duplicates.groupMarkedAndRemoved'),
      });
      
      loadTransactions();
    } catch (error) {
      console.error('Error ignoring set:', error);
      toast({
        title: t('common.error'),
        description: t('transactions.messages.savingError'),
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir={isRTLLayout ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-700 mb-2">
            {t('transactions.duplicates.processing', { progress: 0 })}
          </h2>
          <p className="text-sm text-gray-500">
            {t('transactions.duplicates.processingDuplicates')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-1 sm:p-4 md:p-6 overflow-x-hidden" dir={isRTLLayout ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto space-y-3 sm:space-y-6">
        {/* Header - Mobile Optimized */}
        <div className="bg-white rounded-lg p-3 sm:p-6 shadow-sm">
          <div className="flex flex-col space-y-3">
            {/* Back button and title - Stack on mobile */}
            <div className="flex items-start gap-3">
              <Link 
                to={createPageUrl('Transactions')} 
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors flex-shrink-0 mt-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">{t('common.back')}</span>
              </Link>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2 mb-2">
                  <FileSearch className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-words">
                      {t('transactions.duplicates.title')}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed break-words">
                      {t('transactions.duplicates.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons - Full width on mobile, stacked */}
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 sm:justify-end">
              <Button
                onClick={loadTransactions}
                disabled={isLoading || isProcessing}
                variant="outline"
                className="w-full sm:w-auto text-sm h-9 sm:h-10"
              >
                <Search className="w-4 h-4 mr-2" />
                {isLoading ? t('common.loading') : t('transactions.duplicates.searchAgain')}
              </Button>
              
              {Object.keys(selectedToDelete).some(key => selectedToDelete[key]) && (
                <Button
                  onClick={handleResolve}
                  disabled={isProcessing}
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white text-sm h-9 sm:h-10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('transactions.duplicates.deleteSelected', { 
                    count: Object.keys(selectedToDelete).filter(key => selectedToDelete[key]).length 
                  })}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Processing Progress */}
        {isProcessing && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {t('transactions.duplicates.processing', { progress: Math.round(processingProgress) })}
                </span>
              </div>
              <Progress value={processingProgress} className="w-full" />
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards - Mobile Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-3 sm:p-6 text-center">
              <Users className="w-6 h-6 sm:w-10 sm:h-10 text-orange-600 mx-auto mb-2" />
              <h3 className="text-base sm:text-xl font-bold text-orange-800">{duplicateSets.length}</h3>
              <p className="text-xs sm:text-sm text-orange-600 font-medium leading-tight">
                {t('transactions.duplicates.duplicateGroups')}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-3 sm:p-6 text-center">
              <FileSearch className="w-6 h-6 sm:w-10 sm:h-10 text-blue-600 mx-auto mb-2" />
              <h3 className="text-base sm:text-xl font-bold text-blue-800">{transactions.length}</h3>
              <p className="text-xs sm:text-sm text-blue-600 font-medium leading-tight">
                {t('transactions.duplicates.totalTransactions')}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-3 sm:p-6 text-center">
              <CheckCircle className="w-6 h-6 sm:w-10 sm:h-10 text-green-600 mx-auto mb-2" />
              <h3 className="text-base sm:text-xl font-bold text-green-800">
                {Object.keys(selectedToDelete).filter(key => selectedToDelete[key]).length}
              </h3>
              <p className="text-xs sm:text-sm text-green-600 font-medium leading-tight">
                {t('transactions.duplicates.selectedForDeletion')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Duplicate Sets List */}
        {duplicateSets.length === 0 ? (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 sm:p-8 text-center">
              <CheckCircle className="w-10 h-10 sm:w-16 sm:h-16 text-green-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-xl font-bold text-green-800 mb-2">
                {t('transactions.duplicates.noDuplicatesFound')}
              </h3>
              <p className="text-sm text-green-700 leading-relaxed">
                {t('transactions.duplicates.noDuplicatesDescription')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3 sm:space-y-6">
            {/* Groups Title - Mobile Optimized */}
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
              <h2 className="text-base sm:text-xl font-bold text-gray-800 flex items-center gap-2 break-words">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600 flex-shrink-0" />
                <span className="min-w-0">{t('transactions.duplicates.duplicateGroupsTitle', { count: duplicateSets.length })}</span>
              </h2>
            </div>

            {duplicateSets.map((set, setIndex) => {
              const isExpanded = expandedSets[setIndex];
              const reviewedInSet = set.filter(t => t.is_reviewed_duplicate).length;
              
              return (
                <Card key={setIndex} className="overflow-hidden border-l-4 border-l-orange-400">
                  {/* Card Header - Mobile Optimized */}
                  <CardHeader className="bg-orange-50 p-3 sm:p-4">
                    <div className="space-y-3">
                      {/* Group Info */}
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 flex-shrink-0 text-xs">
                          {setIndex + 1}
                        </Badge>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-sm sm:text-lg text-gray-800 break-words leading-tight">
                            {set[0]?.business_name}
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs text-gray-600 mt-1">
                            <span>{formatDate(set[0]?.date)}</span>
                            <span>•</span>
                            <span>{formatCurrency(set[0]?.billing_amount)}</span>
                            <span>•</span>
                            <span>{t('transactions.duplicates.transactionsCount', { count: set.length })}</span>
                          </div>
                          {reviewedInSet > 0 && reviewedInSet < set.length && (
                            <Badge variant="secondary" className="text-xs mt-2">
                              {t('transactions.duplicates.partiallyReviewed')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons - Full width on mobile, stacked */}
                      <div className="flex flex-col sm:flex-row gap-2 w-full">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSetExpansion(setIndex)}
                          className="w-full sm:w-auto text-xs h-8 justify-center"
                        >
                          {isExpanded ? t('transactions.duplicates.hideDetails') : t('transactions.duplicates.showDetails')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleIgnoreSet(set)}
                          className="w-full sm:w-auto text-xs h-8 justify-center"
                          disabled={isProcessing}
                        >
                          <EyeOff className="w-3 h-3 mr-1" />
                          {t('transactions.duplicates.ignoreGroup')}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        {/* Mobile Layout - Card-based */}
                        <div className="sm:hidden">
                          {set.map((transaction) => (
                            <div key={transaction.id} className="border-b border-gray-100 last:border-b-0 p-3">
                              <div className="space-y-3">
                                {/* Transaction Header */}
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-3 min-w-0">
                                    <Checkbox
                                      checked={selectedToDelete[transaction.id] || false}
                                      onCheckedChange={() => handleToggleSelection(transaction.id)}
                                      disabled={transaction.is_reviewed_duplicate || isProcessing}
                                      className="mt-0.5 flex-shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <div className="font-medium text-gray-900 text-sm break-words">
                                        {transaction.business_name}
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1">
                                        {formatDate(transaction.date)}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <div className="font-semibold text-gray-900 text-sm">
                                      {formatCurrency(transaction.billing_amount)}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Transaction Footer */}
                                <div className="flex items-center justify-between">
                                  <Badge 
                                    variant={transaction.is_reviewed_duplicate ? "secondary" : "destructive"}
                                    className="text-xs"
                                  >
                                    {transaction.is_reviewed_duplicate ? 
                                      t('transactions.duplicates.reviewed') : 
                                      t('transactions.duplicates.notReviewed')
                                    }
                                  </Badge>
                                  <div className="text-xs text-gray-500 font-mono">
                                    {t('transactions.duplicates.id')}: {transaction.id.substring(0, 8)}...
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Desktop Layout - Table */}
                        <div className="hidden sm:block">
                          {/* Table Headers */}
                          <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 text-sm font-medium text-gray-700 border-b">
                            <div>{t('transactions.duplicates.select')}</div>
                            <div>{t('transactions.duplicates.date')}</div>
                            <div>{t('transactions.duplicates.businessName')}</div>
                            <div>{t('transactions.duplicates.amount')}</div>
                            <div>{t('transactions.duplicates.status')}</div>
                            <div>{t('transactions.duplicates.id')}</div>
                          </div>

                          {/* Table Rows */}
                          {set.map((transaction) => (
                            <div key={transaction.id} className="grid grid-cols-6 gap-4 p-4 items-center text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                              <div>
                                <Checkbox
                                  checked={selectedToDelete[transaction.id] || false}
                                  onCheckedChange={() => handleToggleSelection(transaction.id)}
                                  disabled={transaction.is_reviewed_duplicate || isProcessing}
                                />
                              </div>
                              <div className="text-gray-600">
                                {formatDate(transaction.date)}
                              </div>
                              <div className="font-medium text-gray-900 truncate" title={transaction.business_name}>
                                {transaction.business_name}
                              </div>
                              <div className="font-semibold text-gray-900">
                                {formatCurrency(transaction.billing_amount)}
                              </div>
                              <div>
                                <Badge 
                                  variant={transaction.is_reviewed_duplicate ? "secondary" : "destructive"}
                                  className="text-xs"
                                >
                                  {transaction.is_reviewed_duplicate ? 
                                    t('transactions.duplicates.reviewed') : 
                                    t('transactions.duplicates.notReviewed')
                                  }
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-500 font-mono truncate" title={transaction.id}>
                                {transaction.id.substring(0, 8)}...
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
