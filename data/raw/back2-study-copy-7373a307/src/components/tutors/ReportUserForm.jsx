import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserReport } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { AlertTriangle, Upload, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const translations = {
  he: {
    title: "דווח על משתמש",
    reportType: "סוג הדיווח",
    description: "תאר את הבעיה",
    descriptionPlaceholder: "אנא תאר בפירוט מה קרה...",
    evidence: "ראיות (אופציונלי)",
    evidenceDesc: "העלה צילומי מסך או קבצים הקשורים לדיווח",
    submit: "שלח דיווח",
    submitting: "שולח...",
    cancel: "ביטול",
    success: "הדיווח נשלח בהצלחה! נבדוק אותו בהקדם.",
    uploadEvidence: "העלה ראיה",
    reportTypes: {
      harassment: "הטרדה",
      inappropriate_content: "תוכן לא הולם",
      fraud: "הונאה",
      no_show: "אי-הגעה לשיעור",
      poor_behavior: "התנהגות לא הולמת",
      spam: "ספאם",
      identity_fraud: "זיוף זהות",
      other: "אחר"
    }
  },
  en: {
    title: "Report User",
    reportType: "Report Type",
    description: "Describe the issue",
    descriptionPlaceholder: "Please describe in detail what happened...",
    evidence: "Evidence (Optional)",
    evidenceDesc: "Upload screenshots or files related to the report",
    submit: "Submit Report",
    submitting: "Submitting...",
    cancel: "Cancel",
    success: "Report submitted successfully! We'll review it soon.",
    uploadEvidence: "Upload Evidence",
    reportTypes: {
      harassment: "Harassment",
      inappropriate_content: "Inappropriate Content",
      fraud: "Fraud",
      no_show: "No Show",
      poor_behavior: "Poor Behavior",
      spam: "Spam",
      identity_fraud: "Identity Fraud",
      other: "Other"
    }
  }
};

export default function ReportUserForm({ 
  reportedUserId, 
  reporterUserId, 
  relatedBookingId = null,
  language = 'he', 
  onClose, 
  onSubmitted 
}) {
  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const t = translations[language];

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('גודל הקובץ חורג מ-10MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const result = await UploadFile({ file });
      setEvidence(prev => [...prev, {
        file_url: result.file_url,
        file_type: file.type.startsWith('image/') ? 'image' : 'document',
        description: file.name
      }]);
    } catch (err) {
      setError('שגיאה בהעלאת הקובץ');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const removeEvidence = (index) => {
    setEvidence(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!reportType || !description.trim()) {
      setError('נדרש לבחור סוג דיווח ולתאר את הבעיה');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const reportData = {
        reporter_id: reporterUserId,
        reported_user_id: reportedUserId,
        report_type: reportType,
        description: description.trim(),
        evidence: evidence,
        related_booking_id: relatedBookingId,
        status: 'pending',
        priority: ['harassment', 'fraud', 'identity_fraud'].includes(reportType) ? 'high' : 'medium'
      };

      await UserReport.create(reportData);
      setSubmitted(true);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      setError('שגיאה בשליחת הדיווח');
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8"
      >
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-green-800 mb-2">הדיווח נשלח!</h3>
        <p className="text-gray-600 mb-4">{t.success}</p>
        <Button onClick={onClose}>סגור</Button>
      </motion.div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Report Type */}
        <div>
          <label className="block text-sm font-medium mb-2">{t.reportType} *</label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue placeholder="בחר סוג דיווח" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(t.reportTypes).map(([key, value]) => (
                <SelectItem key={key} value={key}>{value}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">{t.description} *</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.descriptionPlaceholder}
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Evidence Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">{t.evidence}</label>
          <p className="text-xs text-gray-500 mb-3">{t.evidenceDesc}</p>
          
          <input
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            onChange={(e) => handleFileUpload(e.target.files[0])}
            className="hidden"
            id="evidence-upload"
          />
          <label
            htmlFor="evidence-upload"
            className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
          >
            {uploading ? (
              <div className="text-center">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm">מעלה...</p>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <Upload className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm">{t.uploadEvidence}</p>
              </div>
            )}
          </label>

          {/* Evidence List */}
          {evidence.length > 0 && (
            <div className="mt-3 space-y-2">
              {evidence.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm">{item.description}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEvidence(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !reportType || !description.trim()}
            className="bg-red-600 hover:bg-red-700"
          >
            {submitting ? t.submitting : t.submit}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}