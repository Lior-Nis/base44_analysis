import React from 'react';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PaymentCancel() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <XCircle className="w-24 h-24 text-red-500 mb-8" />
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Canceled</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md">
        Your payment process was canceled. Your booking has not been confirmed. Please return to the homepage to try again.
      </p>
      <Link to={createPageUrl('Home')}>
        <Button size="lg" className="bg-black text-white hover:bg-gray-800">
          Return to Homepage
        </Button>
      </Link>
    </div>
  );
}