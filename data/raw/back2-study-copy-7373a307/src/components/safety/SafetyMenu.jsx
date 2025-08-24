import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { MoreVertical, Flag, Shield, AlertTriangle } from 'lucide-react';
import ReportUserModal from './ReportUserModal';
import BlockUserModal from './BlockUserModal';
import { useTheme } from '../ui/theme-provider';

const translations = {
  he: {
    moreOptions: 'אפשרויות נוספות',
    reportUser: 'דווח על משתמש',
    blockUser: 'חסום משתמש',
    safetyOptions: 'אפשרויות בטיחות'
  },
  en: {
    moreOptions: 'More Options',
    reportUser: 'Report User',
    blockUser: 'Block User',
    safetyOptions: 'Safety Options'
  }
};

export default function SafetyMenu({ 
  targetUser, 
  context, 
  relatedId, 
  language = 'he',
  className = ""
}) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const { themeClasses } = useTheme();
  const t = translations[language];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`text-white/60 hover:text-white hover:bg-white/10 ${className}`}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="bg-gray-800 border-gray-700 text-white min-w-40"
        >
          <DropdownMenuItem
            onClick={() => setShowReportModal(true)}
            className="hover:bg-red-600/20 text-red-400 cursor-pointer"
          >
            <Flag className="w-4 h-4 mr-2" />
            {t.reportUser}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuItem
            onClick={() => setShowBlockModal(true)}
            className="hover:bg-orange-600/20 text-orange-400 cursor-pointer"
          >
            <Shield className="w-4 h-4 mr-2" />
            {t.blockUser}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ReportUserModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        reportedUser={targetUser}
        context={context}
        relatedId={relatedId}
        language={language}
      />

      <BlockUserModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        userToBlock={targetUser}
        context={context}
        language={language}
      />
    </>
  );
}