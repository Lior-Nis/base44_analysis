
import React from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import GoogleIcon from './GoogleIcon';
import { useLocalization } from "@/components/common/Localization";

export default function LoginScreen() {
    const { t } = useLocalization();
    const handleLogin = async () => {
        try {
            await User.login();
        } catch (error) {
            console.error("Login failed:", error);
            alert("Login failed. Please try again.");
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                <Card className="bg-white rounded-2xl shadow-xl border-0 p-8">
                    <CardContent className="space-y-4">
                        {/* WorkerMeet Logo */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15 18C15 16.3431 16.3431 15 18 15H30C31.6569 15 33 16.3431 33 18V22H36C37.1046 22 38 22.8954 38 24V32C38 33.1046 37.1046 34 36 34H33V30C33 28.3431 31.6569 27 30 27H18C16.3431 27 15 28.3431 15 30V34H12C10.8954 34 10 33.1046 10 32V24C10 22.8954 10.8954 22 12 22H15V18Z" fill="white"/>
                                    <circle cx="24" cy="12" r="4" fill="white"/>
                                </svg>
                            </div>
                        </div>
                        
                        {/* Title */}
                        <div className="text-center space-y-1 mb-6">
                            <h1 className="text-2xl font-bold text-gray-800">
                                {t('welcomeTo')} {t('appName')}
                            </h1>
                            <p className="text-gray-500">
                                {t('signInToContinue')}
                            </p>
                        </div>

                        {/* Google Sign In Button */}
                        <Button 
                            onClick={handleLogin}
                            variant="outline"
                            className="w-full py-3 text-base font-medium border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-3 mb-4"
                        >
                            <GoogleIcon />
                            {t('continueWithGoogle')}
                        </Button>

                        {/* Divider */}
                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">{t('or')}</span>
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2 text-left">
                            <label className="text-gray-700 font-medium text-sm">{t('email')}</label>
                            <Input 
                                type="email"
                                placeholder="you@example.com"
                                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                disabled
                            />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2 text-left">
                            <label className="text-gray-700 font-medium text-sm">{t('password')}</label>
                            <Input 
                                type="password"
                                placeholder="••••••••"
                                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                disabled
                            />
                        </div>

                        {/* Sign In Button */}
                        <Button 
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg font-semibold rounded-lg shadow-md transition-all duration-200 disabled:bg-orange-400"
                            disabled
                        >
                            {t('signIn')}
                        </Button>

                        {/* Footer Links */}
                        <div className="text-center space-y-2 pt-2">
                            <button className="text-sm text-gray-500 hover:text-orange-500 transition-colors block">
                                {t('forgotPassword')}
                            </button>
                            <div className="text-sm text-gray-500">
                                {t('needAnAccount')} 
                                <button className="font-semibold text-orange-500 hover:text-orange-600 ml-1">
                                    {t('signUp')}
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
