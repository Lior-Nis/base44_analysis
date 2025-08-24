import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { sendSlackNotification } from '@/api/functions';
import { Loader2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const translations = {
  he: {
    title: "שלח התראת Slack",
    message: "הודעה",
    placeholder: "כתוב את ההודעה שלך כאן...",
    send: "שלח",
    sending: "שולח...",
    success: "ההתראה נשלחה בהצלחה!",
    error: "שגיאה בשליחת ההתראה.",
    sendAnother: "שלח עוד אחת"
  },
  en: {
    title: "Send Slack Notification",
    message: "Message",
    placeholder: "Type your message here...",
    send: "Send",
    sending: "Sending...",
    success: "Notification sent successfully!",
    error: "Error sending notification.",
    sendAnother: "Send Another"
  }
};

export default function SlackNotifier({ language = 'he', onNotificationSent }) {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle, sending, success, error
  const [errorMsg, setErrorMsg] = useState('');
  const t = translations[language];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus('sending');
    setErrorMsg('');
    try {
      const result = await sendSlackNotification({ message, type: 'info', data: { manual_message: message } });
      if (result?.data?.status === 'success') {
        setStatus('success');
        setMessage('');
        if (onNotificationSent) onNotificationSent(result);
      } else {
        throw new Error(result?.data?.error_message || t.error);
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
            <Label htmlFor="slack-message">{t.message}</Label>
            <Textarea
              id="slack-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.placeholder}
              rows={4}
              disabled={status === 'sending'}
              className="bg-white/80"
            />
          </div>
          {status === 'error' && (
            <p className="text-sm text-red-500">{errorMsg}</p>
          )}
          <Button type="submit" disabled={!message.trim() || status === 'sending'} className="w-full">
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