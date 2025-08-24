import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PaymentSuccess() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <CheckCircle className="w-24 h-24 text-green-500 mb-8" />
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md">
        Thank you for your booking. You will receive a confirmation email shortly with the details of your appointment.
      </p>
      <Link to={createPageUrl('Home')}>
        <Button size="lg" className="bg-black text-white hover:bg-gray-800">
          Return to Homepage
        </Button>
      </Link>
    </div>
  );
}