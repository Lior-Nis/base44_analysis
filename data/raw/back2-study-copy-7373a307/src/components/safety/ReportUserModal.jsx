import React, { useState } from 'react';
import { UserReport } from '@/api/entities';
import { User } from '@/api/entities';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Send, X } from 'lucide-react';
import { useToast } from '../ui/use-toast';
import { useTheme } from '../ui/theme-provider';

const translations = {
  he: {
    reportUser: 'דווח על משתמש',
    reportType: 'סוג הדיווח',
    selectReportType: 'בחר סוג דיווח',
    harassment: 'הטרדה',
    inappropriateContent: 'תוכן לא הולם',
    fraud: 'הונאה',
    noShow: 'לא הגיע לשיעור',
    poorBehavior: 'התנהגות לא הולמת',
    spam: 'ספאם',
    identityFraud: 'זהות מזויפת',
    offensiveLanguage: 'שפה פוגענית',
    scam: 'הונאה כספית',
    fakeProfile: 'פרופיל מזויף',
    other: 'אחר',
    description: 'תיאור הבעיה',
    descriptionPlaceholder: 'אנא תאר במפורט מה קרה...',
    submitReport: 'שלח דיווח',
    submitting: 'שולח...',
    cancel: 'ביטול',
    reportSuccess: 'הדיווח נשלח בהצלחה',
    reportError: 'שגיאה בשליחת הדיווח',
    fillAllFields: 'אנא מלא את כל השדות',
    warning: 'אזהרה',
    reportWarning: 'דיווחי שווא עלולים להוביל לחסימת החשבון שלך',
    anonymous: 'הדיווח יישלח באופן אנונימי למנהלי המערכת'
  },
  en: {
    reportUser: 'Report User',
    reportType: 'Report Type',
    selectReportType: 'Select report type',
    harassment: 'Harassment',
    inappropriateContent: 'Inappropriate Content',
    fraud: 'Fraud',
    noShow: 'No Show',
    poorBehavior: 'Poor Behavior',
    spam: 'Spam',
    identityFraud: 'Identity Fraud',
    offensiveLanguage: 'Offensive Language',
    scam: 'Scam',
    fakeProfile: 'Fake Profile',
    other: 'Other',
    description: 'Problem Description',
    descriptionPlaceholder: 'Please describe in detail what happened...',
    submitReport: 'Submit Report',
    submitting: 'Submitting...',
    cancel: 'Cancel',
    reportSuccess: 'Report submitted successfully',
    reportError: 'Error submitting report',
    fillAllFields: 'Please fill in all fields',
    warning: 'Warning',
    reportWarning: 'False reports may lead to account suspension',
    anonymous: 'The report will be sent anonymously to system administrators'
  }
};

export default function ReportUserModal({ 
  isOpen, 
  onClose, 
  reportedUser, 
  context, 
  relatedId,
  language = 'he' 
}) {
  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { themeClasses } = useTheme();
  const t = translations[language];

  const handleSubmit = async () => {
    if (!reportType || !description.trim()) {
      toast({
        title: t.fillAllFields,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const currentUser = await User.me();
      
      const reportData = {
        reporter_id: currentUser.id,
        reported_user_id: reportedUser.id,
        report_type: reportType,
        context: context || 'other',
        description: description.trim(),
        priority: ['harassment', 'fraud', 'scam'].includes(reportType) ? 'high' : 'medium'
      };

      // Add context-specific IDs
      if (context === 'chat_message' && relatedId) {
        reportData.related_chat_message_id = relatedId;
      } else if (context === 'study_circle' && relatedId) {
        reportData.related_circle_id = relatedId;
      } else if (context === 'campus_event' && relatedId) {
        reportData.related_event_id = relatedId;
      } else if (context === 'tutor_lesson' && relatedId) {
        reportData.related_booking_id = relatedId;
      }

      await UserReport.create(reportData);
      
      toast({
        title: t.reportSuccess,
        description: t.anonymous,
        variant: "success",
      });
      
      onClose();
      setReportType('');
      setDescription('');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: t.reportError,
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${themeClasses.cardSolid} border-red-700/50 max-w-md`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            {t.reportUser}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-yellow-400 mb-1">{t.warning}</p>
                <p className="text-yellow-300/80">{t.reportWarning}</p>
              </div>
            </div>
          </div>

          {/* Reported User */}
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-sm text-white/60 mb-1">דיווח על:</p>
            <p className="font-medium text-white">{reportedUser?.full_name || 'משתמש לא ידוע'}</p>
          </div>

          {/* Report Type */}
          <div className="space-y-2">
            <Label htmlFor="reportType">{t.reportType}</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder={t.selectReportType} />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="harassment">{t.harassment}</SelectItem>
                <SelectItem value="inappropriate_content">{t.inappropriateContent}</SelectItem>
                <SelectItem value="offensive_language">{t.offensiveLanguage}</SelectItem>
                <SelectItem value="spam">{t.spam}</SelectItem>
                <SelectItem value="fraud">{t.fraud}</SelectItem>
                <SelectItem value="scam">{t.scam}</SelectItem>
                <SelectItem value="fake_profile">{t.fakeProfile}</SelectItem>
                <SelectItem value="poor_behavior">{t.poorBehavior}</SelectItem>
                <SelectItem value="no_show">{t.noShow}</SelectItem>
                <SelectItem value="other">{t.other}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t.description}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.descriptionPlaceholder}
              className="bg-white/10 border-white/20 text-white resize-none min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-white/60 text-right">
              {description.length}/500
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-white/20 text-white"
          >
            {t.cancel}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !reportType || !description.trim()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2" />
                {t.submitting}
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {t.submitReport}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}