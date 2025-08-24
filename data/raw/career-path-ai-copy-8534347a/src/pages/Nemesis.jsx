
import React, { useState, useEffect } from 'react';
import { GraduationCap } from 'lucide-react';

import Pagination from '@/components/shared/Pagination';
import NemesisHeroSection from '@/components/nemesis/NemesisHeroSection';
import NemesisResearchSection from '@/components/nemesis/NemesisResearchSection';
import NemesisProblemsSolutionsSection from '@/components/nemesis/NemesisProblemsSolutionsSection';
import NemesisSketchesSection from '@/components/nemesis/NemesisSketchesSection';
import NemesisDigitalSection from '@/components/nemesis/NemesisDigitalSection';
import NemesisCreditsSection from '@/components/nemesis/NemesisCreditsSection';

export default function NemesisPage() {
    const [showHeader, setShowHeader] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 30;
            if (scrolled !== !showHeader) {
                setShowHeader(!scrolled);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [showHeader]);
    
    return (
        <div className="w-full max-w-7xl pt-20 pb-24 space-y-32 md:space-y-48">

            {/* Course Information Header */}
            <div className={`fixed top-6 right-6 z-50 print:static print:top-0 print:right-0 print:mb-8 transition-all duration-500 ease-out ${showHeader ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
                <div className="glass-card rounded-xl p-4 text-right border border-white border-opacity-10 print:bg-white print:text-black print:border-black print:border-opacity-20 hover:bg-black hover:bg-opacity-30 transition-colors duration-300">
                    <div className="flex items-center justify-end gap-2 mb-2">
                        <GraduationCap className="w-4 h-4 text-white text-opacity-60 print:text-black print:text-opacity-60" />
                        <span className="text-white text-opacity-60 text-xs font-light uppercase tracking-widest print:text-black print:text-opacity-60">Academic Presentation</span>
                    </div>
                    <div className="text-white font-medium text-sm print:text-black">BGD301 Professional Practices</div>
                    <div className="text-white text-opacity-80 text-xs font-light print:text-black print:text-opacity-80">Summer 2025</div>
                    <div className="text-white text-opacity-70 text-xs font-light print:text-black print:text-opacity-70">INSTRUCTOR: Michael Simons</div>
                </div>
            </div>

            <NemesisHeroSection />
            <NemesisResearchSection />
            <NemesisProblemsSolutionsSection />
            <NemesisSketchesSection />
            <NemesisDigitalSection />
            <NemesisCreditsSection />

            {/* Pagination */}
            <Pagination currentPage="Nemesis" />
        </div>
    );
}
