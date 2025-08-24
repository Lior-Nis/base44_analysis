
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Feather, Zap, Flame, Clock, Flag, Trash2, Twitter, BarChart3, Trophy, Timer, Settings, Archive, Edit2 } from 'lucide-react';

const Header = React.memo(() => (
    <header
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100"
        style={{ transform: 'translateZ(0)' }}
    >
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
                    <a href="#preview" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        Product
                    </a>
                    <a href="#principles" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        Principles
                    </a>
                    <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        Features
                    </a>
                </nav>

                <div className="flex-1 flex justify-end">
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
                            onClick={() => document.getElementById('get-started')?.click()}
                            className="bg-gray-900 text-white hover:bg-gray-800 text-sm font-medium px-6 py-2.5 rounded-lg transition-all duration-200"
                        >
                            Get Started
                        </Button>
                    </motion.div>
                </div>
            </div>
        </div>
    </header>
));

const Footer = React.memo(() => (
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
                        <li><a href="#features" className="text-gray-500 hover:text-gray-900">Features</a></li>
                        <li><a href="#principles" className="text-gray-500 hover:text-gray-900">Principles</a></li>
                        <li><a href="#preview" className="text-gray-500 hover:text-gray-900">Demo</a></li>
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
));

const ProductPreview = React.memo(() => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(today.getDate() - 2);

    const columns = [
        {
            title: 'Backlog',
            tasks: [
                { title: 'Refactor authentication service', priority: 'medium', created_date: twoDaysAgo.toISOString() },
                { title: 'Code review for payment gateway', priority: 'high', created_date: today.toISOString() },
            ]
        },
        {
            title: 'Today',
            tasks: [
                { title: 'Fix critical database performance issue', priority: 'high', created_date: today.toISOString() },
                { title: 'Deploy hotfix to production', priority: 'high', created_date: yesterday.toISOString() },
                { title: 'Update API documentation', priority: 'medium', created_date: today.toISOString() },
            ]
        },
        {
            title: 'Tomorrow',
            tasks: [
                { title: 'Implement user analytics dashboard', priority: 'medium', created_date: today.toISOString() },
                { title: 'Team standup and sprint planning', priority: 'low', created_date: yesterday.toISOString() },
            ]
        },
        {
            title: 'Weekend',
            tasks: [
                { title: 'Visit parents for dinner', priority: 'medium', created_date: yesterday.toISOString() },
                { title: 'Hiking with friends', priority: 'low', created_date: today.toISOString() },
            ]
        },
        {
            title: 'Done',
            tasks: [
                { title: 'Set up CI/CD pipeline for new service', priority: 'high', created_date: yesterday.toISOString(), completed: true, completed_at: today.toISOString() },
                { title: 'Buy groceries and meal prep', priority: 'medium', created_date: twoDaysAgo.toISOString(), completed: true, completed_at: yesterday.toISOString() },
            ]
        }
    ];

    const formatDaysAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        
        date.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);

        const diffTime = now.getTime() - date.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays}d ago`;
    };
    
    const priorityConfig = {
        high: { label: 'High', color: 'bg-red-100 text-red-700 border-red-200/80' },
        medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700 border-amber-200/80' },
        low: { label: 'Low', color: 'bg-blue-100 text-blue-700 border-blue-200/80' },
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative bg-white/80 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-2 sm:p-3 border border-gray-200/60 shadow-2xl shadow-gray-600/10"
        >
            <div className="h-10 sm:h-12 flex items-center justify-between gap-2 px-4 sm:px-5 bg-gray-100 rounded-t-xl sm:rounded-t-2xl border-b border-gray-200/80">
                <div className="flex gap-2">
                    <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-red-400" />
                    <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-green-400" />
                </div>
                <div className="bg-white h-6 sm:h-7 flex-grow max-w-lg rounded-lg shadow-inner flex items-center px-3 gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    <div className="text-xs text-gray-600 font-medium">www.flowtask.app</div>
                </div>
                <div className="w-8" />
            </div>
            
            <div className="bg-[#F7F7F7] rounded-b-xl sm:rounded-b-2xl min-h-[500px]">
                <div className="px-4 sm:px-6 pt-6 sm:pt-10 pb-6">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
                    >
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl sm:text-3xl font-light text-gray-900 tracking-tight">Gianni's Flow</h1>
                            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full shadow-lg">
                                <Flame className="w-4 h-4" />
                                <span className="font-bold text-sm">7</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-100/80 rounded-2xl p-1">
                            <button className="p-2 text-gray-500 hover:text-gray-800 transition-colors rounded-xl">
                                <Timer className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-500 hover:text-gray-800 transition-colors rounded-xl">
                                <BarChart3 className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-500 hover:text-gray-800 transition-colors rounded-xl">
                                <Trophy className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-500 hover:text-gray-800 transition-colors rounded-xl">
                                <Archive className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-500 hover:text-gray-800 transition-colors rounded-xl">
                                <Edit2 className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>

                    <div>
                        <div className="flex justify-between items-center text-sm mb-2">
                            <span className="font-medium text-gray-600">Daily Goal</span>
                            <span className="text-gray-500">2/10</span>
                        </div>
                        <div className="h-1.5 bg-gray-200/70 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                                initial={{ width: '0%' }}
                                whileInView={{ width: '20%' }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">8 tasks left for today</p>
                    </div>
                </div>

                <div className="overflow-x-auto pb-4">
                    <div className="flex gap-4 p-4 sm:gap-6 sm:p-6 min-w-max">
                        {columns.map((column, colIndex) => (
                            <motion.div 
                                key={column.title}
                                variants={{
                                    hidden: { opacity: 0, y: 30 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                initial="hidden"
                                whileInView="visible"
                                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: colIndex * 0.1 }}
                                className="bg-gray-100/70 rounded-2xl p-3 w-72 flex flex-col flex-shrink-0"
                            >
                                <div className="flex justify-between items-center mb-4 px-1">
                                    <h2 className="font-semibold text-gray-700">{column.title}</h2>
                                    <span className="text-sm font-medium text-gray-500 bg-gray-200 rounded-full px-2 py-0.5">
                                        {column.tasks.length}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {column.tasks.map((task, taskIndex) => (
                                        <motion.div 
                                            key={`${column.title}-${taskIndex}`}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true, amount: 0.5 }}
                                            transition={{ delay: 0.2 + (taskIndex * 0.05), duration: 0.4 }}
                                            className={`bg-white rounded-lg border shadow-sm group hover:shadow-md hover:border-gray-300 border-gray-200/80 p-4 transition-all ${task.completed ? 'opacity-70' : ''}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <p className={`font-medium text-gray-800 text-sm pr-4 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                                                    {task.title}
                                                </p>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="text-gray-400 hover:text-green-600 transition-colors flex-shrink-0">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </button>
                                                    <button className="text-gray-400 hover:text-rose-500 transition-colors flex-shrink-0">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-normal px-2 py-1 rounded border ${priorityConfig[task.priority]?.color}`}>
                                                        {priorityConfig[task.priority]?.label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{formatDaysAgo(task.created_date)}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

const MinimalismVisualization = React.memo(({ delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-6 sm:p-8 text-gray-900 relative overflow-hidden border border-gray-200/50 shadow-xl h-auto lg:h-[560px] flex flex-col"
        >
            <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                    <Feather className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                    <h3 className="text-xl sm:text-2xl font-light text-gray-800">Radical Minimalism</h3>
                </div>
                
                <div className="flex-1 mb-6 sm:mb-8 bg-gray-50 rounded-2xl p-4 sm:p-6 flex flex-col justify-center">
                    <div className="space-y-4 sm:space-y-6">
                        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
                            <div className="text-xs sm:text-sm text-gray-400 mb-2">What needs to be done?</div>
                            <div className="h-px bg-gray-200"></div>
                        </div>
                        
                        <div className="flex gap-2 sm:gap-4">
                            <div className="flex-1 bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
                                <div className="text-xs font-medium text-gray-600 mb-3">Today</div>
                                <div className="space-y-2">
                                    <div className="h-6 sm:h-8 bg-gray-100 rounded-lg"></div>
                                    <div className="h-6 sm:h-8 bg-gray-100 rounded-lg"></div>
                                </div>
                            </div>
                            <div className="flex-1 bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
                                <div className="text-xs font-medium text-gray-600 mb-3">Tomorrow</div>
                                <div className="space-y-2">
                                    <div className="h-6 sm:h-8 bg-gray-100 rounded-lg"></div>
                                </div>
                            </div>
                            <div className="flex-1 bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
                                <div className="text-xs font-medium text-gray-600 mb-3">Done</div>
                                <div className="space-y-2">
                                    <div className="h-6 sm:h-8 bg-green-100 rounded-lg"></div>
                                    <div className="h-6 sm:h-8 bg-green-100 rounded-lg"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200">
                            <div className="flex justify-between text-xs text-gray-500 mb-2">
                                <span>Daily Goal</span>
                                <span>3/10</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                                    initial={{ width: '0%' }}
                                    whileInView={{ width: '30%' }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-gray-500 text-sm leading-relaxed text-center mt-auto">
                    Three elements. Infinite focus. Everything you need, nothing you don't.
                </p>
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl" />
        </motion.div>
    );
});

const GamificationVisualization = React.memo(({ delay = 0 }) => {
    const [level, setLevel] = useState(1);
    const [xp, setXp] = useState(0);

    useEffect(() => {
        const xpLevels = [0, 15, 35, 60, 90, 125, 165, 210];
        let index = 0;
        const interval = setInterval(() => {
            index = (index + 1) % xpLevels.length;
            setXp(xpLevels[index]);
            setLevel(Math.min(7, Math.floor(xpLevels[index] / 30) + 1)); 
        }, 800);
        return () => clearInterval(interval);
    }, []);

    const xpForNextLevel = (Math.floor(xp/30) + 1) * 30;
    const progress = (xp % 30 / 30) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-6 sm:p-8 text-gray-900 relative overflow-hidden border border-gray-200/50 shadow-xl h-auto lg:h-[560px] flex flex-col"
        >
            <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
                    <h3 className="text-xl sm:text-2xl font-light text-gray-800">Intelligent Gamification</h3>
                </div>

                <div className="flex-1 mb-6 sm:mb-8 bg-gray-50 rounded-2xl p-4 sm:p-6 flex flex-col justify-center">
                    <motion.div 
                        key={level}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-6xl sm:text-7xl mb-4 text-center"
                    >
                        {['🌱', '🐣', '🦊', '🐺', '🦉', '🦅', '🏆'][level - 1] || '🌟'}
                    </motion.div>
                    
                    <div className="mb-6 text-center">
                        <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Level {level}</div>
                        <div className="text-sm sm:text-base text-gray-500">{xp} / {xpForNextLevel} XP</div>
                    </div>

                    <div className="h-2 sm:h-3 bg-gray-200 rounded-full overflow-hidden mb-6">
                        <motion.div
                            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-white rounded-xl p-3 border border-gray-200 text-center">
                            <div className="text-xs text-amber-600 mb-1 sm:mb-2 font-medium">STREAK</div>
                            <div className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
                               <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500"/> 12
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-200 text-center">
                            <div className="text-xs text-blue-600 mb-1 sm:mb-2 font-medium">ACHIEVEMENTS</div>
                            <div className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
                                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500"/> 4
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-gray-500 text-sm leading-relaxed text-center mt-auto">
                    Subtle rewards that build genuine momentum and maintain your natural flow state.
                </p>
            </div>

            <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="absolute top-0 right-0 w-28 h-28 bg-orange-500/5 rounded-full blur-2xl" />
        </motion.div>
    );
});

const FeaturesSection = React.memo(() => {
    const features = [
        {
            title: "Radical Minimalism",
            description: "A clean, intuitive interface that gets out of your way so you can focus on what truly matters.",
            icon: Feather,
            visualization: (
                <div className="relative h-48 w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden">
                    <div className="absolute inset-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm mb-3">
                            <div className="h-2 bg-gray-200 rounded mb-2"></div>
                            <div className="h-1 bg-gray-100 rounded w-3/4"></div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm mb-3">
                            <div className="h-2 bg-gray-200 rounded mb-2"></div>
                            <div className="h-1 bg-gray-100 rounded w-2/3"></div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm opacity-60">
                            <div className="h-2 bg-gray-200 rounded mb-2"></div>
                            <div className="h-1 bg-gray-100 rounded w-1/2"></div>
                        </div>
                    </div>
                    <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
            )
        },
        {
            title: "Intelligent Gamification",
            description: "Stay motivated with subtle rewards that build genuine momentum, without distracting you.",
            icon: Zap,
            visualization: (
                <div className="relative h-48 w-full bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl overflow-hidden flex items-center justify-center">
                    <div className="text-center">
                        <motion.div
                            animate={{ 
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="text-4xl mb-2"
                        >
                            🏆
                        </motion.div>
                        <div className="text-xl font-bold text-gray-900 mb-1">Level 5</div>
                        <div className="w-24 h-2 bg-amber-200 rounded-full overflow-hidden mx-auto">
                            <motion.div
                                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                                animate={{ width: ["0%", "70%"] }}
                                transition={{ duration: 2, ease: "easeOut" }}
                            />
                        </div>
                        <div className="text-xs text-gray-600 mt-1">1,240 XP</div>
                    </div>
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs">
                        <Flame className="w-3 h-3" />
                        <span className="font-bold">12</span>
                    </div>
                </div>
            )
        },
        {
            title: "Built-in Focus Timer",
            description: "Use the Pomodoro technique to dedicate focused time blocks to your most important tasks.",
            icon: Timer,
            visualization: (
                <div className="relative h-48 w-full bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl overflow-hidden flex items-center justify-center">
                    <div className="relative">
                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="none"
                                className="text-green-200"
                            />
                            <motion.circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 40}`}
                                strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.7)}`}
                                className="text-green-500"
                                animate={{
                                    strokeDashoffset: [
                                        `${2 * Math.PI * 40}`,
                                        `${2 * Math.PI * 40 * (1 - 0.7)}`
                                    ]
                                }}
                                transition={{ duration: 2, ease: "easeOut" }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-mono font-bold text-gray-900">17:30</span>
                        </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-center text-sm text-gray-600">
                        Focus Session
                    </div>
                </div>
            )
        },
        {
            title: "Insightful Analytics",
            description: "Track your progress with a beautiful stats panel and see how productive you've become over time.",
            icon: BarChart3,
            visualization: (
                <div className="relative h-48 w-full bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl overflow-hidden p-4">
                    <div className="h-full flex items-end gap-2">
                        {[40, 65, 45, 80, 55, 90, 70].map((height, index) => (
                            <motion.div
                                key={index}
                                className="flex-1 bg-gradient-to-t from-purple-400 to-indigo-500 rounded-t"
                                initial={{ height: 0 }}
                                whileInView={{ height: `${height}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                            />
                        ))}
                    </div>
                    <div className="absolute top-4 right-4 bg-white rounded-lg px-3 py-1 shadow-sm">
                        <div className="text-xs text-gray-600">This week</div>
                        <div className="text-lg font-bold text-purple-600">+23%</div>
                    </div>
                </div>
            )
        },
        {
            title: "Customizable Workflow",
            description: "Create and arrange your own columns to build a workflow that perfectly matches your unique style.",
            icon: Edit2,
            visualization: (
                <div className="relative h-48 w-full bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl overflow-hidden p-4">
                    <div className="flex gap-2 h-full">
                        {['Todo', 'Doing', 'Done'].map((title, index) => (
                            <motion.div
                                key={title}
                                className="flex-1 bg-white rounded-lg p-2 shadow-sm border border-gray-200"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <div className="text-xs font-medium text-gray-700 mb-2">{title}</div>
                                <div className="space-y-1">
                                    <div className="h-4 bg-gray-100 rounded"></div>
                                    {index < 2 && <div className="h-4 bg-gray-100 rounded"></div>}
                                    {index === 2 && <div className="h-4 bg-green-100 rounded"></div>}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <motion.div
                        className="absolute top-2 right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center"
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                        <Edit2 className="w-3 h-3 text-white" />
                    </motion.div>
                </div>
            )
        },
        {
            title: "Automatic Archiving",
            description: "Completed tasks are auto-archived after 7 days, keeping your board clean and focused by default.",
            icon: Archive,
            visualization: (
                 <div className="relative h-48 w-full bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl overflow-hidden p-4">
                    <div className="space-y-2">
                        {[1, 2, 3, 4].map((_, index) => (
                            <motion.div
                                key={index}
                                className="h-8 bg-white rounded-lg border border-gray-200 flex items-center px-3"
                                initial={{ opacity: 1, x: 0 }}
                                animate={{
                                    opacity: index < 2 ? 0 : 1,
                                    x: index < 2 ? -50 : 0
                                }}
                                transition={{
                                    duration: 1.5,
                                    delay: index * 0.3,
                                    repeat: Infinity,
                                    repeatType: "loop",
                                    ease: "easeInOut"
                                }}
                            >
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                <div className="h-2 bg-gray-200 rounded flex-1"></div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="absolute bottom-4 right-4 flex items-center gap-1 text-xs text-gray-600 bg-white/50 backdrop-blur-sm px-2 py-1 rounded-md">
                        <Archive className="w-3 h-3" />
                        <span>Auto-archived</span>
                    </div>
                </div>
            )
        }
    ];

    return (
        <section id="features" className="py-24 sm:py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6 sm:px-8">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto text-center mb-16 sm:mb-20"
                >
                    <div className="space-y-2 mb-6">
                        <h2 className="text-4xl sm:text-5xl font-light text-gray-900 tracking-tight leading-tight">
                            Everything you need.
                        </h2>
                        <h2 className="text-4xl sm:text-5xl font-light text-gray-400 tracking-tight leading-tight">
                            Nothing you don't.
                        </h2>
                    </div>
                    <p className="text-lg text-gray-600 font-light leading-relaxed">
                        FlowTask is built on a foundation of core principles that create the perfect productivity experience.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.05, ease: 'easeOut' }}
                            viewport={{ once: true, amount: 0.3 }}
                            className="group relative bg-white rounded-3xl p-8 border border-gray-200/60 h-full transition-all duration-300 hover:border-gray-300 hover:shadow-2xl hover:shadow-gray-600/10"
                        >
                            <div className="relative flex flex-col h-full">
                                <div className="mb-6">
                                    {feature.visualization}
                                </div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        {React.createElement(feature.icon, { className: "w-5 h-5 text-gray-700" })}
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                                </div>
                                <p className="text-gray-600 font-light leading-relaxed flex-grow">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
});

const TestimonialSection = React.memo(() => {
  const companies = [
    { name: 'ABB', logo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/5f0e05654_ABB_logosvg.png' },
    { name: 'ARM', logo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/c7942e730_ARM_logosvg.png' },
    { name: 'Microsoft', logo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/bc6228e2a_ezgif-31bdc6f5f6dc5e.png' },
    { name: 'Netflix', logo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/516298125_Netflix_2015_logosvg.png' },
    { name: 'Notion', logo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f8c0b074a_Notion_logo.png' },
    { name: 'Novartis', logo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/7e2f16d08_Novartis-Logosvg.png' },
    { name: 'UBS', logo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/8451f88ac_UBS_Logo_SVGsvg.png' },
    { name: 'Siemens', logo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a15b36b9a_Siemens-logo.png' },
    { name: 'a16z', logo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/2582fdf73_a16z.png' },
    { name: 'OpenAI', logo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/7cf197100_OpenAI_Logosvg.png' },
    { name: 'McKinsey', logo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/28fea69a9_McKinsey-1015x315.png' },
    { name: 'Palantir', logo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/ad12f2e3f_Palantir_Technologies_logosvg.png' }
  ];

  return (
    <section className="py-20 sm:py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-light text-gray-900 tracking-tight mb-4">
            Trusted by employees at the world's best companies
          </h2>
          <p className="text-lg text-gray-600 font-light">
            People who want to get shit done. LFG! 🚀
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-12 items-center">
          {companies.map((company, index) => (
            <motion.div
              key={company.name}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ 
                  scale: window.innerWidth >= 768 ? 1.05 : 1, 
                  y: window.innerWidth >= 768 ? -2 : 0,
                  transition: { duration: 0.2 }
              }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.6 }}
              className="flex items-center justify-center"
            >
              <img
                src={company.logo}
                alt={`${company.name} logo`}
                className="h-6 sm:h-8 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute top-10 left-5 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-2 h-2 bg-gradient-to-r from-pink-400 to-red-400 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1.5s' }} />
    </section>
  );
});

const CtaSection = React.memo(({ handleGetStarted }) => {
    return (
        <section className="bg-gray-50/70">
            <div className="max-w-4xl mx-auto text-center py-20 sm:py-24 px-6 sm:px-8">
                <h2 className="text-4xl sm:text-5xl font-light text-gray-900 tracking-tight">Ready to Find Your Flow?</h2>
                <p className="mt-4 text-lg text-gray-500 font-light">Stop managing tasks and start building momentum. Sign up for free.</p>
                <div className="mt-10">
                    <Button
                        onClick={handleGetStarted}
                        className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-8 py-4 text-lg font-normal transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        size="lg"
                    >
                        Get Started for Free
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </div>
        </section>
    );
});

export default function HomePage() {
    const handleGetStarted = useCallback(async () => {
        try {
            const redirectUrl = window.location.origin + createPageUrl('Todo');
            await User.loginWithRedirect(redirectUrl);
        } catch (error) {
            console.error("Login redirection failed:", error);
        }
    }, []);

    const titleWords = "If Apple built a To-Do List".split(" ");

    const containerVariant = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.12,
                delayChildren: 0.1,
            }
        }
    };

    const wordVariant = {
        hidden: { 
            opacity: 0, 
            y: 20,
            filter: "blur(8px)"
        },
        visible: { 
            opacity: 1, 
            y: 0,
            filter: "blur(0px)",
            transition: {
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans overflow-x-hidden">
            <Header />
            
            <main>
                <section className="pt-32 pb-16 sm:pt-40 sm:pb-24 md:pt-48 md:pb-32 px-4 sm:px-6 md:px-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 pointer-events-none" />
                    <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-pink-200/20 to-orange-200/20 rounded-full blur-3xl" />

                    <div className="max-w-4xl mx-auto text-center relative z-10">
                        <motion.h1
                            variants={containerVariant}
                            initial="hidden"
                            animate="visible"
                            className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight text-gray-900 mb-6 sm:mb-8"
                        >
                            {titleWords.map((word, index) => (
                                <motion.span
                                    key={index}
                                    variants={wordVariant}
                                    className="inline-block mr-2 sm:mr-3 md:mr-4"
                                >
                                    {word}
                                </motion.span>
                            ))}
                        </motion.h1>
                        
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
                            className="text-base sm:text-lg md:text-xl text-gray-500 font-light max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4 sm:px-0"
                        >
                           The 21st Century ToDo List. FlowTask combines radical simplicity with intelligent motivation to help you build focus in a world of distraction.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 1.8, ease: [0.22, 1, 0.36, 1] }}
                            whileHover={{ scale: 1.05, y: -5, transition: { duration: 0.2 } }}
                        >
                            <Button
                                id="get-started"
                                onClick={handleGetStarted}
                                className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-8 py-4 text-lg font-normal transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center"
                                size="lg"
                            >
                                LFG 🚀
                                <ArrowRight className="w-5 h-5 ml-3" />
                            </Button>
                        </motion.div>
                    </div>
                </section>

                <section className="pb-16 sm:pb-24 md:pb-32 px-4 sm:px-6 md:px-8 relative overflow-hidden" id="preview">
                    <div className="max-w-7xl mx-auto">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            viewport={{ once: true }}
                            className="text-center mb-8 sm:mb-16"
                        >
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 tracking-tight mb-3 sm:mb-4">
                                Your workspace, reimagined
                            </h2>
                            <p className="text-base sm:text-lg text-gray-500 font-light max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
                                See exactly how your tasks flow from idea to completion, with intelligent feedback that keeps you motivated.
                            </p>
                        </motion.div>
                        <ProductPreview />
                    </div>
                </section>

                <section className="py-20 sm:py-24 md:py-32 px-4 sm:px-6 md:px-8 bg-gray-50/70 relative overflow-hidden" id="principles">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12 sm:mb-20">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                viewport={{ once: true }}
                                className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-900 tracking-tight mb-4 sm:mb-6"
                            >
                                Two Principles. Pure Focus.
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                                viewport={{ once: true }}
                                className="text-base sm:text-lg text-gray-500 font-light max-w-3xl mx-auto leading-relaxed px-4 sm:px-0"
                            >
                                Most productivity tools fail because they overcomplicate or underwhelm. 
                                FlowTask succeeds by mastering the balance between radical simplicity and meaningful motivation.
                            </motion.p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                            <MinimalismVisualization delay={0} />
                            <GamificationVisualization delay={0.2} />
                        </div>
                    </div>
                </section>
                <FeaturesSection />
                <TestimonialSection />
                <CtaSection handleGetStarted={handleGetStarted} />
            </main>
            
            <Footer />
        </div>
    );
}
