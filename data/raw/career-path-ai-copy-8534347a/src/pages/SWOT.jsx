import React, { useState, useEffect } from 'react';
import { GraduationCap } from 'lucide-react';

import SWOTMatrix from '@/components/swot/SWOTMatrix';
import ActionPlanVisual from '@/components/swot/ActionPlanVisual';
import Pagination from '@/components/shared/Pagination';

export default function SWOTPage() {
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

    const swotData = {
        strengths: [
            { title: "Cinematic & High-Impact Visual Style", description: "Ability to create design work that feels premium, emotionally charged, and commercially strong." },
            { title: "Cultural Fusion Expertise", description: "Unique ability to merge Bengali and Western luxury aesthetics into a cohesive, original design language." },
            { title: "Advanced AI-Integrated Workflow", description: "Deep knowledge of AI tools (Midjourney, Runway, etc.) for rapid, portfolio-worthy results." },
            { title: "Entrepreneurial Mindset", description: "You design not just for beauty, but for revenue, scalability, and brand positioning." }
        ],
        weaknesses: [
            { title: "Perfectionism & Over-polishing", description: "Can delay launches or deliverables because you keep refining past the 'good enough' stage." },
            { title: "Overextension Across Projects", description: "Tendency to take on too many creative ventures simultaneously, leading to occasional burnout." },
            { title: "Limited Large-Team Collaboration", description: "Most projects are self-led, which may slow adaptation in large corporate/agency settings." },
            { title: "Gaps in Motion/3D Mastery", description: "Still developing advanced animation and 3D skills for high-end campaigns." }
        ],
        opportunities: [
            { title: "Rising Demand for AI-Enhanced Designers", description: "Many brands want creatives who can produce high-quality work faster with AI, and you’re ahead of the curve." },
            { title: "Networking Potential in Vancouver", description: "Surrounded by design students, agencies, and start-ups open to collaborations." },
            { title: "Growing Appetite for Cultural Storytelling", description: "Brands increasingly want authentic, culturally rich visuals—your niche." },
            { title: "Access to Family Financial Backing", description: "You can experiment and scale without relying solely on external funding." }
        ],
        threats: [
            { title: "Market Saturation & AI", description: "Many designers entering the field, especially in AI-generated art, could make it harder to stand out." },
            { title: "Rapid Tool Evolution", description: "AI and design software change fast; if you don’t stay updated, your competitive advantage could shrink." },
            { title: "Client Budget Constraints", description: "In economic downturns, companies often cut creative budgets, making luxury design harder to sell." },
            { title: "Visa & Location Dependencies", description: "Immigration or location constraints could impact job opportunities or client acquisition." }
        ]
    };
    
    return (
        <div className="w-full max-w-7xl pt-20 pb-24 space-y-32 md:space-y-48">
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

            <section id="swot-hero" className="min-h-[60vh] flex items-center justify-center pt-24 pb-12 fade-in">
                <div className="text-center w-full">
                    <p className="text-lg font-light text-white text-opacity-70 mb-2 uppercase tracking-widest">Personal Strategy</p>
                    <h1 className="text-5xl md:text-7xl font-extralight text-white tracking-tight mb-8">SWOT Analysis</h1>
                    <div className="glass-card rounded-2xl p-8 max-w-4xl mx-auto">
                        <p className="text-xl md:text-2xl text-white text-opacity-90 leading-relaxed font-extralight">
                            A strategic framework analyzing internal strengths and weaknesses against external opportunities and threats to inform a targeted action plan.
                        </p>
                    </div>
                </div>
            </section>

            <section id="swot-matrix" className="fade-in">
                <div className="text-center mb-16">
                    <h2 className="text-sm font-light text-white text-opacity-70 mb-3 uppercase tracking-widest">Analysis Framework</h2>
                    <p className="text-4xl md:text-5xl font-extralight text-white tracking-tight">SWOT Matrix</p>
                </div>
                <SWOTMatrix 
                    strengths={swotData.strengths}
                    weaknesses={swotData.weaknesses}
                    opportunities={swotData.opportunities}
                    threats={swotData.threats}
                />
            </section>
            
            <section id="swot-action" className="fade-in">
                <div className="text-center mb-16">
                    <h2 className="text-sm font-light text-white text-opacity-70 mb-3 uppercase tracking-widest">Implementation</h2>
                    <p className="text-4xl md:text-5xl font-extralight text-white tracking-tight">Strategic Action Plan</p>
                </div>
                <ActionPlanVisual />
            </section>
            
            <Pagination currentPage="SWOT" />
        </div>
    );
}