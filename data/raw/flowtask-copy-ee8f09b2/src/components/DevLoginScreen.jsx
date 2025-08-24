import React from 'react';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

const DevLoginScreen = () => {
    const handleLogin = async () => {
        try {
            // Redirect back to the Dev page after login
            const redirectUrl = window.location.origin + createPageUrl('Dev');
            await User.loginWithRedirect(redirectUrl);
        } catch (error) {
            console.error("Login redirection failed:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-6">
                    <Lock className="h-8 w-8 text-gray-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                <p className="text-gray-600 mb-8">
                    This is a restricted area. Please log in to continue.
                p>
                <Button
                    onClick={handleLogin}
                    className="w-full bg-gray-900 text-white hover:bg-gray-800 rounded-lg py-3 text-md font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                    Log In to Dev Environment
                </Button>
            </div>
        </div>
    );
};

export default DevLoginScreen;