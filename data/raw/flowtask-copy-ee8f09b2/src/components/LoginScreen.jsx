import React from 'react';
import { motion } from 'framer-motion';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function LoginScreen() {
    const handleLogin = async () => {
        try {
            await User.loginWithRedirect(createPageUrl('Board'));
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        >
                            <Lock className="w-8 h-8 text-white" />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-white mb-2">FlowTask</h1>
                        <p className="text-gray-300">Log in to access your board</p>
                    </div>
                    <div className="flex justify-center">
                        <Button
                            onClick={handleLogin}
                            className="w-full bg-white text-gray-900 hover:bg-gray-100 rounded-2xl py-3 font-medium transition-colors"
                        >
                            Login with Google
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}