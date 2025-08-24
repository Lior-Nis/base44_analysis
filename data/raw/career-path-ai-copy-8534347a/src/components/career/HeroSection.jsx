import React, { useState, useEffect } from 'react';
import { Target, Image as ImageIcon } from 'lucide-react';

export default function HeroSection() {
    const [showName, setShowName] = useState(false);
    const [showTitle, setShowTitle] = useState(false);
    const [showMission, setShowMission] = useState(false);

    useEffect(() => {
        // Lightning fast sequence
        setTimeout(() => setShowName(true), 200);
        setTimeout(() => setShowTitle(true), 400);
        setTimeout(() => setShowMission(true), 600);
    }, []);

    return (
        <section id="hero" className="min-h-[80vh] flex items-center justify-center pt-24 pb-12 fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-center w-full">
                {/* Profile Image Placeholder */}
                <div className="md:col-span-1 flex justify-center order-1 md:order-2">
                    <div className="w-48 h-48 md:w-64 md:h-64 rounded-full glass-card flex items-center justify-center border-2 border-white border-opacity-10 hover:scale-110 hover:rotate-3 transition-all duration-500 hover:border-opacity-30">
                        <div className="text-center">
                            <ImageIcon className="w-16 h-16 text-white text-opacity-30 mx-auto mb-2 hover:scale-110 transition-transform duration-300" />
                            <p className="text-white text-opacity-40 text-xs font-light">Your Photo</p>
                        </div>
                    </div>
                </div>
                {/* Text content */}
                <div className="md:col-span-2 text-center md:text-left order-2 md:order-1">
                    <div className="mb-4">
                        <p className={`text-lg font-light text-white text-opacity-70 mb-2 uppercase tracking-widest transition-all duration-300 ${showName ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            Alaksa Anjum Khan
                        </p>
                        <h1 className={`text-5xl md:text-7xl font-extralight text-white tracking-tight hover:tracking-wide transition-all duration-500 ${showTitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            Visual Designer & Strategist
                        </h1>
                    </div>
                    {showMission && (
                        <div className="glass-card rounded-2xl p-8 max-w-4xl mx-auto shadow-2xl mt-8 hover:bg-black hover:bg-opacity-30 transition-all duration-300 opacity-0 animate-fade-in-fast">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <Target className="w-5 h-5 text-white text-opacity-70" />
                                <h2 className="text-sm font-light text-white uppercase tracking-widest">Personal Mission</h2>
                            </div>
                            <p className="text-xl md:text-2xl text-white text-opacity-90 leading-relaxed font-extralight">
                                To design cinematic, culturally-rooted luxury identities that translate Bengali heritage into modern premium systems.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}