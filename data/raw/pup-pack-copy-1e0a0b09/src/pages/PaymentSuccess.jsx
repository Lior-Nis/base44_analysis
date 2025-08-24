import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { checkPaymentStatus } from "@/api/functions";
import { CheckCircle, ArrowRight, Loader } from "lucide-react";
import { useHapticFeedback } from "../components/useHapticFeedback.js";

export default function PaymentSuccess() {
  const triggerHaptic = useHapticFeedback();
  const [loading, setLoading] = useState(true);
  const [orderCreated, setOrderCreated] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    processPayment();
  }, []);

  const processPayment = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');
      const pendingOrderId = localStorage.getItem('pendingOrderId');
      
      if (!sessionId) {
        throw new Error('No session ID found');
      }

      const response = await checkPaymentStatus({
        sessionId,
        pendingOrderId
      });

      if (response.data.success) {
        setOrderCreated(true);
        // Clear the pending order from localStorage
        localStorage.removeItem('pendingOrderId');
      } else {
        throw new Error(response.data.message || 'Payment verification failed');
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="backdrop-blur-md bg-white/10 rounded-2xl p-12 border border-white/20 shadow-xl">
            <Loader className="w-12 h-12 text-white mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-white mb-2">Processing Payment...</h1>
            <p className="text-white/80">Please wait while we confirm your payment</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="backdrop-blur-md bg-white/10 rounded-2xl p-12 border border-white/20 shadow-xl">
            <h1 className="text-2xl font-bold text-white mb-4">Payment Error</h1>
            <p className="text-white/80 mb-8">{error}</p>
            <Link
              to={createPageUrl("Home")}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl border border-white/30 hover:bg-white/30 transition-all font-semibold"
            >
              Try Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-12 border border-white/20 shadow-xl">
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Payment Successful!</h1>
          <p className="text-white/80 mb-8">
            Thank you for your purchase! Your transformation credits have been added to your account. You can now upload your dog photos.
          </p>
          <Link
            to={createPageUrl("Dashboard")}
            onClick={triggerHaptic}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-semibold"
          >
            Go to Dashboard <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}