
import React, { useEffect } from 'react';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';

export default function Redirector() {
  useEffect(() => {
    const routeUser = async () => {
      try {
        const user = await User.me();
        // Check if user is an expert by looking for expert_specialty
        if (user.expert_specialty) {
          window.location.href = createPageUrl('ExpertDashboard');
        } else {
          // Send regular users to their dashboard
          window.location.href = createPageUrl('Dashboard');
        }
      } catch (error) {
        // If not logged in for any reason, send to the Home page
        window.location.href = createPageUrl('Home');
      }
    };
    routeUser();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Checking your credentials...</p>
      </div>
    </div>
  );
}
