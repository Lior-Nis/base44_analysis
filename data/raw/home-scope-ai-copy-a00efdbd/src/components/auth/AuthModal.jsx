
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User as UserEntity } from "@/api/entities";
import { createPageUrl } from "@/utils";
import { LogIn, UserPlus, Home as HomeIcon } from "lucide-react";

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  // Removed loginData and registerData state variables as they are no longer used for Google SSO
  // const [loginData, setLoginData] = useState({ email: '', password: '' });
  // const [registerData, setRegisterData] = useState({
  //   fullName: '',
  //   email: '',
  //   password: '',
  //   phone: '',
  //   propertyType: '',
  //   tenantOrOwner: ''
  // });

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // Use base44's built-in login system with redirect to our 'Redirector'
      await UserEntity.loginWithRedirect(window.location.origin + createPageUrl('Redirector'));
      onSuccess(); // Close modal on successful initiation
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
    }
    setIsLoading(false);
  };

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      // Use base44's built-in login system with redirect to our 'Redirector'
      await UserEntity.loginWithRedirect(window.location.origin + createPageUrl('Redirector'));
      onSuccess(); // Close modal on successful initiation
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center">
            <HomeIcon className="w-6 h-6 mr-2 text-green-600" />
            Welcome to HomeScope
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <div className="space-y-4">
              <div className="text-center text-sm text-gray-600">
                Sign in to access your HomeScope dashboard and manage your appointments.
              </div>

              <Button
                onClick={handleLogin}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                <LogIn className="w-4 h-4 mr-2" />
                {isLoading ? "Redirecting..." : "Sign In with Google"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <div className="space-y-4">
              <div className="text-center text-sm text-gray-600">
                Create your HomeScope account to book expert consultations and access exclusive features.
              </div>

              <Button
                onClick={handleRegister}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {isLoading ? "Redirecting..." : "Sign Up with Google"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </div>
      </DialogContent>
    </Dialog>
  );
}
