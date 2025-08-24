import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InvokeLLM } from '@/api/integrations';
import { DoodleUsage } from '@/api/entities';
import { DoodlePurchase } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Palette, Wand2, Loader2, Download, CreditCard, Star } from 'lucide-react';

export default function DoodleNotes() {
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [doodleNotes, setDoodleNotes] = useState(null);
    const [error, setError] = useState('');
    const [usage, setUsage] = useState(null);
    const [user, setUser] = useState(null);
    const [showPurchaseOptions, setShowPurchaseOptions] = useState(false);

    const packages = [
        { type: '5_uses', price: 6, uses: 5, popular: false },
        { type: '11_uses', price: 10, uses: 11, popular: true },
        { type: '25_uses', price: 20, uses: 25, popular: false }
    ];

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const currentUser = await User.me();
            setUser(currentUser);
            
            const userUsage = await DoodleUsage.filter({ user_email: currentUser.email });
            if (userUsage.length > 0) {
                setUsage(userUsage[0]);
            } else {
                // Create initial usage record
                const newUsage = await DoodleUsage.create({ user_email: currentUser.email });
                setUsage(newUsage);
            }
        } catch (error) {
            console.error("Error loading user data:", error);
        }
    };

    const canGenerateDoodle = () => {
        if (!usage) return false;
        return usage.free_uses_remaining > 0 || usage.paid_uses_remaining > 0;
    };

    const getTotalUsesRemaining = () => {
        if (!usage) return 0;
        return usage.free_uses_remaining + usage.paid_uses_remaining;
    };

    const generateDoodleNotes = async () => {
        if (!topic.trim() || !canGenerateDoodle()) return;
        
        setLoading(true);
        setError('');
        setDoodleNotes(null);

        const prompt = `Create colorful doodle notes for the topic "${topic}". The doodle notes should be in English language and include:
        
        1. Key concepts presented in a visual, colorful format
        2. Important definitions and terms highlighted
        3. Visual elements like arrows, boxes, circles, and drawings
        4. Color-coded sections for different subtopics
        5. Easy-to-understand diagrams and illustrations
        6. Memory aids and visual mnemonics
        7. Fun doodles and sketches related to the topic
        
        Format the response as structured notes with clear sections and visual descriptions.`;

        try {
            const response = await InvokeLLM({
                prompt: prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        sections: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    section_title: { type: "string" },
                                    color_theme: { type: "string" },
                                    content: { type: "string" },
                                    visual_elements: { 
                                        type: "array",
                                        items: { type: "string" }
                                    }
                                }
                            }
                        },
                        key_takeaways: {
                            type: "array",
                            items: { type: "string" }
                        }
                    }
                }
            });

            setDoodleNotes(response);
            
            // Update usage count
            const updatedUsage = { ...usage };
            if (usage.free_uses_remaining > 0) {
                updatedUsage.free_uses_remaining -= 1;
            } else if (usage.paid_uses_remaining > 0) {
                updatedUsage.paid_uses_remaining -= 1;
            }
            updatedUsage.total_uses += 1;
            
            await DoodleUsage.update(usage.id, updatedUsage);
            setUsage(updatedUsage);
            
        } catch (e) {
            console.error(e);
            setError('Failed to generate doodle notes. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePurchasePackage = async (packageType) => {
        const selectedPackage = packages.find(p => p.type === packageType);
        if (!selectedPackage || !user) return;

        try {
            await DoodlePurchase.create({
                user_email: user.email,
                package_type: packageType,
                price_paid: selectedPackage.price,
                uses_granted: selectedPackage.uses,
                status: 'pending_verification'
            });
            
            alert('Purchase recorded! Your additional uses will be added after payment verification.');
            setShowPurchaseOptions(false);
        } catch (error) {
            console.error('Error creating purchase record:', error);
            alert('Error processing purchase. Please try again.');
        }
    };

    const colorThemes = {
        blue: 'bg-blue-100 border-blue-300 text-blue-900',
        green: 'bg-green-100 border-green-300 text-green-900',
        purple: 'bg-purple-100 border-purple-300 text-purple-900',
        orange: 'bg-orange-100 border-orange-300 text-orange-900',
        pink: 'bg-pink-100 border-pink-300 text-pink-900'
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-block bg-gradient-to-r from-pink-500 to-orange-500 p-4 rounded-full mb-4">
                        <Palette className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">AI Doodle Notes Generator</h1>
                    <p className="text-lg text-slate-600">Create colorful, visual study notes for any topic</p>
                </div>

                {/* Usage Information */}
                {usage && (
                    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Badge className="bg-green-500 text-white">
                                        {getTotalUsesRemaining()} uses remaining
                                    </Badge>
                                    <span className="text-sm text-slate-600">
                                        Free: {usage.free_uses_remaining} | Paid: {usage.paid_uses_remaining}
                                    </span>
                                </div>
                                {getTotalUsesRemaining() === 0 && (
                                    <Button 
                                        onClick={() => setShowPurchaseOptions(true)}
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                                    >
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Buy More Uses
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Main Generator */}
                <Card className="shadow-xl bg-white/90 backdrop-blur-sm mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-800">
                            <Wand2 className="w-5 h-5 text-pink-600" />
                            Generate Colorful Doodle Notes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="topic">Topic for Doodle Notes</Label>
                            <Input
                                id="topic"
                                placeholder="e.g., Solar System, World War II, Photosynthesis"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        
                        <Button 
                            onClick={generateDoodleNotes} 
                            disabled={loading || !canGenerateDoodle() || !topic.trim()}
                            className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Colorful Doodle Notes...
                                </>
                            ) : (
                                <>
                                    <Palette className="mr-2 h-4 w-4" />
                                    Generate Doodle Notes ({getTotalUsesRemaining()} uses left)
                                </>
                            )}
                        </Button>
                        
                        {!canGenerateDoodle() && (
                            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                <p className="text-yellow-800 font-medium mb-2">No uses remaining!</p>
                                <Button 
                                    onClick={() => setShowPurchaseOptions(true)}
                                    className="bg-yellow-500 hover:bg-yellow-600"
                                >
                                    Purchase More Uses
                                </Button>
                            </div>
                        )}
                        
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </CardContent>
                </Card>

                {/* Purchase Options Modal */}
                {showPurchaseOptions && (
                    <motion.div 
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <Card className="w-full max-w-2xl">
                            <CardHeader>
                                <CardTitle>Purchase Additional Uses</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-3 gap-4 mb-6">
                                    {packages.map((pkg) => (
                                        <div key={pkg.type} className={`relative p-6 border-2 rounded-xl ${pkg.popular ? 'border-purple-500 bg-purple-50' : 'border-slate-200'}`}>
                                            {pkg.popular && (
                                                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-500">
                                                    <Star className="w-3 h-3 mr-1" />
                                                    Most Popular
                                                </Badge>
                                            )}
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-slate-900 mb-2">${pkg.price}</div>
                                                <div className="text-lg font-medium text-slate-700 mb-4">{pkg.uses} Uses</div>
                                                <Button 
                                                    onClick={() => handlePurchasePackage(pkg.type)}
                                                    className={pkg.popular ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-600 hover:bg-slate-700'}
                                                >
                                                    Purchase Now
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button 
                                    onClick={() => setShowPurchaseOptions(false)}
                                    variant="outline" 
                                    className="w-full"
                                >
                                    Cancel
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Generated Doodle Notes */}
                {doodleNotes && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <Card className="shadow-xl bg-white">
                            <CardHeader className="bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-t-lg">
                                <CardTitle className="text-2xl flex items-center justify-between">
                                    <span>📝 {doodleNotes.title}</span>
                                    <Button variant="outline" size="sm" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                                        <Download className="w-4 h-4 mr-2" />
                                        Save Notes
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {doodleNotes.sections?.map((section, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.2 }}
                                        className={`mb-6 p-4 border-2 rounded-lg ${colorThemes[section.color_theme?.toLowerCase()] || colorThemes.blue}`}
                                    >
                                        <h3 className="text-xl font-bold mb-3 flex items-center">
                                            🎨 {section.section_title}
                                        </h3>
                                        <div className="mb-4 whitespace-pre-wrap">
                                            {section.content}
                                        </div>
                                        {section.visual_elements && (
                                            <div className="space-y-2">
                                                <p className="font-semibold text-sm">Visual Elements:</p>
                                                <ul className="list-disc list-inside space-y-1">
                                                    {section.visual_elements.map((element, i) => (
                                                        <li key={i} className="text-sm">✏️ {element}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                                
                                {doodleNotes.key_takeaways && (
                                    <div className="mt-8 p-4 bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-300 rounded-lg">
                                        <h3 className="text-xl font-bold mb-3 text-green-800">🌟 Key Takeaways</h3>
                                        <ul className="space-y-2">
                                            {doodleNotes.key_takeaways.map((takeaway, index) => (
                                                <li key={index} className="flex items-start">
                                                    <span className="text-green-600 mr-2">⭐</span>
                                                    <span>{takeaway}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
}