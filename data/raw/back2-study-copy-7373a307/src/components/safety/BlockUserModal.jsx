import React, { useState } from 'react';
import { UserBlock } from '@/api/entities';
import { User } from '@/api/entities';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Ban, AlertTriangle } from 'lucide-react';
import { useToast } from '../ui/use-toast';
import { useTheme } from '../ui/theme-provider';

const translations = {
  he: {
    blockUser: 'חסום משתמש',
    blockReason: 'סיבת החסימה',
    selectReason: 'בחר סיבה',
    harassment: 'הטרדה',
    inappropriateBehavior: 'התנהגות לא הולמת',
    spam: 'ספאם',
    personalPreference: 'העדפה אישית',
    safetyConcern: 'חשש לבטיחות',
    other: 'אחר',
    additionalNotes: 'הערות נוספות (אופציונלי)',
    notesPlaceholder: 'הוסף הסבר נוסף אם נדרש...',
    blockUser: 'חסום משתמש',
    blocking: 'חוסם...',
    cancel: 'ביטול',
    blockSuccess: 'המשתמש נחסם בהצלחה',
    blockError: 'שגיאה בחסימת המשתמש',
    selectReason: 'אנא בחר סיבה',
    warning: 'אזהרה',
    blockWarning: 'משתמש חסום לא יוכל ליצור איתך קשר או לראות את הפעילות שלך',
    canUnblock: 'תוכל לבטל את החסימה בכל עת דרך הגדרות הפרופיל'
  },
  en: {
    blockUser: 'Block User',
    blockReason: 'Block Reason',
    selectReason: 'Select reason',
    harassment: 'Harassment',
    inappropriateBehavior: 'Inappropriate Behavior',
    spam: 'Spam',
    personalPreference: 'Personal Preference',
    safetyConcern: 'Safety Concern',
    other: 'Other',
    additionalNotes: 'Additional Notes (Optional)',
    notesPlaceholder: 'Add additional explanation if needed...',
    blockUser: 'Block User',
    blocking: 'Blocking...',
    cancel: 'Cancel',
    blockSuccess: 'User blocked successfully',
    blockError: 'Error blocking user',
    selectReason: 'Please select a reason',
    warning: 'Warning',
    blockWarning: 'Blocked user will not be able to contact you or see your activity',
    canUnblock: 'You can unblock at any time through profile settings'
  }
};

export default function BlockUserModal({ 
  isOpen, 
  onClose, 
  userToBlock, 
  context, 
  language = 'he' 
}) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isBlocking, setIsBlocking] = useState(false);
  const { toast } = useToast();
  const { themeClasses } = useTheme();
  const t = translations[language];

  const handleBlock = async () => {
    if (!reason) {
      toast({
        title: t.selectReason,
        variant: "destructive",
      });
      return;
    }

    setIsBlocking(true);
    try {
      const currentUser = await User.me();
      
      const blockData = {
        blocker_id: currentUser.id,
        blocked_id: userToBlock.id,
        reason: reason,
        context: context || 'general',
        notes: notes.trim()
      };

      await UserBlock.create(blockData);
      
      toast({
        title: t.blockSuccess,
        description: t.canUnblock,
        variant: "success",
      });
      
      onClose();
      setReason('');
      setNotes('');
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: t.blockError,
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsBlocking(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${themeClasses.cardSolid} border-orange-700/50 max-w-md`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-400">
            <Shield className="w-5 h-5" />
            {t.blockUser}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Warning */}
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-orange-400 mb-1">{t.warning}</p>
                <p className="text-orange-300/80">{t.blockWarning}</p>
              </div>
            </div>
          </div>

          {/* User to Block */}
          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-sm text-white/60 mb-1">חסימת:</p>
            <p className="font-medium text-white">{userToBlock?.full_name || 'משתמש לא ידוע'}</p>
          </div>

          {/* Block Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">{t.blockReason}</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder={t.selectReason} />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="harassment">{t.harassment}</SelectItem>
                <SelectItem value="inappropriate_behavior">{t.inappropriateBehavior}</SelectItem>
                <SelectItem value="spam">{t.spam}</SelectItem>
                <SelectItem value="safety_concern">{t.safetyConcern}</SelectItem>
                <SelectItem value="personal_preference">{t.personalPreference}</SelectItem>
                <SelectItem value="other">{t.other}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t.additionalNotes}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.notesPlaceholder}
              className="bg-white/10 border-white/20 text-white resize-none"
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-white/60 text-right">
              {notes.length}/200
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isBlocking}
            className="border-white/20 text-white"
          >
            {t.cancel}
          </Button>
          <Button
            onClick={handleBlock}
            disabled={isBlocking || !reason}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isBlocking ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2" />
                {t.blocking}
              </>
            ) : (
              <>
                <Ban className="w-4 h-4 mr-2" />
                {t.blockUser}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}