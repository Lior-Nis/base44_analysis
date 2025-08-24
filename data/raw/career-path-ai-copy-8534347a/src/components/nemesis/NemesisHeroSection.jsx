
import React from 'react';
import { Heart } from 'lucide-react';

export default function NemesisHeroSection() {
    return (
        <section id="nemesis-hero" className="relative min-h-[90vh] flex flex-col items-center justify-center text-center fade-in">
            <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl">
                <img 
                    src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2940&auto=format&fit=crop"
                    alt="Interior of a modern, stylish coffee shop"
                    className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
            </div>

            <div className="relative z-10 p-8">
                <div className="mb-8">
                    <div className="inline-block glass-card rounded-full p-3 mb-6 border-2 border-[#D7263D]/50">
                        <Heart className="w-10 h-10 text-[#D7263D] animate-pulse-heart" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter" style={{ fontFamily: "'Neue Haas Grotesk Display Pro', sans-serif" }}>
                        Brand Audit & Rebrand Proposal
                    </h1>
                    <h2 className="text-2xl md:text-3xl font-extralight text-white text-opacity-90 mt-4">
                        Nemesis Coffee
                    </h2>
                </div>
                
                <div className="glass-card rounded-2xl p-6 max-w-4xl mx-auto">
                    <p className="text-lg md:text-xl text-white text-opacity-80 font-light leading-relaxed">
                        Strategic brand fix & digital / environmental design solutions
                    </p>
                    <div className="mt-6 pt-4 border-t border-white/10 text-xs text-white/60 font-mono tracking-wider space-y-1">
                        <p>Alaksa Anjum Khan — BGD301 Professional Practices</p>
                        <p>INSTRUCTOR: Michael Simons — Week 4 Submission</p>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-4 text-xs text-white/40 font-light">
                Visual: Nemesis — Great Northern Way Pavilion (Concept representation)
            </div>
        </section>
    );
}
