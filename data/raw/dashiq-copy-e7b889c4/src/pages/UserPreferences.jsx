
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { t, isRTL } from "@/components/utils/i18n";
import { User } from '@/api/entities';
import { Transaction } from '@/api/entities';
import { Category } from '@/api/entities';
import { Budget } from '@/api/entities';
import { CategoryRule } from '@/api/entities';
import { ShieldAlert, Download, Trash2, Loader2, Eraser, AlertCircle, CheckCircle, User as UserIcon, Shield } from 'lucide-react';
// The import for revertToCleanState is removed as we are moving the logic to the frontend.
// The import for performAccountDeletion is also removed as it is no longer used.

export default function UserPreferencesPage() {
    const { toast } = useToast();
    const isRTLLayout = isRTL();
    const [isClearingData, setIsClearingData] = useState(false);
    const [clearDataStats, setClearDataStats] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [deleteConfirmationChecked, setDeleteConfirmationChecked] = useState(false);

    // Add state to control dialog visibility
    const [isClearDataDialogOpen, setIsClearDataDialogOpen] = useState(false);
    const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false);

    // Safe localStorage operations with error handling
    const clearLocalStorage = () => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const itemCount = window.localStorage.length;
                window.localStorage.clear();
                return itemCount;
            }
            return 0;
        } catch (error) {
            console.warn('Could not clear localStorage:', error);
            try {
                if (typeof window !== 'undefined' && window.localStorage) {
                    const keys = Object.keys(window.localStorage);
                    keys.forEach(key => {
                        try {
                            window.localStorage.removeItem(key);
                        } catch (e) {
                            console.warn(`Could not remove ${key}:`, e);
                        }
                    });
                    return keys.length;
                }
            } catch (fallbackError) {
                console.warn('Fallback localStorage clear failed:', fallbackError);
            }
            return 0;
        }
    };

    const clearSessionStorage = () => {
        try {
            if (typeof window !== 'undefined' && window.sessionStorage) {
                const itemCount = window.sessionStorage.length;
                window.sessionStorage.clear();
                return itemCount;
            }
            return 0;
        } catch (error) {
            console.warn('Could not clear sessionStorage:', error);
            try {
                if (typeof window !== 'undefined' && window.sessionStorage) {
                    const keys = Object.keys(window.sessionStorage);
                    keys.forEach(key => {
                        try {
                            window.sessionStorage.removeItem(key);
                        } catch (e) {
                            console.warn(`Could not remove ${key}:`, e);
                        }
                    });
                    return keys.length;
                }
            } catch (fallbackError) {
                console.warn('Fallback sessionStorage clear failed:', fallbackError);
            }
            return 0;
        }
    };

    const clearCookies = () => {
        try {
            if (typeof document !== 'undefined' && document.cookie) {
                const cookies = document.cookie.split(";");
                let clearedCount = 0;

                cookies.forEach(cookie => {
                    try {
                        const eqPos = cookie.indexOf("=");
                        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

                        if (name) {
                            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
                            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
                            clearedCount++;
                        }
                    } catch (e) {
                        console.warn('Could not clear cookie:', cookie, e);
                    }
                });

                return clearedCount;
            }
            return 0;
        } catch (error) {
            console.warn('Could not clear cookies:', error);
            return 0;
        }
    };

    const handleClearLocalData = async () => {
        setIsClearingData(true);

        try {
            const beforeUsage = {
                localStorage: (typeof window !== 'undefined' && window.localStorage) ? window.localStorage.length : 0,
                sessionStorage: (typeof window !== 'undefined' && window.sessionStorage) ? window.sessionStorage.length : 0,
                cookies: (typeof document !== 'undefined' && document.cookie) ? document.cookie.split(";").length : 0
            };

            const clearedItems = {
                localStorage: clearLocalStorage(),
                sessionStorage: clearSessionStorage(),
                cookies: clearCookies(),
                caches: 0,
                indexedDB: 0
            };

            if ('caches' in window) {
                try {
                    const cacheNames = await caches.keys();
                    clearedItems.caches = cacheNames.length;
                    await Promise.all(
                        cacheNames.map(cacheName => caches.delete(cacheName))
                    );
                } catch (error) {
                    console.warn('Error clearing caches:', error);
                }
            }

            if ('indexedDB' in window) {
                try {
                    const dbs = await indexedDB.databases?.() || [];
                    clearedItems.indexedDB = dbs.length;

                    for (const db of dbs) {
                        if (db.name) {
                            indexedDB.deleteDatabase(db.name);
                        }
                    }
                } catch (error) {
                    console.warn('Error clearing IndexedDB:', error);
                }
            }

            const spaceSaved = (clearedItems.localStorage + clearedItems.sessionStorage + clearedItems.cookies) * 1024;

            setClearDataStats({
                before: beforeUsage,
                cleared: clearedItems,
                spaceSaved: spaceSaved
            });

            toast({
                title: t('userPreferences.cookies.clearSuccess'),
                description: `${t('userPreferences.cookies.localData')}: ${clearedItems.localStorage}, ${t('userPreferences.cookies.cookies')}: ${clearedItems.cookies}`,
                variant: "default"
            });

            setTimeout(() => {
                User.logout();
            }, 3000);

        } catch (error) {
            console.error('Error clearing local data:', error);
            toast({
                title: t('userPreferences.errors.clearDataError'),
                description: error.message || t('errors.general'),
                variant: "destructive"
            });
        } finally {
            setIsClearingData(false);
            setIsClearDataDialogOpen(false); // Close dialog
        }
    };

    const handleDeleteAccount = async () => {
        if (!deleteConfirmationChecked) {
            toast({
                title: t('userPreferences.errors.confirmationRequired'),
                description: t('userPreferences.errors.checkTheBox'),
                variant: "warning"
            });
            return;
        }

        setIsDeletingAccount(true);
        toast({
            title: t('userPreferences.deleteAccount.deleting'),
            description: t('userPreferences.deleteAccount.deleteInProgress'),
            duration: 20000, // Increased duration
        });

        try {
            // Step 1: Delete all backend data associated with the user
            const [transactionsResult, categoriesResult, budgetsResult, categoryRulesResult] = await Promise.all([
                Transaction.list().catch(err => { console.error('Failed to list transactions:', err); return []; }),
                Category.list().catch(err => { console.error('Failed to list categories:', err); return []; }),
                Budget.list().catch(err => { console.error('Failed to list budgets:', err); return []; }),
                CategoryRule.list().catch(err => { console.error('Failed to list category rules:', err); return []; })
            ]);

            const transactions = transactionsResult;
            const categories = categoriesResult;
            const budgets = budgetsResult;
            const categoryRules = categoryRulesResult;

            // Delete dependent entities first to avoid conflicts
            await Promise.allSettled([
                ...transactions.map(t_item => Transaction.delete(t_item.id).catch(err => console.warn(`Failed to delete transaction ${t_item.id}:`, err))),
                ...budgets.map(b_item => Budget.delete(b_item.id).catch(err => console.warn(`Failed to delete budget ${b_item.id}:`, err))),
                ...categoryRules.map(cr_item => CategoryRule.delete(cr_item.id).catch(err => console.warn(`Failed to delete category rule ${cr_item.id}:`, err)))
            ]);

            // Then delete the categories
            await Promise.allSettled(categories.map(c_item => Category.delete(c_item.id).catch(err => console.warn(`Failed to delete category ${c_item.id}:`, err))));
            
            // Finally, delete the user record
            const currentUser = await User.me();
            if (currentUser && currentUser.id) {
                await User.delete(currentUser.id);
            }

            // Step 2: Thoroughly clear all client-side storage to ensure a clean session
            console.log("Clearing all client-side storage to force re-authentication on next sign-up...");
            clearLocalStorage();
            clearSessionStorage();
            clearCookies();

            if ('caches' in window) {
                try {
                    const cacheNames = await caches.keys();
                    await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
                } catch (error) { console.warn('Could not clear caches:', error); }
            }

            if ('indexedDB' in window && indexedDB.databases) {
                try {
                    const dbs = await indexedDB.databases();
                    await Promise.all(dbs.map(db => db.name ? new Promise((resolve) => {
                        const req = indexedDB.deleteDatabase(db.name);
                        req.onsuccess = resolve;
                        req.onerror = () => { console.warn(`Could not delete IndexedDB ${db.name}`); resolve(); };
                        req.onblocked = () => { console.warn(`IndexedDB ${db.name} is blocked.`); resolve(); };
                    }) : Promise.resolve()));
                } catch (error) { console.warn('Could not clear IndexedDB:', error); }
            }
            console.log("Client-side storage cleared.");

            // Step 3: Log out from the SDK
            await User.logout();

            toast({
                title: t('userPreferences.deleteAccount.successTitle'),
                description: t('userPreferences.deleteAccount.successDescription'),
                variant: "default",
                duration: 7000,
            });

            // Step 4: Redirect to the homepage after a delay to ensure all cleanup is processed
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);

        } catch (error) {
            console.error('Account deletion error (client-side):', error);
            toast({
                title: t('userPreferences.errors.deleteFailed'),
                description: error.message || t('errors.general'),
                variant: "destructive"
            });
            setIsDeletingAccount(false);
            setIsDeleteAccountDialogOpen(false);
        }
    };

    const handleDownloadData = async () => {
        setIsDownloading(true);

        try {
            const user = await User.me();
            const [transactions, categories, budgets, categoryRules] = await Promise.allSettled([
                Transaction.list(),
                Category.list(),
                Budget.list(),
                CategoryRule ? CategoryRule.list() : Promise.resolve([])
            ]);

            const userData = {
                export_info: {
                    exported_at: new Date().toISOString(),
                    user_email: user.email,
                    note: "This file contains all your personal data from the DashIQ financial management system."
                },
                user_profile: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role,
                    created_date: user.created_date,
                    display_preferences: user.display_preferences || {}
                },
                transactions: transactions.status === 'fulfilled' ? transactions.value : [],
                categories: categories.status === 'fulfilled' ? categories.value : [],
                budgets: budgets.status === 'fulfilled' ? budgets.value : [],
                category_rules: categoryRules.status === 'fulfilled' ? categoryRules.value : []
            };

            const jsonData = JSON.stringify(userData, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `dashiq-user-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast({
                title: t('userPreferences.download.downloadSuccess'),
                description: t('userPreferences.download.fileReady'),
                variant: "default"
            });

        } catch (error) {
            console.error('Download error:', error);
            toast({
                title: t('userPreferences.errors.downloadFailed'),
                description: error.message || t('errors.general'),
                variant: "destructive"
            });
        } finally {
            setIsDownloading(false);
        }
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" dir={isRTLLayout ? 'rtl' : 'ltr'}>
            <div className="max-w-6xl mx-auto p-4 md:p-8">
                {/* Hero Header */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full">
                            <UserIcon className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('userPreferences.title')}</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t('userPreferences.subtitle')}</p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

                    {/* Manage Local Data Card */}
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Eraser className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl text-gray-900">{t('userPreferences.cookies.title')}</CardTitle>
                                    <CardDescription className="text-gray-600 mt-1">{t('userPreferences.cookies.description')}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* What will be deleted info */}
                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                                <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {t('userPreferences.cookies.whatWillBeDeleted')}
                                </h4>
                                <ul className="space-y-2 text-orange-700 text-sm">
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                        {t('userPreferences.cookies.localStorageData')}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                        {t('userPreferences.cookies.sessionData')}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                        {t('userPreferences.cookies.websiteCookies')}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                                        {t('userPreferences.cookies.browserCache')}
                                    </li>
                                </ul>
                            </div>

                            {/* Statistics after clearing */}
                            {clearDataStats && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        {t('userPreferences.cookies.clearingStats')}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3 text-sm text-green-700">
                                        <div className="bg-white/50 p-2 rounded">
                                            <strong>{t('userPreferences.cookies.localData')}:</strong> {clearDataStats.cleared.localStorage}
                                        </div>
                                        <div className="bg-white/50 p-2 rounded">
                                            <strong>{t('userPreferences.cookies.cookies')}:</strong> {clearDataStats.cleared.cookies}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Warning Alert */}
                            <Alert className="border-orange-200 bg-orange-50">
                                <ShieldAlert className="h-4 w-4 text-orange-600" />
                                <AlertDescription className="text-orange-700">
                                    {t('userPreferences.cookies.clearWarning')}
                                </AlertDescription>
                            </Alert>

                            {/* CTA Button */}
                            <Button
                                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                disabled={isClearingData}
                                size="lg"
                                onClick={() => setIsClearDataDialogOpen(true)}
                            >
                                {isClearingData ? (
                                    <>
                                        <Loader2 className={`h-5 w-5 animate-spin ${isRTLLayout ? 'ml-2' : 'mr-2'}`} />
                                        {t('userPreferences.cookies.deletingData')}
                                    </>
                                ) : (
                                    <>
                                        <Eraser className={`h-5 w-5 ${isRTLLayout ? 'ml-2' : 'mr-2'}`} />
                                        {t('userPreferences.cookies.clearButton')}
                                    </>
                                )}
                            </Button>

                            {/* AlertDialog for clearing data */}
                            <AlertDialog open={isClearDataDialogOpen} onOpenChange={setIsClearDataDialogOpen}>
                                <AlertDialogContent dir={isRTLLayout ? 'rtl' : 'ltr'}>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2">
                                            <AlertCircle className="w-6 h-6 text-orange-600" />
                                            {t('userPreferences.cookies.confirmClearTitle')}
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className={isRTLLayout ? "text-right" : "text-left"}>
                                            <div className="space-y-4">
                                                <p>{t('userPreferences.cookies.confirmDescription')}</p>
                                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                                    <p className="font-semibold text-orange-800 mb-2">
                                                        {t('userPreferences.cookies.thisActionWillDelete')}
                                                    </p>
                                                    <p className="text-orange-800 font-medium">
                                                        {t('userPreferences.cookies.afterDeletionLogout')}
                                                    </p>
                                                </div>
                                            </div>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel disabled={isClearingData} onClick={() => setIsClearDataDialogOpen(false)}>
                                            {t('common.cancel')}
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleClearLocalData}
                                            className="bg-orange-600 hover:bg-orange-700"
                                            disabled={isClearingData}
                                        >
                                            {isClearingData ? (
                                                <>
                                                    <Loader2 className={`h-4 w-4 animate-spin ${isRTLLayout ? 'ml-2' : 'mr-2'}`} />
                                                    {t('userPreferences.cookies.deletingData')}
                                                </>
                                            ) : (
                                                t('userPreferences.cookies.confirmAction')
                                            )}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>

                    {/* Download Your Information Card */}
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Download className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl text-gray-900">{t('userPreferences.download.title')}</CardTitle>
                                    <CardDescription className="text-gray-600 mt-1">{t('userPreferences.download.description')}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* What will be included */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <h4 className="font-semibold text-blue-800 mb-3">
                                    {t('userPreferences.download.whatWillBeIncluded')}
                                </h4>
                                <ul className="space-y-2 text-blue-700 text-sm">
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                        {t('userPreferences.download.profileData')}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                        {t('userPreferences.download.transactionsData')}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                        {t('userPreferences.download.categoriesData')}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                        {t('userPreferences.download.budgetsData')}
                                    </li>
                                </ul>
                            </div>

                            {/* Security notice */}
                            <Alert className="border-blue-200 bg-blue-50">
                                <Shield className="h-4 w-4 text-blue-600" />
                                <AlertDescription>
                                    <div>
                                        <p className="font-semibold text-blue-800 mb-1">
                                            {t('userPreferences.download.securityNotice')}
                                        </p>
                                        <p className="text-blue-700 text-sm">
                                            {t('userPreferences.download.securityDescription')}
                                        </p>
                                    </div>
                                </AlertDescription>
                            </Alert>

                            {/* CTA Button */}
                            <Button
                                onClick={handleDownloadData}
                                disabled={isDownloading}
                                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                size="lg"
                            >
                                {isDownloading ? (
                                    <>
                                        <Loader2 className={`h-5 w-5 animate-spin ${isRTLLayout ? 'ml-2' : 'mr-2'}`} />
                                        {t('userPreferences.download.downloading')}
                                    </>
                                ) : (
                                    <>
                                        <Download className={`h-5 w-5 ${isRTLLayout ? 'ml-2' : 'mr-2'}`} />
                                        {t('userPreferences.download.downloadButton')}
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Delete Account - Full Width Danger Zone */}
                <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 shadow-xl">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-center mb-4">
                            <div className="p-3 bg-red-100 rounded-full">
                                <Trash2 className="w-8 h-8 text-red-600" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl text-red-700 text-center">{t('userPreferences.deleteAccount.title')}</CardTitle>
                        <CardDescription className="text-red-600 text-center text-lg">
                            {t('userPreferences.deleteAccount.description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Detailed warning */}
                        <div className="bg-red-100 border-2 border-red-300 rounded-xl p-6">
                            <div className="flex items-start gap-4">
                                <ShieldAlert className="w-8 h-8 text-red-600 mt-1 flex-shrink-0" />
                                <div className="space-y-4">
                                    <h4 className="font-bold text-red-800 text-xl">
                                        {t('userPreferences.deleteAccount.finalWarning')}
                                    </h4>
                                    <p className="text-red-700">
                                        {t('userPreferences.deleteAccount.actionIrreversible')}
                                    </p>

                                    <div className="space-y-3">
                                        <p className="font-semibold text-red-800">{t('userPreferences.deleteAccount.whatWillBeDeleted')}</p>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <div className="bg-white/70 p-3 rounded-lg">
                                                <p className="text-red-700 text-sm font-medium">
                                                    {t('userPreferences.deleteAccount.userProfileInfo')}
                                                </p>
                                            </div>
                                            <div className="bg-white/70 p-3 rounded-lg">
                                                <p className="text-red-700 text-sm font-medium">
                                                    {t('userPreferences.deleteAccount.associatedContent')}
                                                </p>
                                            </div>
                                            <div className="bg-white/70 p-3 rounded-lg">
                                                <p className="text-red-700 text-sm font-medium">
                                                    {t('userPreferences.deleteAccount.authCredentials')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-4 border-t border-red-300">
                                        <p className="text-red-700 text-sm">{t('userPreferences.deleteAccount.cannotSignIn')}</p>
                                        <p className="text-red-700 text-sm">{t('userPreferences.deleteAccount.canSignUpAgain')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* User acknowledgment and CTA button combined */}
                        <div className="bg-white border-2 border-red-300 rounded-xl p-6 text-center">
                            <h4 className="font-semibold text-red-800 mb-4 text-lg">
                                {t('userPreferences.deleteAccount.acknowledgmentRequired')}
                            </h4>
                            <div className="flex items-center gap-3 justify-center mb-6">
                                <Checkbox
                                    id="deleteConfirmation"
                                    checked={deleteConfirmationChecked}
                                    onCheckedChange={setDeleteConfirmationChecked}
                                    className="mt-1 border-gray-400 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-700"
                                />
                                <label
                                    htmlFor="deleteConfirmation"
                                    className="text-red-700 font-medium cursor-pointer select-none max-w-md"
                                >
                                    {t('userPreferences.deleteAccount.confirmationText')}
                                </label>
                            </div>

                            {/* Delete account button is now here, always visible */}
                            <Button
                                variant="destructive"
                                disabled={!deleteConfirmationChecked || isDeletingAccount}
                                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold px-8 py-3 text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                size="lg"
                                onClick={() => setIsDeleteAccountDialogOpen(true)}
                            >
                                {isDeletingAccount ? (
                                    <>
                                        <Loader2 className={`h-5 w-5 animate-spin ${isRTLLayout ? 'ml-2' : 'mr-2'}`} />
                                        {t('userPreferences.deleteAccount.deleting')}
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className={`h-5 w-5 ${isRTLLayout ? 'ml-2' : 'mr-2'}`} />
                                        {t('userPreferences.deleteAccount.deleteButton')}
                                    </>
                                )}
                            </Button>

                            {/* AlertDialog for deleting account */}
                            <AlertDialog open={isDeleteAccountDialogOpen} onOpenChange={setIsDeleteAccountDialogOpen}>
                                <AlertDialogContent dir={isRTLLayout ? 'rtl' : 'ltr'}>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2 text-red-700 text-xl">
                                            <AlertCircle className="w-8 h-8" />
                                            {t('userPreferences.deleteAccount.dialogTitle')}
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className={isRTLLayout ? "text-right" : "text-left"}>
                                            <div className="space-y-4">
                                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                                    <div className="flex items-start gap-3">
                                                        <ShieldAlert className="w-8 h-8 text-red-600 mt-0.5 flex-shrink-0" />
                                                        <div className="space-y-2">
                                                            <p className="font-bold text-red-800 text-lg">
                                                                {t('userPreferences.deleteAccount.finalWarning')}
                                                            </p>
                                                            <p className="text-red-700">
                                                                {t('userPreferences.deleteAccount.dialogDescription')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-center p-4 border-2 border-red-300 rounded-lg bg-red-100">
                                                    <p className="font-bold text-red-800 text-lg">
                                                        {t('userPreferences.deleteAccount.actionIrreversible')}
                                                    </p>
                                                </div>
                                            </div>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel disabled={isDeletingAccount} onClick={() => setIsDeleteAccountDialogOpen(false)}>
                                            {t('common.cancel')}
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDeleteAccount}
                                            className="bg-red-700 hover:bg-red-800"
                                            disabled={isDeletingAccount}
                                        >
                                            {isDeletingAccount ? (
                                                <>
                                                    <Loader2 className={`h-5 w-5 animate-spin ${isRTLLayout ? 'ml-2' : 'mr-2'}`} />
                                                    {t('userPreferences.deleteAccount.deleting')}
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 className={`h-5 w-5 ${isRTLLayout ? 'ml-2' : 'mr-2'}`} />
                                                    {t('userPreferences.deleteAccount.deleteButton')}
                                                </>
                                            )}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
