
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings as SettingsIcon,
  Globe,
  Bell,
  Database,
  Save,
  AlertTriangle,
  Trash2,
  Loader2,
  Download, // Added for backup
  Upload, // Added for restore
  AlertCircle // Added for restore warning
} from "lucide-react";
import { User as UserEntity } from "@/api/entities";
import { Transaction } from "@/api/entities"; // Added for backup/restore
import { Category } from "@/api/entities"; // Added for backup/restore
import { Budget } from "@/api/entities"; // Added for backup/restore
import { CategoryRule } from "@/api/entities"; // Added for backup/restore
import { t, getCurrentLanguage, isRTL, getLanguageInfo, useI18n } from '@/components/utils/i18n';
import { initializeUserData } from '@/components/utils/initializeUser'; // Added for clean state process

// Helper function to process deletions serially to avoid rate limiting
const processSerially = async (items, processFn, delay = 100) => {
  console.log(`Serially processing ${items.length} items...`);
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      await processFn(item);
      console.log(`Processed item ${i + 1}/${items.length} (ID: ${item.id})`);
    } catch (err) {
      console.warn(`Failed to process item ${item.id}: ${err.message}. Continuing...`);
    }
    // Always delay to be cautious with rate limits
    if (i + 1 < items.length) {
       await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  console.log('Serial processing complete.');
};


// Default preferences for the useUserPreferences hook - UPDATED to remove timeZone and appearance settings
const DEFAULT_USER_DISPLAY_PREFERENCES = {
  displayCurrency: "ILS",
  dateFormat: "DD/MM/YYYY",
  emailNotifications: true,
  pushNotifications: false,
  smsNotifications: false,
  budgetAlerts: true,
  monthlyReports: true,
  transactionAlerts: false,
};

/**
 * Custom hook to manage user display preferences.
 * Handles loading, updating, and providing access to user display settings.
 */
const useUserPreferences = () => {
  const [preferences, setPreferences] = useState(DEFAULT_USER_DISPLAY_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const loadPreferences = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await UserEntity.me();
      if (user.display_preferences) {
        // Map API response to flat preferences state, removing timeZone and appearance settings
        setPreferences(prev => ({
          ...DEFAULT_USER_DISPLAY_PREFERENCES, // Start with defaults
          displayCurrency: user.display_preferences.displayCurrency ?? DEFAULT_USER_DISPLAY_PREFERENCES.displayCurrency,
          dateFormat: user.display_preferences.dateFormat ?? DEFAULT_USER_DISPLAY_PREFERENCES.dateFormat,
          // Overlay and flatten notification preferences
          emailNotifications: user.display_preferences.notifications?.email ?? DEFAULT_USER_DISPLAY_PREFERENCES.emailNotifications,
          pushNotifications: user.display_preferences.notifications?.push ?? DEFAULT_USER_DISPLAY_PREFERENCES.pushNotifications,
          smsNotifications: user.display_preferences.notifications?.sms ?? DEFAULT_USER_DISPLAY_PREFERENCES.smsNotifications,
          budgetAlerts: user.display_preferences.notifications?.budgetAlerts ?? DEFAULT_USER_DISPLAY_PREFERENCES.budgetAlerts,
          monthlyReports: user.display_preferences.notifications?.monthlyReports ?? DEFAULT_USER_DISPLAY_PREFERENCES.monthlyReports,
          transactionAlerts: user.display_preferences.notifications?.transactionAlerts ?? DEFAULT_USER_DISPLAY_PREFERENCES.transactionAlerts,
        }));
      }
    } catch (error) {
      console.error("Error loading user preferences:", error);
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: t('errors.loadingData'),
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  /**
   * Updates user preferences on the server and locally.
   * Takes a partial object of preferences to update.
   */
  const updatePreferences = async (newPreferencesPartial) => {
    setIsSaving(true);
    let success = false;
    const previousPreferences = preferences; // Store current state for potential rollback

    // Optimistically update local state
    const updatedPreferencesState = { ...preferences, ...newPreferencesPartial };
    setPreferences(updatedPreferencesState);

    try {
      // Map flat preferences state back to API structure, removing timeZone and appearance settings
      const updatedDisplayPreferences = {
        displayCurrency: updatedPreferencesState.displayCurrency,
        dateFormat: updatedPreferencesState.dateFormat,
        notifications: {
          email: updatedPreferencesState.emailNotifications,
          push: updatedPreferencesState.pushNotifications,
          sms: updatedPreferencesState.smsNotifications,
          budgetAlerts: updatedPreferencesState.budgetAlerts,
          monthlyReports: updatedPreferencesState.monthlyReports,
          transactionAlerts: updatedPreferencesState.transactionAlerts
        }
      };

      const updatePayload = {
        display_preferences: updatedDisplayPreferences
      };

      await UserEntity.updateMyUserData(updatePayload);
      success = true;
      toast({
        title: t('toast.success'),
        description: t('toast.settingsSaved'),
      });
      return { success: true };
    } catch (error) {
      console.error("Error saving user preferences:", error);
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: t('errors.savingData'),
      });
      // Rollback local state on error
      setPreferences(previousPreferences);
      return { success: false, error: error };
    } finally {
      setIsSaving(false);
    }
  };

  const refreshPreferences = useCallback(async () => {
    await loadPreferences();
  }, [loadPreferences]);

  return { preferences, isLoading, isSaving, updatePreferences, refreshPreferences };
};

/**
 * Component for General Settings tab.
 * Manages currency and date format.
 * Saves changes immediately upon interaction.
 *
 * @param {object} props
 * @param {object} props.userPreferences - The current user preferences from the useUserPreferences hook.
 * @param {function} props.onUpdate - Function to call to update preferences.
 * @param {boolean} props.isLoading - Combined loading/saving state.
 */
const GeneralSettings = ({ userPreferences, onUpdate, isLoading }) => {

  const handleSave = async (newPreferencesPartial) => {
    const result = await onUpdate(newPreferencesPartial); // onUpdate hook handles its own toasts
    if (result.success) {
      // Special handling for currency change: only reload if currency actually changed and save was successful
      if (newPreferencesPartial.displayCurrency && newPreferencesPartial.displayCurrency !== userPreferences.displayCurrency) {
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        }, 1000);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.general')}</CardTitle>
        <CardDescription>{t('settings.generalDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Currency Selection - UPDATED to only include ILS and USD */}
        <div className="space-y-2">
          <Label htmlFor="currency-select">{t('settings.selectCurrency')}</Label>
          <Select
            value={userPreferences.displayCurrency}
            onValueChange={(value) => {
              handleSave({ displayCurrency: value });
            }}
            disabled={isLoading}
          >
            <SelectTrigger id="currency-select" className="w-full">
              <SelectValue placeholder={t('settings.selectCurrency')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ILS">
                <div className="flex items-center gap-2">
                  <span>₪</span>
                  <span>{t('currencies.ILS', 'Israeli Shekel')}</span>
                </div>
              </SelectItem>
              <SelectItem value="USD">
                <div className="flex items-center gap-2">
                  <span>$</span>
                  <span>{t('currencies.USD', 'US Dollar')}</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500 mt-1">
            {t('settings.currencyDescription')}
          </p>
        </div>

        {/* Date Format */}
        <div className="space-y-2">
          <Label htmlFor="dateFormat-select">{t('settings.selectDateFormat')}</Label>
          <Select
            value={userPreferences.dateFormat}
            onValueChange={(value) => handleSave({ dateFormat: value })}
            disabled={isLoading}
          >
            <SelectTrigger id="dateFormat-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Time Zone - REMOVED */}
      </CardContent>
    </Card>
  );
};


export default function SettingsPage() {
  const { toast } = useToast();
  const { currentLanguage, changeLanguage, availableLanguages } = useI18n();

  // Use the new useUserPreferences hook for all display-related settings
  const { preferences, isLoading: preferencesLoading, isSaving: preferencesSaving, updatePreferences } = useUserPreferences();

  // Ensure availableLanguages is always an array for mapping
  const languagesArray = Array.isArray(availableLanguages)
    ? availableLanguages
    : Object.values(availableLanguages || {});

  const [isLanguageSaving, setIsLanguageSaving] = useState(false); // Only for language
  const [activeTab, setActiveTab] = useState("general");
  const isRTLLayout = isRTL();

  // Language remains a separate state as it's directly tied to i18n context
  const [language, setLanguage] = useState(currentLanguage);

  // Backup/Restore states
  const [backupData, setBackupData] = useState(null); // This state is not directly used in the logic, but kept as per outline.
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);
  const [backupFile, setBackupFile] = useState(null);

  useEffect(() => {
    // Set initial language from i18n context after it's loaded
    setLanguage(currentLanguage);
  }, [currentLanguage]);

  const saveLanguagePreferences = async () => {
    setIsLanguageSaving(true);
    try {
      if (language !== currentLanguage) {
        changeLanguage(language);
        toast({
          title: t('toast.success'),
          description: t('toast.languageChanged'),
        });
      } else {
        toast({
          title: t('toast.info'),
          description: t('settings.noLanguageChange'),
        });
      }
    } catch (error) {
      console.error("Error saving language preferences:", error);
      toast({
        variant: "destructive",
        title: t('toast.error'),
        description: t('toast.serverError'),
      });
    } finally {
      setIsLanguageSaving(false);
    }
  };

  // Handler for clean state success
  const handleCleanStateSuccess = (result) => {
    if (result.success) {
      const totalDeleted = result.deletedCounts.transactions + result.deletedCounts.budgets + result.deletedCounts.categories;

      if (totalDeleted > 0) {
        toast({
          title: t('toast.cleanState.successTitle'),
          description: t('toast.cleanState.successDescription', {
            totalDeleted,
            transactions: result.deletedCounts.transactions || 0,
            budgets: result.deletedCounts.budgets || 0,
            categories: result.deletedCounts.categories || 0
          }),
          duration: 8000,
        });
      } else {
        toast({
          title: t('toast.cleanState.noDataDeletedTitle'),
          description: t('toast.cleanState.noDataDeletedDescription'),
        });
      }

      if (result.categoriesRestored && result.categoriesRestored.count > 0) {
        setTimeout(() => {
          toast({
            title: t('toast.cleanState.categoriesRestoredTitle'),
            description: t('toast.cleanState.categoriesRestoredDescription', {
              count: result.categoriesRestored.count
            }),
            duration: 6000,
          });
        }, 2000);
      }

      // Force page reload after showing success message
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }, 3000);
    }
  };

  // Create backup functionality
  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      // Fetch all user data
      const [transactionsData, categoriesData, budgetsData, categoryRulesData] = await Promise.all([
        Transaction.list(),
        Category.list(),
        Budget.list(),
        CategoryRule.list()
      ]);

      const currentUser = await UserEntity.me();

      const backupData = {
        version: "1.0",
        createdAt: new Date().toISOString(),
        user: {
          email: currentUser.email,
          full_name: currentUser.full_name,
          display_preferences: currentUser.display_preferences
        },
        data: {
          transactions: transactionsData,
          categories: categoriesData,
          budgets: budgetsData,
          categoryRules: categoryRulesData
        },
        counts: {
          transactions: transactionsData.length,
          categories: categoriesData.length,
          budgets: budgetsData.length,
          categoryRules: categoryRulesData.length
        }
      };

      // Create downloadable file
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `dashiq-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      toast({
        title: t('settings.backup.backupCreated'),
        description: t('settings.backup.backupCreatedDescription'),
        variant: "default"
      });

    } catch (error) {
      console.error('Error creating backup:', error);
      toast({
        title: t('settings.backup.backupError'),
        description: t('settings.backup.backupErrorDescription'),
        variant: "destructive"
      });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  // Handle backup file selection
  const handleBackupFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      setBackupFile(file);
    } else {
      setBackupFile(null); // Clear invalid file
      toast({
        title: t('settings.backup.invalidFile'),
        description: t('settings.backup.invalidFileDescription'),
        variant: "destructive"
      });
    }
  };

  // Restore from backup functionality
  const handleRestoreBackup = async () => {
    if (!backupFile) {
      toast({
        title: t('settings.backup.noFileSelected'),
        description: t('settings.backup.noFileSelectedDescription'),
        variant: "destructive"
      });
      return;
    }

    setIsRestoringBackup(true);
    try {
      // Read the backup file
      const fileContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(backupFile);
      });

      let backupData;
      try {
        backupData = JSON.parse(fileContent);
      } catch (parseError) {
        throw new Error(t('settings.backup.invalidBackupFile'));
      }

      // Validate backup structure
      if (!backupData.data || !backupData.version) {
        throw new Error(t('settings.backup.invalidBackupStructure'));
      }

      // Show confirmation dialog (this would be better with a proper dialog)
      const confirmed = window.confirm(
        t('settings.backup.restoreConfirmation') + '\n\n' +
        `${t('settings.backup.backupCreated')}: ${new Date(backupData.createdAt).toLocaleString()}\n` +
        `${t('dashboard.transactions')}: ${backupData.counts?.transactions || 0}\n` +
        `${t('navigation.categoryManagement')}: ${backupData.counts?.categories || 0}\n` +
        `${t('navigation.budget')}: ${backupData.counts?.budgets || 0}\n` +
        `${t('settings.backup.categoryRules')}: ${backupData.counts?.categoryRules || 0}`
      );

      if (!confirmed) {
        setIsRestoringBackup(false);
        return;
      }
      
      toast({
        title: t('settings.backup.clearingDataTitle', 'Clearing existing data...'),
        description: t('settings.backup.clearingDataDescription', 'This may take a few moments.'),
        duration: 5000
      });

      // Clear existing data first using serial processing
      const existingTransactions = await Transaction.list();
      const existingCategories = await Category.list();
      const existingBudgets = await Budget.list();
      const existingRules = await CategoryRule.list();

      // Delete existing data in an order that respects dependencies
      await processSerially(existingTransactions, (item) => Transaction.delete(item.id));
      await processSerially(existingRules, (item) => CategoryRule.delete(item.id));
      await processSerially(existingBudgets, (item) => Budget.delete(item.id));
      await processSerially(existingCategories, (item) => Category.delete(item.id));
      
      toast({
        title: t('settings.backup.restoringDataTitle', 'Restoring data...'),
        description: t('settings.backup.restoringDataDescription', 'Please wait while we restore your information from the backup file.'),
        duration: 8000
      });

      // Restore data from backup
      const { transactions, categories, budgets, categoryRules } = backupData.data;

      const oldToNewCategoryMap = new Map();
      const oldToNewBudgetMap = new Map(); // If transactions reference budget_id

      // 1. Restore categories first and build ID map
      if (categories && categories.length > 0) {
        for (const category of categories) {
          const { id: oldCategoryId, created_date, updated_date, created_by, ...categoryData } = category;
          try {
            const newCategory = await Category.create(categoryData);
            oldToNewCategoryMap.set(oldCategoryId, newCategory.id);
          } catch (catError) {
            console.error(`Error creating category ${oldCategoryId}:`, catError);
            toast({
              title: t('toast.error'),
              description: t('settings.backup.categoryRestoreError', { category: category.name || oldCategoryId }),
              variant: "destructive"
            });
          }
        }
      }

      // 2. Restore budgets (they might reference categories)
      if (budgets && budgets.length > 0) {
        for (const budget of budgets) {
          const { id: oldBudgetId, created_date, updated_date, created_by, category_id, ...budgetData } = budget;
          const newCategoryId = category_id ? oldToNewCategoryMap.get(category_id) : undefined;

          try {
            const newBudget = await Budget.create({
              ...budgetData,
              ...(category_id && newCategoryId && { category_id: newCategoryId }) // Only add if mapped
            });
            oldToNewBudgetMap.set(oldBudgetId, newBudget.id); // For potential transaction budget_id mapping
          } catch (budError) {
            console.error(`Error creating budget ${oldBudgetId}:`, budError);
            toast({
              title: t('toast.error'),
              description: t('settings.backup.budgetRestoreError', { budget: budget.name || oldBudgetId }),
              variant: "destructive"
            });
          }
        }
      }

      // 3. Restore category rules (they reference categories)
      if (categoryRules && categoryRules.length > 0) {
        for (const rule of categoryRules) {
          const { id, created_date, updated_date, created_by, category_id, ...ruleData } = rule;
          const newCategoryId = oldToNewCategoryMap.get(category_id);
          if (category_id && !newCategoryId) {
              console.warn(`Category with old ID ${category_id} not found for rule ${id}. Skipping category assignment for rule.`);
          }
          try {
            await CategoryRule.create({
              ...ruleData,
              ...(newCategoryId && { category_id: newCategoryId }) // Only add if mapped
            });
          } catch (ruleError) {
            console.error(`Error creating rule ${id}:`, ruleError);
            toast({
              title: t('toast.error'),
              description: t('settings.backup.ruleRestoreError', { rule: rule.pattern || id }),
              variant: "destructive"
            });
          }
        }
      }

      // 4. Restore transactions serially
      if (transactions && transactions.length > 0) {
        toast({
          title: t('settings.backup.restoringTransactionsTitle', 'Restoring Transactions...'),
          description: t('settings.backup.restoringTransactionsDescription', {
            count: transactions.length,
          }),
        });

        const createTransaction = async (transaction) => {
          const { id: oldTransactionId, created_date, updated_date, created_by, category_id: oldCategoryId, budget_id: oldBudgetId, ...transactionData } = transaction;

          const newCategoryId = oldCategoryId ? oldToNewCategoryMap.get(oldCategoryId) : undefined;
          const newBudgetId = oldBudgetId ? oldToNewBudgetMap.get(oldBudgetId) : undefined;
          
          // Ensure required fields have valid values
          transactionData.billing_amount = Number(transactionData.billing_amount) || 0;
          transactionData.transaction_amount = Number(transactionData.transaction_amount) || transactionData.billing_amount;
          transactionData.date = transactionData.date || new Date().toISOString().split('T')[0];
          transactionData.business_name = transactionData.business_name || 'Unnamed Transaction';

          if (oldCategoryId && !newCategoryId) {
              console.warn(`Category with old ID ${oldCategoryId} not found for transaction ${oldTransactionId}. Transaction might be restored without category.`);
          }
          if (oldBudgetId && !newBudgetId) {
              console.warn(`Budget with old ID ${oldBudgetId} not found for transaction ${oldTransactionId}. Transaction might be restored without budget.`);
          }

          await Transaction.create({
            ...transactionData,
            ...(newCategoryId && { category_id: newCategoryId }),
            ...(newBudgetId && { budget_id: newBudgetId })
          });
        };
        
        // Use the serial helper to create transactions one by one
        await processSerially(transactions, createTransaction, 100);
      }

      // Update user preferences if available
      if (backupData.user?.display_preferences) {
        await UserEntity.updateMyUserData({
          display_preferences: backupData.user.display_preferences
        });
      }

      toast({
        title: t('settings.backup.restoreSuccess'),
        description: t('settings.backup.restoreSuccessDescription'),
        variant: "default"
      });

      // Reset file input
      setBackupFile(null);
      const fileInput = document.getElementById('backup-file-input');
      if (fileInput) {
        fileInput.value = '';
      }

      // Refresh the page after a short delay to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('Error restoring backup:', error);

      let description = error.message || t('settings.backup.restoreErrorDescription');
      if (error.message.includes('JSON')) {
        description = t('settings.backup.invalidBackupFile');
      } else if (error.message.includes('invalidBackupStructure')) {
        description = t('settings.backup.invalidBackupStructure');
      }

      toast({
        title: t('settings.backup.restoreError'),
        description: description,
        variant: "destructive"
      });
    } finally {
      setIsRestoringBackup(false);
    }
  };

  // Overall loading state for the main component
  const isLoadingOverall = preferencesLoading;

  if (isLoadingOverall) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8" dir={isRTLLayout ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-blue-600" />
            {t('settings.title')}
          </h1>
          <p className="text-gray-600 mt-1">{t('settings.subtitle')}</p>
        </div>
        {/* Main Save button now only saves language, as other settings save on change */}
        <Button
          onClick={saveLanguagePreferences}
          disabled={isLanguageSaving || preferencesSaving}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLanguageSaving ? t('common.loading') : t('common.save')}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Changed grid-cols from 5 to 4 and removed Appearance tab trigger */}
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">
            <Globe className="w-4 h-4 mr-2" />
            {t('settings.tabs.general')}
          </TabsTrigger>
          {/* Appearance Tab Trigger REMOVED */}
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            {t('settings.tabs.notifications')}
          </TabsTrigger>
          <TabsTrigger value="backup">
            <Database className="w-4 h-4 mr-2" />
            {t('settings.tabs.backup')}
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <AlertTriangle className="w-4 h-4 mr-2" />
            {t('settings.tabs.advanced')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <GeneralSettings userPreferences={preferences} onUpdate={updatePreferences} isLoading={preferencesLoading || preferencesSaving} />
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.languageSettings')}</CardTitle>
              <CardDescription>{t('settings.languageDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language Settings */}
              <div className="space-y-2">
                <Label htmlFor="language-select">{t('settings.selectLanguage')}</Label>
                <Select value={language} onValueChange={setLanguage} disabled={preferencesSaving}>
                  <SelectTrigger id="language-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languagesArray.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.flag} {lang.nativeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab Content REMOVED */}

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.notifications')}</CardTitle>
              <CardDescription>{t('settings.notificationsDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNotifications-switch">{t('settings.emailNotifications')}</Label>
                <Switch
                  id="emailNotifications-switch"
                  checked={preferences.emailNotifications}
                  onCheckedChange={(value) => updatePreferences({ emailNotifications: value })}
                  disabled={preferencesSaving}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="pushNotifications-switch">{t('settings.pushNotifications')}</Label>
                <Switch
                  id="pushNotifications-switch"
                  checked={preferences.pushNotifications}
                  onCheckedChange={(value) => updatePreferences({ pushNotifications: value })}
                  disabled={preferencesSaving}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="smsNotifications-switch">{t('settings.smsNotifications')}</Label>
                <Switch
                  id="smsNotifications-switch"
                  checked={preferences.smsNotifications}
                  onCheckedChange={(value) => updatePreferences({ smsNotifications: value })}
                  disabled={preferencesSaving}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="budgetAlerts-switch">{t('settings.budgetAlerts')}</Label>
                <Switch
                  id="budgetAlerts-switch"
                  checked={preferences.budgetAlerts}
                  onCheckedChange={(value) => updatePreferences({ budgetAlerts: value })}
                  disabled={preferencesSaving}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="monthlyReports-switch">{t('settings.monthlyReports')}</Label>
                <Switch
                  id="monthlyReports-switch"
                  checked={preferences.monthlyReports}
                  onCheckedChange={(value) => updatePreferences({ monthlyReports: value })}
                  disabled={preferencesSaving}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="transactionAlerts-switch">{t('settings.transactionAlerts')}</Label>
                <Switch
                  id="transactionAlerts-switch"
                  checked={preferences.transactionAlerts}
                  onCheckedChange={(value) => updatePreferences({ transactionAlerts: value })}
                  disabled={preferencesSaving}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Tab Content - Full implementation of Backup/Restore */}
        <TabsContent value="backup" className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">{t('settings.backup.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('settings.backup.description')}
            </p>
          </div>

          {/* Create Backup Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                {t('settings.backup.createBackup')}
              </CardTitle>
              <CardDescription>
                {t('settings.backup.createBackupDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">{t('settings.backup.whatWillBeIncluded')}</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {t('settings.backup.allTransactions')}</li>
                  <li>• {t('settings.backup.allCategories')}</li>
                  <li>• {t('settings.backup.allBudgets')}</li>
                  <li>• {t('settings.backup.allCategoryRules')}</li>
                  <li>• {t('settings.backup.userPreferences')}</li>
                </ul>
              </div>
              <Button
                onClick={handleCreateBackup}
                disabled={isCreatingBackup}
                className="w-full"
              >
                {isCreatingBackup ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('settings.backup.creatingBackup')}
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    {t('settings.backup.createBackup')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Restore Backup Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                {t('settings.backup.restoreBackup')}
              </CardTitle>
              <CardDescription>
                {t('settings.backup.restoreBackupDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  {t('settings.backup.restoreWarning')}
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <label htmlFor="backup-file-input" className="block text-sm font-medium mb-2">
                    {t('settings.backup.selectBackupFile')}
                  </label>
                  <input
                    id="backup-file-input"
                    type="file"
                    accept=".json"
                    onChange={handleBackupFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                {backupFile && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">
                      {t('settings.backup.fileSelected')}: {backupFile.name}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleRestoreBackup}
                  disabled={!backupFile || isRestoringBackup}
                  variant="destructive"
                  className="w-full"
                >
                  {isRestoringBackup ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('settings.backup.restoringBackup')}
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      {t('settings.backup.restoreBackup')}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab Content - Modified */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                {t('settings.advanced.title')}
              </CardTitle>
              <CardDescription>
                {t('settings.advanced.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Clean State Section */}
              <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                <div className="flex items-start gap-3 mb-4">
                  <Trash2 className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-800 mb-2">
                      {t('settings.advanced.cleanState.sectionTitle')}
                    </h3>
                    <p className="text-red-600 mb-4">
                      {t('settings.advanced.cleanState.sectionDescription')}
                    </p>

                    <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-red-800 mb-2">
                        {t('settings.advanced.cleanState.warningTitle')}:
                      </h4>
                      <ul className="list-disc list-inside text-red-700 space-y-1 text-sm">
                        <li>{t('settings.advanced.cleanState.warning1')}</li>
                        <li>{t('settings.advanced.cleanState.warning2')}</li>
                        <li>{t('settings.advanced.cleanState.warning3')}</li>
                      </ul>
                    </div>

                    <RevertToCleanStateDialog
                      onSuccess={handleCleanStateSuccess}
                      trigger={
                        <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t('settings.advanced.cleanState.button')}
                        </Button>
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Safe utility function for localStorage operations
const safeLocalStorageOperation = (operation, key = null, value = null) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('localStorage is not available');
      return null;
    }

    switch (operation) {
      case 'clear':
        localStorage.clear();
        return true;
      case 'getItem':
        return localStorage.getItem(key);
      case 'setItem':
        localStorage.setItem(key, value);
        return true;
      case 'removeItem':
        localStorage.removeItem(key);
        return true;
      default:
        return null;
    }
  } catch (error) {
    console.warn(`localStorage ${operation} operation failed:`, error);
    return null;
  }
};

function RevertToCleanStateDialog({ onSuccess, trigger }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isReverting, setIsReverting] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const { toast } = useToast();
  const requiredConfirmationText = "DELETE EVERYTHING";

  const handleRevert = async () => {
    if (confirmationText !== requiredConfirmationText) {
      toast({
        title: t('toast.cleanState.confirmationError'),
        description: t('toast.cleanState.confirmationDescription', { requiredText: requiredConfirmationText }),
        variant: "destructive",
      });
      return;
    }

    setIsReverting(true);

    try {
      console.log('Starting client-side clean state revert...');

      toast({
        title: t('toast.cleanState.startingTitle'),
        description: t('toast.cleanState.startingDescription'),
        duration: 10000,
      });

      // New client-side data deletion logic with serial processing
      const [transactions, categories, budgets, categoryRules] = await Promise.all([
          Transaction.list(),
          Category.list(),
          Budget.list(),
          CategoryRule.list()
      ]);

      const deletedCounts = {
          transactions: transactions.length,
          budgets: budgets.length,
          categories: categories.length,
          categoryRules: categoryRules.length
      };
      
      toast({
        title: t('toast.cleanState.deletingDataTitle', 'Deleting all data...'),
        description: t('toast.cleanState.deletingDataDescription', 'This process might take a while.'),
        duration: 15000,
      });

      // Delete dependent entities first
      await processSerially(transactions, (item) => Transaction.delete(item.id));
      await processSerially(budgets, (item) => Budget.delete(item.id));
      await processSerially(categoryRules, (item) => CategoryRule.delete(item.id));
      
      // Delete all categories after dependents are gone
      await processSerially(categories, (item) => Category.delete(item.id));

      // Re-initialize default categories for the user
      const initResult = await initializeUserData();
      
      const responseData = {
          success: true,
          deletedCounts,
          categoriesRestored: { count: initResult.categoriesCreated || 0 }
      };

      setIsOpen(false);
      setConfirmationText('');
      safeLocalStorageOperation('clear');

      if (onSuccess) {
          onSuccess(responseData);
      }
      
    } catch (error) {
      console.error('Error during client-side clean state revert:', error);

      let errorMessage = t('toast.cleanState.errorGeneral');
      if (error.message?.includes('Rate limit')) {
        errorMessage = t('toast.cleanState.errorRateLimit');
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: t('toast.cleanState.errorTitle'),
        description: errorMessage,
        variant: "destructive",
        duration: 10000,
      });
    } finally {
      setIsReverting(false);
    }
  };

  return (
    <>
      {React.cloneElement(trigger, { onClick: () => setIsOpen(true), disabled: isReverting })}

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-red-800">{t('settings.dialogs.cleanState.title')}</h3>
            </div>

            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 mb-2">
                <strong>{t('settings.dialogs.cleanState.warningHeader')}</strong>
              </p>
              <ul className="text-xs text-red-600 space-y-1">
                <li>{t('settings.dialogs.cleanState.warning1')}</li>
                <li>{t('settings.dialogs.cleanState.warning2')}</li>
                <li>{t('settings.dialogs.cleanState.warning3')}</li>
                <li>{t('settings.dialogs.cleanState.warning4')}</li>
                <li>{t('settings.dialogs.cleanState.warning5')}</li>
                <li>{t('settings.dialogs.cleanState.warning6')}</li>
              </ul>
              <p className="text-sm text-red-700 mt-2 font-medium">
                {t('settings.dialogs.cleanState.irreversibleWarning')}
              </p>
            </div>

            <div className="mb-4">
              <Label className="text-red-800 font-medium">{t('settings.dialogs.cleanState.confirmationLabel', { requiredText: requiredConfirmationText })}</Label>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className="w-full mt-1 p-2 border rounded focus:border-red-500"
                placeholder={requiredConfirmationText}
                disabled={isReverting}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isReverting}>
                {t('settings.dialogs.cancel')}
              </Button>
              <Button variant="destructive" onClick={handleRevert} disabled={isReverting}>
                {isReverting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('settings.dialogs.cleanState.loadingButton')}
                  </div>
                ) : (
                  t('settings.dialogs.cleanState.confirmButton')
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
