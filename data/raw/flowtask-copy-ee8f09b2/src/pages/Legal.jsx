
import React from 'react';
import { motion } from 'framer-motion';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Twitter } from 'lucide-react';

const Header = () => (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex-1 flex justify-start">
                    <a href={createPageUrl('Home')} className="flex items-baseline gap-2">
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-2xl font-semibold tracking-tight text-gray-900"
                        >
                            FlowTask
                        </motion.div>
                        <motion.span
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0, transition: { delay: 0.1 } }}
                            className="text-xs font-medium text-gray-400 hidden sm:inline-block"
                        >
                            by Gianni
                        </motion.span>
                    </a>
                </div>
                <nav className="hidden md:flex items-center gap-8">
                    <a href={createPageUrl('Home') + '#preview'} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        Product
                    </a>
                    <a href={createPageUrl('Home') + '#principles'} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        Principles
                    </a>
                    <a href={createPageUrl('Home') + '#features'} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        Features
                    </a>
                </nav>
                <div className="flex-1 flex justify-end">
                    <div className="flex items-center gap-3">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                            <Button
                                onClick={async () => {
                                    try {
                                        const redirectUrl = window.location.origin + createPageUrl('Todo');
                                        await User.loginWithRedirect(redirectUrl);
                                    } catch (error) {
                                        console.error("Login failed:", error);
                                    }
                                }}
                                variant="ghost"
                                className="text-gray-600 hover:text-gray-900 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                            >
                                Login
                            </Button>
                            <Button
                                onClick={() => window.location.href = createPageUrl('Home')}
                                className="bg-gray-900 text-white hover:bg-gray-800 text-sm font-medium px-6 py-2.5 rounded-lg transition-all duration-200"
                            >
                                Get Started
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    </header>
);

const Footer = () => (
    <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-12 sm:pt-16 pb-8 sm:pb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
                <div className="col-span-1 sm:col-span-2 md:col-span-1 text-center sm:text-left">
                    <h3 className="font-semibold text-gray-900 mb-4">FlowTask</h3>
                    <p className="text-gray-500 mb-4">The OS for your focus.</p>
                    <div className="flex justify-center sm:justify-start">
                        <a href="https://x.com/notgiannei" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors">
                            <Twitter className="w-5 h-5" />
                        </a>
                    </div>
                </div>
                <div className="text-center sm:text-left">
                    <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
                    <ul className="space-y-3">
                        <li><a href={createPageUrl('Home') + '#features'} className="text-gray-500 hover:text-gray-900">Features</a></li>
                        <li><a href={createPageUrl('Home') + '#principles'} className="text-gray-500 hover:text-gray-900">Principles</a></li>
                        <li><a href={createPageUrl('Home') + '#preview'} className="text-gray-500 hover:text-gray-900">Demo</a></li>
                    </ul>
                </div>
                <div className="text-center sm:text-left">
                    <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
                    <ul className="space-y-3">
                        <li><a href={createPageUrl('About')} className="text-gray-500 hover:text-gray-900">About Us</a></li>
                        <li><a href={createPageUrl('About')} className="text-gray-500 hover:text-gray-900">Contact</a></li>
                    </ul>
                </div>
                <div className="text-center sm:text-left">
                    <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
                    <ul className="space-y-3">
                        <li><a href={createPageUrl('Legal')} className="text-gray-500 hover:text-gray-900">Privacy Policy</a></li>
                        <li><a href={createPageUrl('Legal')} className="text-gray-500 hover:text-gray-900">Terms of Service</a></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-gray-200 mt-8 sm:mt-10 pt-6 sm:pt-8">
                <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4 text-sm text-gray-500">
                    <p className="text-center sm:text-left">© 2025 FlowTask Inc. All rights reserved.</p>
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🇨🇭</span>
                        <span>Made in Switzerland</span>
                    </div>
                </div>
            </div>
        </div>
    </footer>
);

export default function LegalPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <Header />
            
            <main className="pt-32 pb-16 px-4 sm:px-6 md:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-tight text-gray-900 mb-8"
                    >
                        Legal Stuff
                    </motion.h1>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-center max-w-2xl mx-auto"
                    >
                        <p className="text-xl text-gray-600 font-light mb-8 leading-relaxed">
                            FlowTask is a side project and we're still building. 
                            Proper legal pages are coming soon! 🚧
                        </p>
                        
                        <p className="text-lg text-gray-500 font-light mb-8">
                            For now, if you have any questions or concerns, feel free to reach out:
                        </p>
                        
                        <div className="bg-gray-50 rounded-2xl p-6 inline-block">
                            <p className="text-gray-700 font-mono">
                                gmxhodel [at] gmail [dot] com
                            </p>
                        </div>
                    </motion.div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
}
