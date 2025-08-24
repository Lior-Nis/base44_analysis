import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { sendSMS } from '@/api/functions';
import { User } from '@/api/entities';
import { Loader2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const translations = {
  he: {
    title: "שלח הודעת SMS",
    phoneNumber: "מספר טלפון",
    phonePlaceholder: "לדוגמה: 0501234567",
    message: "הודעה",
    messagePlaceholder: "כתוב את ההודעה שלך כאן...",
    send: "שלח",
    sending: "שולח...",
    success: "הודעת ה-SMS נשלחה בהצלחה!",
    error: "שגיאה בשליחת ההודעה.",
    sendAnother: "שלח עוד אחת",
    missingPhone: "מספר הטלפון שלך לא מוגדר בפרופיל.",
    updateProfile: "עדכן פרופיל"
  },
  en: {
    title: "Send SMS Notification",
    phoneNumber: "Phone Number",
    phonePlaceholder: "e.g., 0501234567",
    message: "Message",
    messagePlaceholder: "Type your message here...",
    send: "Send",
    sending: "Sending...",
    success: "SMS sent successfully!",
    error: "Error sending SMS.",
    sendAnother: "Send Another",
    missingPhone: "Your phone number is not set in your profile.",
    updateProfile: "Update Profile"
  }
};

export default function SMSNotifier({ language = 'he', onNotificationSent }) {
  const [user, setUser] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle, sending, success, error
  const [errorMsg, setErrorMsg] = useState('');
  const t = translations[language];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
        if (userData.phone_number) {
          setPhoneNumber(userData.phone_number);
        }
      } catch (e) {
        console.error("Could not fetch user for SMS component", e);
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim() || !message.trim()) return;

    setStatus('sending');
    setErrorMsg('');
    try {
      const result = await sendSMS({ to: phoneNumber, message });
      const responseData = result.data;

      if (responseData.status === 'success') {
        setStatus('success');
        setMessage('');
        if (onNotificationSent) onNotificationSent(responseData);
      } else {
        throw new Error(responseData.error_message || t.error);
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
      if (onNotificationSent) onNotificationSent({ error: err });
    }
  };

  if (status === 'success') {
    return (
        <Card className="text-center p-6 bg-green-50 border-green-200">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-800">{t.success}</h3>
                <Button onClick={() => setStatus('idle')} className="mt-4">{t.sendAnother}</Button>
            </motion.div>
        </Card>
    );
  }

  return (
    <Card className="bg-white/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="phone-number">{t.phoneNumber}</Label>
            <Input
              id="phone-number"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder={t.phonePlaceholder}
              disabled={status === 'sending' || !!user?.phone_number}
              className="bg-white/80"
            />
            {!phoneNumber && (
                <p className="text-xs text-red-500 mt-1">
                  {t.missingPhone} <Link to={createPageUrl("Profile")} className="underline">{t.updateProfile}</Link>
                </p>
            )}
          </div>
          <div>
            <Label htmlFor="sms-message">{t.message}</Label>
            <Textarea
              id="sms-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.messagePlaceholder}
              rows={4}
              disabled={status === 'sending'}
              className="bg-white/80"
            />
          </div>
          {status === 'error' && (
            <p className="text-sm text-red-500">{errorMsg}</p>
          )}
          <Button type="submit" disabled={!phoneNumber.trim() || !message.trim() || status === 'sending'} className="w-full">
            {status === 'sending' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.sending}
              </>
            ) : t.send}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}