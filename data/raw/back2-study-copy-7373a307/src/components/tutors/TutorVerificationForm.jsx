import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UploadFile } from '@/api/integrations';
import { IdentityVerification } from '@/api/entities';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle, AlertCircle, FileText, Camera } from 'lucide-react';

const translations = {
  he: {
    title: "אימות זהות למורים",
    subtitle: "כדי להפוך למורה מאומת, נדרש לעבור תהליך אימות זהות",
    idDocument: "תעודת זהות/דרכון",
    teachingCertificate: "תעודת הוראה/תעודה אקדמית",
    additionalDocs: "מסמכים נוספים (אופציונלי)",
    uploadDocument: "העלה מסמך",
    uploading: "מעלה...",
    submit: "שלח לאימות",
    submitting: "שולח...",
    success: "המסמכים נשלחו בהצלחה! נבדוק אותם תוך 2-3 ימי עסקים.",
    requirements: "דרישות אימות:",
    req1: "תמונה ברורה של תעודת זהות או דרכון",
    req2: "תעודה אקדמית או תעודת הוראה רלוונטית",
    req3: "כל המסמכים צריכים להיות ברורים וקריאים",
    fileTypes: "קבצים נתמכים: JPG, PNG, PDF (עד 5MB)"
  },
  en: {
    title: "Teacher Identity Verification",
    subtitle: "To become a verified teacher, identity verification is required",
    idDocument: "ID Card/Passport",
    teachingCertificate: "Teaching Certificate/Academic Degree",
    additionalDocs: "Additional Documents (Optional)",
    uploadDocument: "Upload Document",
    uploading: "Uploading...",
    submit: "Submit for Verification",
    submitting: "Submitting...",
    success: "Documents submitted successfully! We'll review them within 2-3 business days.",
    requirements: "Verification Requirements:",
    req1: "Clear photo of ID card or passport",
    req2: "Relevant academic degree or teaching certificate",
    req3: "All documents must be clear and readable",
    fileTypes: "Supported files: JPG, PNG, PDF (up to 5MB)"
  }
};

export default function TutorVerificationForm({ userId, language = 'he', onSubmitted }) {
  const [documents, setDocuments] = useState({
    id_card: null,
    teaching_certificate: null,
    additional: []
  });
  const [uploading, setUploading] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const t = translations[language];

  const handleFileUpload = async (documentType, file) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('גודל הקובץ חורג מ-5MB');
      return;
    }

    setUploading(prev => ({ ...prev, [documentType]: true }));
    setError('');

    try {
      const result = await UploadFile({ file });
      setDocuments(prev => ({
        ...prev,
        [documentType]: {
          file_url: result.file_url,
          file_name: file.name,
          document_type: documentType
        }
      }));
    } catch (err) {
      setError('שגיאה בהעלאת הקובץ');
      console.error('Upload error:', err);
    } finally {
      setUploading(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const handleSubmit = async () => {
    if (!documents.id_card || !documents.teaching_certificate) {
      setError('נדרש להעלות לפחות תעודת זהות ותעודת הוראה');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const verificationData = {
        user_id: userId,
        verification_type: 'tutor_verification',
        documents: [
          {
            document_type: 'id_card',
            file_url: documents.id_card.file_url,
            file_name: documents.id_card.file_name,
            status: 'pending'
          },
          {
            document_type: 'teaching_certificate',
            file_url: documents.teaching_certificate.file_url,
            file_name: documents.teaching_certificate.file_name,
            status: 'pending'
          },
          ...documents.additional.map(doc => ({
            document_type: 'additional',
            file_url: doc.file_url,
            file_name: doc.file_name,
            status: 'pending'
          }))
        ],
        overall_status: 'pending'
      };

      await IdentityVerification.create(verificationData);
      setSubmitted(true);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      setError('שגיאה בשליחת המסמכים');
      console.error('Submission error:', err);
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
        <h3 className="text-xl font-semibold text-green-800 mb-2">המסמכים נשלחו!</h3>
        <p className="text-gray-600">{t.success}</p>
      </motion.div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {t.title}
        </CardTitle>
        <p className="text-gray-600">{t.subtitle}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Requirements */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">{t.requirements}</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• {t.req1}</li>
            <li>• {t.req2}</li>
            <li>• {t.req3}</li>
          </ul>
          <p className="text-xs text-gray-500 mt-2">{t.fileTypes}</p>
        </div>

        {/* ID Document Upload */}
        <div>
          <Label className="text-base font-medium">{t.idDocument} *</Label>
          <div className="mt-2">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileUpload('id_card', e.target.files[0])}
              className="hidden"
              id="id-upload"
            />
            <label
              htmlFor="id-upload"
              className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                documents.id_card ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {uploading.id_card ? (
                <div className="text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm">{t.uploading}</p>
                </div>
              ) : documents.id_card ? (
                <div className="text-center text-green-600">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">{documents.id_card.file_name}</p>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <Upload className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">{t.uploadDocument}</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Teaching Certificate Upload */}
        <div>
          <Label className="text-base font-medium">{t.teachingCertificate} *</Label>
          <div className="mt-2">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileUpload('teaching_certificate', e.target.files[0])}
              className="hidden"
              id="cert-upload"
            />
            <label
              htmlFor="cert-upload"
              className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                documents.teaching_certificate ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {uploading.teaching_certificate ? (
                <div className="text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm">{t.uploading}</p>
                </div>
              ) : documents.teaching_certificate ? (
                <div className="text-center text-green-600">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">{documents.teaching_certificate.file_name}</p>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <Upload className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">{t.uploadDocument}</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={submitting || !documents.id_card || !documents.teaching_certificate}
          className="w-full"
        >
          {submitting ? t.submitting : t.submit}
        </Button>
      </CardContent>
    </Card>
  );
}