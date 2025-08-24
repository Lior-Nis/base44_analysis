import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaymentTransaction } from '@/api/entities';
import { LessonBooking } from '@/api/entities';
import { CreditCard, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const translations = {
  he: {
    paymentStatus: "סטטוס תשלום",
    escrowExplanation: "התשלום מוחזק בנאמנות עד השלמת השיעור",
    amount: "סכום השיעור",
    platformFee: "עמלת פלטפורמה",
    total: "סך הכל",
    statuses: {
      pending: "ממתין לתשלום",
      held: "מוחזק בנאמנות", 
      released_to_tutor: "שולם למורה",
      refunded_to_student: "הוחזר לתלמיד"
    },
    confirmCompletion: "אשר השלמת שיעור",
    requestRefund: "בקש החזר",
    releasePayment: "שחרר תשלום",
    disputePayment: "פתח מחלוקת"
  },
  en: {
    paymentStatus: "Payment Status",
    escrowExplanation: "Payment is held in escrow until lesson completion",
    amount: "Lesson Amount",
    platformFee: "Platform Fee",
    total: "Total",
    statuses: {
      pending: "Pending Payment",
      held: "Held in Escrow",
      released_to_tutor: "Released to Tutor", 
      refunded_to_student: "Refunded to Student"
    },
    confirmCompletion: "Confirm Lesson Completion",
    requestRefund: "Request Refund",
    releasePayment: "Release Payment",
    disputePayment: "Open Dispute"
  }
};

export default function PaymentEscrowSystem({ 
  bookingId, 
  currentUserId, 
  userRole, // 'student' or 'tutor'
  language = 'he' 
}) {
  const [transaction, setTransaction] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const t = translations[language];

  useEffect(() => {
    loadPaymentData();
  }, [bookingId]);

  const loadPaymentData = async () => {
    setLoading(true);
    try {
      const [transactionData, bookingData] = await Promise.all([
        PaymentTransaction.filter({ booking_id: bookingId }),
        LessonBooking.get(bookingId)
      ]);
      
      setTransaction(transactionData[0] || null);
      setBooking(bookingData);
    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmLessonCompletion = async () => {
    setProcessing(true);
    try {
      // Update booking status
      const updateField = userRole === 'student' ? 
        'student_confirmed_completion' : 'tutor_confirmed_completion';
      
      await LessonBooking.update(bookingId, { 
        [updateField]: true,
        completion_date: new Date().toISOString()
      });

      // If both confirmed, release payment
      const updatedBooking = await LessonBooking.get(bookingId);
      if (updatedBooking.student_confirmed_completion && updatedBooking.tutor_confirmed_completion) {
        await PaymentTransaction.update(transaction.id, {
          escrow_status: 'released_to_tutor',
          release_date: new Date().toISOString(),
          status: 'completed'
        });
      }

      loadPaymentData();
    } catch (error) {
      console.error('Error confirming completion:', error);
    } finally {
      setProcessing(false);
    }
  };

  const requestRefund = async () => {
    setProcessing(true);
    try {
      await PaymentTransaction.update(transaction.id, {
        status: 'disputed'
      });
      
      await LessonBooking.update(bookingId, {
        status: 'disputed',
        dispute_reason: 'Student requested refund'
      });

      loadPaymentData();
    } catch (error) {
      console.error('Error requesting refund:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!transaction) {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">לא נמצא מידע על תשלום</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'held': return 'bg-blue-100 text-blue-800';
      case 'released_to_tutor': return 'bg-green-100 text-green-800';
      case 'refunded_to_student': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'held': return <CreditCard className="w-4 h-4" />;
      case 'released_to_tutor': return <CheckCircle className="w-4 h-4" />;
      case 'refunded_to_student': return <RefreshCw className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const canConfirmCompletion = booking?.status === 'completed' && 
    transaction?.escrow_status === 'held' &&
    ((userRole === 'student' && !booking.student_confirmed_completion) ||
     (userRole === 'tutor' && !booking.tutor_confirmed_completion));

  const canRequestRefund = userRole === 'student' && 
    transaction?.escrow_status === 'held' &&
    booking?.status !== 'completed';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          {t.paymentStatus}
        </CardTitle>
        <p className="text-sm text-gray-600">{t.escrowExplanation}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <Badge className={`${getStatusColor(transaction.escrow_status)} flex items-center gap-1`}>
            {getStatusIcon(transaction.escrow_status)}
            {t.statuses[transaction.escrow_status]}
          </Badge>
        </div>

        {/* Payment Breakdown */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span>{t.amount}:</span>
            <span>₪{transaction.amount}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>{t.platformFee}:</span>
            <span>₪{transaction.platform_fee}</span>
          </div>
          <div className="flex justify-between font-semibold border-t pt-2">
            <span>{t.total}:</span>
            <span>₪{transaction.total_amount}</span>
          </div>
        </div>

        {/* Completion Status */}
        {booking && (
          <div className="space-y-2">
            <div className="text-sm">
              <div className={`flex items-center gap-2 ${booking.student_confirmed_completion ? 'text-green-600' : 'text-gray-500'}`}>
                {booking.student_confirmed_completion ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                אישור תלמיד: {booking.student_confirmed_completion ? 'אושר' : 'ממתין'}
              </div>
              <div className={`flex items-center gap-2 ${booking.tutor_confirmed_completion ? 'text-green-600' : 'text-gray-500'}`}>
                {booking.tutor_confirmed_completion ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                אישור מורה: {booking.tutor_confirmed_completion ? 'אושר' : 'ממתין'}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {canConfirmCompletion && (
            <Button
              onClick={confirmLessonCompletion}
              disabled={processing}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {processing ? 'מעבד...' : t.confirmCompletion}
            </Button>
          )}

          {canRequestRefund && (
            <Button
              onClick={requestRefund}
              disabled={processing}
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
            >
              {processing ? 'מעבד...' : t.requestRefund}
            </Button>
          )}
        </div>

        {/* Auto-release info */}
        {transaction.escrow_status === 'held' && (
          <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
            💡 התשלום ישוחרר אוטומטית למורה לאחר 48 שעות מתום השיעור, אלא אם תתבקש מחלוקת.
          </div>
        )}
      </CardContent>
    </Card>
  );
}