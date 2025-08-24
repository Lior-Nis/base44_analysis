import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User as UserEntity } from '@/api/entities';
import { Lock } from 'lucide-react';

// Custom SVG icons for brands
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25C22.56 11.45 22.49 10.68 22.36 9.92H12V14.49H18.06C17.73 16.14 16.85 17.56 15.39 18.51V21.09H19.14C21.32 19.13 22.56 15.99 22.56 12.25Z" fill="#4285F4"/>
    <path d="M12 23C14.97 23 17.45 22.04 19.14 20.45L15.39 17.87C14.39 18.57 13.25 18.99 12 18.99C9.37 18.99 7.14 17.34 6.29 15.07H2.4V17.75C4.12 20.94 7.74 23 12 23Z" fill="#34A853"/>
    <path d="M6.29 15.07C6.08 14.48 5.96 13.86 5.96 13.24C5.96 12.62 6.08 12 6.29 11.41V8.73H2.4C1.66 10.14 1.25 11.65 1.25 13.24C1.25 14.83 1.66 16.34 2.4 17.75L6.29 15.07Z" fill="#FBBC05"/>
    <path d="M12 7.48C13.49 7.48 14.71 7.99 15.63 8.87L19.21 5.29C17.45 3.73 14.97 2.75 12 2.75C7.74 2.75 4.12 4.98 2.4 8.17L6.29 10.85C7.14 8.58 9.37 7.48 12 7.48Z" fill="#EA4335"/>
  </svg>
);
const FacebookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v7.028C18.343 21.128 22 16.991 22 12Z" />
  </svg>
);
const MicrosoftIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.4 11.4H2.25V2.25H11.4V11.4Z" fill="#F25022"/>
    <path d="M21.75 11.4H12.6V2.25H21.75V11.4Z" fill="#7FBA00"/>
    <path d="M11.4 21.75H2.25V12.6H11.4V21.75Z" fill="#00A4EF"/>
    <path d="M21.75 21.75H12.6V12.6H21.75V21.75Z" fill="#FFB900"/>
  </svg>
);

export default function AuthPrompt({ title, message }) {
  const authProviders = [
    { name: "Google", provider: "google", icon: <GoogleIcon />, style: "text-gray-700 border-gray-300" },
    { name: "Facebook", provider: "facebook", icon: <FacebookIcon />, style: "text-white bg-[#1877F2] border-[#1877F2]" },
    { name: "Microsoft", provider: "microsoft", icon: <MicrosoftIcon />, style: "text-gray-700 border-gray-300" },
  ];

  const handleLogin = async (provider) => {
    await UserEntity.loginWithRedirect(`${window.location.origin}${window.location.pathname}`);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="max-w-md w-full soft-shadow">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary-cta)] to-[var(--highlights-accents)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-poppins">{title}</CardTitle>
          <p className="text-[var(--text-muted)] pt-2">{message}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {authProviders.map((provider) => (
            <Button
              key={provider.provider}
              variant="outline"
              className={`w-full justify-center gap-3 py-6 text-base ${provider.style}`}
              onClick={() => handleLogin(provider.provider)}
            >
              {provider.icon}
              Sign in with {provider.name}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}