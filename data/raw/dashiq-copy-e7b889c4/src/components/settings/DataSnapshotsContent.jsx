import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { t, isRTL } from "@/components/utils/i18n";
import {
  Database,
  AlertCircle,
  Info,
  Archive,
  RefreshCw,
  Loader2
} from "lucide-react";

export default function DataSnapshotsContent() {
  const [loading, setLoading] = useState(false);
  const [snapshots, setSnapshots] = useState([]);
  const { toast } = useToast();
  const isRTLLayout = isRTL();

  // Show feature unavailable message
  useEffect(() => {
    setSnapshots([]);
  }, []);

  const handleCreateSnapshot = () => {
    toast({
      title: isRTLLayout ? 'תכונה זמנית לא זמינה' : 'Feature Temporarily Unavailable',
      description: isRTLLayout 
        ? 'תכונת גיבוי הנתונים נמצאת בפיתוח. אנא נסה שוב מאוחר יותר.'
        : 'Data backup feature is under development. Please try again later.',
      duration: 5000,
    });
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: isRTLLayout ? 'רענון הושלם' : 'Refresh Complete',
        description: isRTLLayout 
          ? 'אין גיבויים זמינים כרגע'
          : 'No backups available at the moment',
        duration: 3000,
      });
    }, 1000);
  };

  return (
    <div className="space-y-6" dir={isRTLLayout ? 'rtl' : 'ltr'}>
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Database className="w-7 h-7 text-blue-600" />
            {isRTLLayout ? 'גיבוי נתונים' : 'Data Backup'}
          </h2>
          <p className="text-gray-600 mt-1">
            {isRTLLayout 
              ? 'צור גיבויים של הנתונים הפיננסיים שלך לשמירה בטוחה'
              : 'Create backups of your financial data for safe keeping'
            }
          </p>
        </div>
        <Button 
          onClick={handleCreateSnapshot}
          disabled={true}
          className="bg-blue-600 hover:bg-blue-700 opacity-50 cursor-not-allowed"
        >
          <Database className="w-4 h-4 mr-2" />
          {isRTLLayout ? 'צור גיבוי' : 'Create Backup'}
        </Button>
      </div>

      {/* Feature Status Alert */}
      <Alert className="border-amber-200 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>{isRTLLayout ? 'תכונה בפיתוח:' : 'Feature in Development:'}</strong>{' '}
          {isRTLLayout 
            ? 'תכונת גיבוי הנתונים נמצאת כרגע בפיתוח ותהיה זמינה בעדכון הבא של המערכת.'
            : 'The data backup feature is currently under development and will be available in the next system update.'
          }
        </AlertDescription>
      </Alert>

      {/* How It Works Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Info className="w-5 h-5" />
            {isRTLLayout ? 'איך זה עובד' : 'How It Works'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                1
              </div>
              <h4 className="font-medium text-blue-900">
                {isRTLLayout ? 'צור גיבוי' : 'Create Backup'}
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                {isRTLLayout 
                  ? 'צור גיבוי של כל הנתונים הפיננסיים שלך'
                  : 'Create a backup of all your financial data'
                }
              </p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                2
              </div>
              <h4 className="font-medium text-blue-900">
                {isRTLLayout ? 'שמור בבטחה' : 'Store Safely'}
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                {isRTLLayout 
                  ? 'הגיבוי נשמר בענן בצורה מוצפנת ובטוחה'
                  : 'Backup is stored securely and encrypted in the cloud'
                }
              </p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">
                3
              </div>
              <h4 className="font-medium text-blue-900">
                {isRTLLayout ? 'שחזר בקלות' : 'Easy Restore'}
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                {isRTLLayout 
                  ? 'שחזר את הנתונים בכל עת בלחיצת כפתור'
                  : 'Restore your data anytime with a single click'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="w-5 h-5" />
            {isRTLLayout ? 'תכונות עתידיות' : 'Coming Soon Features'}
          </CardTitle>
          <CardDescription>
            {isRTLLayout 
              ? 'תכונות שיהיו זמינות בגרסה הבאה'
              : 'Features that will be available in the next version'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-gray-900">
                  {isRTLLayout ? 'גיבוי אוטומטי' : 'Automatic Backups'}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {isRTLLayout 
                    ? 'יצירת גיבויים אוטומטיים בתדירות שתבחר'
                    : 'Create automatic backups at your chosen frequency'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-gray-900">
                  {isRTLLayout ? 'גיבוי בחירני' : 'Selective Backup'}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {isRTLLayout 
                    ? 'בחר אילו קטגוריות נתונים לגבות'
                    : 'Choose which data categories to backup'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-gray-900">
                  {isRTLLayout ? 'ייצוא לקובץ' : 'Export to File'}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {isRTLLayout 
                    ? 'ייצא גיבוי לקובץ מקומי במחשב שלך'
                    : 'Export backup to a local file on your computer'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-gray-900">
                  {isRTLLayout ? 'שחזור חלקי' : 'Partial Restore'}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {isRTLLayout 
                    ? 'שחזר רק חלקים ספציפיים מהגיבוי'
                    : 'Restore only specific parts from the backup'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      <Card>
        <CardContent className="text-center py-12">
          <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isRTLLayout ? 'אין גיבויים זמינים' : 'No Backups Available'}
          </h3>
          <p className="text-gray-600 mb-4">
            {isRTLLayout 
              ? 'כשהתכונה תהיה זמינה, תוכל ליצור ולנהל גיבויים כאן'
              : 'When the feature becomes available, you\'ll be able to create and manage backups here'
            }
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={handleRefresh}
              disabled={loading}
              variant="outline"
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {isRTLLayout ? 'רענן' : 'Refresh'}
            </Button>
            <Button
              onClick={handleCreateSnapshot}
              disabled={true}
              className="gap-2 opacity-50 cursor-not-allowed"
            >
              <Database className="w-4 h-4" />
              {isRTLLayout ? 'צור גיבוי ראשון' : 'Create First Backup'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Info className="w-5 h-5" />
            {isRTLLayout ? 'למה חשוב לגבות?' : 'Why Backup?'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-green-700">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              {isRTLLayout 
                ? 'הגנה מפני אובדן נתונים בשל תקלות טכניות'
                : 'Protection against data loss due to technical issues'
              }
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              {isRTLLayout 
                ? 'יכולת לשחזר מידע היסטורי חשוב'
                : 'Ability to restore important historical information'
              }
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              {isRTLLayout 
                ? 'שקט נפשי וביטחון לנתונים הפיננסיים שלך'
                : 'Peace of mind and security for your financial data'
              }
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              {isRTLLayout 
                ? 'אפשרות להעביר נתונים בין מכשירים'
                : 'Option to transfer data between devices'
              }
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}