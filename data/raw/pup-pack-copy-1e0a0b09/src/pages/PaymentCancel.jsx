
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { XCircle, ArrowLeft } from "lucide-react";
import { useHapticFeedback } from "../components/useHapticFeedback.js";

export default function PaymentCancel() {
  const triggerHaptic = useHapticFeedback();
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-12 border border-white/20 shadow-xl">
          <XCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Payment Canceled</h1>
          <p className="text-white/80 mb-8">
            Your payment was not completed. You can go back and try again or choose a different package.
          </p>
          <Link
            to={createPageUrl("Home")}
            onClick={triggerHaptic}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl border border-white/30 hover:bg-white/30 transition-all font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Packages
          </Link>
        </div>
      </div>
    </div>
  );
}
